import { test, expect } from '@playwright/test';

test.describe('Dark Mode Toggle', () => {
  test('should toggle dark mode and update html class', async ({ page }) => {
    // Visit Admin page
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find ThemeToggle button (aria-label containing "모드")
    const themeToggle = page.locator('button[aria-label*="모드"]').first();
    await expect(themeToggle).toBeVisible();

    // Get initial theme state
    const htmlElement = page.locator('html');
    const initialHasLight = await htmlElement.evaluate((el) =>
      el.classList.contains('light')
    );
    const initialHasDark = await htmlElement.evaluate((el) =>
      el.classList.contains('dark')
    );

    // Click theme toggle
    await themeToggle.click();

    // Wait a moment for theme to change
    await page.waitForTimeout(500);

    // Verify html element has class "dark" (if it was light) or "light" (if it was dark)
    if (initialHasLight || (!initialHasLight && !initialHasDark)) {
      // Should now be dark
      await expect(htmlElement).toHaveClass(/dark/);
    } else if (initialHasDark) {
      // Should now be light
      await expect(htmlElement).toHaveClass(/light/);
    }

    // Take screenshot
    await page.screenshot({ path: 'tests/e2e/screenshots/dark-mode.png', fullPage: true });

    // Toggle again to test both directions
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Verify toggle works in reverse
    if (initialHasLight || (!initialHasLight && !initialHasDark)) {
      // Should be back to light
      await expect(htmlElement).not.toHaveClass(/dark/);
    } else if (initialHasDark) {
      // Should be back to dark
      await expect(htmlElement).toHaveClass(/dark/);
    }
  });

  test('should persist theme selection on page reload', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const themeToggle = page.locator('button[aria-label*="모드"]').first();
    const htmlElement = page.locator('html');

    // Toggle to dark mode
    await themeToggle.click();
    await page.waitForTimeout(500);

    const hasDarkClass = await htmlElement.evaluate((el) =>
      el.classList.contains('dark')
    );

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify theme persisted
    if (hasDarkClass) {
      await expect(htmlElement).toHaveClass(/dark/);
    }
  });
});
