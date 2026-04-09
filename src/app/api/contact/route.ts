import { NextResponse } from 'next/server'
import { contactEmail } from '@/lib/data/contact'
import type { ContactPayload } from '@/lib/types'

type DeliveryResult =
  | { delivered: true; channel: 'webhook' | 'resend'; messageId?: string }
  | { delivered: false; skipped: true; channel: 'webhook' | 'resend' }

function sanitize(value: unknown) {
  return String(value ?? '').trim()
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function parseName(payload: ContactPayload) {
  const name = sanitize(payload.name)
  const firstName = sanitize(payload.firstName)
  const lastName = sanitize(payload.lastName)

  if (firstName || lastName) {
    return {
      name: name || [firstName, lastName].filter(Boolean).join(' ').trim(),
      firstName: firstName || (name.split(/\s+/)[0] ?? ''),
      lastName: lastName || name.split(/\s+/).slice(1).join(' '),
    }
  }

  const parts = name.split(/\s+/).filter(Boolean)
  return {
    name,
    firstName: parts[0] || name,
    lastName: parts.slice(1).join(' '),
  }
}

function serializeError(error: unknown) {
  if (!error) return 'unknown error'
  if (error instanceof Error) return error.message
  return String(error)
}

function buildTextPayload(payload: ReturnType<typeof parseName> & { email: string; type: string; message: string; trackingId: string; receivedAt: string }) {
  return [
    `Tracking ID: ${payload.trackingId}`,
    `Time: ${payload.receivedAt}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Type: ${payload.type}`,
    '',
    payload.message,
  ].join('\n')
}

function buildHtmlPayload(payload: ReturnType<typeof parseName> & { email: string; type: string; message: string; trackingId: string; receivedAt: string }) {
  return [
    `<p><strong>Tracking ID:</strong> ${payload.trackingId}</p>`,
    `<p><strong>Time:</strong> ${payload.receivedAt}</p>`,
    `<p><strong>Name:</strong> ${payload.name}</p>`,
    `<p><strong>Email:</strong> ${payload.email}</p>`,
    `<p><strong>Type:</strong> ${payload.type}</p>`,
    `<p><strong>Message:</strong></p>`,
    `<p>${payload.message.replace(/\n/g, '<br>')}</p>`,
  ].join('')
}

async function deliverToWebhook(payload: ReturnType<typeof parseName> & { email: string; type: string; message: string; trackingId: string; receivedAt: string }): Promise<DeliveryResult> {
  if (!process.env.CONTACT_WEBHOOK_URL) {
    return { delivered: false, skipped: true, channel: 'webhook' }
  }

  const response = await fetch(process.env.CONTACT_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`webhook returned ${response.status}`)
  }

  return { delivered: true, channel: 'webhook' }
}

async function deliverToResend(payload: ReturnType<typeof parseName> & { email: string; type: string; message: string; trackingId: string; receivedAt: string }): Promise<DeliveryResult> {
  const apiKey = sanitize(process.env.RESEND_API_KEY)
  const fromEmail = sanitize(process.env.CONTACT_FROM_EMAIL)
  const toEmail = sanitize(process.env.CONTACT_TO_EMAIL || contactEmail)

  if (!apiKey || !fromEmail || !toEmail) {
    return { delivered: false, skipped: true, channel: 'resend' }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: payload.email,
      subject: `[Website Contact] ${payload.type}${payload.name ? ` · ${payload.name}` : ''}`,
      html: buildHtmlPayload(payload),
      text: buildTextPayload(payload),
    }),
  })

  const raw = await response.text()
  let parsed: { id?: string } | null = null

  if (raw) {
    try {
      parsed = JSON.parse(raw) as { id?: string }
    } catch {
      parsed = null
    }
  }

  if (!response.ok) {
    throw new Error(`resend returned ${response.status}${raw ? ` ${raw.slice(0, 200)}` : ''}`)
  }

  return {
    delivered: true,
    channel: 'resend',
    messageId: parsed?.id ? String(parsed.id) : undefined,
  }
}

async function readRequestBody(request: Request) {
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return (await request.json().catch(() => null)) as Record<string, unknown> | null
  }

  if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData()
    return Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, typeof value === 'string' ? value : '']))
  }

  const text = await request.text()
  if (!text) return {}

  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    const search = new URLSearchParams(text)
    return Object.fromEntries(search.entries())
  }
}

export async function POST(request: Request) {
  const body = await readRequestBody(request)
  if (!body) {
    return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 })
  }

  const payloadInput: ContactPayload = {
    name: sanitize(body.name),
    firstName: sanitize(body.firstName || body.first_name),
    lastName: sanitize(body.lastName || body.last_name),
    email: sanitize(body.email),
    type: sanitize(body.type),
    message: sanitize(body.message),
    website: sanitize(body.website),
  }

  if (payloadInput.website) {
    return NextResponse.json({ ok: false, error: 'Spam check failed' }, { status: 400 })
  }

  const { name, firstName, lastName } = parseName(payloadInput)

  if (!name || !payloadInput.email || !payloadInput.type || !payloadInput.message) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
  }

  if (!isValidEmail(payloadInput.email)) {
    return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 })
  }

  const trackingId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const hasWebhook = Boolean(sanitize(process.env.CONTACT_WEBHOOK_URL))
  const hasResend = Boolean(sanitize(process.env.RESEND_API_KEY)) && Boolean(sanitize(process.env.CONTACT_FROM_EMAIL)) && Boolean(sanitize(process.env.CONTACT_TO_EMAIL || contactEmail))

  if (!hasWebhook && !hasResend) {
    return NextResponse.json(
      {
        ok: false,
        error: '联系通道未配置，请联系站长设置发送服务后重试。',
        trackingId,
      },
      { status: 500 }
    )
  }

  const payload = {
    trackingId,
    name,
    firstName,
    lastName,
    email: payloadInput.email,
    type: payloadInput.type,
    message: payloadInput.message,
    receivedAt: new Date().toISOString(),
  }

  const deliveredVia: string[] = []
  const errors: string[] = []

  try {
    const webhookResult = await deliverToWebhook(payload)
    if (webhookResult.delivered) {
      deliveredVia.push(webhookResult.channel)
    }
  } catch (error) {
    errors.push(`webhook: ${serializeError(error)}`)
  }

  try {
    const resendResult = await deliverToResend(payload)
    if (resendResult.delivered) {
      deliveredVia.push(resendResult.channel + (resendResult.messageId ? `:${resendResult.messageId}` : ''))
    }
  } catch (error) {
    errors.push(`resend: ${serializeError(error)}`)
  }

  if (!deliveredVia.length) {
    return NextResponse.json(
      {
        ok: false,
        error: '消息未送达，请稍后重试或直接邮件联系站长。',
        trackingId,
      },
      { status: 502 }
    )
  }

  return NextResponse.json({
    ok: true,
    trackingId,
    deliveredVia,
    warnings: errors.length ? errors : undefined,
  })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
