import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3100'

export default defineConfig({
  testDir: './e2e',
  testIgnore: /production\.spec\.ts/,
  timeout: 45_000,
  expect: {
    timeout: 8_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL,
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'mobile-390',
      testMatch: /(?:\.mobile|mobile-menu-animation|responsive-adaptation)\.spec\.ts/,
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'mobile-375',
      testMatch: /(?:\.mobile|mobile-menu-animation|responsive-adaptation)\.spec\.ts/,
      use: {
        ...devices['iPhone SE'],
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: 'ipad-portrait',
      testMatch: /responsive-adaptation\.spec\.ts/,
      use: {
        ...devices['iPad (gen 7)'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'ipad-landscape',
      testMatch: /responsive-adaptation\.spec\.ts/,
      use: {
        ...devices['iPad (gen 7) landscape'],
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'ipad-pro-12-9-portrait',
      testMatch: /responsive-adaptation\.spec\.ts/,
      use: {
        ...devices['iPad Pro 11'],
        viewport: { width: 1024, height: 1366 },
      },
    },
    {
      name: 'ipad-pro-12-9-landscape',
      testMatch: /responsive-adaptation\.spec\.ts/,
      use: {
        ...devices['iPad Pro 11 landscape'],
        viewport: { width: 1366, height: 1024 },
      },
    },
    {
      name: 'desktop-1280',
      testMatch: /desktop-regression\.spec\.ts/,
      use: {
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: 'node node_modules/next/dist/bin/next dev --port 3100',
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: true,
  },
})
