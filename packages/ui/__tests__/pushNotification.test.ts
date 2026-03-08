import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  isSupported,
  getPermissionStatus,
  requestPermission,
  showNotification,
  wasPreviouslyDenied,
  clearDeniedFlag,
} from '../src/utils/pushNotification'
import { usePushNotification } from '../src/hooks/usePushNotification'

// --- pushNotification utility tests ---

describe('pushNotification utils', () => {
  let originalNotification: typeof Notification

  beforeEach(() => {
    originalNotification = globalThis.Notification
    localStorage.clear()
  })

  afterEach(() => {
    if (originalNotification) {
      Object.defineProperty(globalThis, 'Notification', {
        value: originalNotification,
        writable: true,
        configurable: true,
      })
    }
  })

  describe('isSupported', () => {
    it('returns true when Notification API is available', () => {
      Object.defineProperty(globalThis, 'Notification', {
        value: class MockNotification {
          static permission: NotificationPermission = 'default'
          static requestPermission = vi.fn()
        },
        writable: true,
        configurable: true,
      })
      expect(isSupported()).toBe(true)
    })

    it('returns false when Notification API is not available', () => {
      // @ts-expect-error — deliberately removing Notification for test
      delete (globalThis as Record<string, unknown>).Notification
      expect(isSupported()).toBe(false)
    })
  })

  describe('getPermissionStatus', () => {
    it('returns current Notification.permission', () => {
      Object.defineProperty(globalThis, 'Notification', {
        value: { permission: 'granted' },
        writable: true,
        configurable: true,
      })
      expect(getPermissionStatus()).toBe('granted')
    })

    it('returns denied when Notification is not supported', () => {
      // @ts-expect-error — deliberately removing Notification for test
      delete (globalThis as Record<string, unknown>).Notification
      expect(getPermissionStatus()).toBe('denied')
    })
  })

  describe('requestPermission', () => {
    it('calls Notification.requestPermission and returns result', async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue('granted')
      Object.defineProperty(globalThis, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: mockRequestPermission,
        },
        writable: true,
        configurable: true,
      })

      const result = await requestPermission()
      expect(result).toBe('granted')
      expect(mockRequestPermission).toHaveBeenCalledTimes(1)
    })

    it('returns denied when not supported', async () => {
      // @ts-expect-error — deliberately removing Notification for test
      delete (globalThis as Record<string, unknown>).Notification
      const result = await requestPermission()
      expect(result).toBe('denied')
    })

    it('stores denied flag in localStorage when permission denied', async () => {
      Object.defineProperty(globalThis, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: vi.fn().mockResolvedValue('denied'),
        },
        writable: true,
        configurable: true,
      })

      await requestPermission()
      expect(localStorage.getItem('hchat-notification-denied')).toBe('true')
    })

    it('does not store denied flag when permission granted', async () => {
      Object.defineProperty(globalThis, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: vi.fn().mockResolvedValue('granted'),
        },
        writable: true,
        configurable: true,
      })

      await requestPermission()
      expect(localStorage.getItem('hchat-notification-denied')).toBeNull()
    })

    it('throws when requestPermission rejects', async () => {
      Object.defineProperty(globalThis, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: vi.fn().mockRejectedValue(new Error('Browser error')),
        },
        writable: true,
        configurable: true,
      })

      await expect(requestPermission()).rejects.toThrow(
        'Failed to request notification permission: Browser error',
      )
    })
  })

  describe('showNotification', () => {
    it('creates a new Notification when permission is granted', async () => {
      const mockConstructor = vi.fn()
      Object.defineProperty(globalThis, 'Notification', {
        value: Object.assign(mockConstructor, { permission: 'granted' }),
        writable: true,
        configurable: true,
      })

      await showNotification('Test Title', { body: 'Test body' })
      expect(mockConstructor).toHaveBeenCalledWith('Test Title', { body: 'Test body' })
    })

    it('does nothing when permission is not granted', async () => {
      const mockConstructor = vi.fn()
      Object.defineProperty(globalThis, 'Notification', {
        value: Object.assign(mockConstructor, { permission: 'default' }),
        writable: true,
        configurable: true,
      })

      await showNotification('Test', { body: 'body' })
      expect(mockConstructor).not.toHaveBeenCalled()
    })

    it('does nothing when not supported', async () => {
      // @ts-expect-error — deliberately removing Notification for test
      delete (globalThis as Record<string, unknown>).Notification
      // Should not throw
      await expect(showNotification('Test')).resolves.toBeUndefined()
    })
  })

  describe('wasPreviouslyDenied', () => {
    it('returns false when no flag is set', () => {
      expect(wasPreviouslyDenied()).toBe(false)
    })

    it('returns true when denied flag is set', () => {
      localStorage.setItem('hchat-notification-denied', 'true')
      expect(wasPreviouslyDenied()).toBe(true)
    })
  })

  describe('clearDeniedFlag', () => {
    it('removes the denied flag from localStorage', () => {
      localStorage.setItem('hchat-notification-denied', 'true')
      clearDeniedFlag()
      expect(localStorage.getItem('hchat-notification-denied')).toBeNull()
    })
  })
})

