import { expect, test, type Page } from '@playwright/test'

type DecodeAudit = {
  decoded: WeakSet<HTMLImageElement>
  slowNewDecodes: boolean
  delayedDecodes: number
  gateStarted: number
  gateReleased: boolean
  gateFinished: number
  releaseGate: () => void
}

async function installDecodeAudit(page: Page, gatedSource = '') {
  await page.addInitScript((gatedSource) => {
    const originalDecode = HTMLImageElement.prototype.decode
    let releaseGate!: () => void
    const gate = new Promise<void>((resolve) => { releaseGate = resolve })
    const audit: DecodeAudit = {
      decoded: new WeakSet(), slowNewDecodes: false, delayedDecodes: 0,
      gateStarted: 0, gateReleased: false, gateFinished: 0,
      releaseGate: () => { audit.gateReleased = true; releaseGate() },
    }
    Object.assign(window, { __photoDecodeAudit: audit })
    HTMLImageElement.prototype.decode = async function (this: HTMLImageElement) {
      await originalDecode.call(this)
      if (gatedSource && (this.currentSrc || this.src).includes(gatedSource) && !audit.gateReleased) {
        audit.gateStarted += 1
        await gate
        audit.gateFinished += 1
      }
      if (audit.slowNewDecodes && !audit.decoded.has(this)) {
        audit.delayedDecodes += 1
        await new Promise<void>((resolve) => setTimeout(resolve, 600))
      }
      audit.decoded.add(this)
    }
  }, gatedSource)
}

async function waitForPreparedPhoto(page: Page, photoId: string) {
  // Do not call decode here: the application itself must prepare this node
  // before a gesture, rather than the test warming a browser cache for it.
  await expect.poll(() => page.getByTestId('exhibition-image-frame').evaluate((frame, photoId) => {
    const image = frame.querySelector<HTMLImageElement>(`img[data-photo-id="${photoId}"]`)
    const audit = (window as typeof window & { __photoDecodeAudit: DecodeAudit }).__photoDecodeAudit
    return !!image && image.complete && image.naturalWidth > 0 && audit.decoded.has(image)
  }, photoId), { message: `${photoId} should already be decoded in the retained image pool` }).toBe(true)
}

function photographSource(requestUrl: string) {
  const url = new URL(requestUrl)
  const source = url.searchParams.get('url') ?? url.pathname
  return /\/assets\/(?:generated\/photos|photography)\/.+\.webp$/.test(source) && !source.includes('-thumb.') ? source : null
}

async function measurePreparedNavigation(page: Page, photoId: string, direction: number, input: 'click' | 'keyboard' | 'swipe' | 'index', work = '') {
  return page.getByTestId('exhibition-image-frame').evaluate((frame, { photoId, direction, input, work }) => {
    const prepared = frame.querySelector<HTMLImageElement>(`img[data-photo-id="${photoId}"]`)
    const audit = (window as typeof window & { __photoDecodeAudit: DecodeAudit }).__photoDecodeAudit
    const startedAt = performance.now()
    if (input === 'index') {
      const button = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="tabpanel"] button'))
        .find((button) => button.textContent?.trim().startsWith(work))
      if (!button) throw new Error(`Missing ${work} work in Index`)
      button.click()
    } else if (input === 'click') {
      const stage = document.querySelector<HTMLElement>('[data-testid="exhibition-stage"]')!
      stage.querySelectorAll<HTMLButtonElement>('button')[direction > 0 ? 1 : 0].click()
    } else if (input === 'keyboard') {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: direction > 0 ? 'ArrowRight' : 'ArrowLeft', bubbles: true }))
    } else {
      const stage = document.querySelector<HTMLElement>('[data-testid="exhibition-stage"]')!
      const bounds = stage.getBoundingClientRect()
      const start = { clientX: bounds.left + bounds.width / 2, clientY: bounds.top + bounds.height / 2 }
      const end = { ...start, clientX: start.clientX - direction * 120 }
      for (const [type, touches, changedTouches] of [
        ['touchstart', [start], [start]], ['touchend', [], [end]],
      ] as const) {
        const event = new Event(type, { bubbles: true, cancelable: true })
        Object.defineProperties(event, { touches: { value: touches }, changedTouches: { value: changedTouches } })
        stage.dispatchEvent(event)
      }
    }
    return new Promise<{ elapsedMs: number; painted: boolean; sameNode: boolean }>((resolve) => {
      const sample = () => {
        const active = frame.querySelector<HTMLImageElement>('[data-testid="exhibition-image"]')
        let painted = !!active && active.dataset.photoId === photoId && active.complete && active.naturalWidth > 0 && audit.decoded.has(active)
        if (painted) {
          for (let element: Element | null = active; element; element = element.parentElement) {
            const style = getComputedStyle(element)
            if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) painted = false
            if (element === frame) break
          }
        }
        const elapsedMs = performance.now() - startedAt
        if (painted || elapsedMs > 1500) resolve({ elapsedMs, painted, sameNode: active === prepared })
        else requestAnimationFrame(sample)
      }
      requestAnimationFrame(sample)
    })
  }, { photoId, direction, input, work })
}

