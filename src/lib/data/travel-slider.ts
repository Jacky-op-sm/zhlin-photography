import 'server-only';
import { getTravelBySlug } from '@/lib/data/travel';
import { getTravelCardExtractItemsBySlug, type TravelCardExtractItem } from '@/lib/data/travel-card-extract';
import { getTravelExpandMapBySlug } from '@/lib/data/travel-card-expand';
import { getTravelFoodExpandMapBySlug } from '@/lib/data/travel-food-expand';
import { getTravelFoodExtractItemsBySlug, type TravelFoodExtractItem } from '@/lib/data/travel-food-extract';
import type { TravelSliderCard, TravelSliderDetailBlock } from '@/lib/types/travel-slider';
import type { TravelExpandMap } from '@/lib/types/travel-expand';

const FOOD_SLUGS = new Set(['japan', 'nanjing', 'shanghai', 'beijing', 'dongbei']);

type BaseCard = Omit<TravelSliderCard, 'detailBlocks'>;

type ExtractLikeItem = TravelCardExtractItem | TravelFoodExtractItem;

function normalizeCompareText(text: string): string {
  return text.replace(/\s+/g, '').replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '').toLowerCase();
}

function makeSingleDetailBlock(card: BaseCard): TravelSliderDetailBlock[] {
  return [
    {
      text: card.body,
      imageSrc: card.imageSrc,
      imageAlt: card.imageAlt,
    },
  ];
}

function mergeDuplicateCardsByTitle(cards: TravelSliderCard[]): TravelSliderCard[] {
  const mergedCards: TravelSliderCard[] = [];
  const cardByTitle = new Map<string, TravelSliderCard>();

  for (const card of cards) {
    const key = normalizeCompareText(card.title);
    const existingCard = cardByTitle.get(key);

    if (!existingCard) {
      const clonedCard = {
        ...card,
        detailBlocks: [...card.detailBlocks],
      };
      mergedCards.push(clonedCard);
      cardByTitle.set(key, clonedCard);
      continue;
    }

    const existingBlockKeys = new Set(
      existingCard.detailBlocks.map((block) => `${block.imageSrc}|${normalizeCompareText(block.text)}`),
    );

    for (const block of card.detailBlocks) {
      const blockKey = `${block.imageSrc}|${normalizeCompareText(block.text)}`;
      if (!existingBlockKeys.has(blockKey)) {
        existingCard.detailBlocks.push(block);
        existingBlockKeys.add(blockKey);
      }
    }
  }

  return mergedCards;
}

function buildBaseCardsFromExtract(items: ExtractLikeItem[]): BaseCard[] {
  return items.map((item) => ({
    eyebrow: item.eyebrow,
    title: item.title,
    body: item.body,
    imageSrc: item.imageSrc,
    imageAlt: item.title,
  }));
}

function buildBaseCardsFromExpand(expandMap: TravelExpandMap): BaseCard[] {
  return Object.values(expandMap)
    .sort((a, b) => a.cardIndex - b.cardIndex)
    .map((card) => {
      const firstBlock = card.blocks[0];
      const firstParagraph = firstBlock?.body?.split(/\n\s*\n/).find((line) => line.trim().length > 0) ?? '';

      return {
        eyebrow: card.eyebrow || card.cardName,
        title: card.title,
        body: firstParagraph,
        imageSrc: firstBlock?.imageSrc || '',
        imageAlt: card.title,
      };
    })
    .filter((card) => card.title && card.body && card.imageSrc);
}

function buildDetailBlocksFromExpand(card: BaseCard, cardIndex: number, expandMap?: TravelExpandMap | null): TravelSliderDetailBlock[] {
  if (!expandMap) return makeSingleDetailBlock(card);

  const cards = Object.values(expandMap);
  if (cards.length === 0) return makeSingleDetailBlock(card);

  const normalizedTitle = normalizeCompareText(card.title);
  const exactMatch = cards.find((expandCard) => normalizeCompareText(expandCard.title) === normalizedTitle);
  const fuzzyMatch = cards.find((expandCard) => {
    const target = normalizeCompareText(expandCard.title);
    return target.includes(normalizedTitle) || normalizedTitle.includes(target);
  });
  const indexMatch = cards.find((expandCard) => expandCard.cardIndex === cardIndex);
  const matched = exactMatch ?? fuzzyMatch ?? indexMatch;

  if (!matched || matched.blocks.length === 0) {
    return makeSingleDetailBlock(card);
  }

  const detailBlocks = matched.blocks.map((block) => ({
    text: block.body,
    imageSrc: block.imageSrc || card.imageSrc,
    imageAlt: card.imageAlt || card.title,
  }));

  return detailBlocks.length > 0 ? detailBlocks : makeSingleDetailBlock(card);
}

function attachDetailBlocks(cards: BaseCard[], expandMap?: TravelExpandMap | null): TravelSliderCard[] {
  return cards.map((card, index) => ({
    ...card,
    detailBlocks: buildDetailBlocksFromExpand(card, index + 1, expandMap),
  }));
}

function buildCards({
  extractItems,
  expandMap,
  fallbackCards,
  mergeDuplicateTitles = false,
}: {
  extractItems: ExtractLikeItem[] | null;
  expandMap: TravelExpandMap | null;
  fallbackCards: BaseCard[];
  mergeDuplicateTitles?: boolean;
}): TravelSliderCard[] {
  const fromExtract = extractItems && extractItems.length > 0 ? buildBaseCardsFromExtract(extractItems) : [];
  if (fromExtract.length > 0) {
    const cards = attachDetailBlocks(fromExtract, expandMap);
    return mergeDuplicateTitles ? mergeDuplicateCardsByTitle(cards) : cards;
  }

  const fromExpand = expandMap ? buildBaseCardsFromExpand(expandMap) : [];
  if (fromExpand.length > 0) {
    const cards = attachDetailBlocks(fromExpand, expandMap);
    return mergeDuplicateTitles ? mergeDuplicateCardsByTitle(cards) : cards;
  }

  const cards = attachDetailBlocks(fallbackCards, expandMap);
  return mergeDuplicateTitles ? mergeDuplicateCardsByTitle(cards) : cards;
}

async function getFallbackTravelCards(slug: string, eyebrow: string): Promise<BaseCard[]> {
  const travel = await getTravelBySlug(slug);
  if (!travel) return [];

  const title = travel.cardTitle.replace(/游记/g, '').trim() || travel.cardTitle;
  return [
    {
      eyebrow,
      title,
      body: travel.summary,
      imageSrc: travel.hero,
      imageAlt: travel.cardTitle,
    },
  ];
}

export async function getTravelSpotSliderCardsBySlug(slug: string): Promise<TravelSliderCard[]> {
  const [extractItems, expandMap, fallbackCards] = await Promise.all([
    getTravelCardExtractItemsBySlug(slug),
    getTravelExpandMapBySlug(slug),
    getFallbackTravelCards(slug, '旅途'),
  ]);

  return buildCards({ extractItems, expandMap, fallbackCards });
}

export async function getTravelFoodSliderCardsBySlug(slug: string): Promise<TravelSliderCard[]> {
  if (!FOOD_SLUGS.has(slug)) return [];

  const [extractItems, expandMap, fallbackCards] = await Promise.all([
    getTravelFoodExtractItemsBySlug(slug),
    getTravelFoodExpandMapBySlug(slug),
    getFallbackTravelCards(slug, '美食'),
  ]);

  return buildCards({ extractItems, expandMap, fallbackCards, mergeDuplicateTitles: true });
}
