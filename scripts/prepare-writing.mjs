import fs from 'node:fs'
import { readWritingDirectory } from './writing-markdown.mjs'

// Writing is an explicit selection. Do not repopulate it from other modules.
const validated = readWritingDirectory()
const preview = process.argv.includes('--dev') ? process.env.WRITING_PREVIEW_SLUG : undefined
const published = validated.filter(entry => entry.status === 'published' || entry.slug === preview)
fs.mkdirSync('.generated', { recursive: true })
// Other modules hide links to reading editions no longer selected.
fs.writeFileSync('.generated/writing.json', JSON.stringify({ entries: published, hobbyLinks: {} }))
console.log(`Writing: ${published.length} public pieces; ${validated.length - published.length} drafts excluded${preview ? `; local preview: ${preview}` : ''}.`)
