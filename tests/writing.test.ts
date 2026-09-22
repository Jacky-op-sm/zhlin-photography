import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawnSync } from 'node:child_process'
import { parseWritingMarkdown, readWritingDirectory, serializeWritingMarkdown, writingFilename } from '../scripts/writing-markdown.mjs'
import { archiveUrl, defaultFilters, filterWriting, normalizeFilters, writingPeriods, type WritingEntry } from '../src/lib/content/writing-model.ts'

import { validateWriting } from '../src/lib/content/writing-schema.ts'

const make = (slug: string, date: string | null, order = 1): WritingEntry => ({ slug, date, order, type: 'essay', title: '中文与 English', status: 'published', lang: 'zh-Hans', body: '完整正文。\n\nSecond paragraph.' })
const entries = [make('older', '2020-11'), make('early', '2026-05-02'), make('month-only-second', '2026-05', 2), make('month-only-first', '2026-05'), make('late', '2026-05-18'), make('undated', null)]

test('validates real month/day precision, required fields, unique slugs and default draft status', () => {
  for (const date of ['2026-02-30', '2025-02-29', '2026-2-02', '2026-00', '2026-13', '2026']) assert.throws(() => validateWriting([make('bad', date)]))
  assert.throws(() => validateWriting([make('same', '2026-05'), make('same', '2025-02')]))
  assert.throws(() => validateWriting([{ slug: 'missing-fields' }]))
  assert.throws(() => validateWriting([make('bad-order', '2026-05', 0)]))
  assert.equal(validateWriting([{ ...make('draft', null), status: undefined }])[0].status, 'draft')
  assert.equal(validateWriting([make('leap', '2024-02-29'), make('month', '2024-02')]).length, 2)
})

test('sorts by original month/day without assigning a first day to month-only pieces', () => {
  assert.deepEqual(filterWriting(entries, defaultFilters).map(e => e.slug), ['late', 'early', 'month-only-first', 'month-only-second', 'older', 'undated'])
  assert.deepEqual(filterWriting(entries, { ...defaultFilters, sort: 'oldest' }).map(e => e.slug), ['older', 'early', 'late', 'month-only-first', 'month-only-second', 'undated'])
  assert.deepEqual(filterWriting(entries, { ...defaultFilters, year: '2020' }).map(e => e.slug), ['older'])
  assert.equal(filterWriting(entries, { ...defaultFilters, year: '2026', month: '05' }).length, 4)
  assert.deepEqual(filterWriting(entries, { ...defaultFilters, year: '2020', month: '05' }), [])
  assert.deepEqual(filterWriting([], defaultFilters), [])
  assert.deepEqual(writingPeriods(entries), ['2026-05', '2020-11'])
})

test('URL normalization retains year/month filters and clears obsolete publishing-month parameters', () => {
  const periods = writingPeriods(entries)
  assert.equal(archiveUrl(normalizeFilters(new URLSearchParams('year=2026&month=05&sort=oldest'), periods)), '/writing?year=2026&month=05&sort=oldest')
  assert.equal(archiveUrl(normalizeFilters(new URLSearchParams('year=2018&month=99&sort=bad'), periods)), '/writing')
  assert.equal(archiveUrl(normalizeFilters(new URLSearchParams('month=2&sort=reverse'), periods)), '/writing')
})

test('prepared articles match the current Markdown sources, including manual edits', () => {
  const { entries: published, hobbyLinks } = JSON.parse(fs.readFileSync('.generated/writing.json', 'utf8')) as { entries: WritingEntry[]; hobbyLinks: Record<string, string> }
  const authored = readWritingDirectory() as WritingEntry[]
  const expected = authored.filter(entry => entry.status === 'published')
  assert.equal(fs.readdirSync('content/writing').filter(file => file.endsWith('.json')).length, 0)
  assert.deepEqual(new Set(published.map(entry => entry.slug)), new Set(expected.map(entry => entry.slug)))
  assert.deepEqual(hobbyLinks, {})
  for (const entry of published) assert.deepEqual(entry, expected.find(source => source.slug === entry.slug))
})

