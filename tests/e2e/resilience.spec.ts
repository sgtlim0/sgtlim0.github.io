import { test, expect } from '@playwright/test'

test.describe('Page Refresh - State Restoration', () => {
  test('Admin should persist dark mode preference across refresh', async ({ page }) => {
    await page.goto('https://hchat-admin.vercel.app/')
    await page.waitForLoadState('networkidle')

    // Find and click theme toggle
    const toggle = page
      .locator(
        'button[aria-label*="theme"], button[aria-label*="Theme"], button[aria-label*="dark"], button[aria-label*="Dark"]',
      )
      .first()

    if (await toggle.isVisible()) {
      await toggle.click()
      await page.waitForTimeout(300)

      const htmlClass = await page.locator('html').getAttribute('class')
      const isDark = htmlClass?.includes('dark')

      // Refresh the page
      await page.reload()
      await page.waitForLoadState('networkidle')

      // Theme should persist
      const htmlClassAfter = await page.locator('html').getAttribute('class')
      const isDarkAfter = htmlClassAfter?.includes('dark')
      expect(isDarkAfter).toBe(isDark)
    }
  })

  test('User app should preserve localStorage data across refresh', async ({ page }) => {
    await page.goto('https://hchat-user.vercel.app/')
    await page.waitForLoadState('networkidle')

    // Set a localStorage value
    await page.evaluate(() => {
      localStorage.setItem('hchat-test-key', 'test-value')
    })

    // Refresh
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify localStorage persists
    const value = await page.evaluate(() => localStorage.getItem('hchat-test-key'))
    expect(value).toBe('test-value')

    // Clean up
    await page.evaluate(() => localStorage.removeItem('hchat-test-key'))
  })
})

test.describe('Browser History Navigation', () => {
  test('Admin should handle back/forward navigation', async ({ page }) => {
    // Visit home
    await page.goto('https://hchat-admin.vercel.app/')
    await page.waitForLoadState('networkidle')
    const homeUrl = page.url()

    // Navigate to usage page
    const usageLink = page.locator('a[href*="/usage"], text=usage', { hasText: /usage/i }).first()
    if (await usageLink.isVisible()) {
      await usageLink.click()
      await page.waitForLoadState('networkidle')
      const usageUrl = page.url()
      expect(usageUrl).not.toBe(homeUrl)

      // Go back
      await page.goBack()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain(homeUrl.replace(/\/$/, ''))

      // Go forward
      await page.goForward()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/usage')

      // Page should render properly after navigation
      await expect(page.locator('body')).toBeVisible()
      const bodyText = await page.locator('body').textContent()
      expect(bodyText?.length).toBeGreaterThan(0)
    }
  })

  test('HMG should handle back/forward navigation', async ({ page }) => {
    await page.goto('https://hchat-hmg.vercel.app/')
    await page.waitForLoadState('networkidle')

    // Navigate to publications
    const pubLink = page.locator('a[href*="/publications"]').first()
    if (await pubLink.isVisible()) {
      await pubLink.click()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/publications')

      // Go back to home
      await page.goBack()
      await page.waitForLoadState('networkidle')

      // Should be back at home
      await expect(page.locator('body')).toBeVisible()

      // Go forward to publications
      await page.goForward()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/publications')
    }
  })

  test('LLM Router should handle back/forward between pages', async ({ page }) => {
    await page.goto('https://hchat-llm-router.vercel.app/')
    await page.waitForLoadState('networkidle')

    // Navigate to models
    const modelsLink = page.locator('a[href*="/models"]').first()
    if (await modelsLink.isVisible()) {
      await modelsLink.click()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/models')

      // Go back
      await page.goBack()
      await page.waitForLoadState('networkidle')

      // Should be back at landing
      await expect(page.locator('body')).toBeVisible()
    }
  })
})

test.describe('Rapid Click Protection', () => {
  test('Admin nav should handle rapid clicks without breaking', async ({ page }) => {
    await page.goto('https://hchat-admin.vercel.app/')
    await page.waitForLoadState('networkidle')

    const consoleErrors: string[] = []
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message)
    })

    // Rapidly click multiple nav links
    const navItems = page.locator('nav a[href], aside a[href]')
    const count = await navItems.count()

    if (count >= 2) {
      // Click first link
      await navItems.nth(0).click()
      // Immediately click second link without waiting
      await navItems.nth(1).click()
      // Click first link again
      await navItems.nth(0).click()

      // Wait for final navigation to settle
      await page.waitForLoadState('networkidle')

      // Page should still be functional
      await expect(page.locator('body')).toBeVisible()
      const bodyText = await page.locator('body').textContent()
      expect(bodyText?.length).toBeGreaterThan(0)
    }

    // No uncaught errors from rapid navigation
    expect(consoleErrors).toHaveLength(0)
  })

  test('User app should handle rapid search input without errors', async ({ page }) => {
    await page.goto('https://hchat-user.vercel.app/')
    await page.waitForLoadState('networkidle')

    const uncaughtErrors: string[] = []
    page.on('pageerror', (error) => {
      uncaughtErrors.push(error.message)
    })

    // Find search input
    const searchInput = page.locator('textarea, input[type="text"]').first()
    if (await searchInput.isVisible()) {
      // Type rapidly
      await searchInput.type('test query rapid typing', { delay: 10 })

      // Clear and type again immediately
      await searchInput.fill('')
      await searchInput.type('another quick search', { delay: 10 })

      await page.waitForTimeout(500)
    }

    // No uncaught errors from rapid input
    expect(uncaughtErrors).toHaveLength(0)
  })
})

test.describe('Multiple Tab Behavior', () => {
  test('Admin should work correctly when opened in new tab context', async ({ browser }) => {
    // Open two separate contexts (simulates two tabs)
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()

    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    // Load admin in both
    await page1.goto('https://hchat-admin.vercel.app/')
    await page2.goto('https://hchat-admin.vercel.app/')

    await page1.waitForLoadState('networkidle')
    await page2.waitForLoadState('networkidle')

    // Both should render correctly
    await expect(page1.locator('body')).toBeVisible()
    await expect(page2.locator('body')).toBeVisible()

    const text1 = await page1.locator('body').textContent()
    const text2 = await page2.locator('body').textContent()
    expect(text1?.length).toBeGreaterThan(0)
    expect(text2?.length).toBeGreaterThan(0)

    await context1.close()
    await context2.close()
  })
})

test.describe('JavaScript Disabled Fallback', () => {
  test('Wiki should show content even with JS disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()

    await page.goto('https://sgtlim0.github.io/')
    await page.waitForLoadState('domcontentloaded')

    // Static HTML should still be visible
    await expect(page.locator('body')).toBeVisible()
    const bodyText = await page.locator('body').textContent()
    expect(bodyText?.length).toBeGreaterThan(0)

    await context.close()
  })
})
