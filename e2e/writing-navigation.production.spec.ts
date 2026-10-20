import { test, expect } from '@playwright/test'

type ErrorWindow = Window & { writingNavigationErrors: string[] }

for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
  test(`Writing opens a fresh document from the ${viewport.width}px navigation`, async ({ page }) => {
    await page.setViewportSize(viewport)
    // Scope errors to the loaded document. WebKit can report cancelled homepage
    // prefetches while that document is being replaced by the article.
    await page.addInitScript(() => {
      const errors = ((window as unknown as ErrorWindow).writingNavigationErrors = [])
      window.addEventListener('error', event => errors.push(event.message))
      window.addEventListener('unhandledrejection', event => errors.push(String(event.reason)))
    })
    // An unavailable/stale router response must not prevent opening Writing.
    const writingRouterRequests: string[] = []
    await page.route('**/writing?*', async route => {
      if (route.request().headers().rsc === '1') {
        writingRouterRequests.push(route.request().url())
        await route.abort()
      } else {
        await route.continue()
      }
    })

    await page.goto('/')
    if (viewport.width < 768) {
      await page.getByRole('button', { name: '打开菜单' }).click()
      await expect(page.getByRole('dialog', { name: '移动导航' })).toBeVisible()
    }
    const navigation = page.locator(viewport.width < 768 ? '.site-nav-mobile' : '.site-nav-desktop')
    const writing = navigation.getByRole('link', { name: 'Writing', exact: true })
    await expect(writing).toHaveAttribute('href', '/writing')
    const documentRequest = page.waitForRequest(request =>
      request.isNavigationRequest() && new URL(request.url()).pathname === '/writing',
    )
    await writing.click()
    await documentRequest
    await expect(page).toHaveURL(/\/writing\/[^/?#]+$/)
    await expect(page.locator('article h1')).toBeVisible()
    await expect(page.locator('#writing-archive')).toBeAttached()
    await expect(page.locator('html#__next_error__')).toHaveCount(0)
    expect(writingRouterRequests).toEqual([])
    expect(await page.evaluate(() => (window as unknown as ErrorWindow).writingNavigationErrors)).toEqual([])
  })
}

test('an article navigation reloads when the server belongs to another deployment', async ({ page }) => {
  const response = await page.goto('/writing')
  const deploymentId = (await response!.text()).match(/data-dpl-id="([^"]+)"/)?.[1]
  test.skip(!deploymentId, 'Build with a deployment ID to exercise version skew protection.')

  const article = page.locator('.writing-featured .writing-entry').first()
  const href = (await article.getAttribute('href'))!
  let mismatchedResponse = false
  await page.route(`**${href}?*`, async route => {
    if (route.request().headers().rsc === '1') {
      const response = await route.fetch()
      mismatchedResponse = true
      await route.fulfill({
        response,
        headers: { ...response.headers(), 'x-nextjs-deployment-id': `${deploymentId}-next` },
      })
    } else {
      await route.continue()
    }
  })

  const documentRequest = page.waitForRequest(request =>
    request.isNavigationRequest() && new URL(request.url()).pathname === href,
  )
  await article.click()
  await documentRequest
  await expect(page).toHaveURL(new RegExp(`${href}$`))
  await expect(page.locator('article h1')).toBeVisible()
  await expect(page.locator('html#__next_error__')).toHaveCount(0)
  expect(mismatchedResponse).toBe(true)
})
