import { test, expect } from '@playwright/test'

function isMobileProject(projectName: string) {
  return projectName.startsWith('mobile-')
}

async function scrollSliderForward(
  page: import('@playwright/test').Page,
  sliderIndex: number,
) {
  await page.locator('[data-travel-slider-viewport]').nth(sliderIndex).evaluate((element) => {
    const target = element as HTMLElement
    target.scrollBy({ left: target.clientWidth * 0.8, behavior: 'auto' })
  })
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

    await page.getByRole('button', { name: '下一张卡片' }).first().click()
    await page.waitForTimeout(550)

    const after = await firstCard.boundingBox()
    expect(after).not.toBeNull()

    const deltaX = (after?.x ?? 0) - (before?.x ?? 0)
    expect(deltaX).toBeLessThan(-160)

    const overflow = await page.evaluate(() => {
      const viewportWidth = window.innerWidth
      const rootWidth = document.documentElement.scrollWidth
      const bodyWidth = document.body.scrollWidth
      return Math.max(rootWidth, bodyWidth) - viewportWidth
    })

    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('spot and food sliders respond to native horizontal scrolling', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/travel/nanjing')
    await page.waitForLoadState('networkidle')

    const spotFirstCard = page.getByRole('button', { name: 'Open card 1', exact: true })
    await expect(spotFirstCard).toBeVisible()
    const spotBefore = await spotFirstCard.boundingBox()
    const spotScrollBefore = await page.evaluate(() => window.scrollY)
    expect(spotBefore).not.toBeNull()

    await scrollSliderForward(page, 0)
    await page.waitForTimeout(320)

    const spotAfter = await spotFirstCard.boundingBox()
    const spotScrollAfter = await page.evaluate(() => window.scrollY)
    expect(spotAfter).not.toBeNull()
    expect((spotAfter?.x ?? 0) - (spotBefore?.x ?? 0)).toBeLessThan(-220)
    expect(Math.abs(spotScrollAfter - spotScrollBefore)).toBeLessThanOrEqual(6)

    const foodTitle = page.locator('h2').filter({ hasText: /^美食$/ })
    await foodTitle.scrollIntoViewIfNeeded()
    const foodFirstCard = page.getByRole('button', { name: 'Open food card 1', exact: true })
    await expect(foodFirstCard).toBeVisible()
    const foodBefore = await foodFirstCard.boundingBox()
    const foodScrollBefore = await page.evaluate(() => window.scrollY)
    expect(foodBefore).not.toBeNull()

    await scrollSliderForward(page, 1)
    await page.waitForTimeout(320)

    const foodAfter = await foodFirstCard.boundingBox()
    const foodScrollAfter = await page.evaluate(() => window.scrollY)
    expect(foodAfter).not.toBeNull()
    expect((foodAfter?.x ?? 0) - (foodBefore?.x ?? 0)).toBeLessThan(-220)
    expect(Math.abs(foodScrollAfter - foodScrollBefore)).toBeLessThanOrEqual(6)
  })
})
