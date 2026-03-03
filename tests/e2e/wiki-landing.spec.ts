import { test, expect } from '@playwright/test';

test.describe('Wiki Landing Page', () => {
  test('should load portfolio landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText(/포트폴리오/);
  });

  test('should display all project cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Admin 관리자 패널')).toBeVisible();
    await expect(page.locator('text=User 사용자 앱')).toBeVisible();
    await expect(page.locator('text=HMG 소개 사이트')).toBeVisible();
  });

  test('should have working external links', async ({ page }) => {
    await page.goto('/');
    const adminLink = page.locator('a[href="https://hchat-admin.vercel.app"]');
    await expect(adminLink).toBeVisible();
  });
});
