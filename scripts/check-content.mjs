#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contentRoot = path.join(root, 'content');
const publicRoot = path.join(root, 'public');

const validPhotoSlugs = new Set(['street', 'pets', 'project']);
const failures = [];
const assetRefs = new Set();

function fail(message) {
  failures.push(message);
}

function readJson(relativePath) {
  const file = path.join(root, relativePath);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`${relativePath}: invalid JSON (${error.message})`);
    return null;
  }
}

function assertString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    fail(`${label} must be a non-empty string`);
  }
}

function assertStringArray(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    fail(`${label} must be an array of strings`);
  }
}

function collectAssets(value) {
  if (typeof value === 'string') {
    if (value.startsWith('/assets/')) {
      assetRefs.add(value);
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectAssets(item);
    }
    return;
  }

  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) {
      collectAssets(child);
    }
  }
}

function validateTravelCard(card, label) {
  assertString(card?.eyebrow, `${label}.eyebrow`);
  assertString(card?.title, `${label}.title`);
  assertString(card?.body, `${label}.body`);
  assertString(card?.imageSrc, `${label}.imageSrc`);
  assertString(card?.imageAlt, `${label}.imageAlt`);

  if (!Array.isArray(card?.detailBlocks) || card.detailBlocks.length === 0) {
    fail(`${label}.detailBlocks must contain at least one block`);
    return;
  }

  for (const [index, block] of card.detailBlocks.entries()) {
    assertString(block?.text, `${label}.detailBlocks[${index}].text`);
    assertString(block?.imageSrc, `${label}.detailBlocks[${index}].imageSrc`);
    assertString(block?.imageAlt, `${label}.detailBlocks[${index}].imageAlt`);
  }
}

