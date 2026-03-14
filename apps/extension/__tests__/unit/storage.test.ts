import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getStoredContext,
  setStoredContext,
  clearStoredContext,
  getSettings,
  setSettings,
} from '../../src/utils/storage'
import { DEFAULT_SETTINGS } from '../../src/types/settings'
import type { PageContext } from '../../src/types/context'

describe('storage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getStoredContext', () => {
    it('should return null when storage is empty', async () => {
      const result = await getStoredContext()
      expect(result).toBeNull()
    })

    it('should return stored context when exists', async () => {
      const ctx: PageContext = {
        text: 'Sample text',
        url: 'https://example.com',
        title: 'Example',
        timestamp: Date.now(),
        sanitized: false,
      }

      await setStoredContext(ctx)
      const retrieved = await getStoredContext()

      expect(retrieved).toEqual(ctx)
    })

    it('should return null for non-extension context', async () => {
      const originalChrome = globalThis.chrome
      // @ts-expect-error Testing non-extension context
      delete globalThis.chrome

      const result = await getStoredContext()
      expect(result).toBeNull()

      globalThis.chrome = originalChrome
    })
  })

  describe('setStoredContext', () => {
    it('should store context successfully', async () => {
      const ctx: PageContext = {
        text: 'Test content',
        url: 'https://test.com',
        title: 'Test Page',
        favicon: 'https://test.com/favicon.ico',
        timestamp: 1234567890,
        sanitized: true,
      }

      await setStoredContext(ctx)
      const stored = await getStoredContext()

      expect(stored).toEqual(ctx)
    })

    it('should overwrite existing context', async () => {
      const ctx1: PageContext = {
        text: 'First',
        url: 'https://first.com',
        title: 'First',
        timestamp: 1000,
        sanitized: false,
      }

      const ctx2: PageContext = {
        text: 'Second',
        url: 'https://second.com',
        title: 'Second',
        timestamp: 2000,
        sanitized: true,
      }

      await setStoredContext(ctx1)
      await setStoredContext(ctx2)

      const stored = await getStoredContext()
      expect(stored).toEqual(ctx2)
    })
  })

  describe('clearStoredContext', () => {
    it('should remove stored context', async () => {
      const ctx: PageContext = {
        text: 'To be cleared',
        url: 'https://clear.com',
        title: 'Clear',
        timestamp: Date.now(),
        sanitized: false,
      }

      await setStoredContext(ctx)
      expect(await getStoredContext()).toEqual(ctx)

      await clearStoredContext()
      expect(await getStoredContext()).toBeNull()
    })

    it('should not throw when clearing empty storage', async () => {
      await expect(clearStoredContext()).resolves.toBeUndefined()
    })
  })

  describe('getSettings', () => {
    it('should return DEFAULT_SETTINGS when storage is empty', async () => {
      const settings = await getSettings()
      expect(settings).toEqual(DEFAULT_SETTINGS)
    })

    it('should return stored settings when exists', async () => {
      const customSettings = {
        ...DEFAULT_SETTINGS,
        theme: 'dark' as const,
        language: 'en' as const,
      }

      await setSettings(customSettings)
      const retrieved = await getSettings()

      expect(retrieved).toEqual(customSettings)
    })

    it('should merge with defaults for partial settings', async () => {
      await chrome.storage.local.set({
        hchat_settings: { theme: 'dark' },
      })

      const settings = await getSettings()
      expect(settings).toEqual({
        ...DEFAULT_SETTINGS,
        theme: 'dark',
      })
    })

    it('should return defaults for non-extension context', async () => {
      const originalChrome = globalThis.chrome
      // @ts-expect-error Testing non-extension context
      delete globalThis.chrome

      const result = await getSettings()
      expect(result).toEqual(DEFAULT_SETTINGS)

      globalThis.chrome = originalChrome
    })
  })

  describe('setSettings', () => {
    it('should update settings partially', async () => {
      await setSettings({ theme: 'dark' })
      const settings = await getSettings()

      expect(settings).toEqual({
        ...DEFAULT_SETTINGS,
        theme: 'dark',
      })
    })

    it('should return updated settings', async () => {
      const result = await setSettings({ language: 'en', maxTextLength: 10000 })

      expect(result).toEqual({
        ...DEFAULT_SETTINGS,
        language: 'en',
        maxTextLength: 10000,
      })
    })

    it('should merge multiple updates correctly', async () => {
      await setSettings({ theme: 'dark' })
      await setSettings({ language: 'en' })

      const final = await getSettings()
      expect(final.theme).toBe('dark')
      expect(final.language).toBe('en')
    })

    it('should preserve other settings when updating one', async () => {
      await setSettings({
        theme: 'dark',
        language: 'en',
        autoSanitize: false,
      })

      await setSettings({ theme: 'light' })

      const final = await getSettings()
      expect(final.theme).toBe('light')
      expect(final.language).toBe('en')
      expect(final.autoSanitize).toBe(false)
    })
  })

  describe('context + settings integration', () => {
    it('should not interfere with each other', async () => {
      const ctx: PageContext = {
        text: 'Context text',
        url: 'https://context.com',
        title: 'Context',
        timestamp: Date.now(),
        sanitized: false,
      }

      await setStoredContext(ctx)
      await setSettings({ theme: 'dark' })

      expect(await getStoredContext()).toEqual(ctx)
      expect((await getSettings()).theme).toBe('dark')
    })
  })
})
