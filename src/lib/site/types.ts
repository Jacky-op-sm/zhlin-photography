import type { HomepageContent } from '@/lib/content/schemas'

export type {
  ContactContent,
  ContactInfo,
  HomepageContent,
  NavigationItem,
  ProfileContent,
} from '@/lib/content/schemas'

export type PhotographerShowcaseCard = HomepageContent['photography'][number]
export type TravellerShowcaseCard = HomepageContent['travel'][number]
export type HobbyistShowcaseCard = HomepageContent['hobby'][number]
