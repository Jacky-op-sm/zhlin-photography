import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { CONTACT_REQUEST_MAX_BYTES } from '@/lib/contact/constants'
import type {
  ContactApiResponse,
  ContactMessage,
} from '@/lib/contact/types'
import { parseContactFormInput } from '@/lib/contact/validation'
import { deliverContactMessage } from '@/lib/server/contact/delivery'
import { checkContactRateLimit } from '@/lib/server/contact/rate-limit'

type BodyReadResult =
  | { success: true; value: Record<string, unknown> }
  | {
      success: false
      status: 400 | 413 | 415
      code: 'invalid_body' | 'payload_too_large' | 'unsupported_media_type'
      error: string
    }

function json(
  body: ContactApiResponse,
  status: number,
  headers?: HeadersInit,
) {
  return NextResponse.json(body, {
    status,
    headers,
  })
}

function addAllowedOrigin(
  allowed: Set<string>,
  value: string | undefined,
) {
  if (!value) return
  try {
    allowed.add(new URL(value).origin)
  } catch {
    // Invalid optional environment values are ignored here and fail separately
    // in production metadata validation.
  }
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return true

  const allowed = new Set<string>()
  addAllowedOrigin(
    allowed,
    process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zhlin.space',
  )
  addAllowedOrigin(
    allowed,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  )
  addAllowedOrigin(
    allowed,
    process.env.VERCEL_BRANCH_URL
      ? `https://${process.env.VERCEL_BRANCH_URL}`
      : undefined,
  )

  for (const value of (
    process.env.CONTACT_ALLOWED_ORIGINS || ''
  ).split(',')) {
    addAllowedOrigin(allowed, value.trim() || undefined)
  }

  if (process.env.NODE_ENV !== 'production') {
    allowed.add('http://localhost:3000')
    allowed.add('http://127.0.0.1:3000')
    allowed.add('http://localhost:3100')
    allowed.add('http://127.0.0.1:3100')
  }

  try {
    return allowed.has(new URL(origin).origin)
  } catch {
    return false
  }
}

async function readRequestBody(request: Request): Promise<BodyReadResult> {
  const contentLength = Number(request.headers.get('content-length'))
  if (
    Number.isFinite(contentLength)
    && contentLength > CONTACT_REQUEST_MAX_BYTES
  ) {
    return {
      success: false,
      status: 413,
      code: 'payload_too_large',
      error: '提交内容过长，请缩短后重试。',
    }
  }

  const bytes = await request.arrayBuffer()
  if (bytes.byteLength > CONTACT_REQUEST_MAX_BYTES) {
    return {
      success: false,
      status: 413,
      code: 'payload_too_large',
      error: '提交内容过长，请缩短后重试。',
    }
  }

  const text = new TextDecoder().decode(bytes)
  const contentType = request.headers.get('content-type') || ''

  if (!text.trim()) {
    return {
      success: false,
      status: 400,
      code: 'invalid_body',
      error: '请求内容无法解析。',
    }
  }

  if (
    contentType.includes('application/json')
    || (!contentType && text.trim().startsWith('{'))
  ) {
    try {
      const value = JSON.parse(text) as unknown
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Expected an object')
      }
      return {
        success: true,
        value: value as Record<string, unknown>,
      }
    } catch {
      return {
        success: false,
        status: 400,
        code: 'invalid_body',
        error: '请求内容无法解析。',
      }
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return {
      success: true,
      value: Object.fromEntries(new URLSearchParams(text).entries()),
    }
  }

  return {
    success: false,
    status: 415,
    code: 'unsupported_media_type',
    error: '不支持的提交格式。',
  }
}

function getRequestIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return json(
      {
        ok: false,
        code: 'invalid_origin',
        error: '无法验证提交来源。',
      },
      403,
    )
  }

  const body = await readRequestBody(request)
  if (!body.success) {
    return json(
      {
        ok: false,
        code: body.code,
        error: body.error,
      },
      body.status,
    )
  }

  if (
    typeof body.value.website === 'string'
    && body.value.website.trim()
  ) {
    return json({ ok: true }, 200)
  }

  const parsed = parseContactFormInput(body.value)
  if (!parsed.success) {
    return json(
      {
        ok: false,
        code: 'invalid_input',
        error: '请检查必填项、邮箱格式和内容长度。',
      },
      422,
    )
  }

  const trackingId = `msg_${randomUUID()}`
  const rateLimit = await checkContactRateLimit({
    ip: getRequestIp(request),
    email: parsed.data.email,
  })

  if (!rateLimit.allowed) {
    if (rateLimit.unavailable) {
      return json(
        {
          ok: false,
          code: 'service_unavailable',
          error: '留言服务暂不可用，请通过邮箱联系。',
          trackingId,
        },
        503,
      )
    }

    return json(
      {
        ok: false,
        code: 'rate_limited',
        error: '提交过于频繁，请稍后再试。',
        trackingId,
      },
      429,
      rateLimit.retryAfterSeconds
        ? { 'Retry-After': String(rateLimit.retryAfterSeconds) }
        : undefined,
    )
  }

  const payload: ContactMessage = {
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    type: parsed.data.type,
    message: parsed.data.message,
    name: `${parsed.data.firstName} ${parsed.data.lastName}`.trim(),
    trackingId,
    receivedAt: new Date().toISOString(),
  }

  const delivery = await deliverContactMessage(payload)
  if (delivery.status === 'unconfigured') {
    return json(
      {
        ok: false,
        code: 'service_unavailable',
        error: '留言服务暂不可用，请通过邮箱联系。',
        trackingId,
      },
      503,
    )
  }

  if (delivery.status === 'failed') {
    return json(
      {
        ok: false,
        code: 'delivery_failed',
        error: '消息未送达，请稍后重试或通过邮箱联系。',
        trackingId,
      },
      502,
    )
  }

  return json(
    {
      ok: true,
      trackingId,
    },
    200,
  )
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
    },
  })
}