for (const input of ['click', 'keyboard', 'swipe'] as const) {
  test(`prepared forward and reverse ${input} navigation paints promptly without decoding a replacement node`, async ({ page }, testInfo) => {
    await installDecodeAudit(page)
    let delayRequests = false
    await page.route(/Z52_\d+-large\.webp/, async (route) => {
      if (delayRequests) await new Promise((resolve) => setTimeout(resolve, 500))
      await route.continue().catch(() => { /* The test may finish with a speculative request pending. */ })
    })
    await page.goto('/photography#pets/pets-5')
    const frame = page.getByTestId('exhibition-image-frame')
    await expect(page.getByTestId('exhibition-image')).toHaveAttribute('data-photo-id', 'pets-5')
    await expect(frame).toHaveAttribute('data-state', 'ready')
    await waitForPreparedPhoto(page, 'pets-4')
    await waitForPreparedPhoto(page, 'pets-6')
    // A remount or new network fetch now incurs a visible half-second penalty.
    // Reusing the prepared image must keep navigation fast despite those delays.
    delayRequests = true
    await page.evaluate(() => {
      (window as typeof window & { __photoDecodeAudit: DecodeAudit }).__photoDecodeAudit.slowNewDecodes = true
    })
    const timings = []
    for (const [photoId, direction] of [['pets-6', 1], ['pets-5', -1], ['pets-4', -1], ['pets-5', 1]] as const) {
      await waitForPreparedPhoto(page, photoId)
      const result = await measurePreparedNavigation(page, photoId, direction, input)
      timings.push({ photoId, ...result })
      expect(result.painted).toBe(true)
      expect(result.sameNode, 'Promote the decoded node instead of replacing it with a newly decoded image').toBe(true)
      expect(result.elapsedMs, 'Prepared navigation must not wait for another image load/decode').toBeLessThan(250)
      await expect(frame).toHaveAttribute('data-state', 'ready')
      expect(await frame.locator('img').count(), 'Keep the decoded photo pool bounded').toBeLessThanOrEqual(6)
    }
    console.log(`[photo-latency] ${testInfo.project.name} ${input} ${JSON.stringify(timings)}`)
    await expect(page).toHaveURL(/#pets\/pets-5$/)
  })
}

for (const intent of ['hover', 'focus', 'touchstart'] as const) {
  test(`Index ${intent} prepares work covers without fetching whole works and promotes the decoded cover node`, async ({ page }, testInfo) => {
    await installDecodeAudit(page)
    let delayNewRequests = false
    await page.route(/(?:%2F|\/)project(?:%2F|\/)[1-6]-large\.webp/, async (route) => {
      if (delayNewRequests) await new Promise<void>((resolve) => setTimeout(resolve, 500))
      await route.continue().catch(() => { /* Speculative requests may outlive the review of the selected cover. */ })
    })
    const projectRequests = new Set<string>()
    let coverRequestCount = 0
    page.on('request', (request) => {
      const source = photographSource(request.url())
      if (source?.includes('/photos/project/')) projectRequests.add(source)
      if (source === '/assets/generated/photos/project/1-large.webp') coverRequestCount += 1
    })
    await page.goto('/photography/pets#pets/pets-5')
    const frame = page.getByTestId('exhibition-image-frame')
    await expect(page.getByTestId('exhibition-image')).toHaveAttribute('data-photo-id', 'pets-5')
    await expect(frame).toHaveAttribute('data-state', 'ready')
    await waitForPreparedPhoto(page, 'pets-4')
    await waitForPreparedPhoto(page, 'pets-6')
    expect([...projectRequests], 'A distant work should not load before a user opens Index').toEqual([])

    await page.getByRole('button', { name: 'Index', exact: true }).click()
    await expect(page.getByTestId('exhibition-panel')).toHaveAttribute('data-state', 'open')
    await expect.poll(() => frame.evaluate((frame) => {
      const audit = (window as typeof window & { __photoDecodeAudit: DecodeAudit }).__photoDecodeAudit
      return ['bangkok-08', 'z52-8539', 'project-intersection-1'].some((photoId) => {
        const image = frame.querySelector<HTMLImageElement>(`img[data-photo-id="${photoId}"]`)
        return !!image && image.complete && image.naturalWidth > 0 && audit.decoded.has(image)
      })
    }), { message: 'Opening Index should prepare another work before it is selected' }).toBe(true)
    const projects = page.getByRole('dialog', { name: 'Index', exact: true }).getByRole('button', { name: /Projects/ })
    if (intent === 'hover') await projects.hover()
    else if (intent === 'focus') await projects.focus()
    else await projects.dispatchEvent('touchstart')
    await waitForPreparedPhoto(page, 'project-intersection-1')
    await expect(frame.locator('img[data-photo-id="project-intersection-1"]'), 'Prepared work covers must stay hidden until selected').not.toBeVisible()
    expect(await frame.locator('img').count(), 'Work-cover intent must keep the retained photo pool bounded').toBeLessThanOrEqual(6)
    await page.waitForLoadState('networkidle')
    expect([...projectRequests], 'Opening Index should warm only the distant work cover, not its entire collection')
      .toEqual(['/assets/generated/photos/project/1-large.webp'])
    const preparedRequestCount = coverRequestCount

    // A replacement node or fresh request now costs more than a direct promotion.
    // The test does not decode the cover itself or silently warm a browser cache.
    delayNewRequests = true
    await page.evaluate(() => {
      (window as typeof window & { __photoDecodeAudit: DecodeAudit }).__photoDecodeAudit.slowNewDecodes = true
    })
    const result = await measurePreparedNavigation(page, 'project-intersection-1', 0, 'index', 'Projects')
    expect(result.painted, 'The prepared cover must become a painted photograph').toBe(true)
    expect(result.sameNode, 'Selecting a prepared work must promote its decoded node without mounting another image').toBe(true)
    expect(result.elapsedMs, 'A prepared work may retain the existing curtain but must not wait for a fresh load or decode').toBeLessThan(800)
    expect(coverRequestCount, 'Selecting a decoded cover must not issue another request for it').toBe(preparedRequestCount)
    console.log(`[photo-work-latency] ${testInfo.project.name} ${intent} ${JSON.stringify(result)}`)
    await expect(frame).toHaveAttribute('data-state', 'ready')
    await expect(page).toHaveURL(/#project\/project-intersection-1$/)
  })
}

test('Save-Data loads only selected photographs despite Index navigation intent', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } })
  })
  const photoRequests: string[] = []
  page.on('request', (request) => {
    const source = photographSource(request.url())
    if (source) photoRequests.push(source)
  })
  // Match the server's first photo so a hash hydration fallback cannot account
  // for an extra request or retained node in this bandwidth-saving check.
  await page.goto('/photography/pets')
  const frame = page.getByTestId('exhibition-image-frame')
  const image = page.getByTestId('exhibition-image')
  await expect(image).toHaveAttribute('data-photo-id', 'pets-1')
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0)
  await page.waitForLoadState('networkidle')
  await expect(frame).toHaveAttribute('data-state', 'ready')
  await expect(frame.locator('img')).toHaveCount(1)
  expect(photoRequests.length).toBeGreaterThan(0)
  expect(photoRequests.every((url) => url.includes('Z52_2306-large.webp'))).toBe(true)

  await page.getByRole('button', { name: 'Index', exact: true }).click()
  await expect(page.getByTestId('exhibition-panel')).toHaveAttribute('data-state', 'open')
  const index = page.getByRole('dialog', { name: 'Index', exact: true })
  await index.getByRole('button', { name: /Street/ }).hover()
  const projects = index.getByRole('button', { name: /Projects/ })
  await projects.focus()
  await projects.dispatchEvent('touchstart')
  await page.waitForLoadState('networkidle')
  await expect(frame.locator('img')).toHaveCount(1)
  expect(new Set(photoRequests), 'Save-Data must suppress cover hints as well as adjacent-photo prefetch')
    .toEqual(new Set(['/assets/generated/photos/pets/Z52_2306-large.webp']))

  await projects.click()
  await expect(image).toHaveAttribute('data-photo-id', 'project-intersection-1')
  await expect(frame).toHaveAttribute('data-state', 'ready')
  await page.waitForLoadState('networkidle')
  await expect(frame.locator('img')).toHaveCount(1)
  expect(new Set(photoRequests), 'An explicit work selection may load its cover, but not the rest of that work')
    .toEqual(new Set(['/assets/generated/photos/pets/Z52_2306-large.webp', '/assets/generated/photos/project/1-large.webp']))
})

