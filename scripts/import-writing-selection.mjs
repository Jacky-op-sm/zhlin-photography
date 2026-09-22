import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { validateWriting } from '../src/lib/content/writing-schema.ts'
import { isWritingMarkdown, serializeWritingMarkdown, writingFilename } from './writing-markdown.mjs'

// Explicit, read-only source import. No automatic vault sync or cross-module imports.
const source = process.argv[2]
if (!source || source.startsWith('--')) throw new Error('Usage: node scripts/import-writing-selection.mjs <handoff-directory> [--write]')
const root = path.resolve(source)
const hash = text => createHash('sha256').update(text).digest('hex')
const slugs = {
  2020: ['mushroom-duck-soup'],
  2021: ['words-i-memorize', 'grandmothers-phone-call'],
  2022: ['after-the-banquet', 'the-broken-cable', 'this-time-he-could-not-sleep'],
  2023: ['lao-li-and-his-ideals'],
  2024: ['an-afternoon-by-the-lake', 'books-in-the-old-classroom', 'singing-without-an-audience', 'someone-missing-from-the-photo', 'sheltering-in-the-botanical-garden', 'unwrapping-books', 'tokyo-story', 'say-hello-to-dabai', 'actions-not-hours', 'closing-the-laptop-for-music', 'a-story-in-the-library'],
  2025: ['waiting-for-the-driver', 'i-thought-they-were-trapped', 'a-song-for-a-dare', 'a-drivers-life-lessons', 'the-long-road', 'the-colors-of-matsukos-life', 'seeing-before-drawing', 'the-mask-falls-away'],
  2026: ['next-door-can-hear', 'the-snack-street-and-the-motorcyclist', 'a-photo-by-xuanwu-lake', 'a-writer-like-a-friend', 'twelve-yuan-egg-waffle', 'dont-look-back', 'a-perfume-gathering-at-the-bookshop', 'opening-the-bookshop-latch', 'one-photo-a-better-day', 'photos-not-taken', 'camera-models', 'three-conversations-in-wuhan', 'basketball-among-fruit', 'encounters-with-books', 'nowhere-else-to-go', 'i-never-saw-her-face', 'jiangcun-coffee', 'another-habitat', 'a-magpie-and-a-stone', 'before-the-song-ended', 'letting-go-of-an-old-computer', 'typhoon-notes', 'four-geese-and-a-duck', 'what-to-do-with-this-spider', 'beyond-composition', 'questions-for-the-bookseller'],
}

function archiveDate(row) {
  // Dated chapters outrank the collection's filename.
  if (row.chapter) {
    const date = /## (\d{2})\.(\d{2})/.exec(row.chapter)
    assert.ok(date)
    assert.equal(row.month.slice(5), date[1])
    return `${row.month}-${date[2]}`
  }
  // Conflicting November diary dates establish the month only.
  if (row.id === '2020-11-01') return row.month
  // Book, film and travel records establish the archival month, not a first-draft day.
  if (!row.source.startsWith('02a. Diary/') && !row.source.startsWith('02b. Short Story/')) return row.month
  if (/^\d{4}-\d{2}-\d{2}$/.test(row.source_date) && row.source_date.startsWith(row.month)) return row.source_date
  return row.month
}

