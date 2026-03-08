import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ProtectedRoute from '../src/admin/auth/ProtectedRoute'
import type { AuthContextValue } from '../src/admin/auth/AuthProvider'
import type { AuthUser } from '../src/admin/auth/types'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock AuthProvider
vi.mock('../src/admin/auth/AuthProvider', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../src/admin/auth/AuthProvider'

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading state', () => {
    it('should display loading spinner when isLoading is true', () => {
      const mockAuthContext: AuthContextValue = {
        user: null,
        isAuthenticated: false,
        isLoading: true,
        login: vi.fn(),
        logout: vi.fn(),
      }

      vi.mocked(useAuth).mockReturnValue(mockAuthContext)

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
      )

      // Check for loading spinner
      expect(screen.getByText('로딩 중...')).toBeDefined()
      expect(screen.queryByText('Protected Content')).toBeNull()
    })
  })

  describe('Authentication', () => {
    it('should redirect to /login when not authenticated', async () => {
      const mockAuthContext: AuthContextValue = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      }

      vi.mocked(useAuth).mockReturnValue(mockAuthContext)

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login')
      })

      // Should not render protected content
      expect(screen.queryByText('Protected Content')).toBeNull()
    })

    it('should render children when authenticated', () => {
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

      const mockAuthContext: AuthContextValue = {
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      }

      vi.mocked(useAuth).mockReturnValue(mockAuthContext)

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
      )

      // Should render protected content
      expect(screen.getByText('Protected Content')).toBeDefined()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Role-based access', () => {
    it('should render children when user role meets minimum requirement', () => {
      const mockUser: AuthUser = {
        id: '1',
        email: 'manager@hchat.ai',
        name: 'Manager User',
        role: 'manager',
        organization: 'H Chat',
        department: 'IT',
        avatar: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }

      const mockAuthContext: AuthContextValue = {
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      }

      vi.mocked(useAuth).mockReturnValue(mockAuthContext)

      render(
        <ProtectedRoute minRole="viewer">
          <div>Protected Content</div>
        </ProtectedRoute>,
      )

      // Manager role is higher than viewer, should render content
      expect(screen.getByText('Protected Content')).toBeDefined()
    })

    it('should show access denied when user role is insufficient', () => {
      const mockUser: AuthUser = {
        id: '1',
        email: 'viewer@hchat.ai',
        name: 'Viewer User',
        role: 'viewer',
        organization: 'H Chat',
        department: 'IT',
        avatar: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }

      const mockAuthContext: AuthContextValue = {
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      }

      vi.mocked(useAuth).mockReturnValue(mockAuthContext)

      render(
        <ProtectedRoute minRole="admin">
          <div>Admin Only Content</div>
        </ProtectedRoute>,
      )

      // Should show access denied message
      expect(screen.getByText('접근 권한이 없습니다')).toBeDefined()
      expect(screen.getByText(/이 페이지에 접근하려면 admin 권한 이상이 필요합니다/)).toBeDefined()
      expect(screen.queryByText('Admin Only Content')).toBeNull()

      // Should have "back to dashboard" button
      const backButton = screen.getByRole('button', { name: /대시보드로 돌아가기/ })
      expect(backButton).toBeDefined()
    })

    it('should allow admin role to access all pages', () => {
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

      const mockAuthContext: AuthContextValue = {
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      }

      vi.mocked(useAuth).mockReturnValue(mockAuthContext)

      // Test with highest role requirement
      render(
        <ProtectedRoute minRole="admin">
          <div>Admin Content</div>
        </ProtectedRoute>,
      )

      // Admin should access admin-level content
      expect(screen.getByText('Admin Content')).toBeDefined()
    })

    it('should handle when user object exists but no role specified', () => {
      const mockUser: AuthUser = {
        id: '1',
        email: 'viewer@hchat.ai',
        name: 'Viewer User',
        role: 'viewer',
        organization: 'H Chat',
        department: 'IT',
        avatar: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }

      const mockAuthContext: AuthContextValue = {
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      }

      vi.mocked(useAuth).mockReturnValue(mockAuthContext)

      // No minRole specified - should allow any authenticated user
      render(
        <ProtectedRoute>
          <div>Any Authenticated User Content</div>
        </ProtectedRoute>,
      )

      expect(screen.getByText('Any Authenticated User Content')).toBeDefined()
    })
  })

  describe('Edge cases', () => {
    it('should return null when authenticated but user is null', () => {
      const mockAuthContext: AuthContextValue = {
        user: null,
        isAuthenticated: true, // Edge case: authenticated but no user
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      }

      vi.mocked(useAuth).mockReturnValue(mockAuthContext)

      const { container } = render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
      )

      // Should return null (empty render)
      expect(container.firstChild).toBeNull()
      expect(screen.queryByText('Protected Content')).toBeNull()
    })

    it('should handle dashboard navigation click', async () => {
      const mockUser: AuthUser = {
        id: '1',
        email: 'viewer@hchat.ai',
        name: 'Viewer User',
        role: 'viewer',
        organization: 'H Chat',
        department: 'IT',
        avatar: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }

      const mockAuthContext: AuthContextValue = {
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      }

      vi.mocked(useAuth).mockReturnValue(mockAuthContext)

      render(
        <ProtectedRoute minRole="admin">
          <div>Admin Only Content</div>
        </ProtectedRoute>,
      )

      // Click the back to dashboard button
      const backButton = screen.getByRole('button', { name: /대시보드로 돌아가기/ })
      backButton.click()

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })
  })
})
