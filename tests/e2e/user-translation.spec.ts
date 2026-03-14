import { test, expect } from '@playwright/test'

test.describe('User Translation Page', () => {
  test('should load translation page', async ({ page }) => {
    await page.goto('/translate')
    await expect(page.locator('h1, h2').first()).toContainText(/번역/)
  })

  test('should have engine selector', async ({ page }) => {
    await page.goto('/translate')
    await page.waitForLoadState('domcontentloaded')
    await expect(
      page.locator('select, [role="listbox"], [class*="selector"], [class*="engine"]').first(),
    ).toBeVisible()
  })

  test('should have file upload zone', async ({ page }) => {
    await page.goto('/translate')
    await page.waitForLoadState('domcontentloaded')
    await expect(
      page.locator('[class*="upload"], [class*="drop"], input[type="file"]').first(),
    ).toBeVisible()
  })
})
