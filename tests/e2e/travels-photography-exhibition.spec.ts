import { test, expect } from '@playwright/test'
import wuhan from '../../content/travel/wuhan/cards.json'
import travels from '../../content/travel/exhibition.json'
import bangkok from '../../content/photography/exhibitions/bangkok.json'

test('legacy travel routes preserve every destination', async ({ request }) => {
  const redirects = new Map([
    ...travels.map(({ slug }) => [`/travel/${slug}`, `/photography#travels/${slug}/1`] as const),
    ...['/travel', '/travel/hangzhou', '/travel/huzhou'].map(path => [path, '/photography#travels'] as const),
    ['/travel/bangkok', `/photography#bangkok/${bangkok.photos[0].id}`] as const,
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
    await expect(page.getByTestId('exhibition-position')).toHaveText('Wuhan - 1/10')
    await expect(page.getByTestId('exhibition-image')).toHaveAttribute('alt', card.imageAlt)
    await expect(page.locator('article[aria-hidden="false"] h2')).toHaveText(card.title)
  } finally {
    releaseCover()
  }
  await expect(index.getByRole('tab', { name: 'Travels' })).toHaveAttribute('aria-selected', 'true')
  const painted = await page.getByTestId('exhibition-image').evaluate((img: HTMLImageElement) => ({
    loaded: img.complete && img.naturalWidth > 0,
    visible: getComputedStyle(img).visibility === 'visible' && getComputedStyle(img.parentElement!).opacity === '1',
  }))
  expect(painted).toEqual({ loaded: true, visible: true })
  await expect(page.getByTestId('exhibition-cursor')).toHaveText('Wuhan - 1/10')
  await page.keyboard.press('Escape')
  await expect(index).toHaveCount(0)
  await expect(page).toHaveURL(/#travels\/wuhan\/1$/)
})

test('Travels index, all Wuhan frames, Thumbs and frame history', async ({ page, isMobile }, testInfo) => {
  await page.setViewportSize(isMobile ? { width: 390, height: 844 } : { width: 1440, height: 900 })
  await page.goto('/')
  await expect(page.locator('a[href^="/travel"]')).toHaveCount(0)
  await page.getByRole('link', { name: '查看旅行记录' }).click()
  const index = page.getByRole('dialog', { name: 'Index', exact: true })
  await expect(index.getByRole('tab', { name: 'Travels' })).toHaveAttribute('aria-selected', 'true')
  const places = index.getByRole('tabpanel', { name: 'Travels' }).getByRole('button')
  await expect(places).toHaveText(['Wuhan10', 'Nanjing10', 'Japan10', 'Shanghai8', 'Northeast China8', 'Beijing9'])
  await places.first().click()
  await expect(index).toHaveCount(0)
  const stage = page.getByTestId('exhibition-stage')
  const caption = stage.locator('article[aria-hidden="false"]')
  const image = page.getByTestId('exhibition-image')
  const controls = page.getByTestId('exhibition-controls')
  const touch = isMobile ? await page.context().newCDPSession(page) : null
  const cards = Object.values(wuhan).flat()
  let captionTop: number | undefined
  for (const [i, frame] of travels[0].photos.entries()) {
    const card = cards.find(card => card.imageSrc === frame.src)!
    await expect(page.getByTestId('exhibition-position')).toHaveText(`Wuhan - ${i + 1}/10`)
    await expect(image).toHaveAccessibleName(card.imageAlt)
    await expect(caption.locator('h2')).toHaveText(card.title)
    await expect(caption.locator('p').last()).toHaveText(card.body)
    await expect(image).toHaveCSS('object-fit', 'contain')
    await expect(image).toHaveCSS('object-position', '50% 100%')
    const box = (await image.boundingBox())!
    const text = (await caption.boundingBox())!
    const bar = (await controls.boundingBox())!
    expect(text.y - (box.y + box.height)).toBeCloseTo(28, 0)
    captionTop ??= text.y
    expect(text.y).toBeCloseTo(captionTop, 0)
    expect(text.y + text.height).toBeLessThanOrEqual(bar.y)
    expect(text.width).toBeLessThanOrEqual(600)
    if (i === 3) await page.screenshot({ path: testInfo.outputPath('wuhan-frame-4.png') })
    if (i === 9) break
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
  await expect(thumbs.locator('img')).toHaveCount(10)
  await expect(thumbs.locator('article')).toHaveCount(0)
  await thumbs.getByRole('button', { name: /^View photograph 3:/ }).click()
  await expect(thumbs).toHaveCount(0)
  await expect(page).toHaveURL(/#travels\/wuhan\/3$/)
  await page.reload()
  await expect(caption.locator('h2')).toHaveText('人们总是关心相机的型号')
  await page.goBack()
  await expect(page.getByTestId('exhibition-position')).toHaveText('Wuhan - 10/10')
  await page.getByRole('button', { name: 'Index', exact: true }).click()
  await places.first().click()
  await expect(page).toHaveURL(/#travels\/wuhan\/1$/)
})

test('Nanjing keeps the same image baseline across portrait and landscape frames', async ({ page, isMobile }) => {
  await page.setViewportSize(isMobile ? { width: 375, height: 812 } : { width: 1440, height: 900 })
  await page.goto('/travel/nanjing')
  const stage = page.getByTestId('exhibition-stage')
  const photo = page.getByTestId('exhibition-image')
  const caption = stage.locator('article[aria-hidden="false"]')
  const orientations = new Set<string>()
  let baseline: number | undefined
  for (let i = 1; i <= 10; i++) {
    await expect(page.getByTestId('exhibition-position')).toHaveText(`Nanjing - ${i}/10`)
    await expect(stage).toHaveJSProperty('scrollTop', 0)
    const box = (await photo.boundingBox())!
    const text = (await caption.boundingBox())!
    baseline ??= text.y
    expect(text.y).toBeCloseTo(baseline, 0)
    expect(text.y - box.y - box.height).toBeCloseTo(28, 0)
    orientations.add(await photo.evaluate((img: HTMLImageElement) => img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait'))
    if (isMobile) {
      expect(box.height).toBeLessThanOrEqual(812 * 0.55 + 1)
      const controls = (await page.getByTestId('exhibition-controls').boundingBox())!
      const stageBox = (await stage.boundingBox())!
      const body = caption.locator('p').last()
      const bodyBox = (await body.boundingBox())!
      const lineHeight = await body.evaluate(el => parseFloat(getComputedStyle(el).lineHeight))
      expect(bodyBox.y + 2 * lineHeight).toBeLessThanOrEqual(Math.min(stageBox.y + stageBox.height, controls.y))
      await stage.evaluate(el => { el.scrollTop = el.scrollHeight })
      const scrolled = (await caption.boundingBox())!
      expect(scrolled.y + scrolled.height).toBeLessThanOrEqual(controls.y)
    }
    if (i < 10) {
      const region = (await stage.boundingBox())!
      const imageBox = (await photo.boundingBox())!
      await page.mouse.click(region.x + region.width * 0.8, Math.max(region.y, imageBox.y) + 32)
    }
  }
  expect(orientations).toEqual(new Set(['landscape', 'portrait']))
})
