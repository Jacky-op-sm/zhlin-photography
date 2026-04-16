#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const projectRoot = process.cwd();
const assetsRoot = path.join(projectRoot, 'public', 'assets');

const maxDimension = Number(process.env.PHOTO_MAX_DIM ?? 2048);
const jpegQuality = Number(process.env.PHOTO_JPEG_QUALITY ?? 78);

const imageExtensions = new Set(['.jpg', '.jpeg', '.png']);

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

async function fileSize(file) {
  const stat = await fs.stat(file);
  return stat.size;
}

function bytesToMb(bytes) {
  return (bytes / 1024 / 1024).toFixed(2);
}

function getDimensions(file) {
  const output = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });

  const widthMatch = output.match(/pixelWidth:\s*(\d+)/);
  const heightMatch = output.match(/pixelHeight:\s*(\d+)/);

  const width = widthMatch ? Number(widthMatch[1]) : 0;
  const height = heightMatch ? Number(heightMatch[1]) : 0;

  return { width, height };
}

function optimizeImage(file, ext) {
  const { width, height } = getDimensions(file);
  const longest = Math.max(width, height);

  if (longest > maxDimension) {
    execFileSync('sips', ['-Z', String(maxDimension), file], { stdio: 'ignore' });
  }

  if (ext === '.jpg' || ext === '.jpeg') {
    execFileSync('sips', ['-s', 'formatOptions', String(jpegQuality), file], { stdio: 'ignore' });
  }
}

const files = (await walkFiles(assetsRoot)).filter((file) => {
  const ext = path.extname(file).toLowerCase();
  return imageExtensions.has(ext);
});

let beforeTotal = 0;
let afterTotal = 0;
let changedCount = 0;

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  const before = await fileSize(file);
  beforeTotal += before;

  optimizeImage(file, ext);

  const after = await fileSize(file);
  afterTotal += after;
  if (after !== before) changedCount += 1;
}

const saved = beforeTotal - afterTotal;

console.log('Image optimization finished');
console.log(`- files processed: ${files.length}`);
console.log(`- files changed: ${changedCount}`);
console.log(`- before: ${bytesToMb(beforeTotal)}MB`);
console.log(`- after: ${bytesToMb(afterTotal)}MB`);
console.log(`- saved: ${bytesToMb(saved)}MB`);
console.log(`- max dimension: ${maxDimension}px`);
console.log(`- jpeg quality: ${jpegQuality}`);
