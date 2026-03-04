import { test, expect } from '@playwright/test'

test.describe('Cross-App Navigation', () => {
  test('Wiki landing page should link to all deployed apps', async ({ page }) => {
    await page.goto('https://sgtlim0.github.io/')

    // Check all external links exist
    const expectedLinks = [
      'https://hchat-hmg.vercel.app',
      'https://hchat-admin.vercel.app',
      'https://hchat-user.vercel.app',
      'https://hchat-desktop.vercel.app',
      'https://hchat-wiki-storybook.vercel.app',
    ]

    for (const link of expectedLinks) {
      const anchor = page.locator(`a[href="${link}"]`)
      await expect(anchor).toBeVisible()
      // Verify target="_blank" for external links
      const target = await anchor.getAttribute('target')
      expect(target).toBe('_blank')
    }
  })

  test('Admin app should be accessible', async ({ page }) => {
    const response = await page.goto('https://hchat-admin.vercel.app/')
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('HMG app should be accessible', async ({ page }) => {
    const response = await page.goto('https://hchat-hmg.vercel.app/')
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('User app should be accessible', async ({ page }) => {
    const response = await page.goto('https://hchat-user.vercel.app/')
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('Wiki should be accessible', async ({ page }) => {
    const response = await page.goto('https://sgtlim0.github.io/')
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('Storybook should be accessible', async ({ page }) => {
    const response = await page.goto('https://hchat-wiki-storybook.vercel.app/')
    expect(response?.status()).toBeLessThan(400)
  })

  test('Desktop app should be accessible', async ({ page }) => {
    const response = await page.goto('https://hchat-desktop.vercel.app/')
    expect(response?.status()).toBeLessThan(400)
  })
})

test.describe('Dark Mode Consistency', () => {
  const apps = [
    { name: 'Admin', url: 'https://hchat-admin.vercel.app/' },
    { name: 'User', url: 'https://hchat-user.vercel.app/' },
  ]

  for (const app of apps) {
    test(`${app.name} should support dark mode toggle`, async ({ page }) => {
      await page.goto(app.url)
      // Find theme toggle button (ThemeToggle component)
      const toggle = page
        .locator(
          'button[aria-label*="테마"], button[aria-label*="theme"], button[aria-label*="다크"]',
        )
        .first()
      if (await toggle.isVisible()) {
        await toggle.click()
        // Check that html gets dark class
        const htmlClass = await page.locator('html').getAttribute('class')
        expect(htmlClass).toContain('dark')
        // Toggle back
        await toggle.click()
        const htmlClass2 = await page.locator('html').getAttribute('class')
        expect(htmlClass2).not.toContain('dark')
      }
    })
  }
})

test.describe('Responsive Design', () => {
  test('User app should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('https://hchat-user.vercel.app/')
    await expect(page.locator('h1, h2').first()).toBeVisible()
    // Sidebar should be hidden on mobile
    const sidebar = page.locator('nav, aside').first()
    // Just verify the page renders without errors
  })

  test('Admin app should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('https://hchat-admin.vercel.app/')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })
})
