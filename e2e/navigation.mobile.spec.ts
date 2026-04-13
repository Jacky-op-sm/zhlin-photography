import { test, expect } from '@playwright/test'

function isMobileProject(projectName: string) {
  return projectName.startsWith('mobile-')
}

async function openMobileMenu(page: import('@playwright/test').Page) {
  const toggle = page.getByRole('button', { name: 'Toggle menu' })
  await expect(toggle).toBeVisible()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await toggle.evaluate((el) => (el as HTMLButtonElement).click())
    if ((await toggle.getAttribute('aria-expanded')) === 'true') {
      break
    }
    await page.waitForTimeout(180)
  }
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(mobilePanel(page)).toHaveAttribute('data-state', 'open')
}

async function activate(locator: import('@playwright/test').Locator) {
  await locator.evaluate((el) => (el as HTMLElement).click())
}

function mobilePanel(page: import('@playwright/test').Page) {
  return page.locator('.site-mobile-panel')
}

test.describe('mobile navigation behavior', () => {
  test('parent links are directly reachable from first-level mobile menu', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/')
    await openMobileMenu(page)

    await activate(mobilePanel(page).getByRole('link', { name: 'Photography' }).first())
    await expect(page).toHaveURL(/\/photography$/)

    await openMobileMenu(page)
    await activate(mobilePanel(page).getByRole('link', { name: 'Travel' }).first())
    await expect(page).toHaveURL(/\/travel$/)
  })

  test('submenu entry, back, and close work in second-level mobile menu', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/')
    await openMobileMenu(page)

    await activate(mobilePanel(page).getByRole('button', { name: 'Expand Travel submenu' }))
    await expect(mobilePanel(page).getByRole('button', { name: 'Back to main menu' })).toBeVisible()
    await expect(mobilePanel(page).getByRole('link', { name: 'Explore Travel' })).toBeVisible()
    await expect(mobilePanel(page).getByRole('link', { name: '南京' })).toBeVisible()

    await activate(mobilePanel(page).getByRole('button', { name: 'Back to main menu' }))
    await expect(mobilePanel(page).getByRole('button', { name: 'Expand Travel submenu' })).toBeVisible()

    await activate(mobilePanel(page).getByRole('button', { name: 'Expand Photography submenu' }))
    await activate(mobilePanel(page).getByRole('link', { name: '街头摄影' }))
    await expect(page).toHaveURL(/\/photography\/street$/)

    await openMobileMenu(page)
    await activate(mobilePanel(page).getByRole('button', { name: 'Close menu' }))
    await expect(mobilePanel(page)).toHaveCount(0)

    await openMobileMenu(page)
    await activate(mobilePanel(page).getByRole('button', { name: 'Expand Travel submenu' }))
    await activate(mobilePanel(page).getByRole('link', { name: '上海' }))
    await expect(page).toHaveURL(/\/travel\/shanghai$/)
  })
})
