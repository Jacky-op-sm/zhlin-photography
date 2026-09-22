import { expect, test } from '@playwright/test'
import { primaryAuditPaths } from '@/lib/site/routes'

const kib = (value: number) => value * 1024

const budgets: Record<
  string,
  {
    totalBytes: number
    javascriptBytes: number
    imageBytes: number
    requests: number
  }
> = {
  '/': {
    totalBytes: kib(710),
    javascriptBytes: kib(175),
    imageBytes: kib(500),
    requests: 42,
  },
  '/photography': {
    totalBytes: kib(2030),
    javascriptBytes: kib(190),
    imageBytes: kib(1735),
    requests: 57,
  },
  '/photography/street': {
    totalBytes: kib(350),
    javascriptBytes: kib(185),
    imageBytes: kib(122),
    requests: 42,
  },
  '/travel': {
    totalBytes: kib(920),
    javascriptBytes: kib(175),
    imageBytes: kib(720),
    requests: 48,
  },
  '/hobby': {
    totalBytes: kib(220),
    javascriptBytes: kib(175),
    imageBytes: kib(32),
    requests: 30,
  },
  '/contact': {
    totalBytes: kib(220),
    javascriptBytes: kib(175),
    imageBytes: kib(32),
    requests: 30,
  },
}

test.describe('production runtime budgets', () => {
  for (const route of primaryAuditPaths) {
    test(`${route} stays within runtime budgets`, async ({ page }) => {
      await page.addInitScript(() => {
        const metrics = { cls: 0 }
        Object.assign(window, { __zhlinPerformanceMetrics: metrics })

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const shift = entry as PerformanceEntry & {
              value: number
              hadRecentInput: boolean
            }
            if (!shift.hadRecentInput) metrics.cls += shift.value
          }
        }).observe({ type: 'layout-shift', buffered: true })
      })

      await page.goto(route)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(300)

      const metrics = await page.evaluate(() => {
        const resources = performance.getEntriesByType(
          'resource',
        ) as PerformanceResourceTiming[]
        const longTasks = performance.getEntriesByType('longtask')
        const totalBytes = resources.reduce(
          (total, entry) => total + entry.transferSize,
          0,
        )
        const javascriptBytes = resources
          .filter(
            (entry) =>
              entry.initiatorType === 'script' ||
              /\.js(?:\?|$)/.test(entry.name),
          )
          .reduce((total, entry) => total + entry.transferSize, 0)
        const imageBytes = resources
          .filter(
            (entry) =>
              entry.initiatorType === 'img' ||
              /\/_next\/image(?:\?|$)/.test(entry.name),
          )
          .reduce((total, entry) => total + entry.transferSize, 0)
        const totalBlockingTime = longTasks.reduce(
          (total, entry) => total + Math.max(0, entry.duration - 50),
          0,
        )
        const cls =
          (
            window as typeof window & {
              __zhlinPerformanceMetrics?: { cls: number }
            }
          ).__zhlinPerformanceMetrics?.cls ?? 0

        return {
          cls,
          totalBlockingTime,
          totalBytes,
          javascriptBytes,
          imageBytes,
          requests: resources.length,
        }
      })

      console.log(`[runtime-budget] ${route} ${JSON.stringify(metrics)}`)
      const budget = budgets[route]
      expect(metrics.cls).toBeLessThanOrEqual(0.1)
      expect(metrics.totalBlockingTime).toBeLessThanOrEqual(350)
      expect(metrics.totalBytes).toBeLessThanOrEqual(budget.totalBytes)
      expect(metrics.javascriptBytes).toBeLessThanOrEqual(
        budget.javascriptBytes,
      )
      expect(metrics.imageBytes).toBeLessThanOrEqual(budget.imageBytes)
      expect(metrics.requests).toBeLessThanOrEqual(budget.requests)
    })
  }
})
