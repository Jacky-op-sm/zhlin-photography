import { test, expect } from '@playwright/test'

const pagesUnderTest = [
  { path: '/', name: 'home' },
  { path: '/photography', name: 'photography-index' },
  { path: '/travel', name: 'travel-index' },
  { path: '/hobby', name: 'hobby' },
]

function isDesktopProject(projectName: string) {
  return projectName === 'desktop-1280'
}

test.describe('desktop visual regression guard', () => {
  for (const target of pagesUnderTest) {
    test(`${target.path} matches desktop baseline`, async ({ page }, testInfo) => {
      test.skip(!isDesktopProject(testInfo.project.name), 'desktop-only test')

      await page.goto(target.path)
      await page.waitForLoadState('networkidle')

      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            transition: none !important;
            animation: none !important;
          }
        `,
      })

      await expect(page).toHaveScreenshot(`desktop-${target.name}.png`, {
        fullPage: true,
      })
    })
  }
})
