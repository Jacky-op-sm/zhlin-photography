import type { Travel } from '../types';
import travelData from '@/data/travel.json';

/**
 * 获取所有旅行目的地
 */
export async function getAllTravels(): Promise<Travel[]> {
  return travelData.travels as Travel[];
}

/**
 * 根据 slug 获取单个旅行目的地
 */
export async function getTravelBySlug(slug: string): Promise<Travel | undefined> {
  const travels = await getAllTravels();
  return travels.find((t) => t.slug === slug);
}
