import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { TravelExpandMap } from '@/lib/types/travel-expand';
import { parseExpandMarkdown } from '@/lib/data/travel-markdown';

const FOOD_EXPAND_MD_BY_SLUG: Record<string, string> = {
  nanjing: 'data/travel-food-expand-extract/nanjing-food-expand.md',
  japan: 'data/travel-food-expand-extract/japan-food-expand.md',
  shanghai: 'data/travel-food-expand-extract/shanghai-food-expand.md',
  beijing: 'data/travel-food-expand-extract/beijing-food-expand.md',
  dongbei: 'data/travel-food-expand-extract/dongbei-food-expand.md',
};

export async function getTravelFoodExpandMapBySlug(slug: string): Promise<TravelExpandMap | null> {
  const file = FOOD_EXPAND_MD_BY_SLUG[slug];
  if (!file) return null;

  const abs = path.join(process.cwd(), file);
  let md = '';

  try {
    md = await readFile(abs, 'utf8');
  } catch {
    return null;
  }

  return parseExpandMarkdown(md);
}
