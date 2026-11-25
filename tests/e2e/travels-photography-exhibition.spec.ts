import { test, expect, type Page } from '@playwright/test'
import wuhan from '../../content/travel/wuhan/cards.json'
import travels from '../../content/travel/exhibition.json'
import bangkok from '../../content/photography/photos/bangkok.json'

const CAPTION = '[data-testid="travel-caption"] article'

async function worksLandscape(page: Page) {
  await page.goto('/photography')
  return (await page.getByTestId('exhibition-image').boundingBox())!
}

// Landscape rule: rise from the Works frame by exactly the caption's overflow
// past the bottom line B; if that crosses the top line T, sit at T and shrink.
async function expectLandscapePlacement(page: Page, works: Awaited<ReturnType<typeof worksLandscape>>, mobile: boolean) {
  const photo = (await page.getByTestId('exhibition-image').boundingBox())!
  const caption = (await page.locator(CAPTION).boundingBox())!
  const controls = (await page.getByTestId('exhibition-controls').boundingBox())!
  const bottom = mobile
    ? (await page.getByTestId('exhibition-position').boundingBox())!.y - 20
    : await page.getByRole('button', { name: 'Index', exact: true }).evaluate((element: Element) => {
      const range = document.createRange()
      range.selectNodeContents(element)
      return range.getBoundingClientRect().top - 24
    })
  const top = mobile ? controls.y + controls.height + 16 : 40
  expect(caption.y + caption.height).toBeLessThanOrEqual(bottom + 1)
  const rise = Math.max(0, works.y + works.height + 16 + caption.height - bottom)
  if (works.y - rise >= top) {
    expect(photo.width).toBeCloseTo(works.width, 0)
    expect(photo.x).toBeCloseTo(works.x, 0)
    expect(photo.y).toBeCloseTo(works.y - rise, 0)
  } else {
    expect(photo.y).toBeCloseTo(top, 0)
    expect(photo.width).toBeLessThan(works.width)
  }
}

test('legacy travel routes preserve every destination', async ({ request }) => {
  const redirects = new Map([
    ...travels.map(({ slug }) => [`/travel/${slug}`, `/photography#travels/${slug}/1`] as const),
    ...['/travel', '/travel/hangzhou', '/travel/huzhou'].map(path => [path, '/photography#travels'] as const),
    ['/travel/bangkok', `/photography#bangkok/${bangkok[0].id}`] as const,
  ])
  for (const [path, target] of redirects) {
    const response = await request.get(path, { maxRedirects: 0 })
    expect(response.status()).toBe(308)
    expect(response.headers().location).toBe(target)
  }
})

test('directory entry opens over the decoded Wuhan cover, including with a cold cache', async ({ page, isMobile }) => {
  await page.setViewportSize(isMobile ? { width: 375, height: 812 } : { width: 1440, height: 900 })
  const cover = travels[0].photos[0]
  const card = wuhan.spots[0]
  let releaseCover!: () => void
  const gate = new Promise<void>(resolve => { releaseCover = resolve })
  let requested = false
  await page.route(url => decodeURIComponent(url.searchParams.get('url') ?? '') === cover.src, async route => {
    requested = true
    await gate
    await route.continue()
  })
  const index = page.getByRole('dialog', { name: 'Index', exact: true })
  try {
    await page.goto('/travel/hangzhou', { waitUntil: 'domcontentloaded' })
    await expect.poll(() => requested).toBe(true)
    await expect(index).toHaveCount(0)
    await expect(page.locator('main h1')).toContainText('Wuhan')
    await expect(page.getByTestId('exhibition-position')).toHaveText('Wuhan - 1/8')
    await expect(page.getByTestId('exhibition-image')).toHaveAttribute('alt', card.imageAlt)
    await expect(page.locator(CAPTION).locator('p').first()).toHaveText(cover.place!)
  } finally {
    releaseCover()
  }
  await expect(index.getByRole('tab', { name: 'Travels' })).toHaveAttribute('aria-selected', 'true')
  const painted = await page.getByTestId('exhibition-image').evaluate((img: HTMLImageElement) => ({
    loaded: img.complete && img.naturalWidth > 0,
    visible: getComputedStyle(img).visibility === 'visible' && getComputedStyle(img.parentElement!).opacity === '1',
  }))
  expect(painted).toEqual({ loaded: true, visible: true })
  await expect(page.getByTestId('exhibition-cursor')).toHaveText('Wuhan - 1/8')
  await page.keyboard.press('Escape')
  await expect(index).toHaveCount(0)
  await expect(page).toHaveURL(/#travels\/wuhan\/1$/)
})

test('Travels index, all Wuhan frames, Thumbs and frame history', async ({ page, isMobile }, testInfo) => {
  await page.setViewportSize(isMobile ? { width: 390, height: 844 } : { width: 1440, height: 900 })
  const works = await worksLandscape(page)
  await page.goto('/')
  await expect(page.locator('a[href^="/travel"]')).toHaveCount(0)
  await page.getByRole('link', { name: '查看旅行记录' }).click()
  const index = page.getByRole('dialog', { name: 'Index', exact: true })
  await expect(index.getByRole('tab', { name: 'Travels' })).toHaveAttribute('aria-selected', 'true')
  const places = index.getByRole('tabpanel', { name: 'Travels' }).getByRole('button')
  await expect(places).toHaveText(['Wuhan8', 'Nanjing15', 'Japan25', 'Shanghai6', 'Northeast China9', 'Beijing7'])
  await places.first().click()
  await expect(index).toHaveCount(0)
  const stage = page.getByTestId('exhibition-stage')
  const caption = stage.locator(CAPTION)
  const image = page.getByTestId('exhibition-image')
  const controls = page.getByTestId('exhibition-controls')
  const touch = isMobile ? await page.context().newCDPSession(page) : null
  const cards = Object.values(wuhan).flat()
  const visible = travels[0].photos.filter(photo => !photo.hidden)
  for (const [i, frame] of visible.entries()) {
    const card = cards.find(card => card.imageSrc === frame.src)!
    await expect(page.getByTestId('exhibition-position')).toHaveText(`Wuhan - ${i + 1}/8`)
    await expect(image).toHaveAccessibleName(card.imageAlt)
    await expect(caption.locator('h2')).toHaveCount(0)
    await expect(caption.locator('p').first()).toHaveText(frame.place!)
    await expect(caption.locator('p').last()).toHaveText(card.body)
    await expect(image).toHaveCSS('object-fit', 'cover')
    await expect(image).toHaveCSS('object-position', frame.focus ?? '50% 50%')
    const box = (await image.boundingBox())!
    const text = (await caption.boundingBox())!
    const bar = (await controls.boundingBox())!
    expect(text.y - (box.y + box.height)).toBeCloseTo(16, 0)
    if (frame.width >= frame.height) await expectLandscapePlacement(page, works, isMobile)
    else expect(text.width).toBeCloseTo(box.width, 0)
    if (isMobile) expect(bar.y + bar.height).toBeLessThan(box.y)
    else expect(text.y + text.height).toBeLessThanOrEqual(bar.y)
    expect(text.width).toBeLessThanOrEqual(600)
    if (i === 3) await page.screenshot({ path: testInfo.outputPath('wuhan-frame-4.png') })
    if (i === visible.length - 1) break
    if (touch) {
      const y = Math.round(box.y + box.height / 2)
      await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 325, y }] })
      await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 65, y }] })
      await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    } else {
      await page.keyboard.press('ArrowRight')
    }
  }
  await touch?.detach()
  await page.getByRole('button', { name: 'Thumbs', exact: true }).click()
  const thumbs = page.getByRole('dialog', { name: 'Wuhan — Thumbs' })
  await expect(thumbs.locator('img')).toHaveCount(8)
  await expect(thumbs.locator('article')).toHaveCount(0)
  await thumbs.getByRole('button', { name: /^View photograph 3:/ }).click()
  await expect(thumbs).toHaveCount(0)
  await expect(page).toHaveURL(/#travels\/wuhan\/3$/)
  await page.reload()
  await expect(caption.locator('p').last()).toHaveText(cards.find(card => card.imageSrc === visible[2].src)!.body)
  await page.goBack()
  await expect(page.getByTestId('exhibition-position')).toHaveText('Wuhan - 8/8')
  await page.getByRole('button', { name: 'Index', exact: true }).click()
  await places.first().click()
  await expect(page).toHaveURL(/#travels\/wuhan\/1$/)
})

