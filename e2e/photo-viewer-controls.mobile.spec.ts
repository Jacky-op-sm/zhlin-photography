import { test, expect } from '@playwright/test'

function isMobileProject(projectName: string) {
  return projectName.startsWith('mobile-')
}

test.describe('photo viewer controls on mobile', () => {
  test('nav controls keep a stable vertical position while switching images', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/photography/pets')
    await page.waitForLoadState('networkidle')

    await page.locator('.photo-gallery-item').nth(5).click()
    await expect(page.locator('.photo-viewer-image')).toBeVisible()

    const before = await page.evaluate(() => {
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

    expect(before).not.toBeNull()
    expect(before!.controlsTop).toBeGreaterThanOrEqual(before!.imageBottom - 1)

    await page.getByRole('button', { name: 'Next image' }).click()
    await page.waitForTimeout(160)

    const after = await page.evaluate(() => {
      const viewer = document.querySelector('.photo-viewer') as HTMLElement | null
      const controls = viewer?.querySelector('.photo-viewer-controls') as HTMLElement | null
      if (!controls) return null
      return controls.getBoundingClientRect().top
    })

    expect(after).not.toBeNull()
    expect(Math.abs((after ?? 0) - before!.controlsTop)).toBeLessThanOrEqual(2)
  })
})
