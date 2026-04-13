import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'data', 'travel-card-expand-extract');

const files = fs
  .readdirSync(dir)
  .filter((name) => name.endsWith('-card-expand.md'))
  .map((name) => path.join(dir, name));

const replacements = [
  ['领然接受', '欣然接受'],
  ['瞪着脚踏板', '蹬着脚踏板'],
  ['不上以前的', '比不上以前的'],
  ['特的去翻看', '特地去翻看'],
  ['内部还是对开放的', '内部还是对外开放的'],
  ['大数的人', '大多数人'],
  ['屁股的红裙上写着显眼的"FUCK"字的女士', '屁股位置的红裙上写着显眼“FUCK”字样的女士'],
  ['哪会是这么容易就能做到，然后拍下满意的照片呢，简直莫名其妙的。', '哪有那么容易做到边骑边拍、还拍得满意呢？简直莫名其妙。'],
  ['这位老师初见则有一些面善和熟悉', '这位老师初见时显得有些面善和熟悉'],
  ['我爹GPT', 'ChatGPT'],
];

let changedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles += 1;
    console.log(`Polished ${path.relative(root, file)}`);
  }
}

console.log(`Done. changed_files=${changedFiles}`);