function validateTravel() {
  const travelDir = path.join(contentRoot, 'travel');
  const slugs = fs
    .readdirSync(travelDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const seenSlugs = new Set();

  for (const slug of slugs) {
    if (seenSlugs.has(slug)) {
      fail(`travel slug "${slug}" is duplicated`);
    }
    seenSlugs.add(slug);

    const base = `content/travel/${slug}`;
    const meta = readJson(`${base}/meta.json`);
    const cards = readJson(`${base}/cards.json`);

    if (!fs.existsSync(path.join(root, base, 'story.md'))) {
      fail(`${base}/story.md is missing`);
    }

    if (meta) {
      if (meta.slug !== slug) {
        fail(`${base}/meta.json slug must match directory name`);
      }
      for (const field of ['slug', 'zhName', 'enName', 'period', 'location', 'cardTitle', 'cover', 'hero', 'summary']) {
        assertString(meta[field], `${base}/meta.json.${field}`);
      }
      assertStringArray(meta.tags, `${base}/meta.json.tags`);
      assertStringArray(meta.itinerary, `${base}/meta.json.itinerary`);
      if (!Array.isArray(meta.spots)) {
        fail(`${base}/meta.json.spots must be an array`);
      }
      if (!Array.isArray(meta.gallery)) {
        fail(`${base}/meta.json.gallery must be an array`);
      }
      collectAssets(meta);
    }

    if (cards) {
      for (const section of ['spots', 'bookstores', 'food']) {
        if (!Array.isArray(cards[section])) {
          fail(`${base}/cards.json.${section} must be an array`);
          continue;
        }

        cards[section].forEach((card, index) => {
          validateTravelCard(card, `${base}/cards.json.${section}[${index}]`);
        });
      }
      collectAssets(cards);
    }
  }
}

function validatePhotography() {
  const series = readJson('content/photography/series.json') ?? [];
  const seriesSlugs = new Set();

  if (!Array.isArray(series)) {
    fail('content/photography/series.json must be an array');
  } else {
    for (const [index, item] of series.entries()) {
      if (!validPhotoSlugs.has(item?.slug)) {
        fail(`content/photography/series.json[${index}].slug must be street, pets, or project`);
      }
      if (seriesSlugs.has(item?.slug)) {
        fail(`photography series slug "${item.slug}" is duplicated`);
      }
      seriesSlugs.add(item?.slug);
      for (const field of ['title', 'overline', 'landingSummary', 'landingDescription', 'heroLead', 'cover', 'href', 'ctaLabel']) {
        assertString(item?.[field], `content/photography/series.json[${index}].${field}`);
      }
      assertStringArray(item?.statement, `content/photography/series.json[${index}].statement`);
    }
    collectAssets(series);
  }

  for (const slug of validPhotoSlugs) {
    const photos = readJson(`content/photography/photos/${slug}.json`) ?? [];
    const ids = new Set();

    if (!Array.isArray(photos)) {
      fail(`content/photography/photos/${slug}.json must be an array`);
      continue;
    }

    for (const [index, photo] of photos.entries()) {
      if (ids.has(photo?.id)) {
        fail(`photo id "${photo.id}" is duplicated in ${slug}`);
      }
      ids.add(photo?.id);

      for (const field of ['id', 'title', 'description', 'filename', 'thumbnail', 'takenAt', 'location']) {
        assertString(photo?.[field], `content/photography/photos/${slug}.json[${index}].${field}`);
      }
      if (typeof photo?.width !== 'number' || typeof photo?.height !== 'number') {
        fail(`content/photography/photos/${slug}.json[${index}] width and height must be numbers`);
      }
      assertStringArray(photo?.tags, `content/photography/photos/${slug}.json[${index}].tags`);
    }
    collectAssets(photos);
  }

  const projectMeta = readJson('content/photography/project-meta.json');
  if (projectMeta) {
    for (const field of ['id', 'title', 'titleEn', 'description']) {
      assertString(projectMeta[field], `content/photography/project-meta.json.${field}`);
    }
  }
}

function validateHobbyItem(item, label) {
  assertString(item?.name, `${label}.name`);
  assertString(item?.why, `${label}.why`);
  if (item?.fullWhy !== undefined) assertString(item.fullWhy, `${label}.fullWhy`);
  if (item?.rating !== undefined) assertString(item.rating, `${label}.rating`);
  if (item?.date !== undefined) assertString(item.date, `${label}.date`);
}

function validateHobbyCategory(category, label) {
  assertString(category?.title, `${label}.title`);
  if (!Array.isArray(category?.items)) {
    fail(`${label}.items must be an array`);
    return;
  }
  category.items.forEach((item, index) => validateHobbyItem(item, `${label}.items[${index}]`));
}

function validateHobby() {
  const profile = readJson('content/hobby/profile.json');
  if (profile) {
    assertString(profile.intro, 'content/hobby/profile.json.intro');
    assertString(profile.externalProfiles?.goodreads, 'content/hobby/profile.json.externalProfiles.goodreads');
    assertString(profile.externalProfiles?.letterboxd, 'content/hobby/profile.json.externalProfiles.letterboxd');
    assertString(profile.lolProfile?.server, 'content/hobby/profile.json.lolProfile.server');
    assertString(profile.lolProfile?.rank, 'content/hobby/profile.json.lolProfile.rank');
    assertStringArray(profile.lolProfile?.mainRoles, 'content/hobby/profile.json.lolProfile.mainRoles');
    assertStringArray(profile.lolProfile?.championPool, 'content/hobby/profile.json.lolProfile.championPool');
    assertString(profile.lolProfile?.currentInsight, 'content/hobby/profile.json.lolProfile.currentInsight');
  }

  for (const filename of ['featured.json', 'cards.json']) {
    const categories = readJson(`content/hobby/${filename}`) ?? [];
    if (!Array.isArray(categories)) {
      fail(`content/hobby/${filename} must be an array`);
      continue;
    }
    categories.forEach((category, index) => validateHobbyCategory(category, `content/hobby/${filename}[${index}]`));
  }

  const monthlyDir = path.join(contentRoot, 'hobby', 'monthly');
  const monthFiles = fs
    .readdirSync(monthlyDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)
    .sort();

  for (const filename of monthFiles) {
    const monthData = readJson(`content/hobby/monthly/${filename}`);
    const expectedMonth = filename.replace(/\.json$/, '');

    if (!/^\d{4}-\d{2}$/.test(expectedMonth)) {
      fail(`content/hobby/monthly/${filename} must be named YYYY-MM.json`);
    }
    if (monthData?.month !== expectedMonth) {
      fail(`content/hobby/monthly/${filename}.month must match filename`);
    }

    for (const section of ['reading', 'films']) {
      if (!Array.isArray(monthData?.[section])) {
        fail(`content/hobby/monthly/${filename}.${section} must be an array`);
        continue;
      }
      monthData[section].forEach((item, index) => validateHobbyItem(item, `content/hobby/monthly/${filename}.${section}[${index}]`));
    }
  }
}

function validateAssetRefs() {
  for (const ref of assetRefs) {
    const file = path.join(publicRoot, ref);
    if (!fs.existsSync(file)) {
      fail(`asset reference not found: ${ref}`);
    }
  }
}

validateTravel();
validatePhotography();
validateHobby();
validateAssetRefs();

console.log('Content Check Summary');
console.log(`- asset references: ${assetRefs.size}`);

if (failures.length > 0) {
  console.error('\nContent check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('- validation: passed');