test('a late neighboring decode never replaces the latest selection or blanks the current photo', async ({ page }) => {
  await installDecodeAudit(page, 'Z52_2732-large.webp')
  try {
    await page.goto('/photography#pets/pets-5')
    const frame = page.getByTestId('exhibition-image-frame')
    const image = page.getByTestId('exhibition-image')
    await expect(image).toHaveAttribute('data-photo-id', 'pets-5')
    await expect(frame).toHaveAttribute('data-state', 'ready')
    await expect.poll(() => page.evaluate(() =>
      (window as typeof window & { __photoDecodeAudit: DecodeAudit }).__photoDecodeAudit.gateStarted,
    )).toBeGreaterThan(0)
    await page.keyboard.press('ArrowRight')
    await expect(frame).toHaveAttribute('data-requested', 'pets/pets-6')
    await expect(frame).toHaveAttribute('data-state', 'loading')
    await expect(image).toHaveAttribute('data-photo-id', 'pets-5')
    await expect(image).toBeVisible()
    await page.keyboard.press('ArrowLeft')
    await expect(page).toHaveURL(/#pets\/pets-5$/)
    await expect(frame).toHaveAttribute('data-state', 'ready')
    await page.evaluate(() => {
      (window as typeof window & { __photoDecodeAudit: DecodeAudit }).__photoDecodeAudit.releaseGate()
    })
    await expect.poll(() => page.evaluate(() =>
      (window as typeof window & { __photoDecodeAudit: DecodeAudit }).__photoDecodeAudit.gateFinished,
    )).toBeGreaterThan(0)
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    await expect(image).toHaveAttribute('data-photo-id', 'pets-5')
    await expect(image).toBeVisible()
    await expect(page.getByTestId('exhibition-position')).toContainText(/Animals\s*-\s*5\s*\/\s*15/)
    expect(await frame.locator('img').count()).toBeLessThanOrEqual(6)
  } finally {
    if (!page.isClosed()) await page.evaluate(() => {
      (window as typeof window & { __photoDecodeAudit?: DecodeAudit }).__photoDecodeAudit?.releaseGate()
    })
  }
})

test('resizing during a pending photo decode waits for the new responsive candidate', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.addInitScript(() => {
    const nativeDecode = HTMLImageElement.prototype.decode
    let releaseOld!: () => void
    const gate = new Promise<void>((resolve) => { releaseOld = resolve })
    const audit = {
      oldSource: '', oldStarted: 0, oldFinished: 0, released: false,
      completedSources: [] as string[],
      release: () => { audit.released = true; releaseOld() },
    }
    Object.assign(window, { __responsiveDecodeAudit: audit })
    HTMLImageElement.prototype.decode = async function (this: HTMLImageElement) {
      const source = this.currentSrc
      await nativeDecode.call(this)
      if (!source.includes('Z52_2732-large.webp')) return
      if (!audit.oldSource) audit.oldSource = source
      if (source === audit.oldSource && !audit.released) {
        audit.oldStarted += 1
        await gate
        audit.oldFinished += 1
      } else {
        audit.completedSources.push(source)
      }
    }
  })
  let firstWidth = 0
  let largerRequested = false
  let releaseLarger!: () => void
  const largerGate = new Promise<void>((resolve) => { releaseLarger = resolve })
  await page.route(/Z52_2732-large\.webp/, async (route) => {
    const width = Number(new URL(route.request().url()).searchParams.get('w'))
    if (!firstWidth) firstWidth = width
    if (width > firstWidth) {
      largerRequested = true
      await largerGate
    }
    await route.continue().catch(() => { /* Release outstanding routes on test cleanup. */ })
  })
  type ResponsiveAudit = { oldSource: string; oldStarted: number; oldFinished: number; completedSources: string[]; release: () => void }
  try {
    await page.goto('/photography/pets#pets/pets-5')
    const frame = page.getByTestId('exhibition-image-frame')
    const image = page.getByTestId('exhibition-image')
    await expect(image).toHaveAttribute('data-photo-id', 'pets-5')
    await expect(frame).toHaveAttribute('data-state', 'ready')
    await expect.poll(() => page.evaluate(() =>
      (window as typeof window & { __responsiveDecodeAudit: ResponsiveAudit }).__responsiveDecodeAudit.oldStarted,
    )).toBeGreaterThan(0)
    await page.keyboard.press('ArrowRight')
    await expect(frame).toHaveAttribute('data-requested', 'pets/pets-6')
    await expect(frame).toHaveAttribute('data-state', 'loading')
    await page.setViewportSize({ width: 1440, height: 1000 })
    await expect.poll(() => largerRequested, { message: 'The browser must request a larger responsive image after resizing' }).toBe(true)

    // The old bitmap has decoded, but its successor at the new viewport size
    // is still blocked on the network. Completing the obsolete job must not
    // declare the requested photograph ready or replace the current image.
    await page.evaluate(() => {
      (window as typeof window & { __responsiveDecodeAudit: ResponsiveAudit }).__responsiveDecodeAudit.release()
    })
    await expect.poll(() => page.evaluate(() =>
      (window as typeof window & { __responsiveDecodeAudit: ResponsiveAudit }).__responsiveDecodeAudit.oldFinished,
    )).toBeGreaterThan(0)
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    await expect(frame).toHaveAttribute('data-state', 'loading')
    await expect(image).toHaveAttribute('data-photo-id', 'pets-5')
    await expect(image).toBeVisible()

    releaseLarger()
    await expect(image).toHaveAttribute('data-photo-id', 'pets-6')
    await expect(frame).toHaveAttribute('data-state', 'ready')
    const painted = await frame.evaluate(async (element) => {
      const active = element.querySelector<HTMLImageElement>('[data-testid="exhibition-image"]')!
      const audit = (window as typeof window & { __responsiveDecodeAudit: ResponsiveAudit }).__responsiveDecodeAudit
      const counts = []
      for (let frame = 0; frame < 3; frame++) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        counts.push(Array.from(element.querySelectorAll('img')).filter((image) => {
          if (!image.complete || !image.naturalWidth) return false
          for (let node: Element | null = image; node; node = node.parentElement) {
            const style = getComputedStyle(node)
            if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false
            if (node === element) break
          }
          return true
        }).length)
      }
      return { currentSrc: active.currentSrc, decodedCurrent: audit.completedSources.includes(active.currentSrc), counts }
    })
    expect(Number(new URL(painted.currentSrc).searchParams.get('w'))).toBeGreaterThan(firstWidth)
    expect(painted.decodedCurrent, 'The newly selected responsive candidate must have completed application decoding').toBe(true)
    expect(painted.counts).toEqual([1, 1, 1])
  } finally {
    releaseLarger()
    if (!page.isClosed()) await page.evaluate(() => {
      (window as typeof window & { __responsiveDecodeAudit?: ResponsiveAudit }).__responsiveDecodeAudit?.release()
    })
  }
})
