import { z } from 'zod'

const archiveDate = z.string().regex(/^\d{4}-\d{2}(?:-\d{2})?$/).refine(value => {
  const full = value.length === 7 ? `${value}-01` : value
  const parsed = new Date(`${full}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === full
}, 'Invalid archive date')

export const writingSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1),
  // Month precision is deliberate: a source month is not an invented first day.
  date: archiveDate.nullable(),
  order: z.number().int().positive().optional(),
  type: z.enum(['diary', 'essay', 'travel', 'review', 'sketch']),
  status: z.enum(['draft', 'published']).default('draft'),
  lang: z.string().regex(/^[a-zA-Z]{2,8}(?:-[a-zA-Z0-9]{1,8})*$/),
  body: z.string().trim().min(1),
})
export function validateWriting(values: unknown[]): z.infer<typeof writingSchema>[] {
  const entries = values.map(value => writingSchema.parse(value))
  const slugs = new Set<string>()
  for (const entry of entries) {
    if (slugs.has(entry.slug)) throw new Error(`Duplicate writing slug: ${entry.slug}`)
    slugs.add(entry.slug)
  }
  return entries
}
