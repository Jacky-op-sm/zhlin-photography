import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { writeFile } from 'node:fs/promises'

test.describe('photography exhibition', () => {
  test('Bangkok opens as a photograph and Home restores the site navigation', async ({ page }) => {
    await page.goto('/photography')
    await expect(page.getByTestId('exhibition-image')).toBeVisible()
    await expect(page.getByTestId('exhibition-position')).toContainText('Bangkok')
    await expect(page.getByTestId('exhibition-position')).toContainText(/1\s*\/\s*16/)
    await expect(page.locator('.site-header')).toHaveCount(0)
    await expect(page.locator('.site-footer')).toHaveCount(0)

    await page.getByRole('button', { name: 'Thumbs', exact: true }).click()
    const thumbs = page.getByRole('dialog', { name: /Thumbs/i })
    const photos = thumbs.getByRole('button', { name: /^View photograph / })
    await expect(photos).toHaveCount(16)
    await photos.last().click()
    await expect(page.getByTestId('exhibition-position')).toContainText(/16\s*\/\s*16/)
    await expect.poll(() => page.getByTestId('exhibition-image').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)

    await page.getByRole('button', { name: 'Index', exact: true }).click()
    const index = page.getByRole('dialog', { name: 'Index', exact: true })
    await index.getByRole('tab', { name: 'Info', exact: true }).click()
    await expect(index.getByRole('tab', { name: 'Info', exact: true })).toHaveAttribute('aria-selected', 'true')
    await index.getByRole('link', { name: 'Zhlin home', exact: true }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('.site-header')).toBeVisible()
    await expect(page.locator('.site-footer')).toBeAttached()
  })

  test('Index switches collections and Thumbs opens an exact photograph', async ({ page }) => {
    await page.goto('/photography')
    await page.getByRole('button', { name: 'Index', exact: true }).click()
    const index = page.getByRole('dialog', { name: /Index/i })
    await expect(index).toBeVisible()
    const works = index.getByRole('tab', { name: 'Works', exact: true })
    const info = index.getByRole('tab', { name: 'Info', exact: true })
    await expect(works).toHaveAttribute('aria-selected', 'true')
    await info.click()
    await expect(info).toHaveAttribute('aria-selected', 'true')
    await expect(index.getByRole('button', { name: /Street/ })).not.toBeVisible()
    await works.click()
    await expect(works).toHaveAttribute('aria-selected', 'true')
    for (const name of ['Bangkok', 'Street', 'Animals', 'Projects']) {
      await expect(index.getByRole('button', { name: new RegExp(name) })).toBeVisible()
    }
    await index.getByRole('button', { name: /Street/ }).click()
    await expect(index).not.toBeVisible()
    await expect(page.getByTestId('exhibition-position')).toContainText('Street')
    await expect(page.getByTestId('exhibition-position')).toContainText(/1\s*\/\s*7/)

    await page.getByRole('button', { name: 'Thumbs', exact: true }).click()
    const thumbs = page.getByRole('dialog', { name: /Thumbs/i })
    const photos = thumbs.getByRole('button', { name: /^View photograph / })
    await expect(photos).toHaveCount(7)
    await photos.last().click()
    await expect(thumbs).not.toBeVisible()
    await expect(page.getByTestId('exhibition-position')).toContainText(/7\s*\/\s*7/)
    await expect(page).toHaveURL(/#street\/z52-3020$/)
    await page.keyboard.press('ArrowRight')
    await expect(page).toHaveURL(/#pets\/pets-1$/)
    await expect(page.getByTestId('exhibition-position')).toContainText('Animals')
    await expect(page.getByTestId('exhibition-position')).toContainText(/1\s*\/\s*15/)
    await page.keyboard.press('ArrowLeft')
    await expect(page).toHaveURL(/#street\/z52-3020$/)
  })

  test('photo links survive reload and follow browser history', async ({ page }) => {
    await page.goto('/photography#street/z52-8539')
    await expect(page.getByTestId('exhibition-position')).toContainText(/1\s*\/\s*7/)
    await page.keyboard.press('ArrowRight')
    await expect(page).toHaveURL(/#street\/z52-8331$/)
    await expect(page.getByTestId('exhibition-position')).toContainText(/2\s*\/\s*7/)
    await page.reload()
    await expect(page.getByTestId('exhibition-position')).toContainText(/2\s*\/\s*7/)
    await page.keyboard.press('ArrowRight')
    await expect(page).toHaveURL(/#street\/z52-7693$/)
    await page.goBack()
    await expect(page).toHaveURL(/#street\/z52-8331$/)
    await expect(page.getByTestId('exhibition-position')).toContainText(/2\s*\/\s*7/)
    await page.goForward()
    await expect(page.getByTestId('exhibition-position')).toContainText(/3\s*\/\s*7/)
  })

  test('Index keeps focus inside and Escape restores the triggering button', async ({ page }) => {
    await page.goto('/photography#street/z52-8539')
    const trigger = page.getByRole('button', { name: 'Index', exact: true })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: /Index/i })
    await expect(dialog).toBeVisible()
    const initialUrl = page.url()
    await page.keyboard.press('ArrowRight')
    expect(page.url()).toBe(initialUrl)
    const works = dialog.getByRole('tab', { name: 'Works', exact: true })
    const info = dialog.getByRole('tab', { name: 'Info', exact: true })
    await works.focus()
    await expect(info).toHaveAttribute('tabindex', '-1')
    await page.keyboard.press('ArrowRight')
    await expect(info).toBeFocused()
    await expect(info).toHaveAttribute('aria-selected', 'true')
    await expect(dialog.getByRole('tabpanel', { name: 'Info', exact: true })).toBeVisible()
    await page.keyboard.press('Home')
    await expect(works).toBeFocused()
    await page.keyboard.press('End')
    await expect(info).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(works).toBeFocused()
    await expect(dialog.getByRole('tabpanel', { name: 'Works', exact: true })).toBeVisible()
    for (let index = 0; index < 8; index += 1) {
      await page.keyboard.press('Tab')
      await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
    }
    await dialog.getByRole('tab', { name: 'Info', exact: true }).click()
    await expect(dialog.getByRole('tabpanel', { name: 'Info', exact: true })).toBeVisible()
    for (const key of ['Tab', 'Shift+Tab']) {
      for (let index = 0; index < 6; index += 1) {
        await page.keyboard.press(key)
        await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
      }
    }
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('exhibition-panel')).toHaveAttribute('data-state', 'closing')
    await expect(dialog).toBeVisible()
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toBeFocused()
    await expect(page.locator('#site-root')).not.toHaveAttribute('inert')
  })

  test('desktop cursor follows the pointer, updates its label, and yields to menus', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1280', 'fine-pointer interaction')
    await page.goto('/photography#street/z52-8539')
    await expect(page.getByTestId('exhibition-position')).toContainText(/1\s*\/\s*7/)
    const cursor = page.getByTestId('exhibition-cursor')
    await page.mouse.move(420, 300)
    await expect(cursor).toHaveCSS('opacity', '1')
    await expect(cursor).toContainText(/Street\s*-\s*1\s*\/\s*7/)
    const before = await cursor.boundingBox()
    expect(before).not.toBeNull()
    await page.mouse.move(760, 440)
    await expect.poll(async () => (await cursor.boundingBox())!.x - before!.x).toBeGreaterThan(250)
    await expect.poll(async () => (await cursor.boundingBox())!.y - before!.y).toBeGreaterThan(90)
    await page.mouse.click(760, 440)
    await expect(cursor).toContainText(/Street\s*-\s*2\s*\/\s*7/)
    await page.getByRole('button', { name: 'Index', exact: true }).click()
    await expect(cursor).toHaveCSS('opacity', '0')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await page.getByRole('button', { name: 'Index', exact: true }).hover()
    await expect(cursor).toHaveCSS('opacity', '0')
    let keepMoving = true
    const movement = (async () => {
      let x = 500
      while (keepMoving) {
        await page.mouse.move(x, 350)
        x = x === 500 ? 650 : 500
        await new Promise((resolve) => setTimeout(resolve, 30))
      }
    })()
    try {
      await expect(cursor).toHaveCSS('opacity', '1')
    } finally {
      keepMoving = false
      await movement
    }
  })

  test('reduced motion removes menu movement and returns focus promptly', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1280', 'one reduced-motion browser check')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/photography')
    const index = page.getByRole('button', { name: 'Index', exact: true })
    await index.click()
    const panel = page.getByTestId('exhibition-panel')
    await expect(panel).toHaveAttribute('data-state', 'open')
    const movingElements = await panel.evaluate((element) =>
      [element, ...element.querySelectorAll('*')].filter((item) => {
        const style = getComputedStyle(item)
        return style.transitionProperty.split(',').some((property) => /transform|translate|all/.test(property.trim()))
          && style.transitionDuration.split(',').some((duration) => Number.parseFloat(duration) > 0.01)
      }).length,
    )
    expect(movingElements).toBe(0)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 500 })
    await expect(index).toBeFocused()
  })

  test('a mobile swipe advances the photograph once', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('mobile-'), 'touch interaction')
    await page.goto('/photography#street/z52-8539')
    await expect(page.getByTestId('exhibition-position')).toContainText(/1\s*\/\s*7/)
    const image = page.getByTestId('exhibition-image')
    await expect(image).toBeVisible()
    const box = await image.boundingBox()
    expect(box).not.toBeNull()
    const y = box!.y + box!.height / 2
    const startX = box!.x + box!.width * 0.85
    const endX = box!.x + box!.width * 0.15
    const touch = await page.context().newCDPSession(page)
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: startX, y }] })
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: endX, y }] })
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await touch.detach()
    await expect(page.getByTestId('exhibition-position')).toContainText(/2\s*\/\s*7/)
    await expect(page).toHaveURL(/#street\/z52-8331$/)
  })

  test('a delayed photograph cannot replace the latest rapid selection', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1280', 'one out-of-order image response check')
    let releaseImage!: () => void
    let imageRequested = false
    const imageGate = new Promise<void>((resolve) => { releaseImage = resolve })
    await page.route(/Z52_8331-large\.webp/, async (route) => {
      imageRequested = true
      await imageGate
      await route.continue()
    })
    try {
      await page.goto('/photography#street/z52-8539')
      await expect(page.getByTestId('exhibition-position')).toContainText(/1\s*\/\s*7/)
      await page.keyboard.press('ArrowRight')
      await expect(page).toHaveURL(/#street\/z52-8331$/)
      await expect.poll(() => imageRequested).toBe(true)
      await page.keyboard.press('ArrowRight')
      await expect(page).toHaveURL(/#street\/z52-7693$/)
      await expect(page.getByTestId('exhibition-position')).toContainText(/3\s*\/\s*7/)
      await expect(page.getByTestId('exhibition-image')).toHaveAttribute('src', /Z52_7693-large\.webp/)

      const lateResponse = page.waitForResponse((response) => response.url().includes('Z52_8331-large.webp'))
      releaseImage()
      const response = await lateResponse
      await response.finished()
      await page.evaluate(async (url) => {
        const lateImage = new Image()
        lateImage.src = url
        await lateImage.decode()
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      }, response.url())
      await expect(page).toHaveURL(/#street\/z52-7693$/)
      await expect(page.getByTestId('exhibition-position')).toContainText(/3\s*\/\s*7/)
      await expect(page.getByTestId('exhibition-image')).toHaveAttribute('src', /Z52_7693-large\.webp/)
    } finally {
      releaseImage()
    }
  })

  test('a failed photograph keeps the current image and can be retried', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1280', 'one failed-image recovery check')
    let failImage = true
    await page.route(/Z52_8331-large\.webp/, async (route) => {
      if (failImage) await route.fulfill({ status: 503, headers: { 'cache-control': 'no-store' }, body: 'Temporarily unavailable' })
      else await route.continue()
    })
    await page.goto('/photography#street/z52-8539')
    await expect(page.getByTestId('exhibition-position')).toContainText(/1\s*\/\s*7/)
    await page.keyboard.press('ArrowRight')
    await expect(page).toHaveURL(/#street\/z52-8331$/)
    await expect(page.getByTestId('exhibition-image-frame')).toHaveAttribute('data-state', 'error')
    await expect(page.getByRole('alert').filter({ hasText: 'This photograph could not load.' })).toBeVisible()
    await expect(page.getByTestId('exhibition-image')).toHaveAttribute('src', /Z52_8539-large\.webp/)
    await expect(page.getByTestId('exhibition-position')).toContainText(/1\s*\/\s*7/)
    failImage = false
    await page.getByRole('button', { name: 'Retry', exact: true }).click()
    await expect(page.getByTestId('exhibition-position')).toContainText(/2\s*\/\s*7/)
    await expect(page.getByTestId('exhibition-image')).toHaveAttribute('src', /Z52_8331-large\.webp/)
    await expect(page.getByTestId('exhibition-image-frame')).toHaveAttribute('data-state', 'ready')
    await expect(page.getByText('This photograph could not load.', { exact: true })).not.toBeVisible()
  })

  test('exhibition views remain accessible and render for review', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile-375', 'capture one desktop and one mobile review')
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('requestfailed', (request) => {
      const failure = request.failure()?.errorText
      if (failure !== 'net::ERR_ABORTED') errors.push(`${failure}: ${request.url()}`)
    })
    const saveView = async (view: string) => {
      await page.screenshot({
        path: `.generated/photography/refined-preview/${testInfo.project.name}-${view}.png`,
        animations: 'disabled',
      })
      if (testInfo.project.name === 'desktop-1280') {
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
        expect(result.violations).toEqual([])
      }
    }
    await page.goto('/photography')
    await expect.poll(() => page.getByTestId('exhibition-image').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)
    await expect(page.getByTestId('exhibition-image-frame')).toHaveAttribute('data-state', 'ready')
    if (testInfo.project.name === 'desktop-1280') {
      await page.mouse.move(780, 400)
      await expect(page.getByTestId('exhibition-cursor')).toHaveCSS('opacity', '1')
      await expect(page.getByTestId('exhibition-cursor')).toHaveAttribute('data-size', 'small')
    }
    await saveView('bangkok')
    await page.getByRole('button', { name: 'Index', exact: true }).click()
    await expect(page.getByRole('dialog', { name: 'Index', exact: true })).toBeVisible()
    await expect(page.getByTestId('exhibition-panel')).toHaveAttribute('data-state', 'open')
    await saveView('index-works')
    await page.getByRole('tab', { name: 'Info', exact: true }).click()
    await expect(page.getByRole('tab', { name: 'Info', exact: true })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('tabpanel', { name: 'Info', exact: true })).toBeVisible()
    await saveView('index-info')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await page.getByRole('button', { name: 'Thumbs', exact: true }).click()
    const thumbs = page.getByRole('dialog', { name: /Thumbs/ })
    await expect(thumbs.getByRole('button', { name: /^View photograph / })).toHaveCount(16)
    await expect(page.getByTestId('exhibition-panel')).toHaveAttribute('data-state', 'open')
    await expect.poll(() => thumbs.locator('img').first().evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)
    await saveView('thumbs')
    await writeFile(`.generated/photography/refined-preview/${testInfo.project.name}-diagnostics.json`, JSON.stringify({ errors }, null, 2))
    expect(errors).toEqual([])
  })
})
