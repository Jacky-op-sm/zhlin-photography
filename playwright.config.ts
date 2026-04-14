import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3100'

export default defineConfig({
  testDir: './e2e',
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
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'mobile-390',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'mobile-375',
      use: {
        ...devices['iPhone SE'],
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: 'ipad-portrait',
      use: {
        ...devices['iPad (gen 7)'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'ipad-landscape',
      use: {
        ...devices['iPad (gen 7) landscape'],
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'ipad-pro-12-9-portrait',
      use: {
        ...devices['iPad Pro 11'],
        viewport: { width: 1024, height: 1366 },
      },
    },
    {
      name: 'ipad-pro-12-9-landscape',
      use: {
        ...devices['iPad Pro 11 landscape'],
        viewport: { width: 1366, height: 1024 },
      },
    },
    {
      name: 'desktop-1280',
      use: {
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 3100',
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: false,
  },
})
