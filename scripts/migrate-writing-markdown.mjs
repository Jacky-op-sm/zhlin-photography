import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { validateWriting } from '../src/lib/content/writing-schema.ts'
import { parseWritingMarkdown, serializeWritingMarkdown, writingFilename } from './writing-markdown.mjs'

// Convert the current website copies, including any manual edits. Never reimport the vault.
const directory = path.resolve('content/writing')
assert.equal(path.dirname(directory), path.resolve('content'))
const oldFiles = fs.readdirSync(directory).filter(filename => filename.endsWith('.json')).sort()
if (!oldFiles.length) {
  console.log('No JSON article sources remain; nothing to migrate.')
  process.exit(0)
}
const entries = validateWriting(oldFiles.map(filename => JSON.parse(fs.readFileSync(path.join(directory, filename), 'utf8'))))
const names = new Set()
const converted = entries.map((entry, index) => {
  const filename = writingFilename(entry)
  assert.ok(!names.has(filename.toLowerCase()), `Duplicate filename: ${filename}`)
  assert.ok(!fs.existsSync(path.join(directory, filename)), `File already exists: ${filename}`)
  names.add(filename.toLowerCase())
  const markdown = serializeWritingMarkdown(entry)
  assert.deepEqual(parseWritingMarkdown(markdown, filename), entry, `Conversion changed ${entry.slug}`)
  return { filename, markdown, entry, previous: oldFiles[index] }
})
console.log(`${converted.length} Markdown articles verified; ${entries.filter(entry => entry.date?.length === 7).length} retain month-only dates.`)
if (process.argv.includes('--write')) {
  const backup = path.resolve('workspace/writing/replaced-content', `markdown-${new Date().toISOString().replaceAll(/[:.]/g, '-')}`)
  fs.mkdirSync(backup, { recursive: true })
  for (const filename of oldFiles) fs.copyFileSync(path.join(directory, filename), path.join(backup, filename))
  for (const { filename, markdown } of converted) fs.writeFileSync(path.join(directory, filename), markdown, { flag: 'wx' })
  // Read back every file before removing the old sources.
  for (const { filename, entry } of converted) assert.deepEqual(parseWritingMarkdown(fs.readFileSync(path.join(directory, filename), 'utf8'), filename), entry)
  for (const filename of oldFiles) {
    const file = path.resolve(directory, filename)
    assert.equal(path.dirname(file), directory)
    fs.unlinkSync(file)
  }
  fs.writeFileSync('workspace/writing/markdown-migration.json', JSON.stringify({ backup, entries: converted.map(({ filename, entry, previous }) => ({ slug: entry.slug, previous, filename, body_sha256: createHash('sha256').update(entry.body).digest('hex') })) }, null, 2) + '\n')
  console.log(`Markdown is now the source. JSON originals backed up in ${backup}`)
}
