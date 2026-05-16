import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'local',
      testMatch: ['**/*.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
      webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        stdout: 'ignore',
        stderr: 'pipe',
        timeout: 30_000,
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
