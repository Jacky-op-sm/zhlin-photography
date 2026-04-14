import { test, expect } from '@playwright/test'

function isMobileProject(projectName: string) {
  return projectName.startsWith('mobile-')
}

test.describe('travel detail modal mobile layout', () => {
  test('expanded card keeps readable text width and visible image', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/travel/nanjing')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Open card 1', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Close detail' })).toBeVisible()

    const metrics = await page.evaluate(() => {
      const closeButton = document.querySelector('button[aria-label="Close detail"]') as HTMLElement | null
      const overlay = closeButton?.closest('div.fixed')
      if (!overlay) return null

      const textNode = overlay.querySelector('p.whitespace-pre-line') as HTMLElement | null
      const imageNode = overlay.querySelector('img') as HTMLImageElement | null

      if (!textNode || !imageNode) return null

      const textRect = textNode.getBoundingClientRect()
      const imageRect = imageNode.getBoundingClientRect()

      return {
        textWidth: textRect.width,
        imageHeight: imageRect.height,
      }
    })

    expect(metrics).not.toBeNull()
    expect(metrics!.textWidth).toBeGreaterThan(180)
    expect(metrics!.imageHeight).toBeGreaterThan(180)
  })

  test('close button stays visible after scrolling expanded content', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/travel/nanjing')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Open card 1', exact: true }).click()
    const closeButton = page.getByRole('button', { name: 'Close detail' })
    await expect(closeButton).toBeVisible()

    const overlay = page.locator('div.fixed.inset-0').first()
    await overlay.evaluate((node) => {
      ;(node as HTMLElement).scrollTo({ top: 1200, behavior: 'auto' })
    })
    await page.waitForTimeout(100)

    const inViewport = await closeButton.evaluate((button) => {
      const rect = button.getBoundingClientRect()
      return rect.top >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth
    })

    expect(inViewport).toBe(true)
  })
})
