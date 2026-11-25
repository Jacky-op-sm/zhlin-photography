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
    await expect(page.getByTestId('exhibition-position')).toHaveText('Wuhan - 1/7')
    await expect(page.getByTestId('exhibition-image')).toHaveAttribute('alt', card.imageAlt)
    await expect(page.locator('article[aria-hidden="false"] p').first()).toHaveText(cover.place!)
  } finally {
    releaseCover()
  }
  await expect(index.getByRole('tab', { name: 'Travels' })).toHaveAttribute('aria-selected', 'true')
  const painted = await page.getByTestId('exhibition-image').evaluate((img: HTMLImageElement) => ({
    loaded: img.complete && img.naturalWidth > 0,
    visible: getComputedStyle(img).visibility === 'visible' && getComputedStyle(img.parentElement!).opacity === '1',
  }))
  expect(painted).toEqual({ loaded: true, visible: true })
  await expect(page.getByTestId('exhibition-cursor')).toHaveText('Wuhan - 1/7')
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
  await expect(places).toHaveText(['Wuhan7', 'Nanjing5', 'Japan6', 'Shanghai4', 'Northeast China7', 'Beijing7'])
  await places.first().click()
  await expect(index).toHaveCount(0)
  const stage = page.getByTestId('exhibition-stage')
  const caption = stage.locator('article[aria-hidden="false"]')
  const image = page.getByTestId('exhibition-image')
  const controls = page.getByTestId('exhibition-controls')
  const touch = isMobile ? await page.context().newCDPSession(page) : null
  const cards = Object.values(wuhan).flat()
  const visible = travels[0].photos.filter(photo => !photo.hidden)
  let captionTop: number | undefined
  for (const [i, frame] of visible.entries()) {
    const card = cards.find(card => card.imageSrc === frame.src)!
    await expect(page.getByTestId('exhibition-position')).toHaveText(`Wuhan - ${i + 1}/7`)
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
    captionTop ??= text.y
    expect(text.y).toBeCloseTo(captionTop, 0)
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
  await expect(thumbs.locator('img')).toHaveCount(7)
  await expect(thumbs.locator('article')).toHaveCount(0)
  await thumbs.getByRole('button', { name: /^View photograph 3:/ }).click()
  await expect(thumbs).toHaveCount(0)
  await expect(page).toHaveURL(/#travels\/wuhan\/3$/)
  await page.reload()
  await expect(caption.locator('p').last()).toHaveText(cards.find(card => card.imageSrc === visible[2].src)!.body)
  await page.goBack()
  await expect(page.getByTestId('exhibition-position')).toHaveText('Wuhan - 7/7')
  await page.getByRole('button', { name: 'Index', exact: true }).click()
  await places.first().click()
  await expect(page).toHaveURL(/#travels\/wuhan\/1$/)
})

test('Nanjing fits every caption and keeps same-orientation frames aligned', async ({ page, isMobile }) => {
  await page.setViewportSize(isMobile ? { width: 375, height: 667 } : { width: 1440, height: 900 })
  await page.goto('/photography#travels/nanjing/10')
  await expect(page).toHaveURL(/#travels\/nanjing\/1$/)
  const stage = page.getByTestId('exhibition-stage')
  const photo = page.getByTestId('exhibition-image')
  const baselines = new Map<boolean, number>()
  for (let i = 1; i <= 5; i++) {
    await expect(page.getByTestId('exhibition-position')).toHaveText(`Nanjing - ${i}/5`)
    const box = (await photo.boundingBox())!
    const text = (await stage.locator('article[aria-hidden="false"]').boundingBox())!
    const region = (await stage.boundingBox())!
    expect(box.y).toBeGreaterThanOrEqual(region.y - 1)
    expect(text.y + text.height).toBeLessThanOrEqual(region.y + region.height + 1)
    expect(text.x).toBeCloseTo(box.x, 0)
    expect(text.width).toBeCloseTo(box.width, 0)
    expect(text.y - box.y - box.height).toBeCloseTo(16, 0)
    const landscape = box.width >= box.height
    expect(text.y).toBeCloseTo(baselines.get(landscape) ?? text.y, 0)
    baselines.set(landscape, text.y)
    if (i < 5) await page.mouse.click(region.x + region.width * 0.8, box.y + 32)
  }
  expect(baselines.size).toBe(2)
})
