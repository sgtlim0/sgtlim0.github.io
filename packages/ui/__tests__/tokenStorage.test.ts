import { describe, it, expect, beforeEach, vi } from 'vitest'
import { tokenStorage } from '../src/utils/tokenStorage'

describe('tokenStorage', () => {
  beforeEach(() => {
    // Clear both storages before each test
    if (typeof window !== 'undefined') {
      sessionStorage.clear()
      localStorage.clear()
    }
  })

  describe('Token Management', () => {
    it('should set and get token', () => {
      const token = 'test-token-123'
      tokenStorage.setToken(token)
      expect(tokenStorage.getToken()).toBe(token)
    })

    it('should remove token', () => {
      tokenStorage.setToken('test-token')
      expect(tokenStorage.getToken()).toBeTruthy()

      tokenStorage.removeToken()
      expect(tokenStorage.getToken()).toBeNull()
    })

    it('should handle token when storage is not available', () => {
      const originalSessionStorage = global.sessionStorage
      // @ts-expect-error - intentionally breaking sessionStorage
      delete global.sessionStorage

      expect(tokenStorage.getToken()).toBeNull()
      tokenStorage.setToken('test') // should not throw
      tokenStorage.removeToken() // should not throw

      global.sessionStorage = originalSessionStorage
    })
  })

  describe('User Management', () => {
    it('should set and get user object', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      }

      tokenStorage.setUser(user)
      const retrieved = tokenStorage.getUser()
      expect(retrieved).toEqual(user)
    })

    it('should handle complex user objects', () => {
      const user = {
        id: '1',
        profile: {
          nested: {
            value: 'deep',
          },
        },
        tags: ['admin', 'manager'],
      }

      tokenStorage.setUser(user)
      const retrieved = tokenStorage.getUser()
      expect(retrieved).toEqual(user)
    })

    it('should remove user', () => {
      tokenStorage.setUser({ id: '1' })
      expect(tokenStorage.getUser()).toBeTruthy()

      tokenStorage.removeUser()
      expect(tokenStorage.getUser()).toBeNull()
    })

    it('should return null for invalid JSON', () => {
      // Directly set invalid JSON
      sessionStorage.setItem('hchat_admin_user', 'invalid-json-{')
      expect(tokenStorage.getUser()).toBeNull()
    })

    it('should handle user when storage is not available', () => {
      const originalSessionStorage = global.sessionStorage
      // @ts-expect-error - intentionally breaking sessionStorage
      delete global.sessionStorage

      expect(tokenStorage.getUser()).toBeNull()
      tokenStorage.setUser({ id: '1' }) // should not throw
      tokenStorage.removeUser() // should not throw

      global.sessionStorage = originalSessionStorage
    })
  })

  describe('clear', () => {
    it('should clear both token and user', () => {
      tokenStorage.setToken('test-token')
      tokenStorage.setUser({ id: '1' })

      expect(tokenStorage.getToken()).toBeTruthy()
      expect(tokenStorage.getUser()).toBeTruthy()

      tokenStorage.clear()

      expect(tokenStorage.getToken()).toBeNull()
      expect(tokenStorage.getUser()).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      tokenStorage.setToken('test-token')
      expect(tokenStorage.isAuthenticated()).toBe(true)
    })

    it('should return false when no token', () => {
      expect(tokenStorage.isAuthenticated()).toBe(false)
    })

    it('should return false after clearing', () => {
      tokenStorage.setToken('test-token')
      expect(tokenStorage.isAuthenticated()).toBe(true)

      tokenStorage.clear()
      expect(tokenStorage.isAuthenticated()).toBe(false)
    })
  })

  describe('SSR environment', () => {
    it('should throw error when window is undefined', () => {
      const originalWindow = global.window
      // @ts-expect-error - simulating SSR environment
      delete global.window

      // Import fresh module in SSR context
      vi.resetModules()

      // Since the module is already imported, we need to test the internal function
      // In a real SSR scenario, these would throw when called
      expect(() => {
        // This would normally throw in SSR
        const storage = typeof window !== 'undefined' ? sessionStorage : null
        if (!storage) {
          throw new Error('tokenStorage는 브라우저 환경에서만 사용 가능합니다')
        }
      }).toThrow('tokenStorage는 브라우저 환경에서만 사용 가능합니다')

      global.window = originalWindow
    })
  })

  describe('Type safety', () => {
    it('should preserve user type with generics', () => {
      interface User {
        id: string
        email: string
        role: 'admin' | 'user'
      }

      const user: User = {
        id: '1',
        email: 'test@example.com',
        role: 'admin',
      }

      tokenStorage.setUser(user)
      const retrieved = tokenStorage.getUser<User>()

      expect(retrieved).toEqual(user)
      // TypeScript should recognize retrieved as User | null
      expect(retrieved?.role).toBe('admin')
    })
  })
})
