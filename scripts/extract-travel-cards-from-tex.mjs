import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const imageExts = ['.jpg', '.jpeg', '.png', '.webp'];

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = {
    city: 'hangzhou',
    cityName: '杭州',
    dryRun: false,
    refreshExcerpts: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--dry-run') {
      out.dryRun = true;
    } else if (arg === '--refresh-excerpts') {
      out.refreshExcerpts = true;
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      const value = args[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for ${arg}`);
      }
      out[key] = value;
      i += 1;
    }
  }

  if (!out.tex) {
    throw new Error('Usage: node scripts/extract-travel-cards-from-tex.mjs --tex <file.tex> [--city hangzhou] [--city-name 杭州]');
  }

  return out;
};

const stripBom = (text) => text.replace(/^\uFEFF/, '');

const normalizeBlankLines = (text) => {
  return text
    .split('\n')
    .map((line) => line.replace(/\s+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const cleanTexBody = (text) => {
  const lines = text.split('\n');
  const cleaned = [];

  for (const rawLine of lines) {
    let line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      cleaned.push('');
      continue;
    }

    if (trimmed.startsWith('%')) continue;
    if (/^\\(?:newpage|onefig|h|hh|tmd|label)\b/.test(trimmed)) continue;

    if (trimmed === '\\lb' || trimmed === '\\\\') {
      cleaned.push('');
      continue;
    }

    line = line.replace(/\\lb/g, '').replace(/\\\\\s*$/g, '').trimEnd();
    cleaned.push(line);
  }

  return normalizeBlankLines(cleaned.join('\n'));
};

const parseTexEntries = (texPath) => {
  const raw = fs.readFileSync(texPath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const entries = [];
  let currentTitle = '';

  for (let i = 0; i < lines.length; i += 1) {
    const titleMatch = lines[i].match(/\\hh\{([^}]*)\}/);
    if (titleMatch) {
      currentTitle = titleMatch[1].trim();
    }

    const labelMatch = lines[i].match(/\\label\{([^}]*)\}/);
    if (!labelMatch) continue;

    const label = labelMatch[1].trim();
    const bodyLines = [];
    let date = '';

    for (let j = i + 1; j < lines.length; j += 1) {
      const dateMatch = lines[j].match(/\\tmd\{([^}]*)\}/);
      if (dateMatch) {
        date = dateMatch[1].trim();
        break;
      }
      bodyLines.push(lines[j]);
    }

    const body = cleanTexBody(bodyLines.join('\n'));
    if (!body) continue;

    entries.push({
      label,
      sourceTitle: currentTitle || label,
      date,
      body,
    });
  }

  return entries;
};

const keyFor = (item) => `${item.label}||${item.sourceTitle}||${item.date}`;

const displayLabel = (label) => {
  if (label.startsWith('special:')) return label.slice('special:'.length);
  return label;
};

const findExistingCard = (cards, label) => {
  const candidates = new Set([label, displayLabel(label)]);
  return cards.find((card) => {
    return (
      candidates.has(card.label)
      || candidates.has(displayLabel(card.label))
      || candidates.has(card.name)
      || candidates.has(card.eyebrow)
    );
  });
};

const findExistingBlock = (card, entry) => {
  const exact = card.blocks.find((block) => block.sourceTitle === entry.sourceTitle && block.date === entry.date);
  if (exact) return exact;

  const sameDate = card.blocks.filter((block) => block.date === entry.date);
  if (sameDate.length === 1) return sameDate[0];

  const sameBody = card.blocks.find((block) => normalizeBlankLines(block.body) === normalizeBlankLines(entry.body));
  if (sameBody) return sameBody;

  return undefined;
};

const parseExistingExpand = (filePath) => {
  if (!fs.existsSync(filePath)) return [];

  const raw = stripBom(fs.readFileSync(filePath, 'utf8'));
  const cardMatches = [...raw.matchAll(/^## 卡片：(.+)$/gm)];
  const cards = [];

  for (let idx = 0; idx < cardMatches.length; idx += 1) {
    const start = cardMatches[idx].index;
    const end = idx + 1 < cardMatches.length ? cardMatches[idx + 1].index : raw.indexOf('\n## 来源说明', start);
    const chunk = raw.slice(start, end === -1 ? raw.length : end).trim();
    const name = cardMatches[idx][1].trim();
    const label = chunk.match(/^- label：`([^`]*)`/m)?.[1]?.trim() || name;
    const eyebrow = chunk.match(/^- 页面小标题（eyebrow）：(.+)$/m)?.[1]?.trim() || displayLabel(label);
    const title = chunk.match(/^- 页面主标题（title）：(.+)$/m)?.[1]?.trim() || name;
    const cardIndex = Number(chunk.match(/^- 对应卡片序号：(\d+)$/m)?.[1] || idx + 1);
    const blockMatches = [...chunk.matchAll(/^### 内容块 \d+$/gm)];
    const blocks = [];

    for (let blockIdx = 0; blockIdx < blockMatches.length; blockIdx += 1) {
      const blockStart = blockMatches[blockIdx].index;
      const blockEnd = blockIdx + 1 < blockMatches.length ? blockMatches[blockIdx + 1].index : chunk.length;
      const blockChunk = chunk.slice(blockStart, blockEnd).trim();
      const sourceTitle = blockChunk.match(/^- 来源篇章：(.+)$/m)?.[1]?.trim() || '';
      const date = blockChunk.match(/^- 日期：(.+)$/m)?.[1]?.trim() || '';
      const image = blockChunk.match(/^- 图片：`([^`]*)`/m)?.[1]?.trim() || '';
      const bodyMatch = blockChunk.match(/^- 正文：\n\n([\s\S]*?)\n\n- 图片：/m);
      const body = normalizeBlankLines(bodyMatch?.[1] || '');

      blocks.push({
        label,
        sourceTitle,
        date,
        body,
        image,
      });
    }

    cards.push({ name, label, eyebrow, title, cardIndex, blocks });
  }

  return cards;
};

const parseExistingExcerpts = (filePath) => {
  if (!fs.existsSync(filePath)) return new Map();

  const raw = stripBom(fs.readFileSync(filePath, 'utf8'));
  const cardMatches = [...raw.matchAll(/^## 第\d+块$/gm)];
  const excerpts = new Map();

  for (let idx = 0; idx < cardMatches.length; idx += 1) {
    const start = cardMatches[idx].index;
    const end = idx + 1 < cardMatches.length ? cardMatches[idx + 1].index : raw.indexOf('\n## 来源说明', start);
    const cardChunk = raw.slice(start, end === -1 ? raw.length : end).trim();
    const label = cardChunk.match(/^- label：`([^`]*)`/m)?.[1]?.trim();
    if (!label) continue;

    const blockMatches = [...cardChunk.matchAll(/^### 内容块 \d+$/gm)];
    for (let blockIdx = 0; blockIdx < blockMatches.length; blockIdx += 1) {
      const blockStart = blockMatches[blockIdx].index;
      const blockEnd = blockIdx + 1 < blockMatches.length ? blockMatches[blockIdx + 1].index : cardChunk.length;
      const blockChunk = cardChunk.slice(blockStart, blockEnd).trim();
      const sourceTitle = blockChunk.match(/^- 来源篇章：(.+)$/m)?.[1]?.trim() || '';
      const date = blockChunk.match(/^- 日期：(.+)$/m)?.[1]?.trim() || '';
      const excerpt = blockChunk.match(/^- 正文（原文摘录，60-90字）：(.+)$/m)?.[1]?.trim();
      if (excerpt) {
        excerpts.set(keyFor({ label, sourceTitle, date }), excerpt);
      }
    }
  }

  return excerpts;
};

const findImage = ({ city, label, ordinal, totalBlocks }) => {
  const dir = path.join(root, 'public', 'assets', 'travel', city);
  if (!fs.existsSync(dir)) return '';

  const candidates = [];
  if (totalBlocks > 1) candidates.push(`${label}${ordinal}`);
  candidates.push(label);
  candidates.push(displayLabel(label));
  if (totalBlocks === 1) candidates.push(`${label}1`, `${displayLabel(label)}1`);

  for (const base of candidates) {
    for (const ext of imageExts) {
      const relative = `/assets/travel/${city}/${base}${ext}`;
      const absolute = path.join(root, 'public', relative);
      if (fs.existsSync(absolute)) return relative;
    }
  }

  return '';
};

const fallbackImage = (city) => `待补充（请将图片放到 public/assets/travel/${city}/）`;

const makeExcerpt = (body) => {
  const text = body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && line !== '***')
    .join('');
  const chars = Array.from(text);

  if (chars.length <= 90) return text;

  const punctuation = new Set(['。', '！', '？', '；']);
  let cut = 90;
  for (let i = 89; i >= 59; i -= 1) {
    if (punctuation.has(chars[i])) {
      cut = i + 1;
      break;
    }
  }

  return chars.slice(0, cut).join('');
};

const mergeEntries = ({ existingCards, entries, city }) => {
  const cards = existingCards.map((card) => ({
    ...card,
    blocks: card.blocks.map((block) => ({ ...block })),
  }));

  let added = 0;
  let updated = 0;

  for (const entry of entries) {
    let card = findExistingCard(cards, entry.label);
    if (!card) {
      const name = displayLabel(entry.label);
      card = {
        name,
        label: entry.label,
        eyebrow: name,
        title: entry.sourceTitle,
        cardIndex: cards.length + 1,
        blocks: [],
      };
      cards.push(card);
    }

    if (card.label !== entry.label && (card.name === entry.label || card.eyebrow === entry.label)) {
      card.label = entry.label;
      for (const block of card.blocks) {
        block.label = entry.label;
      }
      updated += 1;
    }

    const existingBlock = findExistingBlock(card, entry);
    if (existingBlock) {
      if (
        existingBlock.body !== entry.body
        || existingBlock.sourceTitle !== entry.sourceTitle
        || existingBlock.label !== entry.label
      ) {
        existingBlock.body = entry.body;
        existingBlock.sourceTitle = entry.sourceTitle;
        existingBlock.label = entry.label;
        updated += 1;
      }
      continue;
    }

    card.blocks.push({
      ...entry,
      image: '',
    });
    added += 1;
  }

  for (const card of cards) {
    card.blocks.forEach((block, index) => {
      if (!block.image || block.image.startsWith('待补充')) {
        block.image = findImage({
          city,
          label: card.label,
          ordinal: index + 1,
          totalBlocks: card.blocks.length,
        }) || fallbackImage(city);
      }
    });
  }

  cards.forEach((card, index) => {
    card.cardIndex = index + 1;
  });

  return { cards, added, updated };
};

const renderExpand = ({ cards, cityName, city }) => {
  let md = `# ${cityName} Card 展开内容（按 label 聚合）\n\n`;

  for (const card of cards) {
    md += `## 卡片：${card.name}\n`;
    md += `- label：\`${card.label}\`\n`;
    md += `- 页面小标题（eyebrow）：${card.eyebrow}\n`;
    md += `- 页面主标题（title）：${card.title}\n`;
    md += `- 对应卡片序号：${card.cardIndex}\n\n`;

    card.blocks.forEach((block, index) => {
      md += `### 内容块 ${index + 1}\n`;
      md += `- 来源篇章：${block.sourceTitle}\n`;
      md += `- 日期：${block.date}\n`;
      md += '- 正文：\n\n';
      md += `${normalizeBlankLines(block.body)}\n\n`;
      md += `- 图片：\`${block.image}\`\n\n`;
    });
  }

  md += '## 来源说明（统一）\n\n';
  md += '- 映射规则：传入的 TeX 文件中每个 `\\label{...}` 标记对应一个卡片归属；相同 label 聚合为同一张卡片。\n';
  md += '- 增量规则：以 `label + 来源篇章 + 日期` 作为唯一键；已有内容块更新正文，不重复追加。\n';
  md += '- 内容块规则：同一 label 在不同 `\\hh{...}` 篇章中出现时，每个篇章拆为一个独立内容块。\n';
  md += '- 大标题来源：新卡片默认使用对应 `\\hh{...}`；已有卡片保留 md 中的人工标题。\n';
  md += '- 正文来源：各 `\\label` 后至本篇章 `\\tmd{...}` 前的正文逐字摘录，仅移除 TeX 标记、注释与换页命令。\n';
  md += `- 图片来源：来自 \`public/assets/travel/${city}/\` 现有素材，按 label 与内容块序号匹配；找不到时标记为待补充。\n`;

  return md;
};

const renderExtract = ({ cards, cityName, city, existingExcerpts, refreshExcerpts }) => {
  let md = `# ${cityName}卡片提取清单（按 label 聚合）\n\n`;

  cards.forEach((card, cardIndex) => {
    md += `## 第${cardIndex + 1}块\n`;
    md += `- label：\`${card.label}\`\n`;
    md += `- 小标题：${card.eyebrow}\n`;
    md += `- 大标题：${card.title}\n`;
    md += `- 内容块数：${card.blocks.length}\n\n`;

    card.blocks.forEach((block, blockIndex) => {
      const blockKey = keyFor({ ...block, label: card.label });
      const excerpt = !refreshExcerpts && existingExcerpts.has(blockKey)
        ? existingExcerpts.get(blockKey)
        : makeExcerpt(block.body);
      md += `### 内容块 ${blockIndex + 1}\n`;
      md += `- 来源篇章：${block.sourceTitle}\n`;
      md += `- 日期：${block.date}\n`;
      md += `- 正文（原文摘录，60-90字）：${excerpt}\n`;
      md += `- 图片：\`${block.image}\`\n\n`;
    });
  });

  md += '## 来源说明（统一）\n\n';
  md += '- 映射规则：传入的 TeX 文件中每个 `\\label{...}` 标记对应一个卡片归属；相同 label 聚合为同一张卡片。\n';
  md += '- 增量规则：以 `label + 来源篇章 + 日期` 作为唯一键；已有内容块不重复追加。\n';
  md += '- 内容块规则：同一 label 在不同 `\\hh{...}` 篇章中出现时，每个篇章拆为一个独立内容块。\n';
  md += '- 大标题来源：新卡片默认使用对应 `\\hh{...}`；已有卡片保留 md 中的人工标题。\n';
  md += '- 正文来源：各 `\\label` 后至本篇章 `\\tmd{...}` 前的正文逐字摘录，不做改写。\n';
  md += `- 图片来源：来自 \`public/assets/travel/${city}/\` 现有素材，按 label 与内容块序号匹配；找不到时标记为待补充。\n`;

  return md;
};

const main = () => {
  const options = parseArgs();
  const texPath = path.resolve(options.tex);
  const expandPath = path.join(root, 'data', 'travel-card-expand-extract', `${options.city}-card-expand.md`);
  const extractPath = path.join(root, 'data', 'travel-card-extracts', `${options.city}-card-extracts.md`);

  const entries = parseTexEntries(texPath);
  const existingCards = parseExistingExpand(expandPath);
  const existingExcerpts = parseExistingExcerpts(extractPath);
  const { cards, added, updated } = mergeEntries({
    existingCards,
    entries,
    city: options.city,
  });

  const expandMd = renderExpand({
    cards,
    cityName: options.cityName,
    city: options.city,
  });
  const extractMd = renderExtract({
    cards,
    cityName: options.cityName,
    city: options.city,
    existingExcerpts,
    refreshExcerpts: options.refreshExcerpts,
  });

  if (!options.dryRun) {
    fs.mkdirSync(path.dirname(expandPath), { recursive: true });
    fs.mkdirSync(path.dirname(extractPath), { recursive: true });
    fs.writeFileSync(expandPath, expandMd, 'utf8');
    fs.writeFileSync(extractPath, extractMd, 'utf8');
  }

  console.log(`${options.dryRun ? 'Checked' : 'Updated'} ${options.cityName} travel cards`);
  console.log(`TeX labels found: ${entries.length}`);
  console.log(`Cards: ${cards.length}`);
  console.log(`Blocks added: ${added}`);
  console.log(`Blocks updated: ${updated}`);
  console.log(`Expand: ${path.relative(root, expandPath)}`);
  console.log(`Extract: ${path.relative(root, extractPath)}`);
};

main();
