import { test, expect } from '@playwright/test'

test.describe('User OCR Page', () => {
  test('should load OCR page', async ({ page }) => {
    await page.goto('/ocr')
    await expect(page.locator('h1, h2').first()).toContainText(/OCR/)
  })

  test('should have file upload zone', async ({ page }) => {
    await page.goto('/ocr')
    await page.waitForLoadState('domcontentloaded')
    await expect(
      page.locator('[class*="upload"], [class*="drop"], input[type="file"]').first(),
    ).toBeVisible()
  })
})
