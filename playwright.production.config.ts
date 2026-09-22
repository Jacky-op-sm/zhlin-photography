import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3100'

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'production-desktop',
      testMatch: [
        /production\.spec\.ts/,
        /runtime-budget\.production\.spec\.ts/,
        /visual-audit\.production\.spec\.ts/,
      ],
      use: {
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'production-mobile',
      testMatch: /(^|\/)production\.spec\.ts$/,
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: {
    command: 'node node_modules/next/dist/bin/next start --port 3100',
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: true,
  },
})
