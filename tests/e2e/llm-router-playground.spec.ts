import { test, expect } from '@playwright/test';

test.describe('LLM Router Playground', () => {
  test('should load playground page', async ({ page }) => {
    await page.goto('/playground');
    await expect(page.locator('h1')).toContainText(/Playground/);
  });

  test('should have model selector and parameter controls', async ({ page }) => {
    await page.goto('/playground');
    await expect(page.locator('select').first()).toBeVisible();
    // Temperature slider should exist
    await expect(page.locator('input[type="range"]').first()).toBeVisible();
  });
});
