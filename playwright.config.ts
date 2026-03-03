import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 720 },
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
    {
      name: 'user',
      use: { baseURL: 'https://hchat-user.vercel.app' },
      testMatch: /user.*\.spec\.ts/,
    },
    {
      name: 'llm-router',
      use: { baseURL: 'http://localhost:3004' },
      testMatch: /llm-router.*\.spec\.ts/,
    },
    {
      name: 'wiki',
      use: { baseURL: 'https://sgtlim0.github.io' },
      testMatch: /wiki.*\.spec\.ts/,
    },
  ],
});
