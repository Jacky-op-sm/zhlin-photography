import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import {
  generatedRoot,
  getGeneratedVariantPaths,
  imageFormat,
  imageProfiles,
  manifestPath,
  photographyContentRoot,
  projectRoot,
  publicImageHardLimitBytes,
  resolveSourcePath,
  toPublicPath,
} from './config.mjs'

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

async function exists(target) {
  try {
    await fs.access(target)
    return true
  } catch {
    return false
  }
}

async function writeAtomically(target, data) {
  await fs.mkdir(path.dirname(target), { recursive: true })
  const temporary = path.join(
    path.dirname(target),
    `.${path.basename(target)}.${process.pid}.tmp`,
  )
  await fs.writeFile(temporary, data)
  await fs.rename(temporary, target)
}

async function buildVariant(sourcePath, outputPath, profile) {
  const buffer = await sharp(sourcePath)
    .rotate()
    .resize({
      width: profile.maxEdge,
      height: profile.maxEdge,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFormat(imageFormat, {
      quality: profile.quality,
      smartSubsample: true,
      effort: 6,
    })
    .toBuffer()

  if (buffer.byteLength > publicImageHardLimitBytes) {
    throw new Error(
      `${toPublicPath(outputPath)} exceeds the configured per-file limit`,
    )
  }

  const metadata = await sharp(buffer).metadata()
  return {
    buffer,
    publicPath: toPublicPath(outputPath),
    width: metadata.width,
    height: metadata.height,
    bytes: buffer.byteLength,
    sha256: sha256(buffer),
  }
}

function sameRuntimeImageFields(current, normalized) {
  return (
    current.source === normalized.source
    && current.filename === normalized.filename
    && current.thumbnail === normalized.thumbnail
    && current.width === normalized.width
    && current.height === normalized.height
  )
}

export async function cleanGeneratedPhotographyImages() {
  const resolvedTarget = path.resolve(generatedRoot)
  const expectedTarget = path.resolve(projectRoot, 'public', 'assets', 'generated', 'photos')
  if (resolvedTarget !== expectedTarget) {
    throw new Error(`Refusing to clean unexpected path: ${resolvedTarget}`)
  }
  if (await exists(generatedRoot)) {
    await fs.rm(generatedRoot, { recursive: true })
  }
}

export async function runPhotographyImagePipeline({
  write = false,
  contentOverrides = new Map(),
  sourceFileOverrides = new Map(),
} = {}) {
  const filenames = new Set(
    (await fs.readdir(photographyContentRoot))
      .filter((filename) => filename.endsWith('.json')),
  )
  for (const series of contentOverrides.keys()) {
    filenames.add(`${series}.json`)
  }

  const manifest = {
    version: 1,
    generator: {
      format: imageFormat,
      ...imageProfiles,
      stripsMetadata: true,
    },
    images: [],
  }
  const generatedFiles = []
  const contentWrites = []
  const contractFailures = []

  for (const filename of [...filenames].sort()) {
    const series = path.basename(filename, '.json')
    const isOverride = contentOverrides.has(series)
    const contentPath = path.join(photographyContentRoot, filename)
    const photos = isOverride
      ? structuredClone(contentOverrides.get(series))
      : JSON.parse(await fs.readFile(contentPath, 'utf8'))

    if (!Array.isArray(photos)) {
      throw new Error(`${filename} must contain an array`)
    }

    const normalizedPhotos = []
    const ids = new Set()
    for (const photo of photos) {
      if (!photo?.id || ids.has(photo.id)) {
        throw new Error(`${filename} has a missing or duplicate photo id`)
      }
      ids.add(photo.id)

      const source = photo.source
      if (typeof source !== 'string' || source.includes('/assets/generated/')) {
        throw new Error(`${filename}:${photo.id} needs a stable source path`)
      }

      const sourceKey = `${series}:${photo.id}`
      const sourcePath = sourceFileOverrides.get(sourceKey) ?? resolveSourcePath(source)
      if (!(await exists(sourcePath))) {
        throw new Error(`Missing source image: ${source}`)
      }

      const outputPaths = getGeneratedVariantPaths(series, source)
      const [thumbnail, large] = await Promise.all([
        buildVariant(sourcePath, outputPaths.thumbnail, imageProfiles.thumbnail),
        buildVariant(sourcePath, outputPaths.large, imageProfiles.large),
      ])
      const normalized = {
        ...photo,
        source,
        filename: large.publicPath,
        thumbnail: thumbnail.publicPath,
        width: large.width,
        height: large.height,
      }

      if (!isOverride && !sameRuntimeImageFields(photo, normalized)) {
        contractFailures.push(`${filename}:${photo.id}`)
      }

      normalizedPhotos.push(normalized)
      generatedFiles.push(
        { path: outputPaths.thumbnail, buffer: thumbnail.buffer },
        { path: outputPaths.large, buffer: large.buffer },
      )
      manifest.images.push({
        id: photo.id,
        series,
        source,
        filename: large.publicPath,
        thumbnail: thumbnail.publicPath,
        width: large.width,
        height: large.height,
        largeBytes: large.bytes,
        thumbnailBytes: thumbnail.bytes,
        largeSha256: large.sha256,
        thumbnailSha256: thumbnail.sha256,
      })
    }

    if (isOverride) {
      contentWrites.push({ path: contentPath, photos: normalizedPhotos })
    }
  }

  if (contractFailures.length > 0) {
    throw new Error(
      `Photography content does not match the generated-image contract:\n- ${contractFailures.join('\n- ')}`,
    )
  }

  manifest.images.sort((a, b) =>
    `${a.series}:${a.id}`.localeCompare(`${b.series}:${b.id}`),
  )

  if (write) {
    for (const file of generatedFiles) {
      await writeAtomically(file.path, file.buffer)
    }
    for (const item of contentWrites) {
      await writeAtomically(item.path, `${JSON.stringify(item.photos, null, 2)}\n`)
    }
    await writeAtomically(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  }

  return {
    manifest,
    photoCount: manifest.images.length,
    totalBytes: manifest.images.reduce(
      (total, image) => total + image.largeBytes + image.thumbnailBytes,
      0,
    ),
  }
}
