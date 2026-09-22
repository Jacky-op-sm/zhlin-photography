import 'server-only'

import { getTravelBySlug, getTravelCardsBySlug } from '@/lib/content/travel'
import type { TravelSliderCard } from '@/lib/content/schemas'

const FOOD_SLUGS = new Set(['japan', 'nanjing', 'shanghai', 'beijing', 'dongbei'])

function makeFallbackCard(
  slug: string,
  eyebrow: string,
): TravelSliderCard[] {
  const travel = getTravelBySlug(slug)
  if (!travel) return []

  return [
    {
      eyebrow,
      title: travel.cardTitle.replace(/游记/g, '').trim() || travel.cardTitle,
      body: travel.summary,
      imageSrc: travel.hero,
      imageAlt: travel.cardTitle,
      detailBlocks: [
        {
          text: travel.summary,
          imageSrc: travel.hero,
          imageAlt: travel.cardTitle,
        },
      ],
    },
  ]
}

export function getTravelSpotCards(slug: string): TravelSliderCard[] {
  const cards = getTravelCardsBySlug(slug)
  return cards?.spots.length ? cards.spots : makeFallbackCard(slug, '旅途')
}

export function getTravelBookstoreCards(slug: string): TravelSliderCard[] {
  return getTravelCardsBySlug(slug)?.bookstores ?? []
}

export function getTravelFoodCards(slug: string): TravelSliderCard[] {
  const cards = getTravelCardsBySlug(slug)
  if (cards?.food.length) return cards.food
  return FOOD_SLUGS.has(slug) ? makeFallbackCard(slug, '美食') : []
}
