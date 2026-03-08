import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../src/admin/auth/AuthProvider'
import type { AuthUser, LoginCredentials } from '../src/admin/auth/types'

// Mock the mockAuthService
vi.mock('../src/admin/auth/mockAuthService', () => ({
  mockAuthService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}))

// Import mocked service after vi.mock
import { mockAuthService } from '../src/admin/auth/mockAuthService'

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial state', () => {
    it('should start with isLoading=true and call getCurrentUser on mount', async () => {
      const mockUser: AuthUser = {
        id: '1',
        email: 'test@hchat.ai',
        name: 'Test User',
        role: 'admin',
        organization: 'Test Org',
        department: 'IT',
        avatar: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }

      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(mockUser)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Initially loading
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()

      // Wait for async effect to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // After loading, user should be set
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      expect(mockAuthService.getCurrentUser).toHaveBeenCalledTimes(1)
    })

    it('should handle unauthenticated state when getCurrentUser returns null', async () => {
      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(null)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Initially loading
      expect(result.current.isLoading).toBe(true)

      // Wait for async effect to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should remain unauthenticated
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })

    it('should handle getCurrentUser error gracefully', async () => {
      vi.mocked(mockAuthService.getCurrentUser).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Initially loading
      expect(result.current.isLoading).toBe(true)

      // Wait for async effect to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should set to unauthenticated on error
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })
  })

  describe('Login', () => {
    it('should successfully login and update state', async () => {
      const mockUser: AuthUser = {
        id: '1',
        email: 'admin@hchat.ai',
        name: 'Admin User',
        role: 'admin',
        organization: 'H Chat',
        department: 'IT',
        avatar: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }

      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(null)
      vi.mocked(mockAuthService.login).mockResolvedValue(mockUser)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const credentials: LoginCredentials = {
        email: 'admin@hchat.ai',
        password: 'Admin123!',
        rememberMe: false,
      }

      // Perform login
      await act(async () => {
        await result.current.login(credentials)
      })

      // Check state after login
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isLoading).toBe(false)
      expect(mockAuthService.login).toHaveBeenCalledWith(credentials)
    })

    it('should throw error when login fails', async () => {
      const loginError = new Error('Invalid credentials')
      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(null)
      vi.mocked(mockAuthService.login).mockRejectedValue(loginError)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const credentials: LoginCredentials = {
        email: 'wrong@hchat.ai',
        password: 'wrong',
        rememberMe: false,
      }

      // Login should throw error
      await expect(
        act(async () => {
          await result.current.login(credentials)
        }),
      ).rejects.toThrow('Invalid credentials')

      // State should remain unauthenticated
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })
  })

  describe('Logout', () => {
    it('should successfully logout and clear state', async () => {
      const mockUser: AuthUser = {
        id: '1',
        email: 'test@hchat.ai',
        name: 'Test User',
        role: 'admin',
        organization: 'Test Org',
        department: 'IT',
        avatar: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }

      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(mockUser)
      vi.mocked(mockAuthService.logout).mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      // Wait for initial load with authenticated user
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)

      // Perform logout
      await act(async () => {
        await result.current.logout()
      })

      // Check state after logout
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(mockAuthService.logout).toHaveBeenCalledTimes(1)
    })
  })

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error
      console.error = vi.fn()

      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')

      // Restore console.error
      console.error = originalError
    })
  })
})
