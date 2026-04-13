import { test, expect } from '@playwright/test'

const pagesUnderTest = ['/', '/photography', '/travel', '/hobby']

function isMobileProject(projectName: string) {
  return projectName.startsWith('mobile-')
}

test.describe('mobile layout smoke', () => {
  for (const path of pagesUnderTest) {
    test(`${path} has no horizontal overflow`, async ({ page }, testInfo) => {
      test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

      await page.goto(path)
      await page.waitForLoadState('networkidle')

      const overflow = await page.evaluate(() => {
        const viewportWidth = window.innerWidth
        const rootWidth = document.documentElement.scrollWidth
        const bodyWidth = document.body.scrollWidth
        return {
          viewportWidth,
          rootWidth,
          bodyWidth,
          maxWidth: Math.max(rootWidth, bodyWidth),
        }
      })

      expect(
        overflow.maxWidth,
        `Overflow on ${path}: viewport=${overflow.viewportWidth}, root=${overflow.rootWidth}, body=${overflow.bodyWidth}`,
      ).toBeLessThanOrEqual(overflow.viewportWidth)
    })
  }
})
