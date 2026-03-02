import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    headless: true,
    screenshot: 'only-on-failure',
  },
  projects: [
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
  ],
});
