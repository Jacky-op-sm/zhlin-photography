export type ContactFormInput = {
  firstName: string
  lastName: string
  email: string
  type: string
  message: string
  website: string
}

export type ContactMessage = Omit<ContactFormInput, 'website'> & {
  name: string
  trackingId: string
  receivedAt: string
}

export type ContactApiResponse =
  | {
      ok: true
      trackingId?: string
    }
  | {
      ok: false
      code:
        | 'invalid_body'
        | 'invalid_origin'
        | 'invalid_input'
        | 'payload_too_large'
        | 'rate_limited'
        | 'service_unavailable'
        | 'delivery_failed'
        | 'unsupported_media_type'
      error: string
      trackingId?: string
    }
