import { test, expect } from '@playwright/test'
import { desktopVisualPaths } from '@/lib/site/routes'

function isDesktopProject(projectName: string) {
  return projectName === 'desktop-1280'
}

test.describe('desktop visual regression guard', () => {
  for (const target of desktopVisualPaths) {
    test(`${target.path} matches desktop baseline`, async ({ page }, testInfo) => {
      test.skip(process.platform !== 'darwin', 'baseline is captured on macOS')
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
