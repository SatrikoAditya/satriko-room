import { defineConfig, devices } from '@playwright/test'

const softwareGl = [
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
]

// Set PLAYWRIGHT_BASE_URL to run the suite against a deployment instead of a local server.
const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  // Software WebGL is CPU-bound; too many parallel scenes starve animation frames.
  workers: 2,
  use: {
    baseURL: externalBaseUrl ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  ...(externalBaseUrl
    ? {}
    : {
        webServer: {
          command: 'yarn build && yarn start',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
        },
      }),
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        launchOptions: { args: softwareGl },
      },
      testIgnore: /mobile|no-webgl/,
    },
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 7'],
        launchOptions: { args: softwareGl },
      },
      testMatch: /mobile|direct-links|a11y|zoom/,
    },
    {
      name: 'no-webgl',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: ['--disable-3d-apis'] },
      },
      testMatch: /no-webgl/,
    },
    {
      name: 'reduced-motion',
      use: {
        ...devices['Desktop Chrome'],
        contextOptions: { reducedMotion: 'reduce' },
        launchOptions: { args: softwareGl },
      },
      testMatch: /navigation|oyen/,
    },
  ],
})
