#!/usr/bin/env node

import { spawn } from 'node:child_process'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { publicPaths, routePattern } from './check-routes.mjs'

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

let output = ''
for (const stream of [child.stdout, child.stderr]) {
  stream.on('data', (chunk) => {
    const text = chunk.toString()
    output += text
    if (stream === child.stdout) process.stdout.write(text)
    else process.stderr.write(text)
  })
}

const exitCode = await new Promise((resolve) => child.on('close', resolve))
const elapsedSeconds = (performance.now() - startedAt) / 1000

if (exitCode !== 0) {
  process.exit(exitCode ?? 1)
}

const routeSymbols = new Map()
for (const line of output.split(/\r?\n/)) {
  const match = line.match(/^[┌├└]\s+([○●ƒ])\s+(\S+)/)
  if (match) routeSymbols.set(match[2], match[1])
}

const failures = []
for (const route of requiredRoutes) {
  const expectedSymbol =
    route === '/travel/[slug]' ? '●' : route === '/hobby' ? 'ƒ' : '○'
  const symbol = routeSymbols.get(route)
  if (symbol !== expectedSymbol) {
    failures.push(
      `${route} must be ${expectedSymbol === '●' ? 'generated' : expectedSymbol === 'ƒ' ? 'dynamic' : 'static'} (${expectedSymbol}), got ${symbol ?? 'missing'}`,
    )
  }
}

console.log('\nBuild route summary')
console.log(`- build time (report only): ${elapsedSeconds.toFixed(2)}s`)
for (const route of requiredRoutes) {
  console.log(`- ${route}: ${routeSymbols.get(route) ?? 'missing'}`)
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
