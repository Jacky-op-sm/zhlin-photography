import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const travelJsonPath = path.join(root, 'data', 'travel.json');
const outPath = path.join(root, 'data', 'travel-card-expand-extract', 'beijing-card-expand.md');

const raw = fs.readFileSync(travelJsonPath, 'utf8');
const json = JSON.parse(raw);
const beijing = json.travel.find((item) => item.slug === 'beijing');

if (!beijing) {
  throw new Error('Cannot find beijing in data/travel.json');
}

const sections = beijing.storySections;

const cards = [
  {
    name: '北京大学',
    eyebrow: 'July 1',
    title: '北京大学',
    cardIndex: 1,
    blocks: [{ image: '/assets/travel/beijing/pku-red-architecture.jpeg', parts: [{ sectionIndex: 0, start: 1, end: 3 }] }],
  },
  {
    name: '南锣鼓巷',
    eyebrow: '南锣鼓巷',
    title: '南锣鼓巷和天安门',
    cardIndex: 2,
    blocks: [{ image: '/assets/travel/beijing/nanluo-sunglasses-cat.jpeg', parts: [{ sectionIndex: 1, start: 1, end: 4 }] }],
  },
  {
    name: '北大图书馆',
    eyebrow: 'July 2',
    title: '尝试进北大图书馆',
    cardIndex: 3,
    blocks: [
      { image: '/assets/travel/beijing/pku-library-outside.png', parts: [{ sectionIndex: 2, start: 1, end: 6 }] },
      { image: '/assets/travel/beijing/national-library-reading-hall.jpeg', parts: [{ sectionIndex: 2, start: 7, end: 11 }] },
    ],
  },
  {
    name: '清华园',
    eyebrow: '清华园',
    title: '游清华园',
    cardIndex: 4,
    blocks: [
      { image: '/assets/travel/beijing/tsinghua-gate.png', parts: [{ sectionIndex: 3, start: 1, end: 5 }] },
      { image: '/assets/travel/beijing/tsinghua-lotus-pond.png', parts: [{ sectionIndex: 3, start: 6, end: 11 }] },
    ],
  },
  {
    name: '喜剧现场',
    eyebrow: 'July 3',
    title: '魔脱喜剧',
    cardIndex: 5,
    blocks: [{ image: '/assets/travel/beijing/motuo-stage.png', parts: [{ sectionIndex: 4, start: 1, end: 6 }] }],
  },
  {
    name: '三里屯',
    eyebrow: '三里屯',
    title: '三里屯商业街',
    cardIndex: 6,
    blocks: [
      { image: '/assets/travel/beijing/sanlitun-taikoo-li.png', parts: [{ sectionIndex: 5, start: 1, end: 6 }] },
      { image: '/assets/travel/beijing/sanlitun-apple.png', parts: [{ sectionIndex: 5, start: 7, end: 9 }] },
    ],
  },
  {
    name: '出租车',
    eyebrow: 'July 4',
    title: '听北京老司机键政',
    cardIndex: 7,
    blocks: [
      { image: '/assets/travel/beijing/taxi-driver-profile.jpeg', parts: [{ sectionIndex: 6, start: 1, end: 7 }] },
      { image: '/assets/travel/beijing/taxi-chat-night.jpeg', parts: [{ sectionIndex: 6, start: 8, end: 13 }] },
      { image: '/assets/travel/beijing/taxi-route-citylight.jpeg', parts: [{ sectionIndex: 6, start: 14, end: 19 }] },
    ],
  },
  {
    name: '圆明园',
    eyebrow: '圆明园',
    title: '游玩圆明园(走个过场)',
    cardIndex: 8,
    blocks: [
      { image: '/assets/travel/beijing/yuanmingyuan-stone-pavilion.jpeg', parts: [{ sectionIndex: 7, start: 1, end: 5 }] },
      { image: '/assets/travel/beijing/yuanmingyuan-zodiac.png', parts: [{ sectionIndex: 7, start: 6, end: 9 }] },
    ],
  },
  {
    name: '颐和园',
    eyebrow: 'July 6',
    title: '怒走颐和园',
    cardIndex: 9,
    blocks: [
      { image: '/assets/travel/beijing/summer-palace-kunming-lake-overlook.jpeg', parts: [{ sectionIndex: 8, start: 1, end: 5 }] },
      { image: '/assets/travel/beijing/summer-palace-arch-bridge.jpeg', parts: [{ sectionIndex: 8, start: 6, end: 9 }] },
      { image: '/assets/travel/beijing/summer-palace-tower-and-boat.jpeg', parts: [{ sectionIndex: 8, start: 10, end: 13 }] },
    ],
  },
  {
    name: '798',
    eyebrow: 'July 11',
    title: '798艺术区',
    cardIndex: 10,
    blocks: [
      { image: '/assets/travel/beijing/798-art-district-poster.jpeg', parts: [{ sectionIndex: 15, start: 1, end: 5 }] },
      { image: '/assets/travel/beijing/798-anime-wall.jpeg', parts: [{ sectionIndex: 15, start: 6, end: 10 }] },
      { image: '/assets/travel/beijing/798-anime-exhibit-photo.jpeg', parts: [{ sectionIndex: 15, start: 11, end: 14 }] },
    ],
  },
  {
    name: '植物园',
    eyebrow: 'July 12',
    title: '植物园',
    cardIndex: 11,
    blocks: [
      { image: '/assets/travel/beijing/botanical-garden-gate.jpeg', parts: [{ sectionIndex: 16, start: 1, end: 3 }] },
      { image: '/assets/travel/beijing/botanical-garden-flower.jpeg', parts: [{ sectionIndex: 16, start: 4, end: 5 }] },
      { image: '/assets/travel/beijing/botanical-garden-rain.jpeg', parts: [{ sectionIndex: 16, start: 6, end: 7 }] },
    ],
  },
  {
    name: '溜冰',
    eyebrow: 'July 8',
    title: '溜冰体验',
    cardIndex: 12,
    blocks: [
      { image: '/assets/travel/beijing/ice-rink-venue.jpeg', parts: [{ sectionIndex: 12, start: 1, end: 4 }] },
      { image: '/assets/travel/beijing/ice-skating-first-try.jpeg', parts: [{ sectionIndex: 12, start: 5, end: 8 }] },
      { image: '/assets/travel/beijing/ice-rink-fast.jpeg', parts: [{ sectionIndex: 12, start: 9, end: 11 }] },
    ],
  },
];

