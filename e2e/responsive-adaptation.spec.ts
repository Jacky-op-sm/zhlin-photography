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
    expect(metrics.spans.length).toBeGreaterThanOrEqual(3)
    for (const span of metrics.spans) {
      expect(span.text.length).toBeGreaterThan(0)
      expect(span.width).toBeLessThanOrEqual(390)
    }
  })

  test('photography masonry starts both first-row columns at the same top', async ({ page }, testInfo) => {
    test.skip(!(isMobileProject(testInfo.project.name) || isIPadProject(testInfo.project.name)), 'mobile/ipad test')

    await page.goto('/photography/street')
    await page.waitForLoadState('networkidle')

    const alignment = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.photo-gallery-item')) as HTMLElement[]
      const boxes = items.map((item) => item.getBoundingClientRect()).filter((box) => box.width > 0)
      const columns = new Map<number, number>()
      for (const box of boxes) {
        const columnX = Math.round(box.left / 8) * 8
        const currentTop = columns.get(columnX)
        if (currentTop === undefined || box.top < currentTop) {
          columns.set(columnX, box.top)
        }
      }
      const columnTops = Array.from(columns.values()).slice(0, 3)
      return {
        columnCount: columnTops.length,
        topDelta: Math.max(...columnTops) - Math.min(...columnTops),
      }
    })

    expect(alignment.columnCount).toBeGreaterThanOrEqual(2)
    expect(alignment.topDelta).toBeLessThanOrEqual(2)
  })

  test('travel spot and food sliders align their first card with section titles on iPad', async ({ page }, testInfo) => {
    test.skip(!isIPadProject(testInfo.project.name), 'ipad-only test')

    await page.goto('/travel/nanjing')
    await page.waitForLoadState('networkidle')

    const spotTitle = page.locator('h2').filter({ hasText: /^景点$/ })
    const spotCard = page.getByRole('button', { name: 'Open card 1', exact: true })
    await expect(spotTitle).toBeVisible()
    await expect(spotCard).toBeVisible()

    const spotDelta = await spotTitle.evaluate((title) => {
      const card = document.querySelector('button[aria-label="Open card 1"]') as HTMLElement | null
      if (!card) return Number.POSITIVE_INFINITY
      return Math.abs(card.getBoundingClientRect().left - title.getBoundingClientRect().left)
    })
    expect(spotDelta).toBeLessThanOrEqual(8)

    const foodTitle = page.locator('h2').filter({ hasText: /^美食$/ })
    await foodTitle.scrollIntoViewIfNeeded()
    const foodCard = page.getByRole('button', { name: 'Open food card 1', exact: true })
    await expect(foodTitle).toBeVisible()
    await expect(foodCard).toBeVisible()

    const foodDelta = await foodTitle.evaluate((title) => {
      const card = document.querySelector('button[aria-label="Open food card 1"]') as HTMLElement | null
      if (!card) return Number.POSITIVE_INFINITY
      return Math.abs(card.getBoundingClientRect().left - title.getBoundingClientRect().left)
    })
    expect(foodDelta).toBeLessThanOrEqual(8)
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
    expect(layout!.gridData.length).toBeGreaterThanOrEqual(3)
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

    await desktopNav.locator('.site-nav-link', { hasText: 'Travel' }).tap()
    await expect(page.locator('.site-nav-dropdown-shell')).toHaveAttribute('data-open', 'true')

    const urlBefore = page.url()
    await page.getByRole('button', { name: 'Close navigation menu' }).click()
    await expect(page.locator('.site-nav-dropdown-shell')).toHaveAttribute('data-open', 'false')
    expect(page.url()).toBe(urlBefore)
  })

  test('iPad portrait travel expand keeps portrait image within readable height', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'ipad-portrait', 'ipad portrait-only test')

    await page.goto('/travel/nanjing')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Open card 1', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Close detail' })).toBeVisible()

    const imageRatio = await page.evaluate(() => {
      const overlay = document.querySelector('div.fixed.inset-0') as HTMLElement | null
      const image = overlay?.querySelector('img') as HTMLImageElement | null
      if (!overlay || !image) return null
      const imageRect = image.getBoundingClientRect()
      return imageRect.height / window.innerHeight
    })

    expect(imageRatio).not.toBeNull()
    expect(imageRatio!).toBeLessThanOrEqual(0.68)
  })

  test('iPad photo viewer controls avoid center overlap on landscape image', async ({ page }, testInfo) => {
    test.skip(!isIPadProject(testInfo.project.name), 'ipad-only test')

    await page.goto('/photography/pets')
    await page.waitForLoadState('networkidle')

    await page.locator('.photo-gallery-item').nth(1).click()
    await expect(page.locator('.photo-viewer-image')).toBeVisible()

    const overlap = await page.evaluate(() => {
      const viewer = document.querySelector('.photo-viewer') as HTMLElement | null
      if (!viewer) return null
      const image = viewer.querySelector('.photo-viewer-image') as HTMLElement | null
      const prev = viewer.querySelector('.photo-viewer-nav-prev') as HTMLElement | null
      const next = viewer.querySelector('.photo-viewer-nav-next') as HTMLElement | null
      if (!image || !prev || !next) return null

      const imageRect = image.getBoundingClientRect()
      const prevRect = prev.getBoundingClientRect()
      const nextRect = next.getBoundingClientRect()
      const centerLeft = imageRect.left + imageRect.width * 0.2
      const centerRight = imageRect.right - imageRect.width * 0.2

      return {
        prevRight: prevRect.right,
        nextLeft: nextRect.left,
        centerLeft,
        centerRight,
      }
    })

    expect(overlap).not.toBeNull()
    expect(overlap!.prevRight).toBeLessThanOrEqual(overlap!.centerLeft)
    expect(overlap!.nextLeft).toBeGreaterThanOrEqual(overlap!.centerRight)
  })
})
