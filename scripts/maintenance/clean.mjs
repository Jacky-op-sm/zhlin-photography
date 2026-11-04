#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Only reproducible build/test outputs belong here. Never sweep all of
// .generated or workspace: they can contain import receipts and source records.
const targets = [
  '.next', 'out', 'build', 'coverage', 'playwright-report', 'test-results',
  '.cache', '.eslintcache', '.npm-cache',
  'tsconfig.tsbuildinfo', '.generated/writing.json',
  'debug.log',
  '.generated/photography/preview', '.generated/photography/refined-preview',
]

async function checkAncestors(root, relativePath) {
  let parent = root
  for (const segment of relativePath.split('/').slice(0, -1)) {
    parent = path.join(parent, segment)
    let stat
    try { stat = await fs.lstat(parent) } catch (error) {
      if (error.code === 'ENOENT') return
      throw error
    }
    if (stat.isSymbolicLink()) throw new Error(`Refusing to clean through a symlink: ${parent}`)
  }
}

async function diskBytes(target) {
  const stat = await fs.lstat(target)
  if (!stat.isDirectory() || stat.isSymbolicLink()) return stat.size
  const entries = await fs.readdir(target)
  const sizes = await Promise.all(entries.map((entry) => diskBytes(path.join(target, entry))))
  return sizes.reduce((total, size) => total + size, 0)
}

export async function cleanProject(root, { dryRun = false } = {}) {
  // Check every ancestor before removing anything. A symlinked .generated/
  // must never turn a nested cache target into a deletion outside the project.
  for (const target of targets) await checkAncestors(root, target)
  const removed = []
  for (const relativePath of targets) {
    const target = path.join(root, relativePath)
    let bytes
    try { bytes = await diskBytes(target) } catch (error) {
      if (error.code === 'ENOENT') continue
      throw error
    }
    if (!dryRun) await fs.rm(target, { recursive: true, force: true })
    removed.push({ path: relativePath, bytes })
  }
  return removed
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  if (args.some((arg) => arg !== '--dry-run')) throw new Error('Usage: npm run clean -- [--dry-run]')
  const dryRun = args.includes('--dry-run')
  const results = await cleanProject(fileURLToPath(new URL('../../', import.meta.url)), { dryRun })
  for (const result of results) console.log(`${dryRun ? 'Would remove' : 'Removed'} ${result.path}`)
  const bytes = results.reduce((total, result) => total + result.bytes, 0)
  console.log(`${dryRun ? 'Reclaimable' : 'Reclaimed'} ${(bytes / 1024 / 1024).toFixed(2)} MiB of reproducible outputs.`)
}
