import contactData from '../../../content/site/contact.json'

export const CONTACT_REQUEST_MAX_BYTES = 32 * 1024

export const CONTACT_FIELD_LIMITS = {
  firstName: 80,
  lastName: 80,
  email: 254,
  message: 5000,
  website: 200,
} as const

export const CONTACT_RATE_LIMITS = {
  ip: {
    requests: 5,
    windowMs: 15 * 60 * 1000,
  },
  email: {
    requests: 20,
    windowMs: 24 * 60 * 60 * 1000,
  },
} as const

export const contactTypeValues = contactData.types as readonly string[]
