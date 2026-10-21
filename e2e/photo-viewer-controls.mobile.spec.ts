import { test, expect } from '@playwright/test'

test('exhibition controls keep their position when the photograph changes', async ({ page }) => {
  await page.goto('/photography/pets')
  const image = page.getByTestId('exhibition-image')
  const controls = page.getByTestId('exhibition-controls')
  await expect(image).toBeVisible()
  const imageBefore = await image.boundingBox()
  const before = await controls.boundingBox()
  expect(before).not.toBeNull()
  expect(imageBefore).not.toBeNull()
  expect(before!.y + before!.height).toBeLessThanOrEqual(imageBefore!.y + 1)
  await expect(page.getByTestId('exhibition-position')).toBeVisible()
  await expect(page.getByTestId('exhibition-cursor')).not.toBeVisible()

  await page.keyboard.press('ArrowRight')
  await expect(page.getByTestId('exhibition-position')).toContainText(/2\s*\/\s*15/)
  const after = await controls.boundingBox()
  expect(after).not.toBeNull()
  expect(Math.abs(after!.y - before!.y)).toBeLessThanOrEqual(2)
})
