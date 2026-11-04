import { test, expect } from '@playwright/test'

test('street exhibition preserves the photograph and fits the mobile viewport', async ({ page }) => {
  await page.goto('/photography/street')
  const image = page.getByTestId('exhibition-image')
  await expect(image).toBeVisible()
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0)

  const layout = await image.evaluate((element: HTMLImageElement) => {
    const box = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    return {
      left: box.left,
      right: box.right,
      top: box.top,
      bottom: box.bottom,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      ratioDifference: Math.abs(box.width / box.height - element.naturalWidth / element.naturalHeight),
      fit: style.objectFit,
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
    }
  })
  expect(layout.left).toBeGreaterThanOrEqual(0)
  expect(layout.right).toBeLessThanOrEqual(layout.viewportWidth)
  expect(layout.top).toBeGreaterThanOrEqual(0)
  expect(layout.bottom).toBeLessThanOrEqual(layout.viewportHeight)
  expect(layout.fit === 'contain' || layout.ratioDifference < 0.01).toBe(true)
  expect(layout.overflow).toBeLessThanOrEqual(0)
  await expect(page.getByTestId('exhibition-position')).toContainText(/1\s*\/\s*7/)
  await expect(page.getByRole('button', { name: 'Index', exact: true })).toBeInViewport()
  await expect(page.getByRole('button', { name: 'Thumbs', exact: true })).toBeInViewport()
})
