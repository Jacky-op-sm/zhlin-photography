import type {
  HobbyContent,
  PhotographyPhotoContent,
  PhotographySeriesContent,
} from '@/lib/content/schemas'

export type {
  HobbyCategory,
  HobbyItem,
  MonthlyDigest,
  Travel,
} from '@/lib/content/schemas'

export type PhotoCategory = PhotographySeriesContent['slug']

export type Photo = PhotographyPhotoContent & {
  category: PhotoCategory
}

export type Hobby = HobbyContent
