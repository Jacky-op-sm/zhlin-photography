#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const projectRoot = process.cwd();
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function parseArgs(argv) {
  const options = {
    catalog: 'conversation/黑白/catalog.json',
    dryRun: false,
    clean: undefined,
    minScore: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--catalog') {
      options.catalog = argv[index + 1];
      index += 1;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--clean') {
      options.clean = true;
    } else if (arg === '--no-clean') {
      options.clean = false;
    } else if (arg === '--min-score') {
      options.minScore = Number(argv[index + 1]);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function resolveFromRoot(value) {
  return path.resolve(projectRoot, value);
}

function resolveFromCatalog(catalogDir, value) {
  if (path.isAbsolute(value)) return value;
  return path.resolve(catalogDir, value);
}

function slugFromFilename(file) {
  return path
    .basename(file, path.extname(file))
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function fallbackTitle(file) {
  return path.basename(file, path.extname(file)).replace(/[_-]+/g, ' ');
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

  if (!width || !height) {
    throw new Error(`Unable to read image dimensions: ${file}`);
  }

  return { width, height };
}

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function cleanAssetDir(assetDir, selectedFiles) {
  if (!(await pathExists(assetDir))) return;

  const entries = await fs.readdir(assetDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (entry.name === '.gitkeep') continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (!imageExtensions.has(ext)) continue;
    if (selectedFiles.has(entry.name)) continue;

    await fs.rm(path.join(assetDir, entry.name));
  }
}

function selectPhotos(catalog, minScore) {
  return catalog.photos
    .filter((photo) => {
      if (photo.publish === false) return false;
      if (photo.publish === true) return true;
      return Number(photo.score) >= minScore;
    })
    .sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : Number.POSITIVE_INFINITY;
      const orderB = typeof b.order === 'number' ? b.order : Number.POSITIVE_INFINITY;
      if (orderA !== orderB) return orderA - orderB;
      return Number(b.score ?? 0) - Number(a.score ?? 0) || a.file.localeCompare(b.file);
    });
}

const options = parseArgs(process.argv.slice(2));
const catalogPath = resolveFromRoot(options.catalog);
const catalogDir = path.dirname(catalogPath);
const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));

if (!catalog.series) {
  throw new Error(`${options.catalog} must include a series field`);
}

if (!Array.isArray(catalog.photos)) {
  throw new Error(`${options.catalog} must include a photos array`);
}

const sourceDir = resolveFromCatalog(catalogDir, catalog.sourceDir ?? '.');
const assetDir = resolveFromRoot(catalog.assetDir ?? `public/assets/photos/${catalog.series}`);
const outputPath = resolveFromRoot(catalog.output ?? `content/photography/photos/${catalog.series}.json`);
const assetPublicPath = catalog.assetPublicPath ?? `/assets/photos/${catalog.series}`;
const minScore = Number.isFinite(options.minScore) ? options.minScore : Number(catalog.minScore ?? 86);
const cleanOutput = options.clean ?? Boolean(catalog.cleanOutput);
const defaults = catalog.defaults ?? {};
const selectedPhotos = selectPhotos(catalog, minScore);
const selectedAssetFiles = new Set(selectedPhotos.map((photo) => photo.outputFile ?? photo.file));
const ids = new Set();

if (selectedPhotos.length === 0) {
  throw new Error(`No photos selected from ${options.catalog}`);
}

const output = [];

for (const photo of selectedPhotos) {
  if (!photo.file) {
    throw new Error('Every selected photo must include a file field');
  }

  const sourceFile = path.join(sourceDir, photo.file);
  const outputFile = photo.outputFile ?? photo.file;
  const publicPath = `${assetPublicPath}/${outputFile}`;

  if (!(await pathExists(sourceFile))) {
    throw new Error(`Source image not found: ${path.relative(projectRoot, sourceFile)}`);
  }

  const id = photo.id ?? slugFromFilename(outputFile);
  if (ids.has(id)) {
    throw new Error(`Duplicate selected photo id: ${id}`);
  }
  ids.add(id);

  const { width, height } = getDimensions(sourceFile);

  output.push({
    id,
    title: photo.title ?? fallbackTitle(photo.file),
    description: photo.description ?? 'A selected frame from the current street photography edit.',
    filename: publicPath,
    thumbnail: photo.thumbnail ?? publicPath,
    width,
    height,
    takenAt: photo.takenAt ?? defaults.takenAt ?? '2026',
    location: photo.location ?? defaults.location ?? 'China',
    tags: photo.tags ?? defaults.tags ?? [catalog.series],
  });
}

if (!options.dryRun) {
  await fs.mkdir(assetDir, { recursive: true });
  if (cleanOutput) {
    await cleanAssetDir(assetDir, selectedAssetFiles);
  }

  for (const photo of selectedPhotos) {
    const sourceFile = path.join(sourceDir, photo.file);
    const outputFile = photo.outputFile ?? photo.file;
    await fs.copyFile(sourceFile, path.join(assetDir, outputFile));
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
}

console.log('Photography selection synced');
console.log(`- catalog: ${path.relative(projectRoot, catalogPath)}`);
console.log(`- series: ${catalog.series}`);
console.log(`- min score: ${minScore}`);
console.log(`- selected: ${selectedPhotos.length}`);
console.log(`- output: ${path.relative(projectRoot, outputPath)}`);
console.log(`- assets: ${path.relative(projectRoot, assetDir)}`);
if (cleanOutput) console.log('- clean output: true');
if (options.dryRun) console.log('- dry run: true');
