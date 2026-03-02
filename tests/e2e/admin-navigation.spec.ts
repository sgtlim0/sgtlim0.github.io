import { test, expect } from '@playwright/test';

test.describe('Admin Navigation', () => {
  test('should navigate through all admin pages without errors', async ({ page }) => {
    // Visit Admin home page
    await page.goto('/');

    // Verify page title contains "H Chat"
    await expect(page).toHaveTitle(/H Chat/i);

    // Test navigation links
    const navLinks = [
      { text: '대시보드', url: '/' },
      { text: '사용내역', url: '/usage' },
      { text: '통계', url: '/statistics' },
      { text: '사용자 관리', url: '/users' },
      { text: '설정', url: '/settings' },
      { text: 'ROI 대시보드', url: '/roi' },
    ];

    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    for (const link of navLinks) {
      // Click the nav link
      await page.click(`text=${link.text}`);

      // Wait for navigation to complete
      await page.waitForURL(`**${link.url}`);

      // Verify URL changes correctly
      expect(page.url()).toContain(link.url);

      // Wait for page to be stable
      await page.waitForLoadState('networkidle');
    }

    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
  });
});
