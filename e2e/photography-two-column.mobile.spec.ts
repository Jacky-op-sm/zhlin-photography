import { test, expect } from '@playwright/test'

function isMobileProject(projectName: string) {
  return projectName.startsWith('mobile-')
}

test.describe('photography series mobile columns', () => {
  test('street gallery renders two masonry columns with tight gap', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/photography/street')
    await page.waitForLoadState('networkidle')

    const layout = await page.evaluate(() => {
      const masonry = document.querySelector('.photo-gallery-masonry') as HTMLElement | null
      const items = Array.from(document.querySelectorAll('.photo-gallery-item')).slice(0, 10) as HTMLElement[]
      if (!masonry || items.length < 4) return null

      const xs = items.map((node) => node.getBoundingClientRect().x)
      const roundedXs = Array.from(new Set(xs.map((x) => Math.round(x / 8) * 8))).sort((a, b) => a - b)

      return {
        columns: roundedXs,
        columnGap: Number.parseFloat(window.getComputedStyle(masonry).columnGap),
      }
    })

    expect(layout).not.toBeNull()
    expect(layout!.columns.length).toBe(2)
    expect(layout!.columnGap).toBeLessThanOrEqual(6)
  })
})
