import { test, expect } from '@playwright/test'

function isMobileProject(projectName: string) {
  return projectName.includes('mobile')
}

async function openMobileMenu(page: import('@playwright/test').Page) {
  const toggle = page.locator('.site-mobile-toggle')
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
  await expect(mobilePanel(page)).toBeVisible()
}

function mobilePanel(page: import('@playwright/test').Page) {
  return page.locator('.site-mobile-panel')
}

function mobileParentLink(page: import('@playwright/test').Page, label: string) {
  return mobilePanel(page).locator('.site-nav-parent-link', { hasText: label }).first()
}

test.describe('mobile navigation behavior', () => {
  test('Home remains reachable and hidden items stay absent', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/')
    await expect(page.locator('a[href^="/hobby"]')).toHaveCount(0)
    await openMobileMenu(page)

    await mobilePanel(page).getByRole('link', { name: 'Home' }).click()
    await expect(page).toHaveURL(/\/$/)

    await openMobileMenu(page)
    await expect(mobilePanel(page).getByRole('link', { name: 'Hobby', exact: true })).toHaveCount(0)
    await expect(mobilePanel(page).getByRole('link', { name: 'Contact' })).toHaveCount(0)
    await expect(mobilePanel(page).getByRole('link', { name: 'Photography', exact: true })).toHaveAttribute('href', '/photography')
    await expect(mobilePanel(page).getByRole('button', { name: '展开 Photography 子菜单' })).toHaveCount(0)
    await mobilePanel(page).getByRole('button', { name: '关闭菜单', exact: true }).click()
    const brand = page.getByRole('link', { name: '打开摄影展览', exact: true })
    await expect(brand).toHaveAttribute('href', '/photography')
    await brand.click()
    await expect(page).toHaveURL(/\/photography(?:#bangkok\/[^/]+)?$/)
    await expect(page.getByTestId('exhibition-position')).toContainText('Bangkok')
    await expect(page.getByTestId('exhibition-image')).toBeVisible()
  })

  test('submenu entry, back, and close work in second-level mobile menu', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/')
    await openMobileMenu(page)

    await mobileParentLink(page, 'Travel').click()
    await expect(mobilePanel(page).getByRole('button', { name: '返回主菜单' })).toBeVisible()
    await expect(mobilePanel(page).getByRole('link', { name: '探索全部' })).toBeVisible()
    await expect(mobilePanel(page).getByRole('link', { name: '南京' })).toBeVisible()

    await mobilePanel(page).getByRole('button', { name: '关闭菜单' }).click()
    await expect(mobilePanel(page)).toHaveCount(0)

    await openMobileMenu(page)
    await mobileParentLink(page, 'Travel').click()
    await expect(mobilePanel(page).getByRole('button', { name: '返回主菜单' })).toBeVisible()

    await mobilePanel(page).getByRole('button', { name: '返回主菜单' }).click()
    await expect(mobilePanel(page).getByRole('button', { name: '展开 Travel 子菜单' })).toBeVisible()

    await mobilePanel(page).getByRole('link', { name: 'Photography', exact: true }).click()
    await expect(page).toHaveURL(/\/photography(?:#bangkok\/[^/]+)?$/)
    await expect(page.getByTestId('exhibition-position')).toContainText('Bangkok')
    await expect(page.getByTestId('exhibition-image')).toBeVisible()
    await expect(mobilePanel(page)).toHaveCount(0)
    await expect(page.locator('.site-header')).toHaveCount(0)
    await page.getByRole('button', { name: 'Index', exact: true }).click()
    await page.getByRole('dialog', { name: 'Index', exact: true }).getByRole('tab', { name: 'Info', exact: true }).click()
    await page.getByRole('dialog', { name: 'Index', exact: true }).getByRole('link', { name: 'Zhlin home', exact: true }).click()
    await expect(page.locator('.site-header')).toBeVisible()

    await openMobileMenu(page)
    await mobileParentLink(page, 'Travel').click()
    await mobilePanel(page).getByRole('link', { name: '探索全部' }).click()
    await expect(page).toHaveURL(/\/travel$/)

    await openMobileMenu(page)
    await mobileParentLink(page, 'Travel').click()
    await mobilePanel(page).getByRole('link', { name: '上海' }).click()
    await expect(page).toHaveURL(/\/travel\/shanghai$/)
  })
})
