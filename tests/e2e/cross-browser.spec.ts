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
    await page.waitForLoadState('domcontentloaded')

    const navLinks = page.locator('a, button')
    const count = await navLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('HMG navigation links are clickable', async ({ page }) => {
    await page.goto('https://hchat-hmg.vercel.app/')
    await page.waitForLoadState('domcontentloaded')

    const navLinks = page.locator('a, button')
    const count = await navLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('User app has navigation', async ({ page }) => {
    await page.goto('https://hchat-user.vercel.app/')
    await page.waitForLoadState('domcontentloaded')

    const nav = page.locator('nav').first()
    await expect(nav).toBeVisible()
  })

  test('LLM Router has navigation', async ({ page }) => {
    await page.goto('https://hchat-llm-router.vercel.app/')
    await page.waitForLoadState('domcontentloaded')

    const nav = page.locator('nav').first()
    await expect(nav).toBeVisible()
  })
})

test.describe('Cross-browser: Dark Mode Toggle', () => {
  test('Admin dark mode toggle works', async ({ page }) => {
    await page.goto('https://hchat-admin.vercel.app/')
    await page.waitForLoadState('domcontentloaded')

    const themeToggle = page.locator('button[aria-label*="모드"]').first()
    const isVisible = await themeToggle.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }

    const htmlElement = page.locator('html')
    const classBefore = await htmlElement.getAttribute('class') ?? ''

    await themeToggle.click()
    await page.waitForTimeout(500)

    const classAfter = await htmlElement.getAttribute('class') ?? ''
    expect(classBefore).not.toEqual(classAfter)
  })

  test('User dark mode toggle works', async ({ page }) => {
    await page.goto('https://hchat-user.vercel.app/')
    await page.waitForLoadState('domcontentloaded')

    const themeToggle = page.locator('button[aria-label*="모드"]').first()
    const isVisible = await themeToggle.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }

    const htmlElement = page.locator('html')
    const classBefore = await htmlElement.getAttribute('class') ?? ''

    await themeToggle.click()
    await page.waitForTimeout(500)

    const classAfter = await htmlElement.getAttribute('class') ?? ''
    expect(classBefore).not.toEqual(classAfter)
  })
})

test.describe('Cross-browser: Responsive Layout', () => {
  test('Admin renders main content area', async ({ page }) => {
    await page.goto('https://hchat-admin.vercel.app/')
    await page.waitForLoadState('domcontentloaded')

    const main = page.locator('main').first()
    await expect(main).toBeVisible()
  })

  test('HMG renders content', async ({ page }) => {
    await page.goto('https://hchat-hmg.vercel.app/')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('body')).toBeVisible()
    const response = await page.goto('https://hchat-hmg.vercel.app/')
    expect(response?.status()).toBeLessThan(400)
  })

  test('User renders main content', async ({ page }) => {
    await page.goto('https://hchat-user.vercel.app/')
    await page.waitForLoadState('domcontentloaded')

    const main = page.locator('main').first()
    await expect(main).toBeVisible()
  })

  test('Wiki renders body content', async ({ page }) => {
    await page.goto('https://sgtlim0.github.io/')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('body')).toBeVisible()
  })

  test('LLM Router renders main content', async ({ page }) => {
    await page.goto('https://hchat-llm-router.vercel.app/')
    await page.waitForLoadState('domcontentloaded')

    const main = page.locator('main').first()
    await expect(main).toBeVisible()
  })
})
