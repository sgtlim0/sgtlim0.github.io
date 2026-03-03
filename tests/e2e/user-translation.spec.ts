import { test, expect } from '@playwright/test';

test.describe('User Translation Page', () => {
  test('should load translation page', async ({ page }) => {
    await page.goto('/translate');
    await expect(page.locator('h1, h2').first()).toContainText(/번역/);
  });

  test('should have engine selector', async ({ page }) => {
    await page.goto('/translate');
    await expect(page.locator('text=내부 번역')).toBeVisible();
  });

  test('should have file upload zone', async ({ page }) => {
    await page.goto('/translate');
    await expect(page.locator('text=파일')).toBeVisible();
  });
});
