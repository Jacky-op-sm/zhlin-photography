#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const navigation = JSON.parse(
  fs.readFileSync(path.join(root, 'content/site/navigation.json'), 'utf8'),
)

function collectPaths(items) {
  return items.flatMap((item) => [
    item.href.split('#')[0],
    ...(item.children ? collectPaths(item.children) : []),
  ])
}

export const publicPaths = [...new Set(collectPaths(navigation))]

export function routePattern(route) {
  return route.startsWith('/travel/') ? '/travel/[slug]' : route
}
