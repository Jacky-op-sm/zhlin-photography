import { test, expect } from '@playwright/test'

function isMobileProject(projectName: string) {
  return projectName.startsWith('mobile-')
}

async function openMobileMenu(page: import('@playwright/test').Page) {
  const toggle = page.getByRole('button', { name: 'Toggle menu' })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await toggle.click({ force: true })
    if ((await toggle.getAttribute('aria-expanded')) === 'true') {
      return
    }
    await page.waitForTimeout(180)
  }
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
}

test.describe('mobile navigation behavior', () => {
  test('parent pages are directly reachable from mobile menu', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/travel')
    await openMobileMenu(page)

    await page.getByRole('link', { name: 'Photography' }).first().click()
    await expect(page).toHaveURL(/\/photography$/)

    await openMobileMenu(page)
    await page.getByRole('link', { name: 'Travel' }).first().click()
    await expect(page).toHaveURL(/\/travel$/)
  })

  test('submenu items are reachable after expansion', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/travel')
    await openMobileMenu(page)

    await page.getByRole('button', { name: 'Expand Photography submenu' }).click()
    await page.getByRole('link', { name: '街头摄影' }).click()
    await expect(page).toHaveURL(/\/photography\/street$/)

    await openMobileMenu(page)
    await page.getByRole('button', { name: 'Expand Travel submenu' }).click()
    await page.getByRole('link', { name: '上海' }).click()
    await expect(page).toHaveURL(/\/travel\/shanghai$/)
  })
})
