import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const travelJsonPath = path.join(root, 'data', 'travel.json');
const outPath = path.join(root, 'data', 'travel-card-expand-extract', 'shanghai-card-expand.md');

const raw = fs.readFileSync(travelJsonPath, 'utf8');
const json = JSON.parse(raw);
const shanghai = json.travel.find((item) => item.slug === 'shanghai');

if (!shanghai) {
  throw new Error('Cannot find shanghai in data/travel.json');
}

const sections = shanghai.storySections;

const cards = [
  {
    name: '前言',
    eyebrow: '前言',
    title: '该怎么组织游记的文字呢？',
    cardIndex: 1,
    blocks: [{ image: '/assets/travel/shanghai/story/bund-crowd-view.jpeg', parts: [{ sectionIndex: 0, start: 1, end: 5 }] }],
  },
  {
    name: '地铁',
    eyebrow: '初到上海',
    title: '精确到秒的上海地铁',
    cardIndex: 2,
    blocks: [
      { image: '/assets/travel/shanghai/story/metro-second-display.jpeg', parts: [{ sectionIndex: 1, start: 1, end: 4 }] },
      { image: '/assets/travel/shanghai/story/metro-second-display.jpeg', parts: [{ sectionIndex: 1, start: 5, end: 8 }] },
    ],
  },
  {
    name: '车厢',
    eyebrow: '车厢',
    title: '车厢里两小孩的国际象棋对局',
    cardIndex: 3,
    blocks: [{ image: '/assets/travel/shanghai/story/metro-chess-kids.jpeg', parts: [{ sectionIndex: 2, start: 1, end: 5 }] }],
  },
  {
    name: '黄浦江',
    eyebrow: '黄浦江',
    title: '黄浦江夜骑 8 km',
    cardIndex: 4,
    blocks: [
      { image: '/assets/travel/shanghai/story/huangpu-ferry-deck.jpeg', parts: [{ sectionIndex: 3, start: 1, end: 6 }] },
      { image: '/assets/travel/shanghai/story/huangpu-riverside-track.jpeg', parts: [{ sectionIndex: 3, start: 7, end: 11 }] },
      { image: '/assets/travel/shanghai/story/huangpu-lupu-bridge.jpeg', parts: [{ sectionIndex: 3, start: 12, end: 16 }] },
    ],
  },
  {
    name: '愚园路',
    eyebrow: '漫步与偶遇',
    title: '独自漫步之愚园路',
    cardIndex: 5,
    blocks: [
      { image: '/assets/travel/shanghai/story/jingan-city-lawn.jpeg', parts: [{ sectionIndex: 4, start: 1, end: 6 }] },
      { image: '/assets/travel/shanghai/story/yuyuan-elder-painting.jpeg', parts: [{ sectionIndex: 4, start: 7, end: 10 }] },
    ],
  },
  {
    name: '静安寺',
    eyebrow: '静安寺',
    title: '静安寺至 Apple Store 的三人行',
    cardIndex: 6,
    blocks: [
      { image: '/assets/travel/shanghai/story/jingan-temple-passby.jpeg', parts: [{ sectionIndex: 5, start: 1, end: 5 }] },
      { image: '/assets/travel/shanghai/story/jingan-city-lawn.jpeg', parts: [{ sectionIndex: 5, start: 6, end: 15 }] },
      { image: '/assets/travel/shanghai/story/jingan-apple-store.jpeg', parts: [{ sectionIndex: 5, start: 16, end: 20 }] },
    ],
  },
  {
    name: '教堂',
    eyebrow: '教堂',
    title: '偶遇法国人天主教洗礼',
    cardIndex: 7,
    blocks: [
      { image: '/assets/travel/shanghai/story/church-entrance.jpeg', parts: [{ sectionIndex: 6, start: 1, end: 10 }] },
      { image: '/assets/travel/shanghai/story/church-ritual-booklet.jpeg', parts: [{ sectionIndex: 6, start: 11, end: 23 }] },
      { image: '/assets/travel/shanghai/story/church-father-son-trumpet.jpeg', parts: [{ sectionIndex: 6, start: 24, end: 39 }] },
      { image: '/assets/travel/shanghai/story/church-father-son-trumpet.jpeg', parts: [{ sectionIndex: 6, start: 40, end: 55 }] },
    ],
  },
  {
    name: '电影博物馆',
    eyebrow: '电影博物馆',
    title: '被打断的上海电影博物馆',
    cardIndex: 8,
    blocks: [
      { image: '/assets/travel/shanghai/story/movie-museum-gate.jpeg', parts: [{ sectionIndex: 7, start: 1, end: 8 }] },
      { image: '/assets/travel/shanghai/story/movie-museum-leiyu.jpeg', parts: [{ sectionIndex: 7, start: 9, end: 18 }] },
    ],
  },
  {
    name: '外滩',
    eyebrow: '外滩',
    title: '外滩打卡的失落',
    cardIndex: 9,
    blocks: [
      { image: '/assets/travel/shanghai/story/bund-crowd-view.jpeg', parts: [{ sectionIndex: 8, start: 1, end: 6 }] },
      { image: '/assets/travel/shanghai/story/bund-clocktower-night.jpeg', parts: [{ sectionIndex: 8, start: 7, end: 12 }] },
      { image: '/assets/travel/shanghai/story/bund-golden-buildings.jpeg', parts: [{ sectionIndex: 8, start: 13, end: 16 }] },
    ],
  },
  {
    name: '出租车',
    eyebrow: '出租车',
    title: '与上海出租车司机的闲聊',
    cardIndex: 10,
    blocks: [
      { image: '/assets/travel/shanghai/story/taxi-lupu-underbridge.jpeg', parts: [{ sectionIndex: 9, start: 1, end: 13 }] },
      { image: '/assets/travel/shanghai/story/taxi-night-fisherman.jpeg', parts: [{ sectionIndex: 9, start: 14, end: 27 }] },
      { image: '/assets/travel/shanghai/story/taxi-riverside-midnight.jpeg', parts: [{ sectionIndex: 9, start: 28, end: 43 }] },
    ],
  },
  {
    name: '迪士尼',
    eyebrow: '重头戏',
    title: '白天的迪士尼',
    cardIndex: 11,
    blocks: [
      { image: '/assets/travel/shanghai/story/disney-castle-day.jpeg', parts: [{ sectionIndex: 10, start: 1, end: 4 }] },
      { image: '/assets/travel/shanghai/story/disney-parade-crowd.jpeg', parts: [{ sectionIndex: 10, start: 5, end: 7 }] },
    ],
  },
  {
    name: '朋友篇',
    eyebrow: '迪士尼',
    title: '朋友篇',
    cardIndex: 12,
    blocks: [
      { image: '/assets/travel/shanghai/story/disney-thomas-train.jpeg', parts: [{ sectionIndex: 11, start: 1, end: 6 }] },
      { image: '/assets/travel/shanghai/story/disney-clocktower.jpeg', parts: [{ sectionIndex: 11, start: 8, end: 11 }] },
      { image: '/assets/travel/shanghai/story/disney-snack-pink.jpeg', parts: [{ sectionIndex: 11, start: 13, end: 17 }] },
      { image: '/assets/travel/shanghai/story/disney-rabbit-toy.jpeg', parts: [{ sectionIndex: 11, start: 19, end: 24 }] },
    ],
  },
  {
    name: '烟花',
    eyebrow: '烟花',
    title: '烟花的尾声',
    cardIndex: 13,
    blocks: [{ image: '/assets/travel/shanghai/story/disney-fireworks-castle.jpeg', parts: [{ sectionIndex: 12, start: 1, end: 4 }] }],
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

let md = '# 上海 Card 展开内容（草稿）\n\n';

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
