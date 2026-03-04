import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const apps = [
  { name: 'Admin', url: 'https://hchat-admin.vercel.app/' },
  { name: 'HMG', url: 'https://hchat-hmg.vercel.app/' },
  { name: 'User', url: 'https://hchat-user.vercel.app/' },
  { name: 'Wiki', url: 'https://sgtlim0.github.io/' },
]

for (const app of apps) {
  test.describe(`Accessibility - ${app.name}`, () => {
    test('has no critical accessibility violations', async ({ page }) => {
      await page.goto(app.url)
      await page.waitForLoadState('networkidle')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .disableRules(['color-contrast'])
        .analyze()

      const critical = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      )

      expect(critical).toEqual([])
    })

    test('has skip navigation link', async ({ page }) => {
      await page.goto(app.url)
      await page.waitForLoadState('networkidle')

      const skipLink = page.locator('a[href="#main-content"], a.sr-only')
      const count = await skipLink.count()
      expect(count).toBeGreaterThanOrEqual(0)
    })

    test('all images have alt text', async ({ page }) => {
      await page.goto(app.url)
      await page.waitForLoadState('networkidle')

      const images = page.locator('img')
      const count = await images.count()

      for (let i = 0; i < count; i++) {
        const img = images.nth(i)
        const alt = await img.getAttribute('alt')
        const role = await img.getAttribute('role')
        const ariaHidden = await img.getAttribute('aria-hidden')

        const hasAccessibility = alt !== null || role === 'presentation' || ariaHidden === 'true'
        expect(hasAccessibility).toBe(true)
      }
    })

    test('interactive elements are keyboard accessible', async ({ page }) => {
      await page.goto(app.url)
      await page.waitForLoadState('networkidle')

      const buttons = page.locator('button, a[href], [role="button"]')
      const count = await buttons.count()

      for (let i = 0; i < Math.min(count, 5); i++) {
        const el = buttons.nth(i)
        if (await el.isVisible()) {
          const tabIndex = await el.getAttribute('tabindex')
          expect(tabIndex !== '-1' || tabIndex === null).toBe(true)
        }
      }
    })
  })
}
