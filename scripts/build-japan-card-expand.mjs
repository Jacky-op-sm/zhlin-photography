import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const travelJsonPath = path.join(root, 'data', 'travel.json');
const outPath = path.join(root, 'data', 'travel-card-expand-extract', 'japan-card-expand.md');

const raw = fs.readFileSync(travelJsonPath, 'utf8');
const json = JSON.parse(raw);
const japan = json.travel.find((item) => item.slug === 'japan');

if (!japan) {
  throw new Error('Cannot find japan in data/travel.json');
}

const sections = japan.storySections;

const cards = [
  {
    name: '前言',
    eyebrow: '前言',
    title: '为什么不想写游记了呢',
    cardIndex: 1,
    blocks: [{ image: '/assets/travel/japan-front.jpeg', sectionIndexes: [0] }],
  },
  {
    name: '航程',
    eyebrow: '航程',
    title: '春秋航空没问题',
    cardIndex: 2,
    blocks: [{ image: '/assets/travel/japan/01-flight-departure.jpeg', sectionIndexes: [2] }],
  },
  {
    name: '高松',
    eyebrow: '高松',
    title: '我们上次来，也是这个老头',
    cardIndex: 3,
    blocks: [
      { image: '/assets/travel/japan/13-takamatsu-jr-train.jpeg', sectionIndexes: [3] },
      { image: '/assets/travel/japan/02-takamatsu-rural-house.jpeg', sectionIndexes: [4] },
      { image: '/assets/travel/japan/04-ritsurin-garden.jpeg', sectionIndexes: [5] },
    ],
  },
  {
    name: '栗林公园',
    eyebrow: '栗林公园',
    title: '在绿色的栗林公园吃红色的刨冰',
    cardIndex: 4,
    blocks: [{ image: '/assets/travel/japan/05-ritsurin-kakigori.jpeg', sectionIndexes: [7] }],
  },
  {
    name: '直岛',
    eyebrow: '直岛',
    title: '海的那边就是直岛啊',
    cardIndex: 5,
    blocks: [
      {
        image: '/assets/travel/japan/07-naoshima-ferry-blue-sea.jpeg',
        parts: [{ sectionIndex: 9, start: 1, end: 3 }],
      },
      {
        image: '/assets/travel/japan/24-ferry-blue-hour.jpeg',
        parts: [{ sectionIndex: 9, start: 4, end: 5 }],
      },
      {
        image: '/assets/travel/japan/12-naoshima-pier-sunset.jpeg',
        parts: [{ sectionIndex: 9, start: 6, end: 7 }],
      },
    ],
  },
  {
    name: '直岛美术馆',
    eyebrow: '直岛美术馆',
    title: '收获了一张最完美的建筑摄影',
    cardIndex: 6,
    blocks: [{ image: '/assets/travel/japan/08-naoshima-museum-sign.jpeg', sectionIndexes: [11] }],
  },
  {
    name: '直岛徒步',
    eyebrow: '直岛徒步',
    title: '真是 fuck 季永伦了',
    cardIndex: 7,
    blocks: [
      { image: '/assets/travel/japan/38-naoshima-traffic-sign.jpeg', sectionIndexes: [13] },
      { image: '/assets/travel/japan/11-naoshima-pink-sky-town.jpeg', sectionIndexes: [15] },
      { image: '/assets/travel/japan/42-ferry-sunset-wide.jpeg', sectionIndexes: [14] },
    ],
  },
  {
    name: '返程',
    eyebrow: '返程',
    title: 'upgrade',
    cardIndex: 8,
    blocks: [{ image: '/assets/travel/japan/24-ferry-blue-hour.jpeg', sectionIndexes: [17] }],
  },
  {
    name: '屋岛',
    eyebrow: '屋岛',
    title: '一边打哈欠，一边拍夜景',
    cardIndex: 9,
    blocks: [
      {
        image: '/assets/travel/japan/13-takamatsu-jr-train.jpeg',
        parts: [{ sectionIndex: 19, start: 1, end: 5 }],
      },
      {
        image: '/assets/travel/japan/14-yashima-temple.jpeg',
        parts: [{ sectionIndex: 21, start: 1, end: 4 }],
      },
      {
        image: '/assets/travel/japan/15-yashima-observatory.jpeg',
        parts: [{ sectionIndex: 21, start: 5, end: 9 }],
      },
      {
        image: '/assets/travel/japan/43-shikoku-wood-architecture.jpeg',
        parts: [{ sectionIndex: 23, start: 1, end: 8 }],
      },
    ],
  },
  {
    name: '京都',
    eyebrow: '京都',
    title: '伏见稻荷与清水寺',
    cardIndex: 10,
    blocks: [{ image: '/assets/travel/japan/25-fushimi-inari-torii.jpeg', sectionIndexes: [32] }],
  },
  {
    name: '清水寺',
    eyebrow: '清水寺',
    title: '俄国姑娘嘴里一直说着 perfect',
    cardIndex: 11,
    blocks: [{ image: '/assets/travel/japan/28-kiyomizu-conan-shot.jpeg', sectionIndexes: [34] }],
  },
  {
    name: '鸭川',
    eyebrow: '鸭川',
    title: '什么才是京都的鸭川？',
    cardIndex: 12,
    blocks: [
      { image: '/assets/travel/japan/39-kamogawa-day.jpeg', parts: [{ sectionIndex: 36, start: 1, end: 1 }] },
      { image: '/assets/travel/japan/30-kyoto-kamogawa-night.jpeg', parts: [{ sectionIndex: 37, start: 1, end: 2 }] },
      { image: '/assets/travel/japan/29-kiyomizu-ninenzaka.jpeg', parts: [{ sectionIndex: 38, start: 1, end: 15 }] },
    ],
  },
  {
    name: '奈良',
    eyebrow: '奈良',
    title: '我们这些人恐怕才是入侵者吧',
    cardIndex: 13,
    blocks: [
      { image: '/assets/travel/japan/31-nara-deer-greeting.jpeg', parts: [{ sectionIndex: 40, start: 1, end: 5 }] },
      { image: '/assets/travel/japan/32-nara-todaiji.jpeg', parts: [{ sectionIndex: 41, start: 1, end: 4 }] },
      { image: '/assets/travel/japan/33-nara-luck-statue.jpeg', parts: [{ sectionIndex: 41, start: 5, end: 7 }] },
    ],
  },
  {
    name: '奈良喂鹿',
    eyebrow: '奈良喂鹿',
    title: '这已经不再是喂食，而是向鹿们求饶',
    cardIndex: 14,
    blocks: [{ image: '/assets/travel/japan/33-nara-luck-statue.jpeg', sectionIndexes: [43] }],
  },
  {
    name: '奈良偶遇',
    eyebrow: '奈良偶遇',
    title: '但她不知道的是其实我也不会日语',
    cardIndex: 15,
    blocks: [{ image: '/assets/travel/japan/34-nara-portrait.jpeg', sectionIndexes: [45] }],
  },
  {
    name: '若草山',
    eyebrow: '若草山',
    title: '像头被勾引的小鹿抵达山顶',
    cardIndex: 16,
    blocks: [{ image: '/assets/travel/japan/35-nara-mt-wakakusa-sunset.jpeg', sectionIndexes: [47] }],
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

let md = '# 日本 Card 展开内容（草稿）\n\n';

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
