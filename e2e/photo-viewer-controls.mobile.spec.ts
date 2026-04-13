import { test, expect } from '@playwright/test'

function isMobileProject(projectName: string) {
  return projectName.startsWith('mobile-')
}

test.describe('photo viewer controls on mobile', () => {
  test('nav controls render below current image for portrait and landscape assets', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/photography/pets')
    await page.waitForLoadState('networkidle')

    await page.locator('.photo-gallery-item').nth(5).click()
    await expect(page.locator('.photo-viewer-image')).toBeVisible()

    const placement = await page.evaluate(() => {
      const viewer = document.querySelector('.photo-viewer') as HTMLElement | null
      if (!viewer) return null
      const img = viewer.querySelector('.photo-viewer-image') as HTMLElement | null
      const controls = viewer.querySelector('.photo-viewer-controls') as HTMLElement | null
      if (!img || !controls) return null

      const imgRect = img.getBoundingClientRect()
      const controlsRect = controls.getBoundingClientRect()

      return {
        imageBottom: imgRect.bottom,
        controlsTop: controlsRect.top,
      }
    })

    expect(placement).not.toBeNull()
    expect(placement!.controlsTop).toBeGreaterThanOrEqual(placement!.imageBottom - 1)
  })
})
