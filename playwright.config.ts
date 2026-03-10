import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    // --- Chromium (default) ---
    {
      name: 'admin',
      use: { baseURL: 'https://hchat-admin.vercel.app' },
      testMatch: /admin.*\.spec\.ts/,
    },
    {
      name: 'hmg',
      use: { baseURL: 'https://hchat-hmg.vercel.app' },
      testMatch: /hmg.*\.spec\.ts/,
    },
    {
      name: 'dark-mode',
      use: { baseURL: 'https://hchat-admin.vercel.app' },
      testMatch: /dark-mode.*\.spec\.ts/,
    },
    {
      name: 'user',
      use: { baseURL: 'https://hchat-user.vercel.app' },
      testMatch: /user.*\.spec\.ts/,
    },
    {
      name: 'llm-router',
      use: { baseURL: 'https://hchat-llm-router.vercel.app' },
      testMatch: /llm-router.*\.spec\.ts/,
    },
    {
      name: 'wiki',
      use: { baseURL: 'https://sgtlim0.github.io' },
      testMatch: /wiki.*\.spec\.ts/,
    },

    // --- Cross-browser: Firefox ---
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /cross-browser\.spec\.ts/,
    },

    // --- Cross-browser: WebKit (Safari) ---
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: /cross-browser\.spec\.ts/,
    },

    // --- Cross-browser: Mobile Chrome ---
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /cross-browser\.spec\.ts/,
    },

    // --- Cross-browser: Mobile Safari ---
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
      testMatch: /cross-browser\.spec\.ts/,
    },
  ],
})
