import 'server-only';
import {
  getAllTravelContent,
  getTravelContentBySlug,
  getTravelContentSlugs,
} from '@/lib/content/travel';
import type { Travel } from '@/lib/types';

export type TravelDetail = Travel & {
  bodyHtml: string;
};

export async function getAllTravel(): Promise<Travel[]> {
  return getAllTravelContent();
}

export async function getAllTravels(): Promise<Travel[]> {
  return getAllTravel();
}

export async function getTravelBySlug(slug: string): Promise<TravelDetail | null> {
  return getTravelContentBySlug(slug);
}

export function getTravelSlugs(): string[] {
  return getTravelContentSlugs();
}