// --- usePushNotification hook tests ---

describe('usePushNotification', () => {
  let originalNotification: typeof Notification

  beforeEach(() => {
    originalNotification = globalThis.Notification
    Object.defineProperty(globalThis, 'Notification', {
      value: {
        permission: 'default' as NotificationPermission,
        requestPermission: vi.fn().mockResolvedValue('granted'),
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(globalThis, 'Notification', {
      value: originalNotification,
      writable: true,
      configurable: true,
    })
  })

  it('returns default permission initially', () => {
    const { result } = renderHook(() => usePushNotification())
    expect(result.current.permission).toBe('default')
  })

  it('returns isSupported true when Notification API exists', () => {
    const { result } = renderHook(() => usePushNotification())
    expect(result.current.isSupported).toBe(true)
  })

  it('returns isSupported false when Notification API is missing', () => {
    // @ts-expect-error — deliberately removing Notification for test
    delete (globalThis as Record<string, unknown>).Notification
    const { result } = renderHook(() => usePushNotification())
    expect(result.current.isSupported).toBe(false)
  })

  it('requestPermission updates permission state', async () => {
    const { result } = renderHook(() => usePushNotification())

    await act(async () => {
      const perm = await result.current.requestPermission()
      expect(perm).toBe('granted')
    })

    expect(result.current.permission).toBe('granted')
  })

  it('requestPermission returns denied when not supported', async () => {
    // @ts-expect-error — deliberately removing Notification for test
    delete (globalThis as Record<string, unknown>).Notification

    const { result } = renderHook(() => usePushNotification())

    await act(async () => {
      const perm = await result.current.requestPermission()
      expect(perm).toBe('denied')
    })
  })

  it('sendNotification calls showNotification with title and body', async () => {
    Object.defineProperty(globalThis, 'Notification', {
      value: Object.assign(vi.fn(), {
        permission: 'granted' as NotificationPermission,
        requestPermission: vi.fn().mockResolvedValue('granted'),
      }),
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => usePushNotification())

    await act(async () => {
      await result.current.sendNotification('Hello', 'World')
    })

    expect(globalThis.Notification).toHaveBeenCalledWith('Hello', {
      body: 'World',
    })
  })

  it('sendNotification does nothing when not supported', async () => {
    // @ts-expect-error — deliberately removing Notification for test
    delete (globalThis as Record<string, unknown>).Notification

    const { result } = renderHook(() => usePushNotification())

    // Should not throw
    await act(async () => {
      await result.current.sendNotification('Hello', 'World')
    })
  })

  it('sendNotification merges additional options', async () => {
    Object.defineProperty(globalThis, 'Notification', {
      value: Object.assign(vi.fn(), {
        permission: 'granted' as NotificationPermission,
        requestPermission: vi.fn().mockResolvedValue('granted'),
      }),
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => usePushNotification())

    await act(async () => {
      await result.current.sendNotification('Title', 'Body', {
        icon: '/custom-icon.png',
        tag: 'test-tag',
      })
    })

    expect(globalThis.Notification).toHaveBeenCalledWith('Title', {
      body: 'Body',
      icon: '/custom-icon.png',
      tag: 'test-tag',
    })
  })
})
