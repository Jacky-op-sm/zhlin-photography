#!/usr/bin/env node

import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { projectRoot, publicRoot } from './config.mjs'

// Gallery derivatives have their own source-preserving pipeline. Already
// optimized WebPs are deliberately excluded to avoid repeated lossy encoding.
const assetDirectories = ['travel', 'home', 'profile']
const referenceDirectories = ['src', 'content', 'tests']
const profile = { format: 'webp', quality: 82, maxEdge: 2400, effort: 6 }
const options = { write: false, report: null }
for (let index = 0; index < process.argv.slice(2).length; index += 1) {
  const args = process.argv.slice(2)
  if (args[index] === '--write') options.write = true
  else if (args[index] === '--report' && args[index + 1] && !args[index + 1].startsWith('--')) options.report = path.resolve(args[++index])
  else throw new Error(`Unknown or incomplete argument: ${args[index]}`)
}

const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex')
const gitBlobHash = (buffer) => crypto.createHash('sha1').update(`blob ${buffer.length}\0`).update(buffer).digest('hex')
const relativePath = (file) => path.relative(projectRoot, file).split(path.sep).join('/')
const publicPath = (file) => `/${path.relative(publicRoot, file).split(path.sep).join('/')}`

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map((entry) => {
    const file = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(file) : [file]
  }))
  return files.flat()
}

async function exists(file) {
  try { await fs.access(file); return true } catch { return false }
}

async function writeAtomically(file, contents) {
  const temporary = `${file}.${process.pid}.tmp`
  await fs.writeFile(temporary, contents)
  await fs.rename(temporary, file)
}

const sourceFiles = (await Promise.all(assetDirectories.map((directory) =>
  walk(path.join(publicRoot, 'assets', directory)),
))).flat().filter((file) => /\.(jpe?g|png)$/i.test(file)).sort()
const candidates = []
let nextIndex = 0
await Promise.all(Array.from({ length: 4 }, async () => {
  while (nextIndex < sourceFiles.length) {
    const source = sourceFiles[nextIndex++]
    const original = await fs.readFile(source)
    const metadata = await sharp(original).metadata()
    if ((metadata.pages ?? 1) > 1) throw new Error(`Animated image requires a separate review: ${relativePath(source)}`)
    const target = source.replace(/\.(jpe?g|png)$/i, '.webp')
    const converted = await sharp(original)
      .rotate()
      .resize({ width: profile.maxEdge, height: profile.maxEdge, fit: 'inside', withoutEnlargement: true })
      .toColourspace('srgb')
      .webp({ quality: profile.quality, effort: profile.effort, smartSubsample: true })
      .toBuffer()
    const output = await sharp(converted).metadata()
    const rotated = (metadata.orientation ?? 1) >= 5
    const width = rotated ? metadata.height : metadata.width
    const height = rotated ? metadata.width : metadata.height
    const scale = Math.min(1, profile.maxEdge / Math.max(width, height))
    if (output.format !== 'webp' || output.exif || output.icc
      || output.width !== Math.round(width * scale) || output.height !== Math.round(height * scale)
      || Boolean(output.hasAlpha) !== Boolean(metadata.hasAlpha)) {
      throw new Error(`Conversion validation failed: ${relativePath(source)}`)
    }
    candidates.push({ source, target, original, converted, width: output.width, height: output.height })
  }
}))
candidates.sort((a, b) => a.source.localeCompare(b.source))
const replacements = candidates.filter((image) => image.converted.length < image.original.length)
const targetPaths = new Set()
for (const image of replacements) {
  if (targetPaths.has(image.target) || await exists(image.target)) throw new Error(`Refusing to overwrite an existing image: ${relativePath(image.target)}`)
  targetPaths.add(image.target)
}

// Every deleted input must remain recoverable, byte-for-byte, in Git history.
// A new or edited export can be inspected in dry-run mode before committing it.
const recoveryCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: projectRoot, encoding: 'utf8' }).trim()
const tree = execFileSync('git', ['ls-tree', '-rz', 'HEAD', '--', 'public/assets'], { cwd: projectRoot, encoding: 'utf8' })
const committed = new Map(tree.split('\0').filter(Boolean).map((entry) => {
  const [info, file] = entry.split('\t')
  return [file, info.split(' ')[2]]
}))
if (options.write) {
  for (const image of replacements) {
    if (committed.get(relativePath(image.source)) !== gitBlobHash(image.original)) {
      throw new Error(`Commit the unchanged original before replacing it: ${relativePath(image.source)}`)
    }
  }
}

const referenceFiles = (await Promise.all(referenceDirectories.map((directory) => walk(path.join(projectRoot, directory)))))
  .flat().filter((file) => /\.(?:json|md|[cm]?js|tsx?|jsx|css|svg)$/.test(file))
const referenceWrites = []
for (const file of referenceFiles) {
  const original = await fs.readFile(file, 'utf8')
  let updated = original
  for (const image of replacements) {
    const oldPath = publicPath(image.source)
    const newPath = publicPath(image.target)
    updated = updated.split(oldPath).join(newPath)
    updated = updated.split(encodeURI(oldPath)).join(encodeURI(newPath))
  }
  if (updated !== original) referenceWrites.push({ file, original, updated })
}

if (options.write) {
  for (const image of replacements) {
    if (sha256(await fs.readFile(image.source)) !== sha256(image.original)) throw new Error(`Source changed during optimization: ${relativePath(image.source)}`)
  }
  for (const item of referenceWrites) {
    if (await fs.readFile(item.file, 'utf8') !== item.original) throw new Error(`Reference file changed during optimization: ${relativePath(item.file)}`)
  }
  for (const image of replacements) await writeAtomically(image.target, image.converted)
  for (const item of referenceWrites) await writeAtomically(item.file, item.updated)
  for (const image of replacements) {
    if (sha256(await fs.readFile(image.target)) !== sha256(image.converted)) throw new Error(`Output verification failed: ${relativePath(image.target)}`)
    await fs.unlink(image.source)
  }
}

const beforeBytes = candidates.reduce((sum, image) => sum + image.original.length, 0)
const afterBytes = candidates.reduce((sum, image) => sum + Math.min(image.original.length, image.converted.length), 0)
const report = {
  mode: options.write ? 'write' : 'dry-run', profile, recoveryCommit,
  images: candidates.length, replaced: replacements.length, skipped: candidates.length - replacements.length,
  beforeBytes, afterBytes, savedBytes: beforeBytes - afterBytes,
  referenceFiles: referenceWrites.map((item) => relativePath(item.file)),
  replacements: replacements.map((image) => ({
    from: publicPath(image.source), to: publicPath(image.target),
    beforeBytes: image.original.length, afterBytes: image.converted.length,
    sourceSha256: sha256(image.original), outputSha256: sha256(image.converted),
    width: image.width, height: image.height,
  })),
}
if (options.report) {
  await fs.mkdir(path.dirname(options.report), { recursive: true })
  await fs.writeFile(options.report, `${JSON.stringify(report, null, 2)}\n`)
}
console.log(`Web image optimization (${report.mode})`)
console.log(`- smaller replacements: ${report.replaced}/${report.images}`)
console.log(`- bytes: ${beforeBytes} -> ${afterBytes} (${((1 - afterBytes / (beforeBytes || 1)) * 100).toFixed(1)}% smaller)`)
console.log(`- reference files: ${referenceWrites.length}`)
console.log(`- originals recoverable from Git: ${recoveryCommit}`)
if (!options.write) console.log('- pass --write to apply the verified replacements')
