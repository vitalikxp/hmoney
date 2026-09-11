import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },

  webServer: {
    command: 'pnpm run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 30_000,
  },

  projects: [
    {
      name: 'local',
      testMatch: ['**/*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:5173',
      },
    },
    {
      name: 'production',
      testIgnore: ['**/accounts.spec.ts', '**/envelopes.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://money.vitalik.dev',
      },
    },
  ],
})
