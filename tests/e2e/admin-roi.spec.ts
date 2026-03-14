import { test, expect } from '@playwright/test'

test.describe('Admin ROI Dashboard', () => {
  test('should load ROI overview page', async ({ page }) => {
    await page.goto('/roi/overview')
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/roi\/overview/)
  })

  test('should navigate between ROI pages', async ({ page }) => {
    await page.goto('/roi/overview')
    await expect(page).toHaveURL(/\/roi\/overview/)

    await page.goto('/roi/upload')
    await expect(page).toHaveURL(/\/roi\/upload/)
    await page.waitForLoadState('domcontentloaded')
  })
})
