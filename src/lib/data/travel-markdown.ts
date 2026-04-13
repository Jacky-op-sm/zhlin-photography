import type { TravelExpandBlock, TravelExpandCard, TravelExpandMap } from '@/lib/types/travel-expand';

export type TravelExtractItem = {
  eyebrow: string;
  title: string;
  body: string;
  imageSrc: string;
};

export function parseExtractMarkdown(markdown: string): TravelExtractItem[] {
  const lines = markdown.split(/\r?\n/);
  const items: TravelExtractItem[] = [];

  let eyebrow = '';
  let title = '';
  let body = '';
  let imageSrc = '';

  const flush = () => {
    if (!title && !eyebrow) return;
    items.push({
      eyebrow: eyebrow.trim(),
      title: title.trim(),
      body: body.trim(),
      imageSrc: normalizeImagePath(imageSrc.trim()),
    });
    eyebrow = '';
    title = '';
    body = '';
    imageSrc = '';
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (/^##\s+第\d+块/.test(line)) {
      flush();
      continue;
    }

    const eyebrowMatch = line.match(/^-\s*小标题：\s*(.+)$/);
    if (eyebrowMatch) {
      eyebrow = eyebrowMatch[1];
      continue;
    }

    const titleMatch = line.match(/^-\s*大标题：\s*(.+)$/);
    if (titleMatch) {
      title = titleMatch[1];
      continue;
    }

    const bodyMatch = line.match(/^-\s*正文（原文摘录[^）]*）：\s*(.+)$/);
    if (bodyMatch) {
      body = bodyMatch[1];
      continue;
    }

    const imageMatch = line.match(/^-\s*图片：\s*`([^`]+)`\s*$/);
    if (imageMatch) {
      imageSrc = imageMatch[1];
      continue;
    }
  }

  flush();

  return items.filter((item) => item.title && item.body && item.imageSrc);
}

export function parseExpandMarkdown(markdown: string): TravelExpandMap {
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
            imageSrc = normalizeImagePath(imageMatch[1].trim());
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

function normalizeImagePath(imagePath: string): string {
  if (imagePath.startsWith('public/')) {
    return `/${imagePath.slice('public/'.length)}`;
  }
  return imagePath;
}
