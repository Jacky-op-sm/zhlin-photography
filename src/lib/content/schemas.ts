import type { z } from 'zod'
import {
  contactSchema,
  hobbyCategorySchema,
  hobbyItemSchema,
  hobbyProfileSchema,
  homepageSchema,
  monthlyDigestSchema,
  photoRecordSchema,
  photographySeriesSchema,
  profileSchema,
  travelCardSchema,
  travelCardsSchema,
  travelDetailBlockSchema,
  travelSchema,
} from '@/lib/content/schema-values.mjs'

export * from '@/lib/content/schema-values.mjs'

export type NavigationItem = {
  id: string
  label: string
  footerLabel?: string
  href: string
  title?: string
  showInHeader: boolean
  showInFooter: boolean
  order: number
  footerOrder?: number
  children?: NavigationItem[]
}

export type Travel = z.infer<typeof travelSchema>
export type TravelCards = z.infer<typeof travelCardsSchema>
export type TravelSliderCard = z.infer<typeof travelCardSchema>
export type TravelSliderDetailBlock = z.infer<typeof travelDetailBlockSchema>
export type PhotographyPhotoContent = z.infer<typeof photoRecordSchema>
export type PhotographySeriesContent = z.infer<typeof photographySeriesSchema>
export type HobbyItem = z.infer<typeof hobbyItemSchema>
export type HobbyCategory = z.infer<typeof hobbyCategorySchema>
export type HobbyProfileContent = z.infer<typeof hobbyProfileSchema>
export type MonthlyDigest = z.infer<typeof monthlyDigestSchema>
export type HobbyContent = HobbyProfileContent & {
  featured: HobbyCategory[]
  monthlyDigest: MonthlyDigest[]
}
export type HomepageContent = z.infer<typeof homepageSchema>
export type ProfileContent = z.infer<typeof profileSchema>
export type ContactContent = z.infer<typeof contactSchema>
export type ContactInfo = ContactContent & {
  email: string
  wechat: string
}
