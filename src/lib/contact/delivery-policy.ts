export type DeliveryPolicyResult =
  | 'webhook'
  | 'resend'
  | 'unconfigured'
  | 'failed'

export async function runDeliveryPolicy({
  hasWebhook,
  hasResend,
  deliverWebhook,
  deliverResend,
  onFailure,
}: {
  hasWebhook: boolean
  hasResend: boolean
  deliverWebhook: () => Promise<boolean>
  deliverResend: () => Promise<boolean>
  onFailure: (channel: 'webhook' | 'resend', error: unknown) => void
}): Promise<DeliveryPolicyResult> {
  if (!hasWebhook && !hasResend) return 'unconfigured'

  if (hasWebhook) {
    try {
      if (await deliverWebhook()) return 'webhook'
    } catch (error) {
      onFailure('webhook', error)
    }
  }

  if (hasResend) {
    try {
      if (await deliverResend()) return 'resend'
    } catch (error) {
      onFailure('resend', error)
    }
  }

  return 'failed'
}
