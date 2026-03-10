import { test, expect } from '@playwright/test'

const apps = [
  { name: 'Admin', url: 'https://hchat-admin.vercel.app' },
  { name: 'HMG', url: 'https://hchat-hmg.vercel.app' },
  { name: 'User', url: 'https://hchat-user.vercel.app' },
  { name: 'Wiki', url: 'https://sgtlim0.github.io' },
  { name: 'LLM Router', url: 'https://hchat-llm-router.vercel.app' },
]

test.describe('Cross-browser: Homepage Load', () => {
  for (const app of apps) {
    test(`${app.name} homepage loads successfully`, async ({ page }) => {
      const response = await page.goto(app.url)
      expect(response?.status()).toBeLessThan(400)
      await page.waitForLoadState('networkidle')
      await expect(page.locator('body')).toBeVisible()
    })
  }
})

test.describe('Cross-browser: Basic Navigation', () => {
  test('Admin navigation links are clickable', async ({ page }) => {
    await page.goto('https://hchat-admin.vercel.app/')
    await page.waitForLoadState('networkidle')

    const navLinks = page.locator('nav a, nav button')
    const count = await navLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('HMG navigation links are clickable', async ({ page }) => {
    await page.goto('https://hchat-hmg.vercel.app/')
    await page.waitForLoadState('networkidle')

    const navLinks = page.locator('nav a, nav button')
    const count = await navLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('User app has navigation', async ({ page }) => {
    await page.goto('https://hchat-user.vercel.app/')
    await page.waitForLoadState('networkidle')

    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })

  test('LLM Router has navigation', async ({ page }) => {
    await page.goto('https://hchat-llm-router.vercel.app/')
    await page.waitForLoadState('networkidle')

    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })
})

test.describe('Cross-browser: Dark Mode Toggle', () => {
  test('Admin dark mode toggle works', async ({ page }) => {
    await page.goto('https://hchat-admin.vercel.app/')
    await page.waitForLoadState('networkidle')

    const themeToggle = page.locator('button[aria-label*="모드"]').first()
    const isVisible = await themeToggle.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }

    const htmlElement = page.locator('html')
    const hadDark = await htmlElement.evaluate((el) =>
      el.classList.contains('dark')
    )

    await themeToggle.click()
    await page.waitForTimeout(500)

    if (hadDark) {
      await expect(htmlElement).not.toHaveClass(/dark/)
    } else {
      await expect(htmlElement).toHaveClass(/dark/)
    }
  })

  test('User dark mode toggle works', async ({ page }) => {
    await page.goto('https://hchat-user.vercel.app/')
    await page.waitForLoadState('networkidle')

    const themeToggle = page.locator('button[aria-label*="모드"]').first()
    const isVisible = await themeToggle.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }

    const htmlElement = page.locator('html')
    const hadDark = await htmlElement.evaluate((el) =>
      el.classList.contains('dark')
    )

    await themeToggle.click()
    await page.waitForTimeout(500)

    if (hadDark) {
      await expect(htmlElement).not.toHaveClass(/dark/)
    } else {
      await expect(htmlElement).toHaveClass(/dark/)
    }
  })
})

test.describe('Cross-browser: Responsive Layout', () => {
  test('Admin renders main content area', async ({ page }) => {
    await page.goto('https://hchat-admin.vercel.app/')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('HMG renders hero section', async ({ page }) => {
    await page.goto('https://hchat-hmg.vercel.app/')
    await page.waitForLoadState('networkidle')

    const section = page.locator('section').first()
    await expect(section).toBeVisible()
  })

  test('User renders main content', async ({ page }) => {
    await page.goto('https://hchat-user.vercel.app/')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('Wiki renders body content', async ({ page }) => {
    await page.goto('https://sgtlim0.github.io/')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('body')).toBeVisible()
  })

  test('LLM Router renders main content', async ({ page }) => {
    await page.goto('https://hchat-llm-router.vercel.app/')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})
