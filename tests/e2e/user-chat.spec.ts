import { test, expect } from '@playwright/test';

test.describe('User Chat Page', () => {
  test('should load chat page with hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('업무 비서');
    // Verify assistant grid is visible
    await expect(page.locator('text=공식 비서')).toBeVisible();
  });

  test('should display assistant cards', async ({ page }) => {
    await page.goto('/');
    // Check at least one assistant card exists
    await expect(page.locator('text=신중한 톡정이')).toBeVisible();
  });

  test('should have working search bar', async ({ page }) => {
    await page.goto('/');
    const searchBar = page.locator('textarea, input[type="text"]').first();
    await expect(searchBar).toBeVisible();
  });
});
