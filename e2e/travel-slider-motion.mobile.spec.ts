import { test, expect } from '@playwright/test'

function isMobileProject(projectName: string) {
  return projectName.startsWith('mobile-')
}

test.describe('travel slider motion on mobile', () => {
  test('next button moves one card step without horizontal overflow', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/travel/nanjing')
    await page.waitForLoadState('networkidle')

    const firstCard = page.getByRole('button', { name: 'Open card 1', exact: true })
    await expect(firstCard).toBeVisible()

    const before = await firstCard.boundingBox()
    expect(before).not.toBeNull()

    await page.getByRole('button', { name: 'Next' }).first().click()
    await page.waitForTimeout(550)

    const after = await firstCard.boundingBox()
    expect(after).not.toBeNull()

    const deltaX = (after?.x ?? 0) - (before?.x ?? 0)
    expect(deltaX).toBeLessThan(-220)

    const overflow = await page.evaluate(() => {
      const viewportWidth = window.innerWidth
      const rootWidth = document.documentElement.scrollWidth
      const bodyWidth = document.body.scrollWidth
      return Math.max(rootWidth, bodyWidth) - viewportWidth
    })

    expect(overflow).toBeLessThanOrEqual(0)
  })
})
