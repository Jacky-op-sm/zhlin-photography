import { test, expect, type Locator, type Page } from '@playwright/test'

const months = ['三月', '四月', '七月', '十月']
const sources = ['march', 'april', 'july', 'october'].map(month => `/assets/writing/seasons/${month}.webp`)

function stack(page: Page) {
  return page.locator('.writing-image-stack')
}

async function expectPhoto(root: Locator, index: number) {
  const active = root.locator('.writing-stack-slide[data-active="true"]')
  await expect(active).toHaveCount(1)
  await expect(active).toHaveAttribute('data-full-src', sources[index])
  await expect(active.locator('img')).toHaveAttribute('src', sources[index])
  await expect(active.locator('img')).toHaveAttribute('alt', new RegExp(`^${months[index]}，`))
  await expect(active).not.toHaveAttribute('aria-hidden', 'true')
  await expect(root.getByRole('img')).toHaveCount(1)
  for (const inactive of await root.locator('.writing-stack-slide[data-active="false"]').all()) {
    await expect(inactive).toHaveAttribute('aria-hidden', 'true')
    await expect(inactive.locator('a, button, [tabindex="0"]')).toHaveCount(0)
  }
  await expect(root.getByText(new RegExp(`^${index + 1}\\s*/\\s*4$`))).toBeVisible()
  await expect(root.getByText(months[index], { exact: true }).filter({ visible: true })).toBeVisible()
}

async function openSeasons(page: Page) {
  await page.goto('/writing/seasons')
  await expect(stack(page)).toHaveAttribute('data-enhanced', 'true')
  await expectPhoto(stack(page), 0)
}

async function decodePhotographs(root: Locator) {
  await root.locator('img').evaluateAll(async images => {
    await Promise.all(images.map(image => (image as HTMLImageElement).decode()))
  })
}

// Use the unchanged WritingFigure markup as the size reference. Measuring its
// computed layout checks the user's existing large-photo sizing at each width.
async function originalFigureSize(page: Page) {
  return page.locator('.writing-prose').evaluate(async (prose, source) => {
    const figure = document.createElement('figure')
    figure.className = 'writing-figure'
    figure.style.visibility = 'hidden'
    const mat = document.createElement('div')
    mat.className = 'writing-figure-mat'
    const image = document.createElement('img')
    image.src = source
    image.alt = ''
    image.width = 1600
    image.height = 2400
    mat.append(image)
    figure.append(mat)
    prose.append(figure)
    try {
      await image.decode()
      const bounds = image.getBoundingClientRect()
      return { width: bounds.width, height: bounds.height }
    } finally {
      figure.remove()
    }
  }, sources[0])
}

// WebKit does not expose a constructible Touch in every environment. Supply
// the standard event fields directly so the same formal gesture tests run there.
async function swipe(target: Locator, dx: number, dy: number, options: { fingers?: number; cancel?: boolean; followupClick?: boolean } = {}) {
  await target.scrollIntoViewIfNeeded()
  await target.evaluate((node, { dx, dy, fingers, cancel, followupClick }) => {
    const rect = node.getBoundingClientRect()
    const startX = rect.left + rect.width / 2
    const startY = rect.top + rect.height / 2
    const touches = (offsetX: number, offsetY: number) => Array.from({ length: fingers }, (_, identifier) => ({
      identifier,
      target: node,
      clientX: startX + offsetX + identifier * 12,
      clientY: startY + offsetY,
      pageX: startX + offsetX + identifier * 12 + window.scrollX,
      pageY: startY + offsetY + window.scrollY,
    }))
    const dispatch = (type: string, current: ReturnType<typeof touches>, changed: ReturnType<typeof touches>) => {
      const event = new Event(type, { bubbles: true, cancelable: true })
      Object.defineProperties(event, {
        touches: { value: current },
        targetTouches: { value: current },
        changedTouches: { value: changed },
      })
      return node.dispatchEvent(event)
    }
    const start = touches(0, 0)
    const end = touches(dx, dy)
    dispatch('touchstart', start, start)
    dispatch('touchmove', end, end)
    dispatch(cancel ? 'touchcancel' : 'touchend', [], end)
    if (followupClick) node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  }, { dx, dy, fingers: options.fingers ?? 1, cancel: options.cancel ?? false, followupClick: options.followupClick ?? false })
}

