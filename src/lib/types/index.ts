import type {
  HobbyContent,
  PhotographyPhotoContent,
} from '@/lib/content/schemas'

export type {
  HobbyCategory,
  HobbyItem,
  MonthlyDigest,
  Travel,
} from '@/lib/content/schemas'

export const PhotoCategory = {
  All: 'all',
  Street: 'street',
  Pets: 'pets',
  Project: 'project',
} as const

export type PhotoCategory =
  (typeof PhotoCategory)[keyof typeof PhotoCategory]

export type Photo = PhotographyPhotoContent & {
  category: PhotoCategory
}

export type Hobby = HobbyContent
