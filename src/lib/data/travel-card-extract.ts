import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseExtractMarkdown, type TravelExtractItem } from '@/lib/data/travel-markdown';

export type TravelCardExtractItem = TravelExtractItem;

const EXTRACT_MD_BY_SLUG: Record<string, string> = {
  nanjing: 'data/travel-card-extracts/nanjing-card-2.md',
  hangzhou: 'data/travel-card-extracts/hangzhou-card-extracts.md',
  huzhou: 'data/travel-card-extracts/huzhou-card-extracts.md',
  japan: 'data/travel-card-extracts/japan-card-extracts.md',
  shanghai: 'data/travel-card-extracts/shanghai-card-extracts.md',
  beijing: 'data/travel-card-extracts/beijing-card-extracts.md',
  dongbei: 'data/travel-card-extracts/dongbei-card-extracts.md',
};

export async function getTravelCardExtractItemsBySlug(slug: string): Promise<TravelCardExtractItem[] | null> {
  const file = EXTRACT_MD_BY_SLUG[slug];
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
