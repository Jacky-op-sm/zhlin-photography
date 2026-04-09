import travelData from '../../../data/travel.json';
import type { Travel, TravelCollection } from '../types';

const collection = travelData as TravelCollection;
const travelEntries = Array.isArray(collection.travel) ? collection.travel : [];
const travelBySlug = new Map(travelEntries.map((item) => [item.slug, item]));

let cachedTravel: Travel[] | null = null;

export async function getAllTravel(): Promise<Travel[]> {
  if (!cachedTravel) {
    cachedTravel = travelEntries;
  }

  return cachedTravel;
}

export async function getTravelBySlug(slug: string): Promise<Travel | null> {
  const travel = travelBySlug.get(slug);
  return travel ?? null;
}

export function getTravelSlugs(): string[] {
  return travelEntries.map((travel) => travel.slug);
}
