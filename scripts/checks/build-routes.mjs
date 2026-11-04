#!/usr/bin/env node

import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { publicPaths, routePattern } from './routes.mjs'

// This command must also work immediately after `npm run clean`.
await import('../writing/prepare.mjs')

const requiredRoutes = [...new Set(publicPaths.map(routePattern))]
const nextCli = path.join(
  process.cwd(),
  'node_modules',
  'next',
  'dist',
  'bin',
  'next',
)
const startedAt = performance.now()
const child = spawn(process.execPath, [nextCli, 'build'], {
  env: {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: '1',
  },
  shell: false,
})

for (const stream of [child.stdout, child.stderr]) {
  stream.on('data', (chunk) => {
    const text = chunk.toString()
    if (stream === child.stdout) process.stdout.write(text)
    else process.stderr.write(text)
  })
}

const exitCode = await new Promise((resolve) => child.on('close', resolve))
const elapsedSeconds = (performance.now() - startedAt) / 1000

if (exitCode !== 0) {
  process.exit(exitCode ?? 1)
}

// Use the build's route records: newer Next versions put the SSG marker on
// concrete child routes rather than their parent in the human-readable table.
const manifest = JSON.parse(await fs.readFile('.next/prerender-manifest.json', 'utf8'))
const routeKinds = new Map()
for (const route of Object.keys(manifest.routes)) routeKinds.set(route, 'static')
for (const route of Object.keys(manifest.dynamicRoutes)) {
  if (Object.values(manifest.routes).some((entry) => entry.srcRoute === route)) routeKinds.set(route, 'generated')
}

const failures = []
for (const route of requiredRoutes) {
  const expectedKind = route === '/travel/[slug]' ? 'generated' : 'static'
  const kind = routeKinds.get(route)
  if (kind !== expectedKind) {
    failures.push(`${route} must be ${expectedKind}, got ${kind ?? 'missing'}`)
  }
}

console.log('\nBuild route summary')
console.log(`- build time (report only): ${elapsedSeconds.toFixed(2)}s`)
for (const route of requiredRoutes) {
  console.log(`- ${route}: ${routeKinds.get(route) ?? 'missing'}`)
}
console.log(
  '- JavaScript and transfer budgets are measured against the running production server',
)

if (failures.length > 0) {
  console.error('\nBuild route check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('\nBuild route check passed.')
