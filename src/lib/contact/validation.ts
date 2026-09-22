import { z } from 'zod'
import {
  CONTACT_FIELD_LIMITS,
  contactTypeValues,
} from '@/lib/contact/constants'
import type { ContactFormInput } from '@/lib/contact/types'

function normalizeText(value: string) {
  return value.replace(/\r\n?/g, '\n').trim()
}

const normalizedText = (maxLength: number) =>
  z
    .string()
    .transform(normalizeText)
    .pipe(z.string().min(1).max(maxLength))

export const contactFormSchema = z
  .object({
    firstName: normalizedText(CONTACT_FIELD_LIMITS.firstName),
    lastName: normalizedText(CONTACT_FIELD_LIMITS.lastName),
    email: z
      .string()
      .transform(normalizeText)
      .pipe(
        z
          .string()
          .min(3)
          .max(CONTACT_FIELD_LIMITS.email)
          .email(),
      ),
    type: z
      .string()
      .transform(normalizeText)
      .pipe(
        z
          .string()
          .refine((value) => contactTypeValues.includes(value), {
            message: 'Unsupported contact type',
          }),
      ),
    message: normalizedText(CONTACT_FIELD_LIMITS.message),
    website: z
      .string()
      .transform(normalizeText)
      .pipe(z.string().max(CONTACT_FIELD_LIMITS.website)),
  })
  .strict()

export function parseContactFormInput(
  value: unknown,
):
  | { success: true; data: ContactFormInput }
  | { success: false } {
  const result = contactFormSchema.safeParse(value)
  if (!result.success) {
    return { success: false }
  }

  return {
    success: true,
    data: result.data,
  }
}
