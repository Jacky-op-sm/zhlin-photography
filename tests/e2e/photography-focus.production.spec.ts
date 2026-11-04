import { expect, test, type Page } from '@playwright/test'

async function openPhotograph(page: Page) {
  await page.goto('/photography#street/z52-8331')
  await expect(page.getByTestId('exhibition-image')).toHaveAttribute('data-photo-id', 'z52-8331')
  await expect(page.getByTestId('exhibition-image-frame')).toHaveAttribute('data-state', 'ready')
}

async function expectNoPhotoZoneOutline(page: Page) {
  await expect.poll(() => page.getByTestId('exhibition-stage').locator('button[aria-hidden="true"]').evaluateAll((zones) =>
    zones.filter((zone) => {
      const style = getComputedStyle(zone)
      return style.outlineStyle !== 'none'
        && Number.parseFloat(style.outlineWidth) > 0
        && style.outlineColor !== 'transparent'
        && style.outlineColor !== 'rgba(0, 0, 0, 0)'
    }).length,
  ), 'Invisible mouse navigation zones must not draw a viewport-height focus outline').toBe(0)
}

for (const direction of [
  { name: 'previous', x: 0.25, photoId: 'z52-8539' },
  { name: 'next', x: 0.75, photoId: 'z52-7693' },
]) {
  test(`Escape after clicking the ${direction.name} photo half does not draw a dividing line`, async ({ page }) => {
    await openPhotograph(page)
    const stage = await page.getByTestId('exhibition-stage').boundingBox()
    expect(stage).not.toBeNull()

    // A real pointer click can focus a tabindex=-1 button. Pressing Escape then
    // changes Chromium's focus-visible heuristic and used to reveal its outline.
    await page.mouse.click(stage!.x + stage!.width * direction.x, stage!.y + stage!.height / 2)
    await expect(page.getByTestId('exhibition-image')).toHaveAttribute('data-photo-id', direction.photoId)
    await expect(page.getByTestId('exhibition-image-frame')).toHaveAttribute('data-state', 'ready')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expectNoPhotoZoneOutline(page)
    await expect(page.getByTestId('exhibition-image')).toHaveAttribute('data-photo-id', direction.photoId)
  })
}

for (const panel of ['Index', 'Thumbs'] as const) {
  test(`Escape restores the already-focused ${panel} opener after mouse activation`, async ({ page }) => {
    await openPhotograph(page)
    const trigger = page.getByRole('button', { name: panel, exact: true })
    // WebKit does not focus buttons on a pointer click. Establish the modal's
    // actual restoration contract explicitly: return to the previous focus.
    await trigger.focus()
    await expect(trigger).toBeFocused()
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: panel === 'Index' ? 'Index' : /Thumbs/ })
    await expect(dialog).toBeVisible()
    await expect(page.getByTestId('exhibition-panel')).toHaveAttribute('data-state', 'open')

    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await expect(trigger).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('#site-root')).not.toHaveAttribute('aria-hidden', 'true')
    await expect.poll(() => page.locator('#site-root').evaluate((root: HTMLElement) => root.inert)).toBe(false)
    await expectNoPhotoZoneOutline(page)
    await expect(page.getByTestId('exhibition-image')).toHaveAttribute('data-photo-id', 'z52-8331')
  })
}

test('exhibition controls retain visible focus when focused after keyboard input', async ({ page }) => {
  await openPhotograph(page)
  for (const name of ['Index', 'Thumbs', 'Previous photograph', 'Next photograph']) {
    const control = page.getByRole('button', { name, exact: true })
    // Safari's default Tab policy can skip buttons. Exercise keyboard modality
    // and each real control's focus styling without imposing Chromium's order.
    await page.keyboard.press('Tab')
    await control.focus()
    await expect(control).toBeFocused()
    await expect.poll(() => control.evaluate((element: HTMLButtonElement) => element.tabIndex)).toBe(0)
    await expect.poll(() => control.evaluate((element) => element.matches(':focus-visible'))).toBe(true)
    await expect(control).toHaveCSS('outline-style', 'solid')
    await expect(control).toHaveCSS('outline-width', '2px')
    const bounds = await control.boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.width).toBeGreaterThan(20)
    expect(bounds!.height).toBeGreaterThanOrEqual(44)
    await expectNoPhotoZoneOutline(page)
  }
})
