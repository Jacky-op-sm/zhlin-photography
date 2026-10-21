#!/usr/bin/env node

import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { imageProfiles, publicImageHardLimitBytes } from './images/config.mjs'

// Originals stay in the supplied local directory. Only metadata-free derivatives
// are added to public/; the private source/hash report stays in ignored .generated/.
const args = process.argv.slice(2)
if (args.length !== 2 || args[0] !== '--source') {
  throw new Error('Usage: node scripts/import-bangkok-exhibition.mjs --source <photo-directory>')
}
const sourceDir = path.resolve(args[1])
const projectRoot = process.cwd()
const outputDir = path.join(projectRoot, 'public/assets/photography/bangkok')
const contentPath = path.join(projectRoot, 'content/photography/exhibitions/bangkok.json')
const reportPath = path.join(projectRoot, '.generated/photography/bangkok/source-report.json')
const sourceFiles = (await fs.readdir(sourceDir))
  .filter(name => /\.jpe?g$/i.test(name))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

if (sourceFiles.length !== 16 || sourceFiles.some((name, index) => {
  return Number(name.match(/_(\d+)_11\.jpe?g$/i)?.[1]) !== 97 + index
})) {
  throw new Error('Expected the 16 reviewed Bangkok photographs numbered 97 through 112.')
}

const descriptions = [
  'A woman in a headscarf standing between stone finials on a temple terrace.',
  'Motorcycles and taxis on a wet Bangkok street beneath an elevated road.',
  'An ornate temple window and patterned wall, photographed in black and white.',
  'A pigeon flying beside a golden fountain with water falling from its upper basin.',
  'A person framed by golden temple columns and a curving staircase.',
  'A couple walking through a busy outdoor market.',
  'A golden shrine illuminated beneath chandeliers inside a temple.',
  'Two children playing in shallow water beside a park playground.',
  'People gathered around an illuminated market stall, photographed in black and white.',
  'A person walking through a green park toward a building framed by trees.',
  'Small objects on a market stall seen between people, photographed in black and white.',
  'A passenger boat passing temple buildings on the opposite riverbank.',
  'A monk in orange robes walking along a tree-lined Bangkok street.',
  'A pale cat perched on the back of a blue and red tuk-tuk.',
  'A pedestrian crossing a street beneath overhead wires and a distant temple spire.',
  'A woman sitting behind a flock of pigeons in a sunlit courtyard.',
]

// A sequence of water, birds, street encounters, interiors, and a quiet ending.
// IDs remain tied to the natural source order so later curation is independent.
const sequence = [8, 4, 16, 14, 13, 5, 3, 7, 1, 6, 9, 11, 2, 15, 12, 10]
const sha256 = buffer => crypto.createHash('sha256').update(buffer).digest('hex')
const photos = []
const provenance = []
await fs.mkdir(outputDir, { recursive: true })
await fs.mkdir(path.dirname(contentPath), { recursive: true })
await fs.mkdir(path.dirname(reportPath), { recursive: true })

for (const [index, name] of sourceFiles.entries()) {
  const id = `bangkok-${String(index + 1).padStart(2, '0')}`
  const sourcePath = path.join(sourceDir, name)
  const original = await fs.readFile(sourcePath)
  const variants = {}
  for (const [variant, profile] of Object.entries(imageProfiles)) {
    const filename = `${id}${variant === 'thumbnail' ? '-thumb' : ''}.webp`
    const image = await sharp(original)
      .rotate()
      .resize(profile.maxEdge, profile.maxEdge, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: profile.quality })
      .toBuffer()
    const metadata = await sharp(image).metadata()
    if (image.length > publicImageHardLimitBytes) throw new Error(`${id} ${variant} exceeds image budget`)
    if (metadata.exif || metadata.xmp || metadata.iptc) throw new Error(`${id} ${variant} retains private metadata`)
    await fs.writeFile(path.join(outputDir, filename), image)
    variants[variant] = {
      path: `/assets/photography/bangkok/${filename}`,
      width: metadata.width,
      height: metadata.height,
      bytes: image.length,
      sha256: sha256(image),
    }
  }
  const originalHash = sha256(original)
  if (sha256(await fs.readFile(sourcePath)) !== originalHash) throw new Error(`${name} changed during import`)
  photos.push({
    id,
    src: variants.large.path,
    thumbnail: variants.thumbnail.path,
    width: variants.large.width,
    height: variants.large.height,
    alt: descriptions[index],
  })
  provenance.push({ id, sourcePath, sourceSha256: originalHash, sourceBytes: original.length, variants })
}

const manifest = {
  id: 'bangkok',
  title: 'Bangkok',
  description: 'Street encounters, temple interiors, and quiet moments in Bangkok.',
  photos: sequence.map(number => photos[number - 1]),
}
await fs.writeFile(contentPath, `${JSON.stringify(manifest, null, 2)}\n`)
await fs.writeFile(reportPath, `${JSON.stringify({ sourceDir, profiles: imageProfiles, photos: provenance }, null, 2)}\n`)
const totalBytes = provenance.reduce((total, entry) => total + entry.variants.large.bytes + entry.variants.thumbnail.bytes, 0)
console.log(`Imported ${photos.length} photographs; 32 WebP variants; ${(totalBytes / 1024 / 1024).toFixed(2)} MB total.`)
console.log(`Private provenance report: ${path.relative(projectRoot, reportPath)}`)