test('four original photographs preserve the article order and stop at both ends', async ({ page }) => {
  await openSeasons(page)
  const gallery = stack(page)
  await expect(gallery.locator('.writing-stack-slide')).toHaveCount(4)
  expect(await gallery.locator('.writing-stack-slide').evaluateAll(slides => slides.map(slide => slide.getAttribute('data-full-src'))))
    .toEqual(sources)
  expect(await gallery.locator('img').evaluateAll(images => images.map(image => image.getAttribute('src'))))
    .toEqual(sources)
  const previous = gallery.getByRole('button', { name: '上一张照片', exact: true })
  const next = gallery.getByRole('button', { name: '下一张照片', exact: true })
  await expect(previous).toBeDisabled()
  for (let index = 1; index < months.length; index++) {
    await next.click()
    await expectPhoto(gallery, index)
    await expect(previous).toBeEnabled()
  }
  await expect(next).toBeDisabled()
  for (let index = months.length - 2; index >= 0; index--) {
    await previous.click()
    await expectPhoto(gallery, index)
  }
  await expect(previous).toBeDisabled()
})

test('clicking a photograph neither opens a viewer nor navigates away', async ({ page }) => {
  await openSeasons(page)
  const articleUrl = page.url()
  const gallery = stack(page)
  await expect(gallery.locator('.writing-stack-slide a, .writing-stack-slide button')).toHaveCount(0)
  for (let index = 0; index < months.length; index++) {
    if (index) await gallery.getByRole('button', { name: '下一张照片', exact: true }).click()
    await expectPhoto(gallery, index)
    const image = gallery.locator('.writing-stack-slide[data-active="true"] img')
    await image.click()
    await expect(page).toHaveURL(articleUrl)
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expectPhoto(gallery, index)
  }
})

test('arrow keys are scoped to the stack and focus remains on its visible stage', async ({ page }) => {
  await openSeasons(page)
  await page.getByRole('link', { name: '↓ 文章目录' }).focus()
  await page.keyboard.press('ArrowRight')
  await expectPhoto(stack(page), 0)

  const stage = stack(page).locator('.writing-stack-stage')
  await expect(stage).toHaveAttribute('role', 'group')
  await expect(stage).toHaveAttribute('tabindex', '0')
  await stage.focus()
  await page.keyboard.press('ArrowLeft')
  await expectPhoto(stack(page), 0)
  for (let index = 1; index < months.length; index++) {
    await page.keyboard.press('ArrowRight')
    await expectPhoto(stack(page), index)
    await expect(stage).toBeFocused()
  }
  await page.keyboard.press('ArrowRight')
  await expectPhoto(stack(page), 3)
  await page.keyboard.press('ArrowLeft')
  await expectPhoto(stack(page), 2)
  await expect(stage).toBeFocused()
  expect(await page.evaluate(() => document.activeElement?.closest('[aria-hidden="true"]') === null)).toBe(true)
  await page.keyboard.press('Tab')
  await expect(stage).not.toBeFocused()
  expect(await page.evaluate(() => document.activeElement?.closest('[aria-hidden="true"]') === null)).toBe(true)
})

test('horizontal swipes navigate while vertical, multi-touch, and cancelled gestures do not', async ({ page }) => {
  await openSeasons(page)
  const currentPhoto = () => stack(page).locator('.writing-stack-slide[data-active="true"] img')
  await swipe(currentPhoto(), -100, 5, { followupClick: true })
  await expectPhoto(stack(page), 1)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await swipe(currentPhoto(), -55, 120)
  await expectPhoto(stack(page), 1)
  await swipe(currentPhoto(), -110, 5, { fingers: 2 })
  await expectPhoto(stack(page), 1)
  await swipe(currentPhoto(), -110, 5, { cancel: true })
  await expectPhoto(stack(page), 1)
  await swipe(currentPhoto(), 100, 5)
  await expectPhoto(stack(page), 0)
  await swipe(currentPhoto(), 100, 5)
  await expectPhoto(stack(page), 0)
  await expect(page).toHaveURL(/\/writing\/seasons$/)
})

