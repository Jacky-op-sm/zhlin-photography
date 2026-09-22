#!/usr/bin/env node

import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import {
  fromPublicPath,
  getGeneratedVariantPaths,
  imageFormat,
  imageProfiles,
  manifestPath,
  photographyContentRoot,
  publicImageHardLimitBytes,
  resolveSourcePath,
  toPublicPath,
} from './config.mjs'

const failures = []
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
const contentImages = new Map()

for (const filename of (await fs.readdir(photographyContentRoot)).sort()) {
  if (!filename.endsWith('.json')) continue
  const series = path.basename(filename, '.json')
  const photos = JSON.parse(
    await fs.readFile(path.join(photographyContentRoot, filename), 'utf8'),
  )
  for (const photo of photos) {
    const key = `${series}:${photo.id}`
    if (contentImages.has(key)) failures.push(`${key} is duplicated`)
    contentImages.set(key, photo)
  }
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

async function checkVariant(image, field, hashField, expectedDimensions) {
  const publicPath = image[field]
  const absolutePath = fromPublicPath(publicPath)
  let buffer
  try {
    buffer = await fs.readFile(absolutePath)
  } catch {
    failures.push(`${publicPath} is missing`)
    return
  }

  if (buffer.byteLength > publicImageHardLimitBytes) {
    failures.push(`${publicPath} exceeds the 1.8 MB hard limit`)
  }
  if (sha256(buffer) !== image[hashField]) {
    failures.push(`${publicPath} does not match its manifest hash`)
  }

  const metadata = await sharp(buffer).metadata()
  if (metadata.format !== imageFormat) {
    failures.push(`${publicPath} must be ${imageFormat}`)
  }
  if (metadata.exif || metadata.gps) {
    failures.push(`${publicPath} contains EXIF or GPS metadata`)
  }
  if (
    expectedDimensions &&
    (metadata.width !== expectedDimensions.width ||
      metadata.height !== expectedDimensions.height)
  ) {
    failures.push(`${publicPath} dimensions do not match content metadata`)
  }
}

if (
  manifest.generator?.format !== imageFormat
  || JSON.stringify(manifest.generator?.thumbnail) !== JSON.stringify(imageProfiles.thumbnail)
  || JSON.stringify(manifest.generator?.large) !== JSON.stringify(imageProfiles.large)
) {
  failures.push('manifest generator settings do not match scripts/images/config.mjs')
}

for (const image of manifest.images) {
  const key = `${image.series}:${image.id}`
  const photo = contentImages.get(key)
  if (!photo) {
    failures.push(`${key} exists in the manifest but not in photography content`)
    continue
  }
  contentImages.delete(key)

  const expectedPaths = getGeneratedVariantPaths(image.series, image.source)
  if (image.filename !== toPublicPath(expectedPaths.large)) {
    failures.push(`${key} has a non-canonical large-image path`)
  }
  if (image.thumbnail !== toPublicPath(expectedPaths.thumbnail)) {
    failures.push(`${key} has a non-canonical thumbnail path`)
  }
  for (const field of ['source', 'filename', 'thumbnail', 'width', 'height']) {
    if (photo[field] !== image[field]) {
      failures.push(`${key} content.${field} does not match the manifest`)
    }
  }
  try {
    await fs.access(resolveSourcePath(image.source))
  } catch {
    failures.push(`${key} source is missing: ${image.source}`)
  }

  await checkVariant(
    image,
    'filename',
    'largeSha256',
    { width: image.width, height: image.height },
  )
  await checkVariant(image, 'thumbnail', 'thumbnailSha256')
}

for (const key of contentImages.keys()) {
  failures.push(`${key} exists in photography content but not in the manifest`)
}

console.log('Photography image check')
console.log(`- manifest entries: ${manifest.images.length}`)
console.log(`- failures: ${failures.length}`)

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('- validation: passed')
