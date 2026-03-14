import { test, expect } from '@playwright/test'

test.describe('User Translation Page', () => {
  test('should load translation page', async ({ page }) => {
    await page.goto('/translate')
    await expect(page.locator('h1, h2').first()).toContainText(/번역/)
  })

  test('should have engine selector', async ({ page }) => {
    await page.goto('/translate')
    await expect(page.locator('text=자체 번역 엔진')).toBeVisible({ timeout: 10000 })
  })

  test('should have file upload zone', async ({ page }) => {
    await page.goto('/translate')
    await expect(page.locator('text=드래그 앤 드롭')).toBeVisible({ timeout: 10000 })
  })
})
