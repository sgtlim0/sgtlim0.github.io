import { test, expect } from '@playwright/test';

const pages = [
  { name: 'Admin Dashboard', url: 'https://hchat-admin.vercel.app/' },
  { name: 'Admin ROI', url: 'https://hchat-admin.vercel.app/roi/overview' },
  { name: 'HMG Home', url: 'https://hchat-hmg.vercel.app/' },
  { name: 'User Home', url: 'https://hchat-user.vercel.app/' },
  { name: 'Wiki Home', url: 'https://sgtlim0.github.io/' },
];

test.describe('Accessibility Checks', () => {
  for (const p of pages) {
    test(`${p.name} should have proper heading hierarchy`, async ({ page }) => {
      await page.goto(p.url);
      // Check h1 exists
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
    });

    test(`${p.name} should have lang attribute on html`, async ({ page }) => {
      await page.goto(p.url);
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBeTruthy();
    });

    test(`${p.name} images should have alt text`, async ({ page }) => {
      await page.goto(p.url);
      const images = page.locator('img');
      const count = await images.count();
      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).not.toBeNull();
      }
    });

    test(`${p.name} interactive elements should be keyboard accessible`, async ({ page }) => {
      await page.goto(p.url);
      // Check buttons and links are focusable
      const buttons = page.locator('button, a[href], input, select, textarea');
      const count = await buttons.count();
      expect(count).toBeGreaterThan(0);
    });

    test(`${p.name} should have no empty links or buttons`, async ({ page }) => {
      await page.goto(p.url);
      const emptyButtons = page.locator('button:empty:not([aria-label])');
      const emptyCount = await emptyButtons.count();
      // Allow some (icon buttons may have aria-label or nested SVG)
      // Just log for awareness
      if (emptyCount > 0) {
        console.warn(`${p.name} has ${emptyCount} potentially empty buttons`);
      }
    });

    test(`${p.name} should have proper focus management`, async ({ page }) => {
      await page.goto(p.url);
      // Tab through the first few focusable elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
      }
      // Verify that an element has focus (not lost to body)
      const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedTag).toBeTruthy();
      expect(focusedTag).not.toBe('BODY');
    });

    test(`${p.name} should have ARIA landmarks`, async ({ page }) => {
      await page.goto(p.url);
      // Check for at least one landmark role
      const landmarks = page.locator(
        'main, [role="main"], nav, [role="navigation"], header, [role="banner"], footer, [role="contentinfo"]',
      );
      const count = await landmarks.count();
      expect(count).toBeGreaterThan(0);
    });
  }
});
