import { z } from 'zod'

const text = z.string().min(1)
const publicHref = text.startsWith('/')
const imagePair = {
  imageSrc: text.optional(),
  imageAlt: text.optional(),
}
const hasCompleteImagePair = (value) =>
  Boolean(value.imageSrc) === Boolean(value.imageAlt)

export const travelSchema = z.object({
  slug: text,
  zhName: text,
  enName: text,
  period: text,
  location: text,
  cardTitle: text,
  cover: text,
  hero: text,
  summary: text,
  tags: z.array(text),
})

export const travelDetailBlockSchema = z
  .object({ text, ...imagePair })
  .refine(hasCompleteImagePair, 'imageSrc and imageAlt must be provided together')

export const travelCardSchema = z
  .object({
    eyebrow: text,
    title: text,
    body: text,
    category: text.optional(),
    ...imagePair,
    detailBlocks: z.array(travelDetailBlockSchema).min(1),
  })
  .refine(hasCompleteImagePair, 'imageSrc and imageAlt must be provided together')

export const travelCardsSchema = z.object({
  spots: z.array(travelCardSchema),
  bookstores: z.array(travelCardSchema),
  food: z.array(travelCardSchema),
})

const exhibitionId = text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const exhibitionAsset = text.startsWith('/assets/').refine(
  (value) => !value.split('/').some((segment) => segment === '..' || segment === '.'),
  'Exhibition images must use a public asset path without traversal segments',
)

export const photoRecordSchema = z.object({
  id: exhibitionId,
  title: text,
  source: text,
  filename: exhibitionAsset,
  thumbnail: exhibitionAsset,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  legacyHash: text.optional(),
})

export const photoRecordsSchema = z.array(photoRecordSchema).min(1).refine(
  (photos) => new Set(photos.map((photo) => photo.id)).size === photos.length,
  'Photo IDs must be unique within a collection',
)

export const photographySeriesSchema = z.object({
  slug: z.enum(['works', 'intersection', 'miaoqiantan', 'bangkok']),
  section: z.enum(['works', 'projects']),
  title: text,
  description: text,
  brightnessOrder: z.array(exhibitionId).optional(),
})

export const photographySeriesListSchema = z.array(photographySeriesSchema)

export const hobbyItemSchema = z.object({
  name: text,
  why: text,
  fullWhy: text.optional(),
  rating: text.optional(),
  date: text.optional(),
})

export const hobbyCategorySchema = z.object({
  title: text,
  items: z.array(hobbyItemSchema),
})

export const hobbyProfileSchema = z.object({
  intro: text,
  externalProfiles: z.object({
    goodreads: text,
    letterboxd: text,
  }),
  lolProfile: z.object({
    server: text,
    rank: text,
    mainRoles: z.array(text),
    championPool: z.array(text),
    currentInsight: text,
  }),
})

export const monthlyDigestSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  books: z.array(hobbyItemSchema),
  films: z.array(hobbyItemSchema),
})

export const navigationItemSchema = z.lazy(() =>
  z.object({
    id: text,
    label: text,
    footerLabel: text.optional(),
    href: publicHref,
    title: text.optional(),
    showInHeader: z.boolean(),
    showInFooter: z.boolean(),
    order: z.number(),
    footerOrder: z.number().optional(),
    children: z.array(navigationItemSchema).optional(),
  }),
)

export const navigationSchema = z.array(navigationItemSchema)

const showcaseBase = {
  href: publicHref,
  image: text,
  alt: text,
  body: text,
  imageClassName: text.optional(),
}

export const homepageSchema = z.object({
  hero: z.object({
    titleLines: z.array(text).min(1),
    summary: text,
    links: z.array(z.object({ label: text, href: publicHref })),
  }),
  photography: z.array(
    z.object({ title: text, quote: text, ...showcaseBase }),
  ),
  travel: z.array(
    z.object({ place: text, bodyClassName: text.optional(), ...showcaseBase }),
  ),
  hobby: z.array(z.object({ title: text, ...showcaseBase })),
})

export const profileSchema = z.object({
  name: text,
  displayName: text,
  title: text,
  displayTitle: text,
  city: text,
  displayCity: text,
  email: text,
  avatar: text,
  aboutParagraphs: z.array(text),
  socials: z.object({
    instagram: z.string(),
    linkedin: z.string(),
    wechat: text,
  }),
})

export const contactSchema = z.object({
  title: text,
  intro: text,
  responseTime: text,
  types: z.array(text).min(1),
})
