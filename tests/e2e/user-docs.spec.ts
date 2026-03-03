import { test, expect } from '@playwright/test';

test.describe('User Docs Page', () => {
  test('should load docs page', async ({ page }) => {
    await page.goto('/docs');
    await expect(page.locator('h1, h2').first()).toContainText(/문서/);
  });
});
