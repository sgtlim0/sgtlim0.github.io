import { test, expect } from '@playwright/test'

const apps = [
  { name: 'Admin', url: 'https://hchat-admin.vercel.app' },
  { name: 'HMG', url: 'https://hchat-hmg.vercel.app' },
  { name: 'User', url: 'https://hchat-user.vercel.app' },
  { name: 'LLM Router', url: 'https://hchat-llm-router.vercel.app' },
  { name: 'Wiki', url: 'https://sgtlim0.github.io' },
]

test.describe('404 - Unknown Routes', () => {
  for (const app of apps) {
    test(`${app.name} should handle unknown route gracefully`, async ({ page }) => {
      const response = await page.goto(`${app.url}/nonexistent-page-xyz-404`)
      await page.waitForLoadState('domcontentloaded')

      // Static export apps return 200 with fallback or 404 status
      const status = response?.status() ?? 0
      expect(status).toBeLessThan(500)

      // Page should still render something (not a blank page)
      const body = page.locator('body')
      await expect(body).toBeVisible()

      // Should not show a raw server error
      const bodyText = await body.textContent()
      expect(bodyText).not.toContain('Internal Server Error')
      expect(bodyText).not.toContain('INTERNAL_SERVER_ERROR')
    })
  }
})

test.describe('Network Error Simulation', () => {
  test('Admin should show content before going offline', async ({ page, context }) => {
    // Load page first while online
    await page.goto('https://hchat-admin.vercel.app/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1, h2').first()).toBeVisible()

    // Go offline
    await context.setOffline(true)

    // Clicking internal navigation while offline should not crash
    const navLinks = page.locator('a[href]')
    const count = await navLinks.count()
    if (count > 0) {
      const firstInternalLink = navLinks.first()
      await firstInternalLink.click().catch(() => {
        // Expected: navigation may fail offline
      })
    }

    // Page should still have visible content (cached or SPA state)
    await expect(page.locator('body')).toBeVisible()

    // Restore online
    await context.setOffline(false)
  })

  test('User app should show content before going offline', async ({ page, context }) => {
    await page.goto('https://hchat-user.vercel.app/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1, h2').first()).toBeVisible()

    await context.setOffline(true)

    // Body should remain visible even offline
    await expect(page.locator('body')).toBeVisible()

    await context.setOffline(false)
  })
})

test.describe('Slow Network Simulation', () => {
  test('Admin should show loading or content under slow network', async ({ page }) => {
    // Intercept all requests and add delay
    await page.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await route.continue()
    })

    await page.goto('https://hchat-admin.vercel.app/', { timeout: 60000 })
    await page.waitForLoadState('domcontentloaded')

    // Page should eventually render
    await expect(page.locator('body')).toBeVisible()
    const bodyText = await page.locator('body').textContent()
    expect(bodyText?.length).toBeGreaterThan(0)
  })

  test('User app should render under slow network', async ({ page }) => {
    await page.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await route.continue()
    })

    await page.goto('https://hchat-user.vercel.app/', { timeout: 60000 })
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('body')).toBeVisible()
    const bodyText = await page.locator('body').textContent()
    expect(bodyText?.length).toBeGreaterThan(0)
  })
})

test.describe('API Error Responses', () => {
  test('Admin should handle API 500 errors gracefully', async ({ page }) => {
    // Intercept API calls and return 500
    await page.route('**/api/**', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      }),
    )

    await page.goto('https://hchat-admin.vercel.app/')
    await page.waitForLoadState('domcontentloaded')

    // Page should still render (mock data fallback or error UI)
    await expect(page.locator('body')).toBeVisible()
    const bodyText = await page.locator('body').textContent()
    expect(bodyText?.length).toBeGreaterThan(0)

    // Should not show raw stack trace
    expect(bodyText).not.toContain('at Object.')
    expect(bodyText).not.toContain('TypeError')
  })

  test('User app should handle API 500 errors gracefully', async ({ page }) => {
    await page.route('**/api/**', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      }),
    )

    await page.goto('https://hchat-user.vercel.app/')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('body')).toBeVisible()
    const bodyText = await page.locator('body').textContent()
    expect(bodyText?.length).toBeGreaterThan(0)
    expect(bodyText).not.toContain('at Object.')
    expect(bodyText).not.toContain('TypeError')
  })

  test('LLM Router should handle API 500 errors gracefully', async ({ page }) => {
    await page.route('**/api/**', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      }),
    )

    await page.goto('https://hchat-llm-router.vercel.app/')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('body')).toBeVisible()
    const bodyText = await page.locator('body').textContent()
    expect(bodyText?.length).toBeGreaterThan(0)
    expect(bodyText).not.toContain('at Object.')
  })
})

test.describe('Console Error Monitoring', () => {
  for (const app of apps) {
    test(`${app.name} should load without uncaught exceptions`, async ({ page }) => {
      const uncaughtErrors: string[] = []

      page.on('pageerror', (error) => {
        uncaughtErrors.push(error.message)
      })

      await page.goto(app.url)
      await page.waitForLoadState('networkidle')

      // No uncaught exceptions should occur on page load
      expect(uncaughtErrors).toHaveLength(0)
    })
  }
})
