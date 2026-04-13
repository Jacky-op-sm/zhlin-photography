import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const travelJsonPath = path.join(root, 'data', 'travel.json');
const outPath = path.join(root, 'data', 'travel-card-expand-extract', 'dongbei-card-expand.md');

const raw = fs.readFileSync(travelJsonPath, 'utf8');
const json = JSON.parse(raw);
const dongbei = json.travel.find((item) => item.slug === 'dongbei');

if (!dongbei) {
  throw new Error('Cannot find dongbei in data/travel.json');
}

const sections = dongbei.storySections;

const cards = [
  {
    name: '初到沈阳',
    eyebrow: '第一天',
    title: '雪白和欢庆的世界',
    cardIndex: 1,
    blocks: [
      { image: '/assets/travel/dongbei/0206/p1.jpeg', parts: [{ sectionIndex: 1, start: 1, end: 5 }] },
      { image: '/assets/travel/dongbei/0206/p4.jpeg', parts: [{ sectionIndex: 2, start: 1, end: 6 }] },
    ],
  },
  {
    name: '沈阳故宫',
    eyebrow: '第二天',
    title: '实在没有可看的东西',
    cardIndex: 2,
    blocks: [
      { image: '/assets/travel/dongbei/0207/c1.jpeg', parts: [{ sectionIndex: 4, start: 1, end: 4 }] },
      { image: '/assets/travel/dongbei/0207/t4.jpeg', parts: [{ sectionIndex: 5, start: 1, end: 12 }] },
    ],
  },
  {
    name: '冰雪新天地',
    eyebrow: '第三天',
    title: '被砸的痛苦',
    cardIndex: 3,
    blocks: [{ image: '/assets/travel/dongbei/0208/c3.jpeg', parts: [{ sectionIndex: 7, start: 1, end: 7 }] }],
  },
  {
    name: '天定山',
    eyebrow: '第三天',
    title: '体会到滑雪的快乐',
    cardIndex: 4,
    blocks: [{ image: '/assets/travel/dongbei/0208/p8.jpeg', parts: [{ sectionIndex: 8, start: 1, end: 9 }] }],
  },
  {
    name: '长白山',
    eyebrow: '第四天',
    title: '速通老里克湖',
    cardIndex: 5,
    blocks: [{ image: '/assets/travel/dongbei/changbai-portrait-white-fur-hat.jpeg', parts: [{ sectionIndex: 10, start: 1, end: 13 }] }],
  },
  {
    name: '长白山',
    eyebrow: '第五天',
    title: '早起去雾凇漂流',
    cardIndex: 6,
    blocks: [
      { image: '/assets/travel/dongbei/changbai-portrait-earmuffs.jpeg', parts: [{ sectionIndex: 12, start: 1, end: 6 }] },
      { image: '/assets/travel/dongbei/changbai-portrait-brown-hat.jpeg', parts: [{ sectionIndex: 13, start: 1, end: 5 }] },
    ],
  },
  {
    name: '北大湖',
    eyebrow: '第六天',
    title: '拿命下来的中级道',
    cardIndex: 7,
    blocks: [
      { image: '/assets/travel/dongbei/beidahu-snow-portrait.jpeg', parts: [{ sectionIndex: 16, start: 1, end: 24 }] },
      { image: '/assets/travel/dongbei/0211/t1.jpeg', parts: [{ sectionIndex: 17, start: 1, end: 6 }] },
    ],
  },
  {
    name: '哈尔滨夜景',
    eyebrow: '第七天',
    title: '索菲亚教堂',
    cardIndex: 8,
    blocks: [
      { image: '/assets/travel/dongbei/0212/p1.jpeg', parts: [{ sectionIndex: 19, start: 1, end: 8 }] },
      { image: '/assets/travel/dongbei/0212/c3.jpeg', parts: [{ sectionIndex: 20, start: 1, end: 9 }] },
    ],
  },
  {
    name: '松花江',
    eyebrow: '第八天',
    title: '行走在结冰的松花江',
    cardIndex: 9,
    blocks: [
      { image: '/assets/travel/dongbei/0213/t2.jpeg', parts: [{ sectionIndex: 22, start: 1, end: 12 }] },
      { image: '/assets/travel/dongbei/0213/p3.jpeg', parts: [{ sectionIndex: 23, start: 1, end: 13 }] },
    ],
  },
  {
    name: '哈尔滨大剧院',
    eyebrow: '第八天',
    title: '初次欣赏戏剧《哈姆雷特》',
    cardIndex: 10,
    blocks: [{ image: '/assets/travel/dongbei/0213/c2.jpeg', parts: [{ sectionIndex: 24, start: 1, end: 27 }] }],
  },
  {
    name: '龙塔',
    eyebrow: '第九天',
    title: '真有必要上这类塔嘛',
    cardIndex: 11,
    blocks: [{ image: '/assets/travel/dongbei/longta-night.jpeg', parts: [{ sectionIndex: 28, start: 1, end: 11 }] }],
  },
  {
    name: '哈尔滨漫步',
    eyebrow: '第十天',
    title: '夜晚的城市漫步：松花江',
    cardIndex: 12,
    blocks: [
      { image: '/assets/travel/dongbei/0215/p8.jpeg', parts: [{ sectionIndex: 30, start: 1, end: 12 }] },
      { image: '/assets/travel/dongbei/0215/t3.jpeg', parts: [{ sectionIndex: 31, start: 1, end: 16 }] },
    ],
  },
  {
    name: '结尾',
    eyebrow: '总结',
    title: '此次东北旅行的总结',
    cardIndex: 13,
    blocks: [{ image: '/assets/travel/dongbei/harbin-window-snow-night.jpeg', parts: [{ sectionIndex: 35, start: 1, end: 7 }] }],
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

let md = '# 东北 Card 展开内容（草稿）\n\n';

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
