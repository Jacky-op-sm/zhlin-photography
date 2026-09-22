import 'server-only'

import { readContentDirNames, readContentJson } from '@/lib/content/read'
import {
  travelCardsSchema,
  travelSchema,
  type Travel,
  type TravelCards,
} from '@/lib/content/schemas'

let travelSlugsCache: string[] | null = null
const travelMetaCache = new Map<string, Travel>()
const travelCardsCache = new Map<string, TravelCards>()

export function getTravelSlugs() {
  travelSlugsCache ??= readContentDirNames('travel')
  return travelSlugsCache
}

export function getAllTravel() {
  return getTravelSlugs()
    .map(getTravelBySlug)
    .filter((travel): travel is Travel => travel !== null)
}

export function getTravelBySlug(slug: string) {
  if (!getTravelSlugs().includes(slug)) return null

  if (!travelMetaCache.has(slug)) {
    travelMetaCache.set(
      slug,
      travelSchema.parse(readContentJson('travel', slug, 'meta.json')),
    )
  }
  return travelMetaCache.get(slug) ?? null
}

export function getTravelCardsBySlug(slug: string) {
  if (!getTravelSlugs().includes(slug)) return null

  if (!travelCardsCache.has(slug)) {
    travelCardsCache.set(
      slug,
      travelCardsSchema.parse(
        readContentJson('travel', slug, 'cards.json'),
      ),
    )
  }
  return travelCardsCache.get(slug) ?? null
}
