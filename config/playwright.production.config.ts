import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3100'

export default defineConfig({
  testDir: '../tests/e2e',
  outputDir: '../.cache/playwright/results',
  tsconfig: './tsconfig.json',
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: true,
  reporter: [['list'], ['html', { outputFolder: '../.cache/playwright/report', open: 'never' }]],
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
        /navigation\.desktop\.spec\.ts/,
      ],
      use: {
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'production-mobile',
      testMatch: [/(^|\/)production\.spec\.ts$/, /(?:writing-(?:stack|navigation)|photography-(?:motion|loading|smoothness|focus))\.production\.spec\.ts$/, /navigation\.mobile\.spec\.ts$/],
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'production-webkit',
      testMatch: /(?:writing-(?:stack|navigation)|photography-(?:motion|loading|smoothness|focus))\.production\.spec\.ts$/,
      use: {
        ...devices['Desktop Safari'],
        browserName: 'webkit',
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'production-iphone-webkit',
      testMatch: /(?:writing-(?:stack|navigation)|photography-(?:motion|loading|smoothness|focus))\.production\.spec\.ts$/,
      use: {
        ...devices['iPhone 12'],
        browserName: 'webkit',
      },
    },
    {
      name: 'production-ipad-webkit',
      testMatch: /(?:writing-(?:stack|navigation)|photography-(?:motion|loading|smoothness|focus))\.production\.spec\.ts$/,
      use: {
        ...devices['iPad Pro 11'],
        browserName: 'webkit',
      },
    },
  ],
  webServer: {
    cwd: '..',
    command: 'node node_modules/next/dist/bin/next start --port 3100',
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: true,
  },
})
