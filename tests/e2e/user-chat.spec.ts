import { test, expect } from '@playwright/test'

test.describe('User Chat Page', () => {
  test('should load chat page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=업무 비서')).toBeVisible({ timeout: 15000 })
  })

  test('should display assistant cards', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=공식 비서')).toBeVisible({ timeout: 15000 })
  })

  test('should have working search bar', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('textarea').first()).toBeVisible({ timeout: 15000 })
  })
})
