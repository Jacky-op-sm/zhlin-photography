import fs from 'node:fs'
import path from 'node:path'
import { dump, load, JSON_SCHEMA } from 'js-yaml'
import { writingSchema, validateWriting } from '../src/lib/content/writing-schema.ts'

const metadataSchema = writingSchema.omit({ body: true }).strict()

export function parseWritingMarkdown(source, filename = 'article.md') {
  try {
    const markdown = source.replace(/^\uFEFF/, '').replaceAll('\r\n', '\n')
    const header = /^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(markdown)
    if (!header) throw new Error('Start the file with YAML metadata between two --- lines')
    // Keep date values as strings, including unquoted YYYY-MM-DD values.
    const metadata = metadataSchema.parse(load(header[1], { schema: JSON_SCHEMA, filename }))
    return writingSchema.parse({ ...metadata, body: markdown.slice(header[0].length) })
  } catch (error) {
    throw new Error(`${filename}: ${error.message}`, { cause: error })
  }
}

export function serializeWritingMarkdown(value) {
  const { body, ...metadata } = writingSchema.parse(value)
  const header = dump(metadata, { schema: JSON_SCHEMA, lineWidth: -1, noRefs: true, quotingType: '"', forceQuotes: true })
  return `---\n${header}---\n\n${body}\n`
}

export function writingFilename(value) {
  const entry = writingSchema.parse(value)
  const replacements = { '<': '＜', '>': '＞', ':': '：', '"': '＂', '/': '／', '\\': '＼', '|': '｜', '?': '？', '*': '＊' }
  const title = Array.from(entry.title).map(char => replacements[char] ?? (char.codePointAt(0) < 32 ? '' : char)).join('').replace(/[. ]+$/, '')
  if (!title) throw new Error(`Cannot make a filename for ${entry.slug}`)
  return `${entry.date ?? 'undated'}-${title}.md`
}

export function isWritingMarkdown(filename) {
  return filename.toLowerCase().endsWith('.md') && filename.toLowerCase() !== 'readme.md'
}

export function readWritingDirectory(directory = 'content/writing') {
  const files = fs.readdirSync(directory)
  if (files.some(file => file.endsWith('.json'))) throw new Error(`${directory}: article sources must be Markdown; migrate the remaining JSON files`)
  return validateWriting(files.filter(isWritingMarkdown).sort().map(filename =>
    parseWritingMarkdown(fs.readFileSync(path.join(directory, filename), 'utf8'), filename),
  ))
}
