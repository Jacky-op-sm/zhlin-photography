import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { TravelExpandCard, TravelExpandMap } from '@/lib/types/travel-expand';

const EXPAND_MD_BY_SLUG: Record<string, string> = {
  nanjing: 'data/travel-card-expand-extract/nanjing-card-expand.md',
};

export async function getTravelExpandMapBySlug(slug: string): Promise<TravelExpandMap | null> {
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
}

function parseExpandMarkdown(markdown: string): TravelExpandMap {
  const lines = markdown.split(/\r?\n/);
  const cards: TravelExpandCard[] = [];

  let i = 0;
  while (i < lines.length) {
    const cardHeading = lines[i].match(/^##\s+卡片：(.+)$/);
    if (!cardHeading) {
      i += 1;
      continue;
    }

    const cardName = cardHeading[1].trim();
    i += 1;

    let eyebrow = '';
    let title = '';
    let cardIndex = 0;
    const blocks: TravelExpandBlock[] = [];

    while (i < lines.length && !lines[i].startsWith('## 卡片：')) {
      const eyebrowMatch = lines[i].match(/^-\s*页面小标题（eyebrow）：\s*(.*)$/);
      if (eyebrowMatch) eyebrow = eyebrowMatch[1].trim();

      const titleMatch = lines[i].match(/^-\s*页面主标题（title）：\s*(.*)$/);
      if (titleMatch) title = titleMatch[1].trim();

      const indexMatch = lines[i].match(/^-\s*对应卡片序号：\s*(\d+)$/);
      if (indexMatch) cardIndex = Number.parseInt(indexMatch[1], 10);

      const blockHeading = lines[i].match(/^###\s+内容块\s+\d+$/);
      if (blockHeading) {
        i += 1;

        let imageSrc = '';
        const bodyLines: string[] = [];

        while (i < lines.length && !lines[i].startsWith('### 内容块') && !lines[i].startsWith('## 卡片：')) {
          const imageMatch = lines[i].match(/^-\s*图片：\s*`([^`]+)`\s*$/);
          if (imageMatch) {
            imageSrc = imageMatch[1].trim();
            i += 1;
            continue;
          }

          if (lines[i].startsWith('- 正文：')) {
            i += 1;
            while (i < lines.length && !lines[i].startsWith('### 内容块') && !lines[i].startsWith('## 卡片：')) {
              bodyLines.push(lines[i]);
              i += 1;
            }
            break;
          }

          i += 1;
        }

        const body = bodyLines.join('\n').trim();
        if (imageSrc || body) {
          blocks.push({ imageSrc, body });
        }
        continue;
      }

      i += 1;
    }

    const normalizedTitle = title || cardName;
    cards.push({
      cardName,
      eyebrow,
      title: normalizedTitle,
      cardIndex,
      blocks,
    });
  }

  const map: TravelExpandMap = {};
  for (const card of cards) {
    if (card.title) map[card.title] = card;
  }

  return map;
}
