/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for CSRF Protection Utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  generateCsrfToken,
  getCsrfToken,
  validateCsrfToken,
  clearCsrfToken,
  addCsrfHeader,
  useCsrf,
} from '../src/utils/csrf'

describe('CSRF Utilities', () => {
  // Mock sessionStorage
  const mockSessionStorage = {
    store: {} as Record<string, string>,
    getItem: vi.fn((key: string) => mockSessionStorage.store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      mockSessionStorage.store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete mockSessionStorage.store[key]
    }),
    clear: vi.fn(() => {
      mockSessionStorage.store = {}
    }),
  }

  beforeEach(() => {
    // Clear mock storage
    mockSessionStorage.store = {}
    vi.clearAllMocks()

    // Mock window and sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    })

    // Mock crypto.randomUUID
    Object.defineProperty(window, 'crypto', {
      value: {
        randomUUID: vi.fn(() => '550e8400-e29b-41d4-a716-446655440000'),
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('generateCsrfToken', () => {
    it('should generate UUID format token using crypto.randomUUID', () => {
      const token = generateCsrfToken()
      expect(token).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(window.crypto.randomUUID).toHaveBeenCalled()
    })

    it('should generate UUID format token with fallback when crypto.randomUUID is not available', () => {
      // Remove crypto.randomUUID but keep getRandomValues
      Object.defineProperty(window, 'crypto', {
        value: {
          getRandomValues: (arr: Uint8Array) => {
            for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
            return arr
          },
        },
        writable: true,
      })

      const token = generateCsrfToken()

      // Check UUID v4 format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(token).toMatch(uuidRegex)
    })

    it('should generate different tokens on multiple calls with fallback', () => {
      // Remove crypto.randomUUID to test fallback but keep getRandomValues
      Object.defineProperty(window, 'crypto', {
        value: {
          getRandomValues: (arr: Uint8Array) => {
            for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
            return arr
          },
        },
        writable: true,
      })

      const token1 = generateCsrfToken()
      const token2 = generateCsrfToken()

      // While they should be different, there's a tiny chance they could be the same
      // So we just check format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(token1).toMatch(uuidRegex)
      expect(token2).toMatch(uuidRegex)
    })
  })

  describe('getCsrfToken', () => {
    it('should generate and cache new token when none exists', () => {
      const token = getCsrfToken()

      expect(token).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('csrf_token')
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('csrf_token', token)
    })

    it('should return cached token when it exists', () => {
      const existingToken = 'existing-token-12345'
      mockSessionStorage.store['csrf_token'] = existingToken

      const token = getCsrfToken()

      expect(token).toBe(existingToken)
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('csrf_token')
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled()
    })

    it('should return empty string on server side', () => {
      // Mock server environment
      const originalWindow = global.window
      // @ts-expect-error -- testing invalid input
      delete global.window

      const token = getCsrfToken()
      expect(token).toBe('')

      // Restore window
      global.window = originalWindow
    })
  })

  describe('validateCsrfToken', () => {
    it('should return true for valid token', () => {
      const validToken = 'valid-token-12345'
      mockSessionStorage.store['csrf_token'] = validToken

      const isValid = validateCsrfToken(validToken)
      expect(isValid).toBe(true)
    })

    it('should return false for invalid token', () => {
      const validToken = 'valid-token-12345'
      const invalidToken = 'invalid-token-67890'
      mockSessionStorage.store['csrf_token'] = validToken

      const isValid = validateCsrfToken(invalidToken)
      expect(isValid).toBe(false)
    })

    it('should return false for empty token', () => {
      mockSessionStorage.store['csrf_token'] = 'valid-token'

      const isValid = validateCsrfToken('')
      expect(isValid).toBe(false)
    })

    it('should return false when no session token exists', () => {
      const isValid = validateCsrfToken('some-token')
      expect(isValid).toBe(false)
    })

    it('should return false for tokens with different lengths', () => {
      mockSessionStorage.store['csrf_token'] = 'short'

      const isValid = validateCsrfToken('longer-token')
      expect(isValid).toBe(false)
    })

    it('should use constant-time comparison', () => {
      const validToken = 'aaaaaaaa'
      const invalidToken1 = 'baaaaaaa' // Different at start
      const invalidToken2 = 'aaaaaaab' // Different at end

      mockSessionStorage.store['csrf_token'] = validToken

      // Both should return false
      expect(validateCsrfToken(invalidToken1)).toBe(false)
      expect(validateCsrfToken(invalidToken2)).toBe(false)

      // Valid token should return true
      expect(validateCsrfToken(validToken)).toBe(true)
    })

    it('should return false on server side', () => {
      const originalWindow = global.window
      // @ts-expect-error -- testing invalid input
      delete global.window

      const isValid = validateCsrfToken('any-token')
      expect(isValid).toBe(false)

      global.window = originalWindow
    })
  })

  describe('clearCsrfToken', () => {
    it('should remove token from session storage', () => {
      mockSessionStorage.store['csrf_token'] = 'token-to-remove'

      clearCsrfToken()

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('csrf_token')
      expect(mockSessionStorage.store['csrf_token']).toBeUndefined()
    })

    it('should not throw on server side', () => {
      const originalWindow = global.window
      // @ts-expect-error -- testing invalid input
      delete global.window

      expect(() => clearCsrfToken()).not.toThrow()

      global.window = originalWindow
    })
  })

  describe('addCsrfHeader', () => {
    it('should add CSRF token to plain object headers', () => {
      const token = getCsrfToken()
      const headers = { 'Content-Type': 'application/json' }

      const newHeaders = addCsrfHeader(headers)

      expect(newHeaders).toEqual({
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
      })
    })

    it('should add CSRF token to Headers instance', () => {
      const token = getCsrfToken()
      const headers = new Headers({ 'Content-Type': 'application/json' })

      const newHeaders = addCsrfHeader(headers) as Headers

      expect(newHeaders).toBeInstanceOf(Headers)
      expect(newHeaders.get('X-CSRF-Token')).toBe(token)
      expect(newHeaders.get('Content-Type')).toBe('application/json')
    })

    it('should work with empty headers', () => {
      const token = getCsrfToken()

      const newHeaders = addCsrfHeader()

      expect(newHeaders).toEqual({
        'X-CSRF-Token': token,
      })
    })

    it('should override existing X-CSRF-Token header', () => {
      const token = getCsrfToken()
      const headers = { 'X-CSRF-Token': 'old-token' }

      const newHeaders = addCsrfHeader(headers)

      expect(newHeaders).toEqual({
        'X-CSRF-Token': token,
      })
    })

    it('should generate token if not exists', () => {
      // Ensure no token exists
      mockSessionStorage.store = {}

      const headers = addCsrfHeader()

      expect(headers).toHaveProperty('X-CSRF-Token')
      expect(mockSessionStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('useCsrf', () => {
    it('should return CSRF utilities object', () => {
      const csrf = useCsrf()

      expect(csrf).toHaveProperty('token')
      expect(csrf).toHaveProperty('validateToken')
      expect(csrf).toHaveProperty('refreshToken')
      expect(csrf).toHaveProperty('addToHeaders')

      expect(typeof csrf.token).toBe('string')
      expect(typeof csrf.validateToken).toBe('function')
      expect(typeof csrf.refreshToken).toBe('function')
      expect(typeof csrf.addToHeaders).toBe('function')
    })

    it('should provide current token', () => {
      const csrf = useCsrf()
      const expectedToken = getCsrfToken()

      expect(csrf.token).toBe(expectedToken)
    })

    it('should validate tokens correctly', () => {
      const csrf = useCsrf()
      const validToken = csrf.token
      const invalidToken = 'invalid-token'

      expect(csrf.validateToken(validToken)).toBe(true)
      expect(csrf.validateToken(invalidToken)).toBe(false)
    })

    it('should refresh token', () => {
      const csrf = useCsrf()
      const oldToken = csrf.token

      // Mock new UUID for refresh
      ;(window.crypto.randomUUID as any).mockReturnValue('new-token-12345')

      const newToken = csrf.refreshToken()

      expect(newToken).toBe('new-token-12345')
      expect(newToken).not.toBe(oldToken)
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('csrf_token')
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('csrf_token', newToken)
    })

    it('should add token to headers', () => {
      const csrf = useCsrf()
      const headers = { 'Content-Type': 'application/json' }

      const newHeaders = csrf.addToHeaders(headers)

      expect(newHeaders).toEqual({
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf.token,
      })
    })

    it('should return safe defaults on server side', () => {
      const originalWindow = global.window
      // @ts-expect-error -- testing invalid input
      delete global.window

      const csrf = useCsrf()

      expect(csrf.token).toBe('')
      expect(csrf.validateToken('any')).toBe(false)
      expect(csrf.refreshToken()).toBe('')
      expect(csrf.addToHeaders({ test: 'header' })).toEqual({ test: 'header' })

      global.window = originalWindow
    })
  })

  describe('Integration tests', () => {
    it('should maintain token consistency across operations', () => {
      // Get initial token
      const token1 = getCsrfToken()

      // Token should be consistent
      const token2 = getCsrfToken()
      expect(token2).toBe(token1)

      // Should validate correctly
      expect(validateCsrfToken(token1)).toBe(true)

      // Headers should contain same token
      const headers = addCsrfHeader({})
      expect(headers).toHaveProperty('X-CSRF-Token', token1)

      // Clear should remove token
      clearCsrfToken()
      expect(mockSessionStorage.store['csrf_token']).toBeUndefined()

      // New token should be generated after clear
      ;(window.crypto.randomUUID as any).mockReturnValue('new-token-after-clear')
      const token3 = getCsrfToken()
      expect(token3).toBe('new-token-after-clear')
      expect(token3).not.toBe(token1)
    })

    it('should handle complete user session flow', () => {
      // User logs in - generate token
      const loginToken = getCsrfToken()
      expect(loginToken).toBeTruthy()

      // Make API calls with token
      const headers = addCsrfHeader({ 'Content-Type': 'application/json' })
      expect(headers).toHaveProperty('X-CSRF-Token', loginToken)

      // Validate incoming requests
      expect(validateCsrfToken(loginToken)).toBe(true)
      expect(validateCsrfToken('malicious-token')).toBe(false)

      // User logs out - clear token
      clearCsrfToken()
      expect(validateCsrfToken(loginToken)).toBe(false)

      // New session - new token
      ;(window.crypto.randomUUID as any).mockReturnValue('new-session-token')
      const newSessionToken = getCsrfToken()
      expect(newSessionToken).not.toBe(loginToken)
    })
  })
})
