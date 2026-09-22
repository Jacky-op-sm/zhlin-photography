#!/usr/bin/env node

import path from 'node:path'
import {
  cleanGeneratedPhotographyImages,
  runPhotographyImagePipeline,
} from './pipeline.mjs'
import { generatedRoot, manifestPath, projectRoot } from './config.mjs'

const args = new Set(process.argv.slice(2))
const unknownArgs = [...args].filter((arg) => !['--write', '--clean'].includes(arg))
if (unknownArgs.length > 0) {
  throw new Error(`Unknown argument: ${unknownArgs[0]}`)
}

if (args.has('--clean')) {
  if (args.has('--write')) {
    throw new Error('--clean and --write cannot be combined')
  }
  await cleanGeneratedPhotographyImages()
  console.log(`Removed ${path.relative(projectRoot, generatedRoot)}`)
  process.exit(0)
}

const write = args.has('--write')
const result = await runPhotographyImagePipeline({ write })

console.log('Photography image build')
console.log(`- mode: ${write ? 'write' : 'report only'}`)
console.log(`- photos: ${result.photoCount}`)
console.log(`- generated size: ${(result.totalBytes / 1024 / 1024).toFixed(2)} MB`)
console.log(
  write
    ? `- manifest: ${path.relative(projectRoot, manifestPath)}`
    : '- pass --write to update generated files and the manifest',
)
