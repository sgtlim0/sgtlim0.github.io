import { test, expect } from '@playwright/test';

test.describe('User My Page', () => {
  test('should load my page with subscription info', async ({ page }) => {
    await page.goto('/my-page');
    await expect(page.locator('text=마이페이지')).toBeVisible();
  });

  test('should display usage table', async ({ page }) => {
    await page.goto('/my-page');
    await expect(page.locator('table, [role="table"]').first()).toBeVisible();
  });
});
