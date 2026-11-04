import { expect, test, type Page } from '@playwright/test'

async function expectSinglePaintedPhoto(page: Page) {
  await expect.poll(() => page.getByTestId('exhibition-image-frame').evaluate((frame) =>
    Array.from(frame.querySelectorAll('img')).filter((image) => {
      if (!image.complete || !image.naturalWidth) return false
      const bounds = image.getBoundingClientRect()
      if (bounds.width <= 1 || bounds.height <= 1) return false
      for (let element: Element | null = image; element; element = element.parentElement) {
        const style = getComputedStyle(element)
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false
        if (element === frame) break
      }
      return true
    }).length,
  )).toBe(1)
}

async function startLayerAudit(page: Page) {
  await page.getByTestId('exhibition-image-frame').evaluate((frame) => {
    const audit = { samples: 0, transitionSamples: 0, overlaps: [] as string[][], longestEmptyMs: 0, stopped: false }
    let lastPaintedAt = performance.now()
    Object.assign(window, { __photographyLayerAudit: audit })
    const sample = () => {
      if (audit.stopped) return
      const visible = Array.from(frame.querySelectorAll('img')).filter((image) => {
        if (!image.complete || !image.naturalWidth) return false
        const bounds = image.getBoundingClientRect()
        if (bounds.width <= 1 || bounds.height <= 1) return false
        // Include opacity on the image's ancestors, so the pending loader and
        // the hidden half of each collection transition do not count as painted.
        for (let element: Element | null = image; element; element = element.parentElement) {
          const style = getComputedStyle(element)
          if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false
          if (element === frame) break
        }
        return true
      })
      audit.samples += 1
      if (frame.getAttribute('data-state') === 'transitioning') audit.transitionSamples += 1
      if (visible.length > 1) audit.overlaps.push(visible.map((image) => image.currentSrc))
      if (visible.length > 0) lastPaintedAt = performance.now()
      else audit.longestEmptyMs = Math.max(audit.longestEmptyMs, performance.now() - lastPaintedAt)
      requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
  })
}

async function finishLayerAudit(page: Page) {
  return page.evaluate(() => {
    const audit = (window as typeof window & {
      __photographyLayerAudit: { samples: number; transitionSamples: number; overlaps: string[][]; longestEmptyMs: number; stopped: boolean }
    }).__photographyLayerAudit
    audit.stopped = true
    return audit
  })
}

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`switching works never paints overlapping photographs with system motion ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion })
    await page.goto('/photography#street/z52-8539')
    const frame = page.getByTestId('exhibition-image-frame')
    const image = page.getByTestId('exhibition-image')
    await expect(image).toHaveAttribute('data-photo-id', 'z52-8539')
    await expect(frame).toHaveAttribute('data-state', 'ready')
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0)

    // Exercise portrait -> landscape and the reverse. A transparent incoming
    // layer used to leave the taller/wider outgoing photograph showing behind it.
    for (const selection of [
      { work: 'Bangkok', photoId: 'bangkok-08' },
      { work: 'Street', photoId: 'z52-8539' },
      { work: 'Animals', photoId: 'pets-1' },
      { work: 'Street', photoId: 'z52-8539' },
    ]) {
      await page.getByRole('button', { name: 'Index', exact: true }).click()
      const index = page.getByRole('dialog', { name: 'Index', exact: true })
      await expect(page.getByTestId('exhibition-panel')).toHaveAttribute('data-state', 'open')
      await startLayerAudit(page)
      await index.getByRole('button', { name: new RegExp(selection.work) }).click()
      await expect(image).toHaveAttribute('data-photo-id', selection.photoId)
      await expect(frame).toHaveAttribute('data-state', 'ready')
      await expect(index).not.toBeVisible()
      const audit = await finishLayerAudit(page)
      expect(audit.samples).toBeGreaterThan(5)
      expect(audit.transitionSamples, 'The existing collection animation should still run').toBeGreaterThan(3)
      expect(audit.overlaps, 'Only one photograph may be painted in any transition frame').toEqual([])
      await expectSinglePaintedPhoto(page)
    }
  })
}

test('a second work transition restarts cleanly when browser Back interrupts the first', async ({ page }) => {
  await page.goto('/photography#bangkok/bangkok-04')
  const frame = page.getByTestId('exhibition-image-frame')
  const image = page.getByTestId('exhibition-image')
  await expect(image).toHaveAttribute('data-photo-id', 'bangkok-04')
  await expect(frame).toHaveAttribute('data-state', 'ready')
  await page.evaluate(() => { window.location.hash = '#street/z52-8539' })
  await expect(image).toHaveAttribute('data-photo-id', 'z52-8539')
  await expect(frame).toHaveAttribute('data-state', 'ready')
  await startLayerAudit(page)

  await page.evaluate(() => { window.location.hash = '#pets/pets-1' })
  await expect(image).toHaveAttribute('data-photo-id', 'pets-1')
  await expect(frame).toHaveAttribute('data-state', 'transitioning')
  // Interrupt before the one-second curtain finishes. The outgoing image must
  // restart alongside the new incoming image, rather than inherit an old clock.
  await page.waitForTimeout(350)
  await page.goBack()
  await expect(image).toHaveAttribute('data-photo-id', 'z52-8539')
  await expect(frame).toHaveAttribute('data-state', 'transitioning')
  await expect(frame).toHaveAttribute('data-state', 'ready')
  const audit = await finishLayerAudit(page)
  expect(audit.overlaps).toEqual([])
  expect(audit.longestEmptyMs, 'Interrupted transitions must not leave a blank photograph layer').toBeLessThan(150)
  await expectSinglePaintedPhoto(page)

  await page.goBack()
  await expect(page).toHaveURL(/#bangkok\/bangkok-04$/)
  await expect(image).toHaveAttribute('data-photo-id', 'bangkok-04')
  await expect(frame).toHaveAttribute('data-state', 'ready')
  await expectSinglePaintedPhoto(page)
})

test('rapid work changes keep a single photograph through interrupted curtains', async ({ page }) => {
  await page.goto('/photography#bangkok/bangkok-08')
  const frame = page.getByTestId('exhibition-image-frame')
  const image = page.getByTestId('exhibition-image')
  await expect(frame).toHaveAttribute('data-state', 'ready')
  await startLayerAudit(page)

  // Interrupt on both sides of the covered midpoint, including returning to
  // a photograph that is already visible underneath an unfinished curtain.
  for (const [hash, photoId, delay] of [
    ['#street/z52-8539', 'z52-8539', 100],
    ['#bangkok/bangkok-08', 'bangkok-08', 650],
    ['#pets/pets-1', 'pets-1', 100],
    ['#street/z52-8539', 'z52-8539', 650],
    ['#bangkok/bangkok-08', 'bangkok-08', 100],
    ['#street/z52-8539', 'z52-8539', 0],
  ] as const) {
    await page.evaluate((hash) => { window.location.hash = hash }, hash)
    await expect(image).toHaveAttribute('data-photo-id', photoId)
    if (delay) await page.waitForTimeout(delay)
  }
  await expect(frame).toHaveAttribute('data-state', 'ready')
  const audit = await finishLayerAudit(page)
  expect(audit.transitionSamples).toBeGreaterThan(5)
  expect(audit.overlaps).toEqual([])
  expect(audit.longestEmptyMs).toBeLessThan(150)
  await expectSinglePaintedPhoto(page)
  expect(await frame.locator('img').count()).toBeLessThanOrEqual(6)
})

test('browser Back wins over a delayed photograph from another work', async ({ page }) => {
  let releaseImage!: () => void
  let requested = false
  const imageGate = new Promise<void>((resolve) => { releaseImage = resolve })
  await page.route(/Z52_2306-large\.webp/, async (route) => {
    requested = true
    await imageGate
    await route.continue()
  })
  try {
    await page.goto('/photography#street/z52-8539')
    const image = page.getByTestId('exhibition-image')
    const frame = page.getByTestId('exhibition-image-frame')
    await expect(image).toHaveAttribute('data-photo-id', 'z52-8539')
    await expect(frame).toHaveAttribute('data-state', 'ready')
    await page.getByRole('button', { name: 'Index', exact: true }).click()
    await page.getByRole('dialog', { name: 'Index', exact: true }).getByRole('button', { name: /Animals/ }).click()
    await expect(page).toHaveURL(/#pets\/pets-1$/)
    await expect.poll(() => requested).toBe(true)
    await expect(frame).toHaveAttribute('data-state', 'loading')
    await expect(image).toHaveAttribute('data-photo-id', 'z52-8539')

    await page.goBack()
    await expect(page).toHaveURL(/#street\/z52-8539$/)
    await expect(frame).toHaveAttribute('data-state', 'ready')
    const lateResponse = page.waitForResponse((response) => response.url().includes('Z52_2306-large.webp'))
    releaseImage()
    const response = await lateResponse
    await response.finished()
    await page.evaluate(async (url) => {
      const lateImage = new Image()
      lateImage.src = url
      await lateImage.decode()
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    }, response.url())
    await expect(page).toHaveURL(/#street\/z52-8539$/)
    await expect(image).toHaveAttribute('data-photo-id', 'z52-8539')
    await expect(page.getByTestId('exhibition-position')).toContainText(/Street\s*-\s*1\s*\/\s*7/)
    await expectSinglePaintedPhoto(page)
  } finally {
    releaseImage()
  }
})

test('the requested photograph loads before speculative next photographs', async ({ page }) => {
  let releaseImage!: () => void
  let requested = false
  const imageGate = new Promise<void>((resolve) => { releaseImage = resolve })
  const speculativeRequests: string[] = []
  page.on('request', (request) => {
    if (/Z52_8331-large\.webp/.test(request.url())) speculativeRequests.push(request.url())
  })
  await page.route(/Z52_8539-large\.webp/, async (route) => {
    requested = true
    await imageGate
    await route.continue()
  })
  try {
    await page.goto('/photography#street/z52-8539', { waitUntil: 'domcontentloaded' })
    const frame = page.getByTestId('exhibition-image-frame')
    await expect.poll(() => requested).toBe(true)
    await expect(frame).toHaveAttribute('data-requested', 'street/z52-8539')
    // Opening Index confirms hydration/effects have run while the selected
    // photograph remains blocked; prefetch must not compete with that request.
    await page.getByRole('button', { name: 'Index', exact: true }).click()
    await expect(page.getByTestId('exhibition-panel')).toHaveAttribute('data-state', 'open')
    expect(speculativeRequests).toEqual([])
    releaseImage()
    await expect(page.getByTestId('exhibition-image')).toHaveAttribute('data-photo-id', 'z52-8539')
    await expect(frame).toHaveAttribute('data-state', 'ready')
    await expect.poll(() => speculativeRequests.length).toBeGreaterThan(0)
  } finally {
    releaseImage()
  }
})

test('a portrait downloads the smallest candidate covering its displayed pixels', async ({ page }) => {
  // Playwright gives this test a fresh context, so a previously cached larger
  // candidate cannot influence the browser's responsive-image selection.
  await page.goto('/photography#bangkok/bangkok-04')
  const image = page.getByTestId('exhibition-image')
  await expect(image).toHaveAttribute('data-photo-id', 'bangkok-04')
  await expect(page.getByTestId('exhibition-image-frame')).toHaveAttribute('data-state', 'ready')
  const selection = await image.evaluate(async (element: HTMLImageElement) => {
    await element.decode()
    const bounds = element.getBoundingClientRect()
    const aspectRatio = Number(element.getAttribute('width')) / Number(element.getAttribute('height'))
    // object-fit: contain can make the visible photograph narrower than its
    // image element. Measure the existing layout independently of `sizes`.
    const requiredWidth = Math.min(bounds.width, bounds.height * aspectRatio) * window.devicePixelRatio
    const candidates = element.srcset.split(',').map((candidate) => {
      const match = candidate.trim().match(/^(\S+)\s+(\d+)w$/)
      if (!match) throw new Error(`Unexpected responsive image candidate: ${candidate}`)
      return { url: new URL(match[1], document.baseURI).href, width: Number(match[2]) }
    }).sort((left, right) => left.width - right.width)
    const actual = candidates.find((candidate) => candidate.url === element.currentSrc)
    // Allow one physical pixel of rounding at CSS/device-pixel boundaries.
    const expected = candidates.find((candidate) => candidate.width + 1 >= requiredWidth) ?? candidates.at(-1)
    return { requiredWidth, actual, expected }
  })
  expect(selection.actual, 'The browser must choose a declared responsive candidate').toBeDefined()
  expect(selection.expected).toBeDefined()
  expect(selection.actual!.width, `Visible portrait requires ${selection.requiredWidth.toFixed(2)} physical pixels`).toBe(selection.expected!.width)
})
