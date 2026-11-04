#!/usr/bin/env node

const deploymentUrl = process.env.DEPLOYMENT_URL
const expectedSha = process.env.EXPECTED_GIT_SHA

if (!deploymentUrl || !expectedSha) {
  console.error('DEPLOYMENT_URL and EXPECTED_GIT_SHA are required')
  process.exit(2)
}

const baseUrl = new URL(deploymentUrl)
const expectedRevision = expectedSha.slice(0, 12)

const [homeResponse, versionResponse] = await Promise.all([
  fetch(baseUrl),
  fetch(new URL('/api/version', baseUrl)),
])

if (!homeResponse.ok) {
  throw new Error(`Homepage returned ${homeResponse.status}`)
}
if (!versionResponse.ok) {
  throw new Error(`/api/version returned ${versionResponse.status}`)
}

const [html, version] = await Promise.all([
  homeResponse.text(),
  versionResponse.json(),
])

if (!html.includes('Photography')) {
  throw new Error('Homepage marker was not found')
}
if (version.revision !== expectedRevision) {
  throw new Error(
    `Deployment revision ${version.revision} does not match ${expectedRevision}`,
  )
}

console.log(`Deployment verified: ${baseUrl.origin} @ ${expectedRevision}`)
