import { test, expect } from '@playwright/test';

test.describe('LLM Router Landing', () => {
  test('should load landing page with hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText(/86개/);
  });

  test('should show feature cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=통합 API')).toBeVisible();
    await expect(page.locator('text=최적 비용')).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=모델')).toBeVisible();
    await expect(page.locator('text=문서')).toBeVisible();
  });
});
