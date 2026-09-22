import path from 'node:path'
import { test } from '@playwright/test'

const captureVisuals = process.env.CAPTURE_VISUALS === '1'

const routes = [
  ['home', '/'],
  ['photography', '/photography'],
  ['street', '/photography/street'],
  ['travel', '/travel'],
  ['travel-nanjing', '/travel/nanjing'],
  ['hobby', '/hobby'],
  ['contact', '/contact'],
] as const

test.describe('manual production visual audit', () => {
  test.skip(!captureVisuals, 'Set CAPTURE_VISUALS=1 to capture audit images.')

  for (const [name, route] of routes) {
    test(`${name} route`, async ({ page }, testInfo) => {
      await page.goto(route)
      await page.evaluate(async () => {
        await document.fonts.ready

        const step = Math.max(window.innerHeight * 0.8, 480)
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo(0, y)
          await new Promise((resolve) => window.setTimeout(resolve, 80))
        }
        await Promise.all(
          [...document.images].map((image) =>
            image.decode().catch(() => undefined),
          ),
        )
        window.scrollTo(0, 0)
      })

      await page.screenshot({
        path: path.join(
          process.cwd(),
          'test-results',
          'visual-audit',
          `${testInfo.project.name}-${name}.png`,
        ),
        fullPage: true,
        animations: 'disabled',
      })
    })
  }
})
