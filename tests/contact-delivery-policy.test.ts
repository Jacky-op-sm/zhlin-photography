import assert from 'node:assert/strict'
import test from 'node:test'
import { runDeliveryPolicy } from '../src/lib/contact/delivery-policy.ts'

test('a successful webhook stops before Resend', async () => {
  let webhookCalls = 0
  let resendCalls = 0
  const result = await runDeliveryPolicy({
    hasWebhook: true,
    hasResend: true,
    deliverWebhook: async () => {
      webhookCalls += 1
      return true
    },
    deliverResend: async () => {
      resendCalls += 1
      return true
    },
    onFailure: () => undefined,
  })

  assert.equal(result, 'webhook')
  assert.equal(webhookCalls, 1)
  assert.equal(resendCalls, 0)
})

test('a failed webhook falls back to Resend', async () => {
  const failures: string[] = []
  let resendCalls = 0
  const result = await runDeliveryPolicy({
    hasWebhook: true,
    hasResend: true,
    deliverWebhook: async () => {
      throw new Error('webhook unavailable')
    },
    deliverResend: async () => {
      resendCalls += 1
      return true
    },
    onFailure: (channel) => failures.push(channel),
  })

  assert.equal(result, 'resend')
  assert.deepEqual(failures, ['webhook'])
  assert.equal(resendCalls, 1)
})

test('unconfigured and all-failed policies are distinct', async () => {
  const noop = async () => false
  const unconfigured = await runDeliveryPolicy({
    hasWebhook: false,
    hasResend: false,
    deliverWebhook: noop,
    deliverResend: noop,
    onFailure: () => undefined,
  })
  const failed = await runDeliveryPolicy({
    hasWebhook: true,
    hasResend: true,
    deliverWebhook: noop,
    deliverResend: noop,
    onFailure: () => undefined,
  })

  assert.equal(unconfigured, 'unconfigured')
  assert.equal(failed, 'failed')
})
