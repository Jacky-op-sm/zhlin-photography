import 'server-only';
import { getTravelCardsContentBySlug } from '@/lib/content/travel';
import { getTravelBySlug } from '@/lib/data/travel';
import type { TravelSliderCard } from '@/lib/types/travel-slider';

const FOOD_SLUGS = new Set(['japan', 'nanjing', 'shanghai', 'beijing', 'dongbei']);

type BaseCard = Omit<TravelSliderCard, 'detailBlocks'>;

function makeSingleDetailCard(card: BaseCard): TravelSliderCard {
  return {
    ...card,
    detailBlocks: [
      {
        text: card.body,
        imageSrc: card.imageSrc,
        imageAlt: card.imageAlt,
      },
    ],
  };
}

async function getFallbackTravelCards(slug: string, eyebrow: string): Promise<TravelSliderCard[]> {
  const travel = await getTravelBySlug(slug);
  if (!travel) return [];

  const title = travel.cardTitle.replace(/游记/g, '').trim() || travel.cardTitle;

  return [
    makeSingleDetailCard({
      eyebrow,
      title,
      body: travel.summary,
      imageSrc: travel.hero,
      imageAlt: travel.cardTitle,
    }),
  ];
}

export async function getTravelSpotSliderCardsBySlug(slug: string): Promise<TravelSliderCard[]> {
  const cards = getTravelCardsContentBySlug(slug);

  if (cards?.spots.length) {
    return cards.spots;
  }

  return getFallbackTravelCards(slug, '旅途');
}

export async function getTravelBookstoreSliderCardsBySlug(slug: string): Promise<TravelSliderCard[]> {
  return getTravelCardsContentBySlug(slug)?.bookstores ?? [];
}

export async function getTravelFoodSliderCardsBySlug(slug: string): Promise<TravelSliderCard[]> {
  const cards = getTravelCardsContentBySlug(slug);

  if (cards?.food.length) {
    return cards.food;
  }

  if (!FOOD_SLUGS.has(slug)) {
    return [];
  }

  return getFallbackTravelCards(slug, '美食');
}
