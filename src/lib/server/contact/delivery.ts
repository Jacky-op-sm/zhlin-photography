import 'server-only'

import profile from '../../../../content/site/profile.json'
import type { ContactMessage } from '@/lib/contact/types'
import { escapeHtml } from '@/lib/contact/html'
import { runDeliveryPolicy } from '@/lib/contact/delivery-policy'

type DeliveryResult =
  | { status: 'delivered'; channel: 'webhook' | 'resend' }
  | { status: 'unconfigured' }
  | { status: 'failed' }

function buildTextPayload(payload: ContactMessage) {
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

function buildHtmlPayload(payload: ContactMessage) {
  const escapedMessage = escapeHtml(payload.message).replaceAll('\n', '<br>')

  return [
    `<p><strong>Tracking ID:</strong> ${escapeHtml(payload.trackingId)}</p>`,
    `<p><strong>Time:</strong> ${escapeHtml(payload.receivedAt)}</p>`,
    `<p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>`,
    `<p><strong>Type:</strong> ${escapeHtml(payload.type)}</p>`,
    '<p><strong>Message:</strong></p>',
    `<p>${escapedMessage}</p>`,
  ].join('')
}

async function deliverToWebhook(payload: ContactMessage) {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL?.trim()
  if (!webhookUrl) return false

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) {
    throw new Error(`webhook returned ${response.status}`)
  }

  return true
}

async function deliverToResend(payload: ContactMessage) {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim()
  const toEmail = (process.env.CONTACT_TO_EMAIL || profile.email).trim()

  if (!apiKey || !fromEmail || !toEmail) return false

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
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) {
    throw new Error(`resend returned ${response.status}`)
  }

  return true
}

function logDeliveryFailure(
  trackingId: string,
  channel: 'webhook' | 'resend',
  error: unknown,
) {
  const message = error instanceof Error ? error.message : 'unknown error'
  console.error('[contact-delivery]', {
    trackingId,
    channel,
    message,
  })
}

export async function deliverContactMessage(
  payload: ContactMessage,
): Promise<DeliveryResult> {
  const hasWebhook = Boolean(process.env.CONTACT_WEBHOOK_URL?.trim())
  const hasResend = Boolean(
    process.env.RESEND_API_KEY?.trim()
      && process.env.CONTACT_FROM_EMAIL?.trim()
      && (process.env.CONTACT_TO_EMAIL || profile.email).trim(),
  )

  const result = await runDeliveryPolicy({
    hasWebhook,
    hasResend,
    deliverWebhook: () => deliverToWebhook(payload),
    deliverResend: () => deliverToResend(payload),
    onFailure: (channel, error) =>
      logDeliveryFailure(payload.trackingId, channel, error),
  })

  if (result === 'unconfigured') return { status: 'unconfigured' }
  if (result === 'failed') return { status: 'failed' }
  return { status: 'delivered', channel: result }
}
