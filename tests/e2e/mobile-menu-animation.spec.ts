import { test, expect } from '@playwright/test'

function isMobileProject(projectName: string) {
  return projectName.startsWith('mobile-')
}

async function openMobileMenu(page: import('@playwright/test').Page) {
  const toggle = page.locator('.site-mobile-toggle')
  await expect(toggle).toBeVisible()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(panel(page)).toBeVisible()
}

function panel(page: import('@playwright/test').Page) {
  return page.locator('.site-mobile-panel')
}

test.describe('mobile menu animation', () => {
  test('opening menu expands from header and reaches viewport bottom', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/')
    await openMobileMenu(page)
    await expect(panel(page)).toBeVisible()

    const metrics = await page.evaluate(() => {
      const panel = document.querySelector('.site-mobile-panel') as HTMLElement | null
      if (!panel) return null
      const styles = window.getComputedStyle(panel)
      return {
        position: styles.position,
        top: styles.top,
        bottom: styles.bottom,
      }
    })

    expect(metrics).not.toBeNull()
    expect(metrics!.position).toBe('fixed')
    expect(metrics!.bottom).toBe('0px')
    expect(Math.abs(Number.parseFloat(metrics!.top))).toBeLessThanOrEqual(1)
  })

  test('closing menu unmounts promptly and restores the trigger', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/')
    await openMobileMenu(page)

    const closeButton = page.getByRole('button', { name: '关闭菜单' })
    await closeButton.click()
    await expect(panel(page)).toHaveCount(0)
    await expect(page.locator('.site-mobile-toggle')).toBeFocused()
  })

  test('menu can still open while scrolled and page can scroll again after close', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/travel/nanjing')
    await page.evaluate(() => window.scrollTo(0, Math.max(600, document.body.scrollHeight * 0.4)))
    await page.waitForTimeout(100)

    await openMobileMenu(page)
    await expect(panel(page)).toBeVisible()

    const closeButton = page.getByRole('button', { name: '关闭菜单' })
    await closeButton.click()
    await expect(panel(page)).toHaveCount(0)

    const bodyOverflow = await page.evaluate(() => document.body.style.overflow)
    expect(bodyOverflow).toBe('')

    const before = await page.evaluate(() => window.scrollY)
    await page.evaluate(() => window.scrollBy(0, 500))
    const after = await page.evaluate(() => window.scrollY)
    expect(after).toBeGreaterThanOrEqual(before)
  })
})
