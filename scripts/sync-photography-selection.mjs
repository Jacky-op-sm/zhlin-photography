#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import {
  getPhotographySeriesPaths,
  projectRoot,
} from './images/config.mjs'
import { runPhotographyImagePipeline } from './images/pipeline.mjs'

function parseArgs(argv) {
  const options = {
    catalog: 'workspace/photography/street-selection/catalog.json',
    minScore: undefined,
    write: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--catalog') {
      const value = argv[index + 1]
      if (!value || value.startsWith('--')) {
        throw new Error('--catalog requires a path')
      }
      options.catalog = value
      index += 1
    } else if (arg === '--min-score') {
      const value = argv[index + 1]
      if (!value || value.startsWith('--')) {
        throw new Error('--min-score requires a number')
      }
      options.minScore = Number(value)
      if (!Number.isFinite(options.minScore)) {
        throw new Error('--min-score requires a finite number')
      }
      index += 1
    } else if (arg === '--write') {
      options.write = true
    } else if (arg === '--dry-run') {
      options.write = false
    } else if (arg === '--clean' || arg === '--no-clean') {
      throw new Error(
        `${arg} is no longer supported; source photographs are never removed automatically`,
      )
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return options
}

function resolveFromCatalog(catalogDir, value) {
  return path.isAbsolute(value) ? value : path.resolve(catalogDir, value)
}

function slugFromFilename(file) {
  return path
    .basename(file, path.extname(file))
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function fallbackTitle(file) {
  return path.basename(file, path.extname(file)).replace(/[_-]+/g, ' ')
}

async function exists(target) {
  try {
    await fs.access(target)
    return true
  } catch {
    return false
  }
}

function selectPhotos(catalog, minScore) {
  return catalog.photos
    .filter((photo) => {
      if (photo.publish === false) return false
      if (photo.publish === true) return true
      return Number(photo.score) >= minScore
    })
    .sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : Number.POSITIVE_INFINITY
      const orderB = typeof b.order === 'number' ? b.order : Number.POSITIVE_INFINITY
      if (orderA !== orderB) return orderA - orderB
      return Number(b.score ?? 0) - Number(a.score ?? 0) || a.file.localeCompare(b.file)
    })
}

function assertLegacyCatalogPaths(catalog, seriesPaths) {
  const expected = {
    assetDir: seriesPaths.originalDir,
    output: seriesPaths.contentPath,
    assetPublicPath: seriesPaths.originalPublicPath,
  }

  for (const [field, expectedValue] of Object.entries(expected)) {
    if (catalog[field] === undefined) continue
    const actual = field === 'assetPublicPath'
      ? catalog[field]
      : path.resolve(projectRoot, catalog[field])
    if (actual !== expectedValue) {
      throw new Error(
        `${field} is configured centrally and must resolve to ${path.relative(projectRoot, expectedValue)}`,
      )
    }
  }
}

const options = parseArgs(process.argv.slice(2))
const catalogPath = path.resolve(projectRoot, options.catalog)
const catalogDir = path.dirname(catalogPath)
const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'))

if (typeof catalog.series !== 'string' || !Array.isArray(catalog.photos)) {
  throw new Error(`${options.catalog} must include series and photos fields`)
}

const seriesPaths = getPhotographySeriesPaths(catalog.series)
assertLegacyCatalogPaths(catalog, seriesPaths)
const sourceDir = resolveFromCatalog(catalogDir, catalog.sourceDir ?? '.')
const minScore = Number.isFinite(options.minScore)
  ? options.minScore
  : Number(catalog.minScore ?? 86)
const defaults = catalog.defaults ?? {}
const selectedPhotos = selectPhotos(catalog, minScore)

if (selectedPhotos.length === 0) {
  throw new Error(`No photos selected from ${options.catalog}`)
}

const ids = new Set()
const sourceFiles = new Map()
const photos = []

for (const photo of selectedPhotos) {
  if (!photo.file) throw new Error('Every selected photo must include a file field')

  const sourceFile = path.join(sourceDir, photo.file)
  if (!(await exists(sourceFile))) {
    throw new Error(`Source image not found: ${path.relative(projectRoot, sourceFile)}`)
  }

  const outputFile = photo.outputFile ?? photo.file
  const id = photo.id ?? slugFromFilename(outputFile)
  if (ids.has(id)) throw new Error(`Duplicate selected photo id: ${id}`)
  ids.add(id)

  const source = `${seriesPaths.originalPublicPath}/${outputFile}`
  sourceFiles.set(`${catalog.series}:${id}`, sourceFile)
  photos.push({
    id,
    title: photo.title ?? fallbackTitle(photo.file),
    description:
      photo.description
      ?? 'A selected frame from the current street photography edit.',
    source,
    filename: source,
    thumbnail: source,
    width: 0,
    height: 0,
    takenAt: photo.takenAt ?? defaults.takenAt ?? '2026',
    location: photo.location ?? defaults.location ?? 'China',
    tags: photo.tags ?? defaults.tags ?? [catalog.series],
  })
}

if (options.write) {
  await fs.mkdir(seriesPaths.originalDir, { recursive: true })
  for (const [index, photo] of selectedPhotos.entries()) {
    const sourceFile = sourceFiles.get(`${catalog.series}:${photos[index].id}`)
    await fs.copyFile(
      sourceFile,
      path.join(seriesPaths.originalDir, photo.outputFile ?? photo.file),
    )
  }
}

const result = await runPhotographyImagePipeline({
  write: options.write,
  contentOverrides: new Map([[catalog.series, photos]]),
  sourceFileOverrides: sourceFiles,
})

console.log('Photography selection pipeline')
console.log(`- mode: ${options.write ? 'write' : 'report only'}`)
console.log(`- catalog: ${path.relative(projectRoot, catalogPath)}`)
console.log(`- series: ${catalog.series}`)
console.log(`- min score: ${minScore}`)
console.log(`- selected: ${selectedPhotos.length}`)
console.log(`- pipeline photos: ${result.photoCount}`)
console.log(`- content: ${path.relative(projectRoot, seriesPaths.contentPath)}`)
console.log(`- sources: ${path.relative(projectRoot, seriesPaths.originalDir)}`)
if (!options.write) console.log('- pass --write to publish the selection and derivatives')
