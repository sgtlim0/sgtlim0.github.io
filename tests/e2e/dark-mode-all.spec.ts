import { test, expect } from '@playwright/test'

const apps = [
  { name: 'Admin', url: 'https://hchat-admin.vercel.app/' },
  { name: 'HMG', url: 'https://hchat-hmg.vercel.app/' },
  { name: 'User', url: 'https://hchat-user.vercel.app/' },
  { name: 'Wiki', url: 'https://sgtlim0.github.io/' },
]

for (const app of apps) {
  test.describe(`Dark Mode - ${app.name}`, () => {
    test('page loads in light mode by default', async ({ page }) => {
      await page.goto(app.url)
      await page.waitForLoadState('networkidle')
      const html = page.locator('html')
      await expect(html).not.toHaveClass(/dark/)
    })

    test('dark mode toggle works', async ({ page }) => {
      await page.goto(app.url)
      await page.waitForLoadState('networkidle')

      const themeToggle = page
        .locator(
          'button[aria-label*="테마"], button[aria-label*="theme"], button[aria-label*="다크"], button[aria-label*="dark"]',
        )
        .first()

      if (await themeToggle.isVisible()) {
        await themeToggle.click()
        await page.waitForTimeout(500)
        const html = page.locator('html')
        await expect(html).toHaveClass(/dark/)
      }
    })

    test('no broken styles in dark mode', async ({ page }) => {
      await page.goto(app.url)
      await page.waitForLoadState('networkidle')

      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForTimeout(300)

      const body = page.locator('body')
      await expect(body).toBeVisible()

      const bodyBg = await body.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor
      })
      expect(bodyBg).not.toBe('rgba(0, 0, 0, 0)')
    })
  })
}
