import { describe, it, expect, beforeEach } from 'vitest'
import { mockAuthService, _resetForTesting } from '../src/admin/auth/mockAuthService'
import { generateToken } from '../src/admin/auth/token'

describe('mockAuthService', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    _resetForTesting()
  })

  describe('login', () => {
    it('should login admin user with correct credentials', async () => {
      const user = await mockAuthService.login({
        email: 'admin@hchat.ai',
        password: 'Admin123!',
        rememberMe: false,
      })

      expect(user.email).toBe('admin@hchat.ai')
      expect(user.name).toBe('관리자')
      expect(user.role).toBe('admin')
      expect(user.organization).toBe('현대자동차그룹')
    })

    it('should login manager user', async () => {
      const user = await mockAuthService.login({
        email: 'manager@hchat.ai',
        password: 'Manager123!',
        rememberMe: false,
      })

      expect(user.role).toBe('manager')
    })

    it('should always store token in sessionStorage (security)', async () => {
      await mockAuthService.login({
        email: 'admin@hchat.ai',
        password: 'Admin123!',
        rememberMe: false,
      })

      expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeTruthy()
      expect(localStorage.getItem('hchat_admin_auth_token')).toBeNull()
    })

    it('should use sessionStorage even when rememberMe is true', async () => {
      await mockAuthService.login({
        email: 'admin@hchat.ai',
        password: 'Admin123!',
        rememberMe: true,
      })

      expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeTruthy()
      expect(sessionStorage.getItem('hchat_admin_user')).toBeTruthy()
      expect(localStorage.getItem('hchat_admin_auth_token')).toBeNull()
    })

    it('should throw error for invalid email', async () => {
      await expect(
        mockAuthService.login({
          email: 'wrong@hchat.ai',
          password: 'Admin123!',
          rememberMe: false,
        }),
      ).rejects.toThrow('이메일 또는 비밀번호가 올바르지 않습니다.')
    })

    it('should throw error for empty password', async () => {
      await expect(
        mockAuthService.login({
          email: 'admin@hchat.ai',
          password: '',
          rememberMe: false,
        }),
      ).rejects.toThrow('비밀번호를 입력해주세요')
    })

    it('should throw error for invalid email format', async () => {
      await expect(
        mockAuthService.login({
          email: 'not-an-email',
          password: 'password123',
          rememberMe: false,
        }),
      ).rejects.toThrow('올바른 이메일 형식이 아닙니다')
    })

    it('should store a signed JWT token (not plain base64)', async () => {
      await mockAuthService.login({
        email: 'admin@hchat.ai',
        password: 'Admin123!',
        rememberMe: false,
      })

      const token = sessionStorage.getItem('hchat_admin_auth_token')!
      const parts = token.split('.')
      expect(parts).toHaveLength(3)
    })

    it('should reject wrong password for valid email', async () => {
      await expect(
        mockAuthService.login({
          email: 'admin@hchat.ai',
          password: 'WrongPass!',
          rememberMe: false,
        }),
      ).rejects.toThrow('이메일 또는 비밀번호가 올바르지 않습니다.')
    })
  })

  describe('logout', () => {
    it('should clear sessionStorage on logout', async () => {
      await mockAuthService.login({
        email: 'admin@hchat.ai',
        password: 'Admin123!',
        rememberMe: false,
      })

      expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeTruthy()

      await mockAuthService.logout()

      expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeNull()
      expect(sessionStorage.getItem('hchat_admin_user')).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('should return null when no token exists', async () => {
      const user = await mockAuthService.getCurrentUser()
      expect(user).toBeNull()
    })

    it('should return user from sessionStorage with valid JWT', async () => {
      // Generate a real signed token
      const token = await generateToken({ email: 'admin@hchat.ai' })
      sessionStorage.setItem('hchat_admin_auth_token', token)
      sessionStorage.setItem(
        'hchat_admin_user',
        JSON.stringify({
          id: '1',
          email: 'admin@hchat.ai',
          name: '관리자',
          role: 'admin',
          organization: '현대자동차그룹',
        }),
      )

      const user = await mockAuthService.getCurrentUser()

      expect(user).not.toBeNull()
      expect(user!.email).toBe('admin@hchat.ai')
    })

    it('should return null for user data that fails Zod validation', async () => {
      const token = await generateToken({ email: 'admin@hchat.ai' })
      sessionStorage.setItem('hchat_admin_auth_token', token)
      sessionStorage.setItem(
        'hchat_admin_user',
        JSON.stringify({
          id: '1',
          email: 'not-an-email',
          name: '관리자',
          role: 'superadmin',
          organization: '현대자동차그룹',
        }),
      )

      const user = await mockAuthService.getCurrentUser()
      expect(user).toBeNull()
    })

    it('should return null for invalid JSON', async () => {
      const token = await generateToken({ email: 'admin@hchat.ai' })
      sessionStorage.setItem('hchat_admin_auth_token', token)
      sessionStorage.setItem('hchat_admin_user', 'invalid-json')

      const user = await mockAuthService.getCurrentUser()
      expect(user).toBeNull()
    })

    it('should clear storage when token is invalid', async () => {
      sessionStorage.setItem('hchat_admin_auth_token', 'not-a-valid-jwt')
      sessionStorage.setItem(
        'hchat_admin_user',
        JSON.stringify({
          id: '1',
          email: 'admin@hchat.ai',
          name: '관리자',
          role: 'admin',
          organization: '현대자동차그룹',
        }),
      )

      const user = await mockAuthService.getCurrentUser()
      expect(user).toBeNull()
      expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return false when no token', () => {
      expect(mockAuthService.isAuthenticated()).toBe(false)
    })

    it('should return true with sessionStorage token', () => {
      sessionStorage.setItem('hchat_admin_auth_token', 'token')
      expect(mockAuthService.isAuthenticated()).toBe(true)
    })
  })
})
