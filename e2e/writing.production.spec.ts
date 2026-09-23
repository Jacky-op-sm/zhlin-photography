import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import fs from 'node:fs'
import { featuredWritingSlugs } from '../src/lib/content/writing-featured'
import { defaultFilters, filterWriting, type WritingEntry } from '../src/lib/content/writing-model'

const published = JSON.parse(fs.readFileSync('.generated/writing.json', 'utf8')).entries as WritingEntry[]
const featuredSlugs = new Set<string>(featuredWritingSlugs)
const featuredByTitleLength = featuredWritingSlugs
  .map(slug => published.find(entry => entry.slug === slug)!)
  .sort((a, b) => [...a.title].length - [...b.title].length)
const chronicle = filterWriting(published.filter(entry => !featuredSlugs.has(entry.slug)), defaultFilters)
const hidden = [
  'camera-models',
  'a-birds-death-an-insects-dinner',
  'let-reading-questions-live-longer',
  'the-mask-falls-away',
  'an-afternoon-by-the-lake',
]

test('featured writing precedes the chronological archive, with a clean footer', async ({ page }) => {
  await page.goto('/writing')
  await expect(page.locator('.writing-featured h2')).toHaveText('精选')
  expect(await page.locator('.writing-featured .writing-entry').evaluateAll(links => links.map(link => link.getAttribute('href'))))
    .toEqual(featuredByTitleLength.map(entry => `/writing/${entry.slug}`))
  await expect(page.locator('.writing-featured .writing-entry-number')).toHaveText(['1', '2', '3', '4', '5', '6'])
  await expect(page.locator('.writing-featured time')).toHaveCount(0)
  expect(await page.locator('.writing-month:not(.writing-featured) .writing-entry-title').allTextContents())
    .toEqual(chronicle.map(entry => entry.title))
  await expect(page.locator('.writing-month[data-month="2026-09"] .writing-month-heading')).toHaveText('2026九月')
  await expect(page.locator('.writing-month[data-year="2025"] .writing-month-heading')).toHaveText('2025')
  await expect(page.locator('.writing-entry-tag, .writing-filter-disclosure, .writing-result, .writing-footer')).toHaveCount(0)
  for (const slug of hidden) await expect(page.locator(`.writing-entry[href="/writing/${slug}"]`)).toHaveCount(0)
})

test('hidden pieces have no public route or sitemap entry; articles repeat the directory', async ({ page, request }) => {
  for (const slug of hidden) expect((await request.get(`/writing/${slug}`)).status()).toBe(404)
  const sitemap = await (await request.get('/sitemap.xml')).text()
  for (const slug of hidden) expect(sitemap).not.toContain(`/writing/${slug}`)
  for (const slug of featuredWritingSlugs) expect(sitemap).toContain(`/writing/${slug}`)
  await page.goto(`/writing/${featuredWritingSlugs[0]}`)
  await expect(page.locator('article h1')).toHaveText('台风小记')
  await expect(page.locator('.writing-entry')).toHaveCount(published.length)
  await expect(page.locator('.writing-entry[aria-current="page"]')).toHaveCount(1)
  await expect(page.locator('.writing-footer, .writing-filter-disclosure')).toHaveCount(0)
  await expect(page.getByRole('link', { name: '↓ 文章目录' })).toHaveAttribute('href', '#writing-archive')
})

test('the writing URL and homepage link open the latest public article above its archive', async ({ page }) => {
  const latest = filterWriting(published, defaultFilters)[0]
  await page.goto('/writing')
  await expect(page).toHaveURL(new RegExp(`/writing/${latest.slug}$`))
  await expect(page.locator('article h1')).toHaveText(latest.title)
  await expect(page.locator('.writing-prose')).toContainText(latest.body.trim().slice(0, 30))
  await expect(page.locator('#writing-archive .writing-entry')).toHaveCount(published.length)
  expect(await page.locator('article').evaluate(article => Boolean(article.compareDocumentPosition(document.querySelector('#writing-archive')) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true)
  await page.goto('/')
  const writingLink = page.locator('.site-nav-desktop a', { hasText: 'Writing' })
  await expect(writingLink).toHaveAttribute('href', '/writing')
  await writingLink.click()
  await expect(page).toHaveURL(new RegExp(`/writing/${latest.slug}$`))
  await expect(page.locator('article h1')).toHaveText(latest.title)
})

test('archive works without JavaScript and fits mobile and desktop', async ({ browser, page }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const noJsPage = await context.newPage()
  await noJsPage.goto('/writing')
  await expect(noJsPage.locator('.writing-entry')).toHaveCount(published.length)
  await context.close()

  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/writing')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(page.locator('.site-header')).toBeHidden()
    await expect(page.locator('.site-footer')).toBeHidden()
    const year = await page.locator('.writing-month[data-month="2026-09"] .writing-month-heading span').first().boundingBox()
    const month = await page.locator('.writing-month[data-month="2026-09"] .writing-month-heading span').last().boundingBox()
    expect(year!.y).toBe(month!.y)
  }
  expect((await new AxeBuilder({ page }).include('.writing').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([])
})
