#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const assetsRoot = path.join(projectRoot, 'public', 'assets');

const maxTotalMb = Number(process.env.ASSET_TOTAL_MB ?? 80);
const maxFileMb = Number(process.env.ASSET_MAX_FILE_MB ?? 2);

const textSearchRoots = [
  'src',
  'data',
  'scripts',
  'e2e',
  'README.md',
  'next.config.js',
  'package.json',
  'tailwind.config.ts',
  'tailwind.config.js',
];

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(rootDir) {
  const files = [];

  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else {
        files.push(full);
      }
    }
  }

  await walk(rootDir);
  return files;
}

function stripTrailingPunctuation(value) {
  return value.replace(/[),.;:!?]+$/g, '');
}

async function collectAssetReferences() {
  const refs = new Set();
  const assetPattern = /\/assets\/[A-Za-z0-9_./\-]+/g;

  for (const item of textSearchRoots) {
    const target = path.join(projectRoot, item);
    if (!(await pathExists(target))) continue;

    const stat = await fs.stat(target);
    const files = stat.isDirectory() ? await walkFiles(target) : [target];

    for (const file of files) {
      let content = '';
      try {
        content = await fs.readFile(file, 'utf8');
      } catch {
        continue;
      }

      const matches = content.match(assetPattern);
      if (!matches) continue;

      for (const match of matches) {
        const normalized = stripTrailingPunctuation(match);
        refs.add(path.normalize(path.join(projectRoot, 'public', normalized)));
      }
    }
  }

  return refs;
}

function bytesToMb(bytes) {
  return bytes / 1024 / 1024;
}

const assetFiles = (await walkFiles(assetsRoot)).map((file) => path.normalize(file));
const references = await collectAssetReferences();

const ignoredBasenames = new Set(['.gitkeep']);
const metadataFiles = assetFiles.filter((file) => path.basename(file) === '.DS_Store');
const unreferenced = assetFiles.filter((file) => {
  const base = path.basename(file);
  if (base === '.DS_Store') return false;
  if (ignoredBasenames.has(base)) return false;
  return !references.has(file);
});

let totalBytes = 0;
const fileSizes = [];
for (const file of assetFiles) {
  const stat = await fs.stat(file);
  totalBytes += stat.size;
  fileSizes.push({ file, size: stat.size });
}

fileSizes.sort((a, b) => b.size - a.size);
const oversizedFiles = fileSizes.filter((item) => bytesToMb(item.size) > maxFileMb);

const failures = [];

if (metadataFiles.length > 0) {
  failures.push(`Found metadata junk files: ${metadataFiles.length}`);
}

if (unreferenced.length > 0) {
  failures.push(`Found unreferenced assets: ${unreferenced.length}`);
}

if (bytesToMb(totalBytes) > maxTotalMb) {
  failures.push(`Asset total ${bytesToMb(totalBytes).toFixed(2)}MB exceeds ${maxTotalMb}MB`);
}

if (oversizedFiles.length > 0) {
  failures.push(`Found ${oversizedFiles.length} files over ${maxFileMb}MB`);
}

console.log('Asset Check Summary');
console.log(`- total files: ${assetFiles.length}`);
console.log(`- total size: ${bytesToMb(totalBytes).toFixed(2)}MB`);
console.log(`- unreferenced: ${unreferenced.length}`);
console.log(`- .DS_Store files: ${metadataFiles.length}`);
console.log(`- oversized files (> ${maxFileMb}MB): ${oversizedFiles.length}`);

if (unreferenced.length > 0) {
  console.log('\nUnreferenced assets:');
  for (const file of unreferenced.slice(0, 30)) {
    console.log(`- ${path.relative(projectRoot, file)}`);
  }
}

if (metadataFiles.length > 0) {
  console.log('\nMetadata junk files:');
  for (const file of metadataFiles) {
    console.log(`- ${path.relative(projectRoot, file)}`);
  }
}

if (oversizedFiles.length > 0) {
  console.log('\nLargest oversized files:');
  for (const item of oversizedFiles.slice(0, 20)) {
    console.log(`- ${path.relative(projectRoot, item.file)} (${bytesToMb(item.size).toFixed(2)}MB)`);
  }
}

if (failures.length > 0) {
  console.error('\nAsset check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('\nAsset check passed.');
