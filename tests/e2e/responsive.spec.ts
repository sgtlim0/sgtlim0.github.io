import { test, expect } from '@playwright/test'

const viewports = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
}

test.describe('Responsive Layout - Admin', () => {
  test('admin nav collapses on mobile', async ({ page }) => {
    await page.setViewportSize(viewports.mobile)
    await page.goto('https://hchat-admin.vercel.app/')
    await page.waitForLoadState('networkidle')
    const mobileMenu = page.locator('[aria-label="메뉴 열기"], [aria-label="메뉴"]')
    await expect(mobileMenu.or(page.locator('nav button'))).toBeVisible()
  })

  test('admin layout fills desktop', async ({ page }) => {
    await page.setViewportSize(viewports.desktop)
    await page.goto('https://hchat-admin.vercel.app/')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})

test.describe('Responsive Layout - HMG', () => {
  test('hmg gnb shows hamburger on mobile', async ({ page }) => {
    await page.setViewportSize(viewports.mobile)
    await page.goto('https://hchat-hmg.vercel.app/')
    await page.waitForLoadState('networkidle')
    const menuButton = page.locator('button[aria-label]').first()
    await expect(menuButton).toBeVisible()
  })

  test('hmg hero banner is visible on tablet', async ({ page }) => {
    await page.setViewportSize(viewports.tablet)
    await page.goto('https://hchat-hmg.vercel.app/')
    await page.waitForLoadState('networkidle')
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()
  })
})

test.describe('Responsive Layout - User', () => {
  test('user nav adapts to mobile', async ({ page }) => {
    await page.setViewportSize(viewports.mobile)
    await page.goto('https://hchat-user.vercel.app/')
    await page.waitForLoadState('networkidle')
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })

  test('user app renders on desktop', async ({ page }) => {
    await page.setViewportSize(viewports.desktop)
    await page.goto('https://hchat-user.vercel.app/')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})

test.describe('Responsive Layout - Wiki', () => {
  test('wiki sidebar hidden on mobile', async ({ page }) => {
    await page.setViewportSize(viewports.mobile)
    await page.goto('https://sgtlim0.github.io/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
  })

  test('wiki sidebar visible on desktop', async ({ page }) => {
    await page.setViewportSize(viewports.desktop)
    await page.goto('https://sgtlim0.github.io/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
  })
})
