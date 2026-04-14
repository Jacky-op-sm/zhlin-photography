import { test, expect } from '@playwright/test'

function isMobileProject(projectName: string) {
  return projectName.startsWith('mobile-')
}

async function swipeLeftOnSlider(
  page: import('@playwright/test').Page,
  sliderIndex: number,
) {
  await page.locator('[data-travel-slider-viewport]').nth(sliderIndex).evaluate((element) => {
    const target = element as HTMLElement
    const rect = target.getBoundingClientRect()
    const startX = rect.left + rect.width * 0.72
    const endX = rect.left + rect.width * 0.24
    const y = rect.top + rect.height * 0.5

    const supportsTouch = typeof window.Touch === 'function'
    if (!supportsTouch) return

    const mkTouch = (x: number) =>
      new Touch({
        identifier: 1,
        target,
        clientX: x,
        clientY: y,
        pageX: x,
        pageY: y,
        screenX: x,
        screenY: y,
      })

    target.dispatchEvent(
      new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [mkTouch(startX)],
        targetTouches: [mkTouch(startX)],
        changedTouches: [mkTouch(startX)],
      }),
    )

    target.dispatchEvent(
      new TouchEvent('touchmove', {
        bubbles: true,
        cancelable: true,
        touches: [mkTouch(endX)],
        targetTouches: [mkTouch(endX)],
        changedTouches: [mkTouch(endX)],
      }),
    )

    target.dispatchEvent(
      new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        touches: [],
        targetTouches: [],
        changedTouches: [mkTouch(endX)],
      }),
    )
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

  test('spot and food sliders respond to left swipe by moving cards', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/travel/nanjing')
    await page.waitForLoadState('networkidle')

    const spotFirstCard = page.getByRole('button', { name: 'Open card 1', exact: true })
    await expect(spotFirstCard).toBeVisible()
    const spotBefore = await spotFirstCard.boundingBox()
    expect(spotBefore).not.toBeNull()

    await swipeLeftOnSlider(page, 0)
    await page.waitForTimeout(320)

    const spotAfter = await spotFirstCard.boundingBox()
    expect(spotAfter).not.toBeNull()
    expect((spotAfter?.x ?? 0) - (spotBefore?.x ?? 0)).toBeLessThan(-220)

    const foodTitle = page.locator('h2').filter({ hasText: /^美食$/ })
    await foodTitle.scrollIntoViewIfNeeded()
    const foodFirstCard = page.getByRole('button', { name: 'Open food card 1', exact: true })
    await expect(foodFirstCard).toBeVisible()
    const foodBefore = await foodFirstCard.boundingBox()
    expect(foodBefore).not.toBeNull()

    await swipeLeftOnSlider(page, 1)
    await page.waitForTimeout(320)

    const foodAfter = await foodFirstCard.boundingBox()
    expect(foodAfter).not.toBeNull()
    expect((foodAfter?.x ?? 0) - (foodBefore?.x ?? 0)).toBeLessThan(-220)
  })
})