const getBlockBody = (block) => {
  const paras = [];
  const parts = [...(block.parts || [])];

  if (parts.length === 0 && Array.isArray(block.sectionIndexes)) {
    for (const sectionIndex of block.sectionIndexes) {
      parts.push({ sectionIndex, start: 1, end: undefined });
    }
  }

  for (const part of parts) {
    const section = sections[part.sectionIndex];
    if (!section) continue;
    const src = section.paragraphs || [];
    const start = Math.max(1, part.start || 1);
    const end = Math.min(src.length, part.end || src.length);

    for (let i = start - 1; i < end; i += 1) {
      const text = (src[i] || '').trim();
      if (!text || text === '***') continue;
      paras.push(text);
    }
  }

  return paras.join('\n\n');
};

let md = '# 北京 Card 展开内容（草稿）\n\n';

for (const card of cards) {
  md += `## 卡片：${card.name}\n`;
  md += `- 页面小标题（eyebrow）：${card.eyebrow}\n`;
  md += `- 页面主标题（title）：${card.title}\n`;
  md += `- 对应卡片序号：${card.cardIndex}\n\n`;

  card.blocks.forEach((block, idx) => {
    md += `### 内容块 ${idx + 1}\n`;
    md += `- 图片：\`${block.image}\`\n`;
    md += '- 正文：\n\n';
    md += `${getBlockBody(block)}\n\n`;
  });
}

fs.writeFileSync(outPath, md, 'utf8');
console.log(`Generated ${path.relative(root, outPath)}`);