test('Markdown frontmatter supports ordinary YAML and preserves prose, scene breaks, lists and figures', () => {
  const entry = make('markdown', '2026-06-11')
  entry.body = '第一段的 "英文引号" 和中文。\n\n---\n\n- 列表项目\n\n![照片](/assets/example.webp "说明")\n\n```js\nconst text = "hello"\n```'
  const markdown = serializeWritingMarkdown(entry)
  assert.deepEqual(parseWritingMarkdown(markdown), entry)
  assert.deepEqual(parseWritingMarkdown('\uFEFF' + markdown.replaceAll('\n', '\r\n')), entry)
  const unquotedDate = markdown.replace('date: "2026-06-11"', 'date: 2026-06-11')
  assert.equal(parseWritingMarkdown(unquotedDate).date, '2026-06-11')
  assert.equal(parseWritingMarkdown(markdown.replace('status: "published"\n', '')).status, 'draft')
  assert.throws(() => parseWritingMarkdown('No frontmatter', 'broken.md'), /broken.md/)
  assert.throws(() => parseWritingMarkdown(markdown.replace('date: "2026-06-11"', 'date: 2026-02-30')), /Invalid archive date/)
  assert.throws(() => parseWritingMarkdown(markdown.replace('status: "published"', 'status: published\nstatus: draft')), /duplicated mapping key/)
  assert.throws(() => parseWritingMarkdown(markdown.replace('status: "published"', 'statsu: published')), /statsu/)
  assert.throws(() => parseWritingMarkdown(markdown.split('\n---\n')[0] + '\n---\n'), /body/)
})

test('date-title filenames preserve Chinese and month precision and avoid Windows path characters', () => {
  assert.equal(writingFilename({ ...make('article', '2026-06-11'), title: '蒋村本质' }), '2026-06-11-蒋村本质.md')
  assert.equal(writingFilename({ ...make('article', '2026-05'), title: '人们总是关心相机的型号' }), '2026-05-人们总是关心相机的型号.md')
  const filename = writingFilename({ ...make('article', '2026-05'), title: '../中文: "问题"/答案?' })
  assert.equal(path.basename(filename), filename)
  assert.ok(!/[<>:"/\\|?*]/.test(filename))
})

test('preparation reads changed Markdown, preserves routes on rename and excludes drafts from production', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'writing-markdown-'))
  assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir()))
  const content = path.join(directory, 'content/writing')
  fs.mkdirSync(content, { recursive: true })
  const script = path.resolve('scripts/prepare-writing.mjs')
  const article = { ...make('editable', '2026-06-11'), title: '原题' }
  const draft = { ...make('draft', '2026-06'), status: 'draft' as const, body: 'PRIVATE_DRAFT_CANARY' }
  const filename = path.join(content, writingFilename(article))
  fs.writeFileSync(filename, serializeWritingMarkdown(article))
  fs.writeFileSync(path.join(content, writingFilename(draft)), serializeWritingMarkdown(draft))
  fs.writeFileSync(path.join(content, 'README.md'), '# Instructions, not an article')
  const prepare = (dev = false) => spawnSync(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', script, ...(dev ? ['--dev'] : [])], { cwd: directory, encoding: 'utf8', env: { ...process.env, WRITING_PREVIEW_SLUG: 'draft' } })
  const read = () => JSON.parse(fs.readFileSync(path.join(directory, '.generated/writing.json'), 'utf8')).entries as WritingEntry[]
  try {
    assert.equal(prepare().status, 0)
    assert.deepEqual(read(), [article])
    article.title = '手动修改后的标题'
    article.body = '这是直接在 Markdown 写下的新正文。\n\n第二段，不需要转义。'
    fs.writeFileSync(filename, serializeWritingMarkdown(article))
    fs.renameSync(filename, path.join(content, writingFilename(article)))
    assert.equal(prepare().status, 0)
    assert.deepEqual(read(), [article])
    assert.equal(prepare(true).status, 0)
    assert.equal(read().length, 2)
    assert.equal(prepare().status, 0)
    assert.ok(!JSON.stringify(read()).includes('PRIVATE_DRAFT_CANARY'))
    fs.writeFileSync(path.join(content, 'bad.md'), '---\nstatus: published\n---\nIncomplete metadata')
    const invalid = prepare()
    assert.notEqual(invalid.status, 0)
    assert.match(invalid.stderr, /bad.md/)
    assert.deepEqual(read(), [article])
  } finally {
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir()))
    assert.ok(path.basename(directory).startsWith('writing-markdown-'))
    fs.rmSync(directory, { recursive: true, force: true })
  }
})
