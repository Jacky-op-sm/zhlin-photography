import 'server-only'

import { createHmac } from 'node:crypto'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { CONTACT_RATE_LIMITS } from '@/lib/contact/constants'

type RateLimitResult =
  | {
      allowed: true
    }
  | {
      allowed: false
      unavailable: boolean
      retryAfterSeconds?: number
    }

type MemoryEntry = {
  timestamps: number[]
}

const globalRateLimitState = globalThis as typeof globalThis & {
  __contactRateLimitMemory?: Map<string, MemoryEntry>
}

function getMemoryStore() {
  globalRateLimitState.__contactRateLimitMemory ??= new Map()
  return globalRateLimitState.__contactRateLimitMemory
}

function checkMemoryLimit(
  key: string,
  requests: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const store = getMemoryStore()
  const entry = store.get(key) ?? { timestamps: [] }
  const activeTimestamps = entry.timestamps.filter(
    (timestamp) => now - timestamp < windowMs,
  )

  if (activeTimestamps.length >= requests) {
    const retryAt = activeTimestamps[0] + windowMs
    store.set(key, { timestamps: activeTimestamps })
    return {
      allowed: false,
      unavailable: false,
      retryAfterSeconds: Math.max(1, Math.ceil((retryAt - now) / 1000)),
    }
  }

  activeTimestamps.push(now)
  store.set(key, { timestamps: activeTimestamps })
  return { allowed: true }
}

function getRedisConfig() {
  const url = (
    process.env.UPSTASH_REDIS_REST_URL
    || process.env.KV_REST_API_URL
  )?.trim()
  const token = (
    process.env.UPSTASH_REDIS_REST_TOKEN
    || process.env.KV_REST_API_TOKEN
  )?.trim()
  const secret = process.env.CONTACT_RATE_LIMIT_SECRET?.trim()

  if (!url || !token || !secret) return null
  return { url, token, secret }
}

function hashEmail(email: string, secret: string) {
  return createHmac('sha256', secret)
    .update(email.trim().toLowerCase())
    .digest('hex')
}

async function checkPersistentLimits(
  ip: string,
  email: string,
  config: NonNullable<ReturnType<typeof getRedisConfig>>,
): Promise<RateLimitResult> {
  const redis = new Redis({
    url: config.url,
    token: config.token,
  })
  const ipLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      CONTACT_RATE_LIMITS.ip.requests,
      '15 m',
    ),
    prefix: 'contact:ip',
    analytics: false,
  })
  const emailLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      CONTACT_RATE_LIMITS.email.requests,
      '24 h',
    ),
    prefix: 'contact:email',
    analytics: false,
  })

  const [ipResult, emailResult] = await Promise.all([
    ipLimiter.limit(ip),
    emailLimiter.limit(hashEmail(email, config.secret)),
  ])

  if (ipResult.success && emailResult.success) {
    return { allowed: true }
  }

  const resetAt = Math.max(ipResult.reset, emailResult.reset)
  return {
    allowed: false,
    unavailable: false,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((resetAt - Date.now()) / 1000),
    ),
  }
}

export async function checkContactRateLimit({
  ip,
  email,
}: {
  ip: string
  email: string
}): Promise<RateLimitResult> {
  const config = getRedisConfig()

  if (config) {
    try {
      return await checkPersistentLimits(ip, email, config)
    } catch (error) {
      console.error('[contact-rate-limit]', {
        message: error instanceof Error ? error.message : 'unknown error',
      })
      return {
        allowed: false,
        unavailable: true,
      }
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return {
      allowed: false,
      unavailable: true,
    }
  }

  const ipResult = checkMemoryLimit(
    `ip:${ip}`,
    CONTACT_RATE_LIMITS.ip.requests,
    CONTACT_RATE_LIMITS.ip.windowMs,
  )
  if (!ipResult.allowed) return ipResult

  return checkMemoryLimit(
    `email:${email.trim().toLowerCase()}`,
    CONTACT_RATE_LIMITS.email.requests,
    CONTACT_RATE_LIMITS.email.windowMs,
  )
}
