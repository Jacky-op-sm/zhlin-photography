import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseExtractMarkdown, type TravelExtractItem } from '@/lib/data/travel-markdown';

export type TravelFoodExtractItem = TravelExtractItem;

const FOOD_EXTRACT_MD_BY_SLUG: Record<string, string> = {
  nanjing: 'data/travel-food-extracts/nanjing-food-extracts.md',
  japan: 'data/travel-food-extracts/japan-food-extracts.md',
  shanghai: 'data/travel-food-extracts/shanghai-food-extracts.md',
  beijing: 'data/travel-food-extracts/beijing-food-extracts.md',
  dongbei: 'data/travel-food-extracts/dongbei-food-extracts.md',
};

export async function getTravelFoodExtractItemsBySlug(slug: string): Promise<TravelFoodExtractItem[] | null> {
  const file = FOOD_EXTRACT_MD_BY_SLUG[slug];
  if (!file) return null;

  const abs = path.join(process.cwd(), file);
  let md = '';

  try {
    md = await readFile(abs, 'utf8');
  } catch {
    return null;
  }

  const items = parseExtractMarkdown(md);
  return items.length > 0 ? items : null;
}
