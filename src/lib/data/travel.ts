import travelData from '../../../data/travel.json';
import travelRawData from '../../../data/travel-raw.json';
import type { Travel, TravelCollection } from '../types';

interface TravelRawEntry {
  slug: string;
  bodyHtml: string;
}

interface TravelRawCollection {
  travel: TravelRawEntry[];
}

export type TravelDetail = Travel & {
  bodyHtml: string;
};

const collection = travelData as TravelCollection;
const rawCollection = travelRawData as TravelRawCollection;

const travelEntries = Array.isArray(collection.travel) ? collection.travel : [];
const rawEntries = Array.isArray(rawCollection.travel) ? rawCollection.travel : [];

const rawBySlug = new Map(rawEntries.map((item) => [item.slug, item.bodyHtml]));

const travelDetailEntries: TravelDetail[] = travelEntries.map((item) => ({
  ...item,
  bodyHtml: rawBySlug.get(item.slug) ?? '',
}));

const travelBySlug = new Map(travelDetailEntries.map((item) => [item.slug, item]));

let cachedTravel: Travel[] | null = null;

export async function getAllTravel(): Promise<Travel[]> {
  if (!cachedTravel) {
    cachedTravel = travelEntries;
  }

  return cachedTravel;
}

export async function getTravelBySlug(slug: string): Promise<TravelDetail | null> {
  const travel = travelBySlug.get(slug);
  return travel ?? null;
}

export function getTravelSlugs(): string[] {
  return travelEntries.map((travel) => travel.slug);
}