const articles = []
const inventory = []
const sourceFiles = []
const years = []
const pending = []
for (let year = 2018; year <= 2026; year++) {
  const folder = `2026-09-22 ${year}写作按原月严选`
  const directory = path.join(root, folder)
  const names = fs.readdirSync(directory)
  const manifests = names.filter(name => name.endsWith('来源与校验.json'))
  assert.equal(manifests.length, 1)
  const manifestRaw = fs.readFileSync(path.join(directory, manifests[0]), 'utf8')
  const manifest = JSON.parse(manifestRaw)
  sourceFiles.push({ file: `${folder}/${manifests[0]}`, sha256: hash(manifestRaw) })
  assert.equal(manifest.selected_count, manifest.selections.length)
  assert.equal(manifest.selections.length, slugs[year]?.length ?? 0)
  years.push({ year, selected: manifest.selected_count })
  for (const row of manifest.pending_month_candidates ?? []) pending.push({ id: row.id, title: row.title, source: row.source, reason: row.date_note })
  const previews = new Map()
  for (const name of names.filter(name => /^\d{2} \d{4}-\d{2} 月选\.md$/.test(name))) {
    const raw = fs.readFileSync(path.join(directory, name), 'utf8')
    sourceFiles.push({ file: `${folder}/${name}`, sha256: hash(raw) })
    const markdown = raw.replaceAll('\r\n', '\n')
    for (const block of markdown.matchAll(/<a id="([^"]+)"><\/a>\s*\n## (.*?)\n([\s\S]*?)(?=\n<a id="|$)/g)) {
      const id = block[1].toLowerCase()
      assert.ok(!previews.has(id), `Duplicate preview ${id}`)
      const title = block[2].replace(/\s*★\s*$/, '').replace(/^S\d+ /, '')
      const body = block[3].split(/### (?:原文预览|入选原文)\n/)[1]?.replace(/\n---\s*$/, '').trim()
      previews.set(id, { title, body, file: `${folder}/${name}` })
    }
  }
  assert.equal(previews.size, manifest.selected_count)
  manifest.selections.forEach((row, index) => {
    const preview = previews.get(row.id.toLowerCase())
    assert.ok(preview, `Missing Markdown preview ${row.id}`)
    assert.equal(preview.title, row.title)
    assert.equal(preview.body, row.preview_text.trim(), `Manifest/Markdown mismatch: ${row.id}`)
    if (row.excerpt_sha256_utf8_lf) assert.equal(hash(row.preview_text), row.excerpt_sha256_utf8_lf)
    assert.ok(row.month.startsWith(`${year}-`))
    const date = archiveDate(row)
    const slug = slugs[year][index]
    articles.push({ slug, title: preview.title, date, order: index + 1, type: 'essay', status: 'published', lang: 'zh-Hans', body: preview.body })
    inventory.push({ id: row.id, slug, title: row.title, month: row.month, archive_date: date, selection_file: preview.file, body_sha256: hash(preview.body), source: row.source, source_date: row.source_date, source_sha256: row.source_sha256, date_note: row.date_note ?? null, scope: row.scope ?? null, editorial_note: row.edit })
  })
}
const validated = validateWriting(articles)
const target = path.resolve('content/writing')
assert.equal(path.dirname(target), path.resolve('content'))
const oldFiles = fs.readdirSync(target).filter(name => name.endsWith('.json') || isWritingMarkdown(name))
const desired = new Set(validated.map(writingFilename))
assert.equal(desired.size, validated.length, 'Duplicate article filenames')
const removed = oldFiles.filter(name => !desired.has(name))
console.log(JSON.stringify({ entries: validated.length, months: new Set(validated.map(entry => entry.date.slice(0, 7))).size, years, pending_month_candidates: pending.length, old_files_removed: removed.length }, null, 2))
if (process.argv.includes('--write')) {
  const backup = path.resolve('workspace/writing/replaced-content', new Date().toISOString().replaceAll(/[:.]/g, '-'))
  fs.mkdirSync(backup, { recursive: true })
  for (const name of oldFiles) fs.copyFileSync(path.join(target, name), path.join(backup, name))
  for (const [from, to] of [['.generated/writing.json', 'previous-prepared.json'], ['workspace/writing/selection-inventory.json', 'previous-inventory.json']]) {
    if (fs.existsSync(from)) fs.copyFileSync(from, path.join(backup, to))
  }
  for (const entry of validated) fs.writeFileSync(path.join(target, writingFilename(entry)), serializeWritingMarkdown(entry))
  for (const name of removed) {
    const file = path.resolve(target, name)
    assert.equal(path.dirname(file), target)
    fs.unlinkSync(file)
  }
  fs.writeFileSync('workspace/writing/selection-inventory.json', JSON.stringify({ curated_on: '2026-09-22', selection_basis: 'original_month', source_files: sourceFiles, years, pending_month_candidates: pending, entries: inventory }, null, 2) + '\n')
  console.log(`Previous local content backed up to ${backup}`)
}
