import { test, expect } from '@playwright/test'

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`Index and Thumbs animate consistently with system motion ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion })
    await page.goto('/photography')
    await expect(page.getByTestId('exhibition-image')).toBeVisible()

    for (const name of ['Index', 'Thumbs']) {
      const trigger = page.getByRole('button', { name, exact: true })
      await trigger.click()
      const panel = page.getByTestId('exhibition-panel')
      await expect(panel).toHaveAttribute('data-state', 'open')
      const motion = await panel.evaluate(async (element, name) => {
        const animations = element.getAnimations().filter(animation =>
          animation instanceof CSSTransition
          && animation.transitionProperty === 'transform'
          && (animation.effect as KeyframeEffect).target === element,
        )
        const positions: number[] = []
        for (let frame = 0; frame < 5; frame++) {
          const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform)
          positions.push(name === 'Index' ? matrix.m41 : matrix.m42)
          await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
        }
        return {
          durations: animations.map(animation => animation.effect!.getTiming().duration),
          positions,
        }
      }, name)
      // Check actual movement between frames, not just the declared CSS duration.
      expect(motion.durations).toEqual([1000])
      expect(motion.positions[0]).toBeGreaterThan(0)
      expect(motion.positions.at(-1)!).toBeLessThan(motion.positions[0])

      await page.keyboard.press('Escape')
      await expect(panel).toHaveAttribute('data-state', 'closing')
      await expect(page.getByRole('dialog')).not.toBeVisible()
    }
  })
}
