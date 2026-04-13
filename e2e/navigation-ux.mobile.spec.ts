import { test, expect } from '@playwright/test'

function isMobileProject(projectName: string) {
  return projectName.startsWith('mobile-')
}

async function openMobileMenu(page: import('@playwright/test').Page) {
  const toggle = page.getByRole('button', { name: 'Toggle menu' })
  await toggle.click({ force: true })
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
}

test.describe('mobile navigation panel ux', () => {
  test('menu overlays to viewport bottom and closes with closing state', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/travel/nanjing')
    await openMobileMenu(page)
    await expect(page.locator('.site-mobile-panel')).toHaveAttribute('data-state', 'open')

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
    expect(Number.parseFloat(metrics!.top)).toBeGreaterThan(40)

    const closeButton = page.getByRole('button', { name: 'Close menu' })
    const borderBefore = await closeButton.evaluate((el) => window.getComputedStyle(el).borderTopWidth)
    expect(borderBefore).toBe('0px')

    await closeButton.click()

    const closingState = await page.locator('.site-mobile-panel').getAttribute('data-state')
    expect(closingState).toBe('closing')

    await page.waitForTimeout(360)
    await expect(page.locator('.site-mobile-panel')).toHaveCount(0)
  })

  test('submenu screen has borderless back and close actions', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/travel')
    await openMobileMenu(page)

    await page.getByRole('button', { name: 'Expand Travel submenu' }).click()

    const backButton = page.getByRole('button', { name: 'Back to main menu' })
    const closeButton = page.getByRole('button', { name: 'Close menu' })

    const [backBorder, closeBorder] = await Promise.all([
      backButton.evaluate((el) => window.getComputedStyle(el).borderTopWidth),
      closeButton.evaluate((el) => window.getComputedStyle(el).borderTopWidth),
    ])

    expect(backBorder).toBe('0px')
    expect(closeBorder).toBe('0px')
  })
})
