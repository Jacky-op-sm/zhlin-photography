import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { cleanProject } from '../../scripts/maintenance/clean.mjs'

test('cleanup previews and removes only reproducible outputs, preserving source records', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'zhlin-clean-'))
  const keep = ['.generated/photography/bangkok/source-report.json', 'workspace/writing/receipt.json', 'content/writing/draft.md', 'assets-source/photo.jpg', '.git/config', 'node_modules/package/index.js']
  const remove = ['.next/cache/image.webp', 'test-results/preview.png', '.generated/writing.json', '.cache/playwright/results/preview.png', '.cache/typescript/tsconfig.tsbuildinfo']
  try {
    for (const file of [...keep, ...remove]) {
      await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true })
      await fs.writeFile(path.join(root, file), 'preserve this content')
    }
    const preview = await cleanProject(root, { dryRun: true })
    assert.equal(preview.length, 4)
    for (const file of [...keep, ...remove]) await fs.access(path.join(root, file))
    assert.deepEqual(await cleanProject(root), preview)
    for (const file of keep) assert.equal(await fs.readFile(path.join(root, file), 'utf8'), 'preserve this content')
    for (const file of remove) await assert.rejects(fs.access(path.join(root, file)), { code: 'ENOENT' })
    assert.deepEqual(await cleanProject(root), [])
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})

test('cleanup refuses symlink ancestors and never deletes their destination', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'zhlin-clean-links-'))
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'zhlin-keep-'))
  try {
    await fs.writeFile(path.join(outside, 'writing.json'), 'original data')
    await fs.mkdir(path.join(root, '.next'))
    await fs.writeFile(path.join(root, '.next/cache'), 'cache')
    await fs.symlink(outside, path.join(root, '.generated'), 'dir')
    await assert.rejects(cleanProject(root, { dryRun: true }), /symlink/)
    await assert.rejects(cleanProject(root), /symlink/)
    assert.equal(await fs.readFile(path.join(outside, 'writing.json'), 'utf8'), 'original data')
    await fs.access(path.join(root, '.next/cache'))
    await fs.unlink(path.join(root, '.generated'))
    await fs.rm(path.join(root, '.next'), { recursive: true })
    await fs.symlink(outside, path.join(root, '.next'), 'dir')
    await cleanProject(root)
    assert.equal(await fs.readFile(path.join(outside, 'writing.json'), 'utf8'), 'original data')
    await assert.rejects(fs.lstat(path.join(root, '.next')), { code: 'ENOENT' })
  } finally {
    await fs.rm(root, { recursive: true, force: true })
    await fs.rm(outside, { recursive: true, force: true })
  }
})
