#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import {
  contactSchema,
  hobbyCategorySchema,
  hobbyProfileSchema,
  homepageSchema,
  monthlyDigestSchema,
  navigationSchema,
  photoRecordsSchema,
  photographySeriesListSchema,
  profileSchema,
  travelCardsSchema,
  travelSchema,
} from '../src/lib/content/schema-values.mjs'

const root = process.cwd()
const contentRoot = path.join(root, 'content')
const publicRoot = path.join(root, 'public')
const failures = []
const assetRefs = new Set()

function fail(message) {
  failures.push(message)
}

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'))
  } catch (error) {
    fail(`${relativePath}: invalid JSON (${error.message})`)
    return null
  }
}

function validate(schema, value, label) {
  if (value === null) return null
  const result = schema.safeParse(value)
  if (result.success) return result.data

  for (const issue of result.error.issues) {
    const field = issue.path.length ? `.${issue.path.join('.')}` : ''
    fail(`${label}${field}: ${issue.message}`)
  }
  return null
}

function collectAssets(value) {
  if (typeof value === 'string') {
    if (value.startsWith('/assets/')) assetRefs.add(value)
    return
  }
  if (Array.isArray(value)) {
    value.forEach(collectAssets)
    return
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach(collectAssets)
  }
}

function contentDirectories(relativePath) {
  return fs
    .readdirSync(path.join(contentRoot, relativePath), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

function validateTravel() {
  for (const slug of contentDirectories('travel')) {
    const base = `content/travel/${slug}`
    const meta = validate(
      travelSchema,
      readJson(`${base}/meta.json`),
      `${base}/meta.json`,
    )
    const cards = validate(
      travelCardsSchema,
      readJson(`${base}/cards.json`),
      `${base}/cards.json`,
    )

    if (meta?.slug !== slug) {
      fail(`${base}/meta.json.slug must match its directory`)
    }
    collectAssets(meta)
    collectAssets(cards)
  }
}

function validatePhotography() {
  const series = validate(
    photographySeriesListSchema,
    readJson('content/photography/series.json'),
    'content/photography/series.json',
  )
  const seriesSlugs = new Set()
  for (const item of series ?? []) {
    if (seriesSlugs.has(item.slug)) {
      fail(`photography series slug "${item.slug}" is duplicated`)
    }
    seriesSlugs.add(item.slug)
  }
  collectAssets(series)

  for (const slug of ['street', 'pets', 'project']) {
    const label = `content/photography/photos/${slug}.json`
    const photos = validate(photoRecordsSchema, readJson(label), label)
    const ids = new Set()
    for (const photo of photos ?? []) {
      if (ids.has(photo.id)) fail(`photo id "${photo.id}" is duplicated in ${slug}`)
      ids.add(photo.id)
    }
    collectAssets(photos)
  }
}

function routeExists(href) {
  const route = href.split('#')[0].split('?')[0]
  if (route === '/') return fs.existsSync(path.join(root, 'src/app/page.tsx'))

  const exactPage = path.join(root, 'src/app', route.slice(1), 'page.tsx')
  if (fs.existsSync(exactPage)) return true

  const travelMatch = route.match(/^\/travel\/([^/]+)$/)
  return Boolean(
    travelMatch &&
      fs.existsSync(
        path.join(contentRoot, 'travel', travelMatch[1], 'meta.json'),
      ),
  )
}

function validateNavigationItems(items, allIds, parentHref) {
  const siblingHrefs = new Set()
  for (const item of items) {
    if (allIds.has(item.id)) fail(`navigation id "${item.id}" is duplicated`)
    allIds.add(item.id)

    if (!routeExists(item.href)) {
      fail(`navigation href does not resolve to a public route: ${item.href}`)
    }

    const isParentAllLink = parentHref && item.href === parentHref
    if (siblingHrefs.has(item.href) && !isParentAllLink) {
      fail(`navigation href "${item.href}" is duplicated among siblings`)
    }
    siblingHrefs.add(item.href)

    if (item.children) {
      validateNavigationItems(item.children, allIds, item.href)
    }
  }
}

function validateSite() {
  const navigation = validate(
    navigationSchema,
    readJson('content/site/navigation.json'),
    'content/site/navigation.json',
  )
  if (navigation) validateNavigationItems(navigation, new Set())

  const homepage = validate(
    homepageSchema,
    readJson('content/site/homepage.json'),
    'content/site/homepage.json',
  )
  const homepageLinks = [
    ...(homepage?.hero.links ?? []),
    ...(homepage?.photography ?? []),
    ...(homepage?.travel ?? []),
    ...(homepage?.hobby ?? []),
  ]
  for (const link of homepageLinks) {
    if (!routeExists(link.href)) {
      fail(`homepage href does not resolve to a public route: ${link.href}`)
    }
  }

  const profile = validate(
    profileSchema,
    readJson('content/site/profile.json'),
    'content/site/profile.json',
  )
  validate(
    contactSchema,
    readJson('content/site/contact.json'),
    'content/site/contact.json',
  )
  collectAssets(homepage)
  collectAssets(profile)
}

function validateHobby() {
  validate(
    hobbyProfileSchema,
    readJson('content/hobby/profile.json'),
    'content/hobby/profile.json',
  )
  validate(
    hobbyCategorySchema.array(),
    readJson('content/hobby/featured.json'),
    'content/hobby/featured.json',
  )

  const monthlyDir = path.join(contentRoot, 'hobby', 'monthly')
  const monthFiles = fs
    .readdirSync(monthlyDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)
    .sort()

  for (const filename of monthFiles) {
    const label = `content/hobby/monthly/${filename}`
    const digest = validate(monthlyDigestSchema, readJson(label), label)
    const expectedMonth = filename.replace(/\.json$/, '')
    if (digest?.month !== expectedMonth) {
      fail(`${label}.month must match its filename`)
    }
  }
}

function validateAssetRefs() {
  for (const ref of assetRefs) {
    if (!fs.existsSync(path.join(publicRoot, ref))) {
      fail(`asset reference not found: ${ref}`)
    }
  }
}

validateTravel()
validatePhotography()
validateHobby()
validateSite()
validateAssetRefs()

console.log('Content Check Summary')
console.log(`- asset references: ${assetRefs.size}`)

if (failures.length) {
  console.error('\nContent check failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('- validation: passed')
