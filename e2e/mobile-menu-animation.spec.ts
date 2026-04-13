import { test, expect } from '@playwright/test'

function isMobileProject(projectName: string) {
  return projectName.startsWith('mobile-')
}

async function openMobileMenu(page: import('@playwright/test').Page) {
  const toggle = page.getByRole('button', { name: 'Toggle menu' })
  await expect(toggle).toBeVisible()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.evaluate((el) => (el as HTMLButtonElement).click())
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(panel(page)).toHaveAttribute('data-state', 'open')
}

function panel(page: import('@playwright/test').Page) {
  return page.locator('.site-mobile-panel')
}

test.describe('mobile menu animation', () => {
  test('opening menu expands from header and reaches viewport bottom', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/')
    await openMobileMenu(page)
    await expect(panel(page)).toHaveAttribute('data-state', 'open')

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
  })

  test('closing menu keeps a closing phase before unmounting', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/')
    await openMobileMenu(page)

    const closeButton = page.getByRole('button', { name: 'Close menu' })
    await closeButton.evaluate((el) => (el as HTMLButtonElement).click())
    await expect(panel(page)).toHaveAttribute('data-state', 'closing')

    await page.waitForTimeout(360)
    await expect(panel(page)).toHaveCount(0)
  })
})
