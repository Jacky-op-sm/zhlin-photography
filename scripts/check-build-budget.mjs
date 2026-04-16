#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const firstLoadBudgetKb = Number(process.env.PHOTOGRAPHY_FIRST_LOAD_BUDGET_KB ?? 105);
const buildTimeBudgetSec = Number(process.env.BUILD_TIME_BUDGET_SECONDS ?? 10);

const requiredRoutes = [
  '/photography',
  '/photography/street',
  '/photography/pets',
  '/photography/project',
];

const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const args = ['next', 'build', '--no-lint'];
const env = {
  ...process.env,
  NEXT_TELEMETRY_DISABLED: '1',
  SKIP_TYPECHECK: '1',
};

const startedAt = performance.now();
const child = spawn(cmd, args, { env });

let output = '';

child.stdout.on('data', (chunk) => {
  const text = chunk.toString();
  output += text;
  process.stdout.write(text);
});

child.stderr.on('data', (chunk) => {
  const text = chunk.toString();
  output += text;
  process.stderr.write(text);
});

const exitCode = await new Promise((resolve) => {
  child.on('close', resolve);
});

const elapsedSec = (performance.now() - startedAt) / 1000;

if (exitCode !== 0) {
  console.error(`Build failed with exit code ${exitCode}.`);
  process.exit(exitCode ?? 1);
}

const routeStats = new Map();
const linePattern = /^[├└]\s+([○ƒ●])\s+(\/\S+)\s+.*?\s+(\d+(?:\.\d+)?)\s+kB\s*$/;

for (const line of output.split(/\r?\n/)) {
  const match = line.match(linePattern);
  if (!match) continue;

  const [, symbol, route, firstLoad] = match;
  routeStats.set(route, {
    symbol,
    firstLoadKb: Number(firstLoad),
  });
}

const failures = [];

for (const route of requiredRoutes) {
  const stat = routeStats.get(route);
  if (!stat) {
    failures.push(`Missing route stats for ${route}`);
    continue;
  }

  if (stat.symbol !== '○') {
    failures.push(`${route} must be static (○), got ${stat.symbol}`);
  }

  if (stat.firstLoadKb > firstLoadBudgetKb) {
    failures.push(`${route} first load ${stat.firstLoadKb}kB exceeds ${firstLoadBudgetKb}kB`);
  }
}

if (elapsedSec > buildTimeBudgetSec) {
  failures.push(`build time ${elapsedSec.toFixed(2)}s exceeds ${buildTimeBudgetSec}s`);
}

console.log('\nBuild Budget Summary');
console.log(`- build time: ${elapsedSec.toFixed(2)}s`);
for (const route of requiredRoutes) {
  const stat = routeStats.get(route);
  if (!stat) continue;
  console.log(`- ${route}: ${stat.symbol}, ${stat.firstLoadKb}kB`);
}
console.log(`- budget: first load <= ${firstLoadBudgetKb}kB`);
console.log(`- budget: build time <= ${buildTimeBudgetSec}s`);

if (failures.length > 0) {
  console.error('\nBuild budget check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('\nBuild budget check passed.');
