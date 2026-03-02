import { test, expect } from '@playwright/test';

test.describe('Admin ROI Dashboard', () => {
  test('should load sample data and display KPI cards', async ({ page }) => {
    // Visit /roi/upload page
    await page.goto('/roi/upload');

    // Click "샘플 데이터 적재" button
    await page.click('button:has-text("샘플 데이터 적재")');

    // Wait for data to load (10,433 records)
    // Look for success message or record count
    await page.waitForSelector('text=/10,?433/', { timeout: 15000 });

    // Navigate to /roi/overview
    await page.goto('/roi/overview');

    // Verify KPI cards are rendered
    // Check for text like "절감" or "ROI"
    await expect(page.locator('text=/절감|ROI/i')).toBeVisible();

    // Verify multiple KPI cards exist
    const kpiCards = page.locator('[class*="stat"], [class*="card"], [class*="kpi"]');
    await expect(kpiCards.first()).toBeVisible();

    // Wait for page to be stable
    await page.waitForLoadState('networkidle');
  });

  test('should navigate between ROI pages', async ({ page }) => {
    // Visit ROI overview
    await page.goto('/roi/overview');
    await expect(page).toHaveURL(/\/roi\/overview/);

    // Navigate to upload page
    await page.goto('/roi/upload');
    await expect(page).toHaveURL(/\/roi\/upload/);

    // Verify upload page elements exist
    await expect(page.locator('button:has-text("샘플 데이터 적재")')).toBeVisible();
  });
});