test('Nanjing fits each landscape caption and keeps portrait frames aligned', async ({ page, isMobile }) => {
  await page.setViewportSize(isMobile ? { width: 375, height: 667 } : { width: 1440, height: 900 })
  const works = await worksLandscape(page)
  await page.goto('/photography#travels/nanjing/16')
  await expect(page).toHaveURL(/#travels\/nanjing\/1$/)
  const stage = page.getByTestId('exhibition-stage')
  const photo = page.getByTestId('exhibition-image')
  let portraitCaptionTop: number | undefined
  for (let i = 1; i <= 15; i++) {
    await expect(page.getByTestId('exhibition-position')).toHaveText(`Nanjing - ${i}/15`)
    const box = (await photo.boundingBox())!
    const text = (await stage.locator(CAPTION).boundingBox())!
    const region = (await stage.boundingBox())!
    expect(box.y).toBeGreaterThanOrEqual(region.y - 1)
    expect(text.y + text.height).toBeLessThanOrEqual(region.y + region.height + 1)
    expect(text.x).toBeCloseTo(box.x, 0)
    expect(text.width).toBeGreaterThanOrEqual(box.width - 1)
    expect(text.y - box.y - box.height).toBeCloseTo(16, 0)
    if (box.width >= box.height) {
      await expectLandscapePlacement(page, works, isMobile)
    } else {
      expect(text.width).toBeCloseTo(box.width, 0)
      portraitCaptionTop ??= text.y
      expect(text.y).toBeCloseTo(portraitCaptionTop, 0)
    }
    if (i < 15) await page.mouse.click(region.x + region.width * 0.8, box.y + 32)
  }
  expect(portraitCaptionTop).toBeDefined()
})

test('short phone screens keep the photograph and the whole travel caption visible', async ({ page }) => {
  await page.goto('/photography#travels/nanjing/3')
  await expect(page.getByTestId('exhibition-position')).toHaveText('Nanjing - 3/15')
  for (const viewport of [{ width: 320, height: 568 }, { width: 667, height: 375 }]) {
    await page.setViewportSize(viewport)
    const image = page.getByTestId('exhibition-image')
    const caption = page.locator(CAPTION)
    await expect(image).toBeInViewport({ ratio: 1 })
    await expect(caption).toBeInViewport({ ratio: 1 })
    const photoBox = (await image.boundingBox())!
    const textBox = (await caption.boundingBox())!
    expect(textBox.y - photoBox.y - photoBox.height).toBeCloseTo(16, 0)
    if (viewport.height > viewport.width) {
      // Text and photo share a width whenever both fit between T and B. On the
      // smallest phones no shared width fits Nanjing's longest caption, so the
      // text keeps the whole photo band and the photograph takes what remains.
      expect(textBox.width).toBeGreaterThanOrEqual(photoBox.width - 1)
      expect(textBox.x + textBox.width / 2).toBeCloseTo(photoBox.x + photoBox.width / 2, 0)
    }
  }
})
