import fs from 'node:fs'
import { test, expect, devices, type Page } from '@playwright/test'
import exhibition from '../../content/travel/exhibition.json'

// Every Travels frame must land in one place per viewport, however it is
// reached: a reloaded deep link, the arrow keys from frame 1, or a jump from
// another series. Captions never move once visible and never outrun their photo.

type Box = { x: number; y: number; w: number; h: number; bottom: number }
type Placement = { photo: Box; caption: Box; place: Box; clipped: boolean; top: number; bottom: number; viewportHeight: number }

const viewports = [
  { name: '393x723', width: 393, height: 723, mobile: true },
  { name: '375x667', width: 375, height: 667, mobile: true },
  { name: '430x800', width: 430, height: 800, mobile: true },
  { name: '1440x900', width: 1440, height: 900, mobile: false },
  { name: '1280x720', width: 1280, height: 720, mobile: false },
]
const series = exhibition.map(({ slug, title, photos }) => {
  const cards = Object.values(JSON.parse(fs.readFileSync(`content/travel/${slug}/cards.json`, 'utf8')) as Record<string, { imageSrc?: string; body: string }[]>).flat()
  const frames = photos.filter(photo => !('hidden' in photo && photo.hidden)).map((photo, i) => ({
    index: i + 1, src: photo.src, landscape: photo.width >= photo.height,
    text: photo.place + cards.find(card => card.imageSrc === photo.src)!.body,
  }))
  return { slug, title, frames }
})
const sourceOfText = new Map(series.flatMap(({ frames }) => frames.map(frame => [frame.text, frame.src])))

async function settle(page: Page, title: string, index: number, total: number) {
  await page.waitForFunction((label) => {
    const frame = document.querySelector<HTMLElement>('[data-testid="exhibition-image-frame"]')
    const img = document.querySelector<HTMLImageElement>('[data-testid="exhibition-image"]')
    const caption = document.querySelector('[data-testid="travel-caption"]')
    return frame?.dataset.state === 'ready' && document.querySelector('[data-testid="exhibition-position"]')?.textContent === label
      && !!img?.complete && img.naturalWidth > 0 && !!caption && getComputedStyle(caption).visibility === 'visible'
  }, `${title} - ${index}/${total}`, { timeout: 20_000 })
  await page.evaluate(() => document.fonts.ready)
}

function read(page: Page): Promise<Placement> {
  return page.evaluate(() => {
    const box = (element: Element) => { const r = element.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, bottom: r.bottom } }
    const article = document.querySelector('[data-testid="travel-caption"] article')!
    const controls = document.querySelector('[data-testid="exhibition-controls"]')!.getBoundingClientRect()
    const counter = document.querySelector('[data-testid="exhibition-position"]')!.getBoundingClientRect()
    const stage = document.querySelector('[data-testid="exhibition-stage"]')!.getBoundingClientRect()
    const range = document.createRange()
    range.selectNodeContents(document.querySelector('[data-testid="exhibition-controls"] button')!)
    const navAtTop = controls.top < stage.top + stage.height / 2
    return {
      photo: box(document.querySelector('[data-testid="exhibition-image"]')!),
      caption: box(article),
      place: box(article.firstElementChild!),
      clipped: article.scrollHeight > article.clientHeight + 1,
      top: navAtTop ? controls.bottom + 16 : stage.top + 40,
      bottom: counter.height > 1 ? counter.top - 20 : navAtTop ? stage.bottom - 20 : range.getBoundingClientRect().top - 24,
      viewportHeight: innerHeight,
    }
  })
}

