import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { parseWritingMarkdown, readWritingDirectory, serializeWritingMarkdown, writingFilename, isWritingMarkdown } from './markdown.mjs'

const directory = path.resolve('content/writing')
const args = process.argv.slice(2)
const suppliedDate = args.find(arg => arg.startsWith('--date='))?.slice(7)
const requested = args.filter(arg => !arg.startsWith('--'))
if (requested.length > 1 || args.some(arg => arg.startsWith('--') && !arg.startsWith('--date='))) {
  throw new Error('Usage: npm run writing:add -- [article.md] [--date=YYYY-MM-DD]')
}

function today() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function selectedFiles() {
  if (!requested.length) return fs.readdirSync(directory).filter(isWritingMarkdown).sort()
  const full = path.resolve(requested[0])
  if (path.dirname(full) !== directory || !isWritingMarkdown(path.basename(full))) {
    throw new Error('Choose a .md file directly inside content/writing')
  }
  return [path.basename(full)]
}

function convert(filename, usedSlugs) {
  const sourcePath = path.join(directory, filename)
  const raw = fs.readFileSync(sourcePath, 'utf8').replace(/^\uFEFF/, '').replaceAll('\r\n', '\n')
  if (/^---[ \t]*\n/.test(raw)) {
    parseWritingMarkdown(raw, filename)
    return null
  }
  const heading = /^# (.+?)[ \t]*\n(?:\n|$)/.exec(raw)
  if (!heading) throw new Error(`${filename}: start a new article with '# 标题' followed by a blank line`)
  const title = heading[1].trim()
  const body = raw.slice(heading[0].length).trim()
  const datedName = /^(\d{4}-\d{2}(?:-\d{2})?)-/.exec(filename)
  const date = suppliedDate ?? datedName?.[1] ?? today()
  const digest = createHash('sha256').update(filename).digest('hex').slice(0, 10)
  const slug = `piece-${date.replaceAll('-', '')}-${digest}`
  const entry = { slug, title, date, type: 'essay', status: 'published', lang: /[\u3400-\u9fff]/u.test(`${title}${body}`) ? 'zh-Hans' : 'en', body }
  const normalized = serializeWritingMarkdown(entry)
  if (usedSlugs.has(slug)) throw new Error(`${filename}: generated slug already exists: ${slug}`)
  const outputName = writingFilename(entry)
  const outputPath = path.join(directory, outputName)
  if (outputPath !== sourcePath && fs.existsSync(outputPath)) throw new Error(`${filename}: destination already exists: ${outputName}`)
  fs.writeFileSync(sourcePath, normalized)
  if (outputPath !== sourcePath) fs.renameSync(sourcePath, outputPath)
  usedSlugs.add(slug)
  return outputName
}

export function addWriting() {
  const existing = readWritingDirectoryIgnoringPlain()
  const usedSlugs = new Set(existing.map(entry => entry.slug))
  const converted = []
  for (const filename of selectedFiles()) {
    const result = convert(filename, usedSlugs)
    if (result) converted.push(result)
  }
  readWritingDirectory()
  return converted
}

function readWritingDirectoryIgnoringPlain() {
  return fs.readdirSync(directory).filter(isWritingMarkdown).flatMap(filename => {
    const raw = fs.readFileSync(path.join(directory, filename), 'utf8')
    return /^\uFEFF?---[ \t]*\r?\n/.test(raw) ? [parseWritingMarkdown(raw, filename)] : []
  })
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const converted = addWriting()
  console.log(converted.length ? `Prepared ${converted.length} article(s):\n${converted.join('\n')}` : 'No plain Markdown articles to prepare.')
}
