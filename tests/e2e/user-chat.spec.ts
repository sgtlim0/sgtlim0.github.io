import { test, expect } from '@playwright/test'

test.describe('User Chat Page', () => {
  test('should load chat page', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBeLessThan(400)
    await page.waitForLoadState('domcontentloaded')
  })

  test('should display page content', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('body')).toBeVisible()
  })

  test('should have interactive elements', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const buttons = page.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
  })
})
