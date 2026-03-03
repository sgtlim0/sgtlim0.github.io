import { test, expect } from '@playwright/test';

test.describe('LLM Router Models', () => {
  test('should load models page with table', async ({ page }) => {
    await page.goto('/models');
    await expect(page.locator('h1')).toContainText(/모델/);
    // Table should be visible
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('should have search and filter controls', async ({ page }) => {
    await page.goto('/models');
    await expect(page.locator('input[type="text"], input[placeholder]').first()).toBeVisible();
  });
});
