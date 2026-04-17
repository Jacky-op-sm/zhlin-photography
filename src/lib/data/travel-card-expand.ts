import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { TravelExpandMap } from '@/lib/types/travel-expand';
import { parseExpandMarkdown } from '@/lib/data/travel-markdown';

const EXPAND_MD_BY_SLUG: Record<string, string> = {
  nanjing: 'data/travel-card-expand-extract/nanjing-card-expand.md',
  hangzhou: 'data/travel-card-expand-extract/hangzhou-card-expand.md',
  huzhou: 'data/travel-card-expand-extract/huzhou-card-expand.md',
  japan: 'data/travel-card-expand-extract/japan-card-expand.md',
  shanghai: 'data/travel-card-expand-extract/shanghai-card-expand.md',
  beijing: 'data/travel-card-expand-extract/beijing-card-expand.md',
  dongbei: 'data/travel-card-expand-extract/dongbei-card-expand.md',
};

const expandCache = new Map<string, Promise<TravelExpandMap | null>>();

export async function getTravelExpandMapBySlug(slug: string): Promise<TravelExpandMap | null> {
  const cached = expandCache.get(slug);
  if (cached) return cached;

  const promise = (async () => {
  const file = EXPAND_MD_BY_SLUG[slug];
    if (!file) return null;

  const abs = path.join(process.cwd(), file);
  let md = '';

  try {
    md = await readFile(abs, 'utf8');
  } catch {
    return null;
  }

    return parseExpandMarkdown(md);
  })();

  expandCache.set(slug, promise);
  return promise;
}
