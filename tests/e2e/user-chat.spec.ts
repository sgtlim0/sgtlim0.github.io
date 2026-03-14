import { test, expect } from '@playwright/test'

test.describe('User Chat Page', () => {
  test('should load chat page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('should display assistant cards', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const cards = page.locator('[class*="card"], [class*="assistant"], [role="article"]')
    await expect(cards.first()).toBeVisible()
  })

  test('should have working search bar', async ({ page }) => {
    await page.goto('/')
    const searchBar = page.locator('textarea, input[type="text"], input[placeholder]').first()
    await expect(searchBar).toBeVisible()
  })
})
