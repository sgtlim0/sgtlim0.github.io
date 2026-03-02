import { test, expect } from '@playwright/test';

test.describe('HMG Navigation', () => {
  test('should navigate through all HMG pages', async ({ page }) => {
    // Visit HMG home page
    await page.goto('/');

    // Verify page title
    await expect(page).toHaveTitle(/H Chat|HMG/i);

    // Test menu items
    const menuItems = [
      { text: '서비스 소개', url: '/' },
      { text: '사용 가이드', url: '/guide' },
      { text: '대시보드', url: '/dashboard' },
      { text: '자료실', url: '/publications' },
    ];

    for (const item of menuItems) {
      // Click menu item
      const menuLink = page.locator(`a:has-text("${item.text}")`).first();

      if (await menuLink.isVisible()) {
        await menuLink.click();

        // Wait for navigation
        await page.waitForURL(`**${item.url}`, { timeout: 10000 });

        // Verify URL changes
        expect(page.url()).toContain(item.url);

        // Wait for page to be stable
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should display main content on home page', async ({ page }) => {
    await page.goto('/');

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Verify main sections are visible
    const mainContent = page.locator('main, [role="main"], article');
    await expect(mainContent.first()).toBeVisible();
  });
});
