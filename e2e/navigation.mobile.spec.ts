import { test, expect } from '@playwright/test'

function isMobileProject(projectName: string) {
  return projectName.startsWith('mobile-')
}

async function openMobileMenu(page: import('@playwright/test').Page) {
  const toggle = page.getByRole('button', { name: 'Toggle menu' })
  await expect(toggle).toBeVisible()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await toggle.click()
    if ((await toggle.getAttribute('aria-expanded')) === 'true') {
      break
    }
    await page.waitForTimeout(180)
  }
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(mobilePanel(page)).toHaveAttribute('data-state', 'open')
}

function mobilePanel(page: import('@playwright/test').Page) {
  return page.locator('.site-mobile-panel')
}

function mobileParentLink(page: import('@playwright/test').Page, label: string) {
  return mobilePanel(page).locator('.site-nav-parent-link', { hasText: label }).first()
}

test.describe('mobile navigation behavior', () => {
  test('parent links are directly reachable from first-level mobile menu', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/')
    await openMobileMenu(page)

    await mobilePanel(page).getByRole('link', { name: 'Home' }).click()
    await expect(page).toHaveURL(/\/$/)

    await openMobileMenu(page)
    await mobilePanel(page).getByRole('link', { name: 'Hobby' }).click()
    await expect(page).toHaveURL(/\/hobby$/)

    await openMobileMenu(page)
    await mobilePanel(page).getByRole('link', { name: 'Contact' }).click()
    await expect(page).toHaveURL(/\/contact$/)
  })

  test('submenu entry, back, and close work in second-level mobile menu', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/')
    await openMobileMenu(page)

    await mobileParentLink(page, 'Travel').click()
    await expect(mobilePanel(page).getByRole('button', { name: 'Back to main menu' })).toBeVisible()
    await expect(mobilePanel(page).getByRole('link', { name: 'Explore Travel' })).toBeVisible()
    await expect(mobilePanel(page).getByRole('link', { name: '南京' })).toBeVisible()

    await mobilePanel(page).getByRole('button', { name: 'Back to main menu' }).click()
    await expect(mobilePanel(page).getByRole('button', { name: 'Expand Travel submenu' })).toBeVisible()

    await mobilePanel(page).getByRole('button', { name: 'Expand Photography submenu' }).click()
    await mobilePanel(page).getByRole('link', { name: '街头摄影' }).click()
    await expect(page).toHaveURL(/\/photography\/street$/)

    await openMobileMenu(page)
    await mobilePanel(page).getByRole('button', { name: 'Close menu' }).click()
    await expect(mobilePanel(page)).toHaveCount(0)

    await openMobileMenu(page)
    await mobileParentLink(page, 'Travel').click()
    await mobilePanel(page).getByRole('link', { name: 'Explore Travel' }).click()
    await expect(page).toHaveURL(/\/travel$/)

    await openMobileMenu(page)
    await mobileParentLink(page, 'Travel').click()
    await mobilePanel(page).getByRole('link', { name: '上海' }).click()
    await expect(page).toHaveURL(/\/travel\/shanghai$/)
  })
})
