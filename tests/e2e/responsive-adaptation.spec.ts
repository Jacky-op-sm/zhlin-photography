import { test, expect } from '@playwright/test'

function isMobileProject(projectName: string) {
  return projectName.startsWith('mobile-')
}

function isIPadProject(projectName: string) {
  return projectName.startsWith('ipad-')
}

test.describe('responsive adaptation regressions', () => {
  test('home marquee keeps full words in mobile viewport without overflow', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'mobile-only test')

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const metrics = await page.evaluate(() => {
      const marquees = Array.from(document.querySelectorAll('.home-photographer-marquee')) as HTMLElement[]
      const viewportWidth = window.innerWidth
      return {
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - viewportWidth,
        spans: marquees.map((marquee) => {
          const firstSpan = marquee.querySelector('span') as HTMLElement | null
          const rect = firstSpan?.getBoundingClientRect()
          return {
            text: firstSpan?.textContent?.trim() ?? '',
            width: rect?.width ?? 0,
          }
        }),
      }
    })

    expect(metrics.overflow).toBeLessThanOrEqual(0)
    expect(metrics.spans.map((span) => span.text)).toEqual(['PHOTOGRAPHER', 'TRAVELLER'])
    for (const span of metrics.spans) {
      expect(span.text.length).toBeGreaterThan(0)
      expect(span.width).toBeLessThanOrEqual(390)
    }
  })

  test('photography exhibition keeps the cropped frame inside the viewport', async ({ page }, testInfo) => {
    test.skip(!(isMobileProject(testInfo.project.name) || isIPadProject(testInfo.project.name)), 'mobile/ipad test')

    await page.goto('/photography/street')
    const image = page.getByTestId('exhibition-image')
    await expect(image).toBeVisible()
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0)

    const placement = await image.evaluate((element: HTMLImageElement) => {
      const box = element.getBoundingClientRect()
      return {
        left: box.left,
        right: box.right,
        top: box.top,
        bottom: box.bottom,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        fit: getComputedStyle(element).objectFit,
        ratioDifference: Math.abs(box.width / box.height - (element.naturalWidth >= element.naturalHeight ? 1.25 : 0.8)),
      }
    })
    expect(placement.left).toBeGreaterThanOrEqual(0)
    expect(placement.right).toBeLessThanOrEqual(placement.viewportWidth)
    expect(placement.top).toBeGreaterThanOrEqual(0)
    expect(placement.bottom).toBeLessThanOrEqual(placement.viewportHeight)
    expect(placement.fit).toBe('cover')
    expect(placement.ratioDifference).toBeLessThan(0.01)
    await expect(page.getByRole('button', { name: 'Index', exact: true })).toBeInViewport()
    await expect(page.getByRole('button', { name: 'Thumbs', exact: true })).toBeInViewport()
  })

  test('iPad portrait home hero stacks and three-card sections stay together', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'ipad-portrait', 'ipad portrait-only test')

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const layout = await page.evaluate(() => {
      const copy = document.querySelector('.home-hero-copy') as HTMLElement | null
      const panel = document.querySelector('.home-hero-panel') as HTMLElement | null
      const grids = Array.from(document.querySelectorAll('.home-photographer-grid')) as HTMLElement[]
      const gridData = grids.map((grid) => {
        const cards = Array.from(grid.querySelectorAll('.home-photographer-card')) as HTMLElement[]
        const cardTops = cards.map((card) => Math.round(card.getBoundingClientRect().top / 8) * 8)
        const uniqueRows = Array.from(new Set(cardTops))
        const rect = grid.getBoundingClientRect()
        return {
          rowCount: uniqueRows.length,
          left: rect.left,
          rightMargin: window.innerWidth - rect.right,
        }
      })

      if (!copy || !panel) return null
      return {
        panelBelowCopy: panel.getBoundingClientRect().top > copy.getBoundingClientRect().bottom,
        gridData,
      }
    })

    expect(layout).not.toBeNull()
    expect(layout!.panelBelowCopy).toBe(true)
    expect(layout!.gridData).toHaveLength(2)
    for (const grid of layout!.gridData) {
      expect(grid.rowCount).toBe(1)
      expect(grid.left).toBeGreaterThanOrEqual(20)
      expect(grid.rightMargin).toBeGreaterThanOrEqual(20)
    }
  })

  test('desktop navigation on iPad closes from outside tap without activating page content', async ({ page }, testInfo) => {
    test.skip(!isIPadProject(testInfo.project.name), 'ipad-only test')

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const desktopNav = page.locator('.site-nav-desktop')
    test.skip(!(await desktopNav.isVisible()), 'desktop navigation is not visible at this iPad width')

    await desktopNav.getByRole('button', { name: '展开 Travel 子菜单' }).tap()
    await expect(page.locator('.site-nav-dropdown-shell')).toHaveAttribute('data-open', 'true')

    const urlBefore = page.url()
    const viewport = page.viewportSize()
    expect(viewport).not.toBeNull()
    await page.touchscreen.tap(8, (viewport?.height ?? 768) - 8)
    await expect(page.locator('.site-nav-dropdown-shell')).toHaveAttribute('data-open', 'false')
    expect(page.url()).toBe(urlBefore)
  })

  test('iPad exhibition controls stay outside image and keep stable Y while switching', async ({ page }, testInfo) => {
    test.skip(!isIPadProject(testInfo.project.name), 'ipad-only test')

    await page.goto('/photography/pets')
    const image = page.getByTestId('exhibition-image')
    const controls = page.getByTestId('exhibition-controls')
    await expect(image).toBeVisible()
    const imageBefore = await image.boundingBox()
    const before = await controls.boundingBox()
    expect(before).not.toBeNull()
    expect(imageBefore).not.toBeNull()
    expect(before!.y + before!.height <= imageBefore!.y + 1 || before!.y >= imageBefore!.y + imageBefore!.height - 1).toBe(true)

    await page.keyboard.press('ArrowRight')
    await expect(page.getByTestId('exhibition-position')).toContainText(/2\s*\/\s*15/)
    const after = await controls.boundingBox()
    expect(after).not.toBeNull()
    expect(Math.abs(after!.y - before!.y)).toBeLessThanOrEqual(2)
  })
})