// Samples the visible caption and photographs at every animation frame.
async function watch(page: Page) {
  await page.evaluate(() => {
    const samples: { text: string; rect: number[]; sources: string[] }[] = []
    const state = window as unknown as { travelSamples: typeof samples; travelWatching: boolean }
    state.travelSamples = samples
    state.travelWatching = true
    const source = (img: HTMLImageElement) => new URL(img.currentSrc || img.src, location.href).searchParams.get('url') ?? img.src
    const tick = () => {
      const caption = document.querySelector('[data-testid="travel-caption"]')
      const article = caption?.querySelector('article')
      const style = caption && getComputedStyle(caption)
      if (article && style?.visibility === 'visible' && Number(style.opacity) > 0) {
        const r = article.getBoundingClientRect()
        samples.push({
          text: article.textContent ?? '', rect: [r.left, r.top, r.width, r.height],
          sources: [...document.querySelectorAll<HTMLImageElement>('[data-testid="exhibition-image-frame"] img')]
            .filter(img => getComputedStyle(img).visibility === 'visible').map(source),
        })
      }
      if (state.travelWatching) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  return async (context: string) => {
    const samples = await page.evaluate(() => {
      const state = window as unknown as { travelSamples: { text: string; rect: number[]; sources: string[] }[]; travelWatching: boolean }
      state.travelWatching = false
      return state.travelSamples
    })
    const first = new Map<string, number[]>()
    for (const { text, rect, sources } of samples) {
      const known = first.get(text) ?? rect
      first.set(text, known)
      expect(rect.map((value, i) => Math.abs(value - known[i])).every(delta => delta <= 1), `${context}: caption moved after appearing`).toBe(true)
      expect(sources, `${context}: caption shown without its photograph`).toContain(sourceOfText.get(text))
    }
  }
}

const close = (a: Box, b: Box) => (['x', 'y', 'w', 'h'] as const).every(key => Math.abs(a[key] - b[key]) <= 1)

test.describe.configure({ mode: 'parallel' })

for (const viewport of viewports) {
  for (const { slug, title, frames } of series) {
    test(`${viewport.name}: ${title} frames land in one place however they are reached`, async ({ browser, baseURL }) => {
      test.setTimeout(300_000)
      const context = await browser.newContext({
        ...(viewport.mobile ? devices['iPhone 12'] : {}),
        viewport: { width: viewport.width, height: viewport.height }, baseURL,
      })
      const page = await context.newPage()
      const total = frames.length
      const slugs = exhibition.map(item => item.slug)
      const other = exhibition[(slugs.indexOf(slug) + 1) % slugs.length]
      const otherTotal = other.photos.filter(photo => !('hidden' in photo && photo.hidden)).length

      await page.goto('/photography#works/w01')
      await expect(page.getByTestId('exhibition-image-frame')).toHaveAttribute('data-state', 'ready')
      const works = await page.getByTestId('exhibition-image').evaluate(img => { const r = img.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, bottom: r.bottom } })

      // (b) The arrow keys from frame 1, watched frame by frame.
      const walked: Placement[] = []
      await page.goto(`/photography#travels/${slug}/1`)
      await settle(page, title, 1, total)
      const walk = await watch(page)
      for (const frame of frames) {
        if (frame.index > 1) {
          await page.keyboard.press('ArrowRight')
          await settle(page, title, frame.index, total)
        }
        walked.push(await read(page))
      }
      await walk(`${slug} walk`)

      for (const frame of frames) {
        const placed = walked[frame.index - 1]
        const label = `${viewport.name} ${slug}/${frame.index}`
        // (a) A deep link, reloaded.
        await page.goto(`/photography#travels/${slug}/${frame.index}`)
        await page.reload()
        await settle(page, title, frame.index, total)
        const linked = await read(page)
        expect(close(linked.photo, placed.photo) && close(linked.caption, placed.caption), `${label}: deep link differs from the walk`).toBe(true)
        // (c) From the last frame of another series by a hash change, watched.
        await page.goto(`/photography#travels/${other.slug}/${otherTotal}`)
        await settle(page, other.title, otherTotal, otherTotal)
        const jump = await watch(page)
        await page.evaluate(hash => { location.hash = hash }, `#travels/${slug}/${frame.index}`)
        await settle(page, title, frame.index, total)
        await expect(page.getByTestId('exhibition-image-frame')).toHaveAttribute('data-state', 'ready')
        await page.waitForTimeout(1_050)
        const jumped = await read(page)
        await jump(`${label} from ${other.slug}`)
        expect(close(jumped.photo, placed.photo) && close(jumped.caption, placed.caption), `${label}: jump differs from the walk`).toBe(true)

        // Bounds: T, the 16px gap, B and an unclipped caption.
        expect(placed.photo.y, `${label}: photo above T`).toBeGreaterThanOrEqual(placed.top - 1)
        expect(Math.abs(placed.place.y - placed.photo.bottom - 16), `${label}: photo-to-place gap`).toBeLessThanOrEqual(1)
        expect(placed.caption.bottom, `${label}: caption below B`).toBeLessThanOrEqual(placed.bottom + 1)
        expect(placed.clipped || placed.caption.bottom > placed.viewportHeight, `${label}: caption clipped`).toBe(false)
        if (frame.landscape) {
          const rise = Math.max(0, works.bottom + 16 + placed.caption.h - placed.bottom)
          if (rise === 0) expect(close(placed.photo, works), `${label}: a caption that fits keeps the Works frame`).toBe(true)
          else if (works.y - rise >= placed.top) {
            expect(Math.abs(placed.photo.y - (works.y - rise)), `${label}: rises by exactly the overflow`).toBeLessThanOrEqual(1)
            expect(Math.abs(placed.photo.w - works.w), `${label}: keeps the Works width while rising`).toBeLessThanOrEqual(1)
          } else expect(Math.abs(placed.photo.y - placed.top), `${label}: a reduced photo sits at T`).toBeLessThanOrEqual(1)
        }
      }

      // (c) The Index panel opens frame 1 from the previous series' last frame.
      const previous = exhibition[(slugs.indexOf(slug) + slugs.length - 1) % slugs.length]
      const previousTotal = previous.photos.filter(photo => !('hidden' in photo && photo.hidden)).length
      await page.goto(`/photography#travels/${previous.slug}/${previousTotal}`)
      await settle(page, previous.title, previousTotal, previousTotal)
      await page.getByRole('button', { name: 'Index', exact: true }).click()
      await page.getByRole('dialog', { name: 'Index', exact: true }).getByRole('tabpanel').getByRole('button', { name: `${title} ${total}`, exact: true }).click()
      await settle(page, title, 1, total)
      await page.waitForTimeout(1_300)
      const indexed = await read(page)
      expect(close(indexed.photo, walked[0].photo) && close(indexed.caption, walked[0].caption), `${viewport.name} ${slug}/1: Index differs from the walk`).toBe(true)
      await context.close()
    })
  }
}
