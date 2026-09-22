import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { primaryAuditPaths } from '@/lib/site/routes'

test.describe('production route contract', () => {
  for (const route of primaryAuditPaths) {
    test(`${route} has valid metadata, landmarks, and accessibility`, async ({
      page,
    }) => {
      const response = await page.goto(route)
      expect(response?.status()).toBe(200)
      await page.waitForLoadState('networkidle')

      expect(await page.title()).not.toBe('')
      await expect(page.locator('main')).toHaveCount(1)

      const canonical = page.locator('link[rel="canonical"]')
      await expect(canonical).toHaveCount(1)
      await expect(canonical).toHaveAttribute('href', /^https:\/\/www\.zhlin\.space/)

      const ogImage = page.locator('meta[property="og:image"]')
      await expect(ogImage).toHaveCount(1)
      await expect(ogImage).toHaveAttribute('content', /^https:\/\/www\.zhlin\.space/)

      const results = await new AxeBuilder({ page }).analyze()
      const seriousViolations = results.violations.filter((violation) =>
        violation.impact === 'serious' || violation.impact === 'critical',
      )
      expect(
        seriousViolations,
        seriousViolations
          .map((violation) => `${violation.id}: ${violation.help}`)
          .join('\n'),
      ).toEqual([])
    })
  }

  test('sitemap, robots, and deployment revision are exposed', async ({
    page,
    request,
  }) => {
    await page.goto('/')
    const revision = await request.get('/api/version')
    expect(revision.status()).toBe(200)
    const revisionBody = await revision.json()
    expect(revisionBody.revision).toBeTruthy()
    await expect(page.locator('meta[name="build-revision"]')).toHaveAttribute(
      'content',
      revisionBody.revision,
    )

    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.status()).toBe(200)
    const sitemapText = await sitemap.text()
    for (const route of [
      '/photography/street',
      '/travel/japan',
      '/hobby',
      '/contact',
    ]) {
      expect(sitemapText).toContain(`https://www.zhlin.space${route}`)
    }
    expect(sitemapText).not.toContain('localhost')

    const robots = await request.get('/robots.txt')
    expect(robots.status()).toBe(200)
    expect(await robots.text()).toContain(
      'Sitemap: https://www.zhlin.space/sitemap.xml',
    )
  })
})

test.describe('contact API contract', () => {
  test('rejects malformed and untrusted submissions safely', async ({
    request,
  }) => {
    const missing = await request.post('/api/contact', { data: {} })
    expect(missing.status()).toBe(422)

    const invalidOrigin = await request.post('/api/contact', {
      headers: { Origin: 'https://malicious.example' },
      data: { website: 'bot' },
    })
    expect(invalidOrigin.status()).toBe(403)

    const honeypot = await request.post('/api/contact', {
      data: { website: 'filled-by-bot' },
    })
    expect(honeypot.status()).toBe(200)
    expect(await honeypot.json()).toEqual({ ok: true })

    const oversized = await request.post('/api/contact', {
      data: {
        firstName: 'A',
        lastName: 'B',
        email: 'a@example.com',
        type: '评论',
        message: 'x'.repeat(33 * 1024),
        website: '',
      },
    })
    expect(oversized.status()).toBe(413)
  })

  test('fails closed when production rate limiting is not configured', async ({
    request,
  }) => {
    const response = await request.post('/api/contact', {
      data: {
        firstName: 'Lin',
        lastName: 'Zhihao',
        email: 'lin@example.com',
        type: '评论',
        message: '<img src=x onerror=alert(1)>',
        website: '',
      },
    })
    expect(response.status()).toBe(503)
    const body = await response.json()
    expect(body.code).toBe('service_unavailable')
    expect(JSON.stringify(body)).not.toContain('UPSTASH')
    expect(JSON.stringify(body)).not.toContain('onerror')
  })
})

test.describe('production interactions', () => {
  test('mobile menu traps focus, closes on Escape, and restores focus', async ({
    page,
  }, testInfo) => {
    test.skip(!testInfo.project.name.includes('mobile'), 'mobile-only')

    await page.goto('/')
    const toggle = page.getByRole('button', { name: '打开菜单' })
    await toggle.click()
    const dialog = page.getByRole('dialog', { name: '移动导航' })
    await expect(dialog).toBeVisible()
    await expect(page.locator('#site-root')).toHaveAttribute('inert', '')

    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(toggle).toBeFocused()
    await expect(page.locator('#site-root')).not.toHaveAttribute('inert', '')
  })

  test('photo viewer and travel detail restore their trigger focus', async ({
    page,
  }) => {
    await page.goto('/photography/pets')
    const photo = page.locator('.photo-gallery-item').first()
    await photo.click()
    const viewer = page.getByRole('dialog', { name: /照片查看器/ })
    await expect(viewer).toBeVisible()
    await expect(
      page.getByRole('button', { name: '关闭照片查看器' }),
    ).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(viewer).toHaveCount(0)
    await expect(photo).toBeFocused()

    await page.goto('/travel/nanjing')
    const card = page.getByRole('button', { name: 'Open card 1', exact: true })
    await card.click()
    const detail = page.getByRole('dialog')
    await expect(detail).toBeVisible()
    await expect(page.getByRole('button', { name: '关闭详情' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(detail).toHaveCount(0)
    await expect(card).toBeFocused()
  })

  test('generated thumbnails are used by the gallery', async ({ page }) => {
    await page.goto('/photography/street')
    await page.waitForLoadState('networkidle')
    const sources = await page.locator('.photo-gallery-item img').evaluateAll(
      (images) =>
        images.map((image) => (image as HTMLImageElement).currentSrc),
    )
    expect(sources.length).toBeGreaterThan(0)
    expect(
      sources.every(
        (source) =>
          source.includes('/_next/image') &&
          source.includes('generated%2Fphotos'),
      ),
    ).toBe(true)
  })

  test('contact form shows safe failure feedback and preserves input', async ({
    page,
  }) => {
    await page.route('**/api/contact', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue()
        return
      }

      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          error: '留言服务暂不可用，请稍后重试。',
        }),
      })
    })

    await page.goto('/contact')
    await page.getByLabel('名（必填）').fill('Lin')
    await page.getByLabel('姓（必填）').fill('Zhihao')
    await page.getByLabel('邮箱（必填）').fill('lin@example.com')
    await page.getByLabel('类型（必填）').selectOption('评论')
    await page.getByLabel('留言内容（必填）').fill('请保留这段文字')

    const submit = page.getByRole('button', { name: '发送', exact: true })
    await expect(submit).toBeEnabled()
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().endsWith('/api/contact') &&
          response.request().method() === 'POST',
      ),
      submit.click(),
    ])

    const alert = page.locator('#contact-form-status')
    await expect(alert).toContainText('留言服务暂不可用')
    await expect(
      page.getByRole('link', { name: '改用邮箱发送' }),
    ).toHaveAttribute('href', /^mailto:/)
    await expect(page.getByLabel('留言内容（必填）')).toHaveValue(
      '请保留这段文字',
    )
  })
})
