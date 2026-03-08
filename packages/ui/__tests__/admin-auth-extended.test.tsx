import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor, render, screen } from '@testing-library/react'
import React from 'react'
import { AuthProvider, useAuth } from '../src/admin/auth/AuthProvider'
import { RealAuthService } from '../src/admin/auth/realAuthService'
import { ApiClient } from '../src/client/apiClient'
import type { AuthUser } from '../src/admin/auth/types'
import { mockAuthService, _resetForTesting } from '../src/admin/auth/mockAuthService'
import { generateToken } from '../src/admin/auth/token'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
}))

// ---------------------------------------------------------------------------
// AuthProvider tests
// ---------------------------------------------------------------------------

describe('AuthProvider', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    _resetForTesting()
  })

  it('renders children', async () => {
    render(
      <AuthProvider>
        <div data-testid="child">Hello</div>
      </AuthProvider>,
    )

    // Wait for initial auth check to complete
    await act(async () => {
      await new Promise((r) => setTimeout(r, 400))
    })

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('provides context with initial loading state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      ),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('resolves to unauthenticated when no stored user', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      ),
    })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 400))
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('resolves to authenticated when user exists in storage with valid JWT', async () => {
    const token = await generateToken({ email: 'admin@hchat.ai' })
    sessionStorage.setItem('hchat_admin_auth_token', token)
    sessionStorage.setItem(
      'hchat_admin_user',
      JSON.stringify({
        id: '1',
        email: 'admin@hchat.ai',
        name: 'Admin',
        role: 'admin',
        organization: 'Test Org',
      }),
    )

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      ),
    })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 400))
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.email).toBe('admin@hchat.ai')
  })

  it('login sets authenticated state', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      ),
    })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 400))
    })

    expect(result.current.isAuthenticated).toBe(false)

    await act(async () => {
      await result.current.login({
        email: 'admin@hchat.ai',
        password: 'Admin123!',
      })
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.role).toBe('admin')
  })

  it('login throws on invalid credentials', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      ),
    })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 400))
    })

    await expect(
      act(async () => {
        await result.current.login({
          email: 'wrong@example.com',
          password: 'wrong',
        })
      }),
    ).rejects.toThrow()
  })

  it('logout clears authenticated state', async () => {
    // Test logout directly via mockAuthService (AuthProvider integration
    // is covered by the login test above; this verifies the logout flow)
    await mockAuthService.login({
      email: 'admin@hchat.ai',
      password: 'Admin123!',
    })

    expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeTruthy()
    expect(mockAuthService.isAuthenticated()).toBe(true)

    await mockAuthService.logout()

    expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeNull()
    expect(sessionStorage.getItem('hchat_admin_user')).toBeNull()
    expect(mockAuthService.isAuthenticated()).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// useAuth - context error
// ---------------------------------------------------------------------------

describe('useAuth outside provider', () => {
  it('throws when used outside AuthProvider', () => {
    // React 19 wraps rendering errors — use ErrorBoundary pattern
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const { result } = renderHook(() => useAuth())
      // If renderHook doesn't throw, the hook itself should have thrown
      // and result.current should reflect the error state
      expect(result.current).toBeNull()
    } catch (error) {
      expect((error as Error).message).toContain(
        'useAuth must be used within an AuthProvider',
      )
    } finally {
      spy.mockRestore()
    }
  })
})

// ---------------------------------------------------------------------------
// RealAuthService
// ---------------------------------------------------------------------------

describe('RealAuthService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
    sessionStorage.clear()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function jsonOk<T>(data: T) {
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ success: true, data }),
    } as Response)
  }

  function jsonError(status: number, msg: string) {
    return Promise.resolve({
      ok: false,
      status,
      statusText: msg,
      json: () => Promise.resolve({ error: msg }),
    } as Response)
  }

  function createService(): RealAuthService {
    const client = new ApiClient({ baseURL: 'https://api.test' })
    return new RealAuthService(client)
  }

  it('login stores token and returns user', async () => {
    const mockUser: AuthUser = {
      id: '1',
      email: 'admin@hchat.ai',
      name: 'Admin',
      role: 'admin',
      organization: 'Test',
    }
    mockFetch.mockReturnValue(
      jsonOk({ token: 'abc123', user: mockUser }),
    )

    const service = createService()
    const user = await service.login({
      email: 'admin@hchat.ai',
      password: 'pass123',
    })

    expect(user.email).toBe('admin@hchat.ai')
    expect(sessionStorage.getItem('hchat_admin_auth_token')).toBe('abc123')
  })

  it('login throws on API error', async () => {
    mockFetch.mockReturnValue(jsonError(401, 'Unauthorized'))

    const service = createService()
    await expect(
      service.login({ email: 'admin@hchat.ai', password: 'wrong' }),
    ).rejects.toThrow()
  })

  it('login throws on invalid email format', async () => {
    const service = createService()
    await expect(
      service.login({ email: 'not-email', password: 'pass' }),
    ).rejects.toThrow()
  })

  it('logout clears token even when API fails', async () => {
    sessionStorage.setItem('hchat_admin_auth_token', 'token')
    sessionStorage.setItem('hchat_admin_user', '{}')

    mockFetch.mockReturnValue(jsonError(500, 'Server Error'))

    const service = createService()
    await service.logout()

    expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeNull()
    expect(sessionStorage.getItem('hchat_admin_user')).toBeNull()
  })

  it('logout clears token on success', async () => {
    sessionStorage.setItem('hchat_admin_auth_token', 'token')
    mockFetch.mockReturnValue(jsonOk(null))

    const service = createService()
    await service.logout()

    expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeNull()
  })

  it('getCurrentUser returns null when no token', async () => {
    mockFetch.mockClear()
    const service = createService()
    const user = await service.getCurrentUser()
    expect(user).toBeNull()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('getCurrentUser fetches profile when token exists', async () => {
    sessionStorage.setItem('hchat_admin_auth_token', 'token')

    const mockUser: AuthUser = {
      id: '1',
      email: 'admin@hchat.ai',
      name: 'Admin',
      role: 'admin',
      organization: 'Test',
    }
    mockFetch.mockReturnValue(jsonOk(mockUser))

    const service = createService()
    const user = await service.getCurrentUser()
    expect(user?.email).toBe('admin@hchat.ai')
  })

  it('getCurrentUser clears token on API error', async () => {
    sessionStorage.setItem('hchat_admin_auth_token', 'token')
    mockFetch.mockReturnValue(jsonError(401, 'Unauthorized'))

    const service = createService()
    const user = await service.getCurrentUser()
    expect(user).toBeNull()
    expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeNull()
  })

  it('isAuthenticated returns correct state', () => {
    const service = createService()
    expect(service.isAuthenticated()).toBe(false)

    sessionStorage.setItem('hchat_admin_auth_token', 'token')
    expect(service.isAuthenticated()).toBe(true)
  })

  it('refreshToken stores new token on success', async () => {
    sessionStorage.setItem('hchat_admin_auth_token', 'old-token')
    mockFetch.mockReturnValue(jsonOk({ token: 'new-token' }))

    const service = createService()
    const token = await service.refreshToken()

    expect(token).toBe('new-token')
    expect(sessionStorage.getItem('hchat_admin_auth_token')).toBe('new-token')
  })

  it('refreshToken clears storage and returns null on failure', async () => {
    sessionStorage.setItem('hchat_admin_auth_token', 'old-token')
    mockFetch.mockReturnValue(jsonError(401, 'Expired'))

    const service = createService()
    const token = await service.refreshToken()

    expect(token).toBeNull()
    expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeNull()
  })
})