test('reduced motion permits rapid navigation without an animation lock', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openSeasons(page)
  const next = stack(page).getByRole('button', { name: '下一张照片', exact: true })
  for (let index = 0; index < 3; index++) await next.click()
  await expectPhoto(stack(page), 3)
  await expect(next).toBeDisabled()
  const stage = stack(page).locator('.writing-stack-stage')
  await stage.focus()
  for (let index = 0; index < 3; index++) await page.keyboard.press('ArrowLeft')
  await expectPhoto(stack(page), 0)
  await expect(stage).toBeFocused()
  await expect(stack(page).getByRole('button', { name: '上一张照片', exact: true })).toBeDisabled()
})

test('without JavaScript all four photographs and their captions remain readable', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  try {
    const page = await context.newPage()
    await page.goto('/writing/seasons')
    const gallery = stack(page)
    await expect(gallery.locator('.writing-stack-slide')).toHaveCount(4)
    await expect(gallery.getByRole('img')).toHaveCount(4)
    let precedingBottom = 0
    for (let index = 0; index < months.length; index++) {
      const slide = gallery.locator('.writing-stack-slide').nth(index)
      await slide.locator('img').scrollIntoViewIfNeeded()
      await slide.locator('img').evaluate(async (image: HTMLImageElement) => image.decode())
      await expect(slide.locator('img')).toBeVisible()
      await expect(slide.locator('img')).toHaveAttribute('src', sources[index])
      await expect(slide.getByText(months[index], { exact: true })).toBeVisible()
      const bounds = await slide.evaluate(node => {
        const rect = node.getBoundingClientRect()
        return { y: rect.y + scrollY, height: rect.height }
      })
      expect(bounds.y).toBeGreaterThanOrEqual(precedingBottom)
      expect(bounds.height).toBeGreaterThan(150)
      precedingBottom = bounds.y + bounds.height
    }
    await expect(gallery.getByRole('button', { name: '下一张照片', exact: true })).toBeHidden()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  } finally {
    await context.close()
  }
})

test('the original large-photo size is preserved at 320, 390, and 1440 pixel widths', async ({ page }, testInfo) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 844 })
    await openSeasons(page)
    const gallery = stack(page)
    await decodePhotographs(gallery)
    const originalSize = await originalFigureSize(page)
    const image = gallery.locator('.writing-stack-slide[data-active="true"] img')
    await image.scrollIntoViewIfNeeded()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const bounds = await image.boundingBox()
    expect(bounds!.width).toBeGreaterThan(100)
    expect(bounds!.height).toBeGreaterThan(150)
    expect(bounds!.width / bounds!.height).toBeCloseTo(2 / 3, 2)
    expect(Math.abs(bounds!.width - originalSize.width)).toBeLessThanOrEqual(1)
    expect(Math.abs(bounds!.height - originalSize.height)).toBeLessThanOrEqual(1)
    expect(bounds!.x).toBeGreaterThanOrEqual(-1)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1)
    const pixels = await image.evaluate((img: HTMLImageElement) => ({ width: img.naturalWidth, height: img.naturalHeight }))
    expect(pixels).toEqual({ width: 1600, height: 2400 })
    for (const control of ['上一张照片', '下一张照片']) {
      const buttonBounds = await gallery.getByRole('button', { name: control, exact: true }).boundingBox()
      expect(buttonBounds!.width).toBeGreaterThanOrEqual(44)
      expect(buttonBounds!.height).toBeGreaterThanOrEqual(44)
      expect(buttonBounds!.x).toBeGreaterThanOrEqual(-1)
      expect(buttonBounds!.x + buttonBounds!.width).toBeLessThanOrEqual(width + 1)
    }
    if ((width === 1440 && testInfo.project.name === 'production-desktop')
      || (width === 390 && testInfo.project.name === 'production-mobile')) {
      await gallery.screenshot({ path: testInfo.outputPath(`seasons-stack-${width === 390 ? 'mobile' : 'desktop'}.png`) })
    }
  }
})
