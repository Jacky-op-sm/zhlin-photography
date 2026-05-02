import 'server-only';
import {
  readContentDirNames,
  readContentJson,
  readContentText,
} from '@/lib/content/read';
import type {
  TravelCardsContentFile,
  TravelContentFile,
  TravelContentRecord,
} from '@/lib/content/types';

let travelRecordsCache: TravelContentRecord[] | null = null;
const travelCardsCache = new Map<string, TravelCardsContentFile | null>();

function loadTravelRecord(slug: string): TravelContentRecord {
  const meta = readContentJson<TravelContentFile>('travel', slug, 'meta.json');
  const bodyHtml = readContentText('travel', slug, 'story.md');

  return {
    ...meta,
    bodyHtml,
  };
}

export function getTravelContentSlugs() {
  return readContentDirNames('travel');
}

export function getAllTravelContent() {
  if (!travelRecordsCache) {
    travelRecordsCache = getTravelContentSlugs().map(loadTravelRecord);
  }

  return travelRecordsCache;
}

export function getTravelContentBySlug(slug: string) {
  return getAllTravelContent().find((travel) => travel.slug === slug) ?? null;
}

export function getTravelCardsContentBySlug(slug: string) {
  if (travelCardsCache.has(slug)) {
    return travelCardsCache.get(slug) ?? null;
  }

  try {
    const cards = readContentJson<TravelCardsContentFile>('travel', slug, 'cards.json');
    travelCardsCache.set(slug, cards);
    return cards;
  } catch {
    travelCardsCache.set(slug, null);
    return null;
  }
}
