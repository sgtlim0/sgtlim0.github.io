import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mockAuthService } from '../src/admin/auth/mockAuthService'

describe('mockAuthService', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('login', () => {
    it('should login admin user with correct credentials', async () => {
      const loginPromise = mockAuthService.login({
        email: 'admin@hchat.ai',
        password: 'Admin123!',
        rememberMe: false,
      })
      vi.advanceTimersByTime(600)
      const user = await loginPromise

      expect(user.email).toBe('admin@hchat.ai')
      expect(user.name).toBe('관리자')
      expect(user.role).toBe('admin')
      expect(user.organization).toBe('현대자동차그룹')
    })

    it('should login manager user', async () => {
      const loginPromise = mockAuthService.login({
        email: 'manager@hchat.ai',
        password: 'pass',
        rememberMe: false,
      })
      vi.advanceTimersByTime(600)
      const user = await loginPromise

      expect(user.role).toBe('manager')
    })

    it('should always store token in sessionStorage (security)', async () => {
      const loginPromise = mockAuthService.login({
        email: 'admin@hchat.ai',
        password: 'Admin123!',
        rememberMe: false,
      })
      vi.advanceTimersByTime(600)
      await loginPromise

      expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeTruthy()
      expect(localStorage.getItem('hchat_admin_auth_token')).toBeNull()
    })

    it('should use sessionStorage even when rememberMe is true', async () => {
      const loginPromise = mockAuthService.login({
        email: 'admin@hchat.ai',
        password: 'Admin123!',
        rememberMe: true,
      })
      vi.advanceTimersByTime(600)
      await loginPromise

      expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeTruthy()
      expect(sessionStorage.getItem('hchat_admin_user')).toBeTruthy()
      expect(localStorage.getItem('hchat_admin_auth_token')).toBeNull()
    })

    it('should throw error for invalid email', async () => {
      const loginPromise = mockAuthService.login({
        email: 'wrong@hchat.ai',
        password: 'Admin123!',
        rememberMe: false,
      })
      vi.advanceTimersByTime(600)

      await expect(loginPromise).rejects.toThrow('이메일 또는 비밀번호가 올바르지 않습니다.')
    })

    it('should throw error for empty password', async () => {
      const loginPromise = mockAuthService.login({
        email: 'admin@hchat.ai',
        password: '',
        rememberMe: false,
      })
      vi.advanceTimersByTime(600)

      await expect(loginPromise).rejects.toThrow('비밀번호를 입력해주세요')
    })

    it('should throw error for invalid email format', async () => {
      const loginPromise = mockAuthService.login({
        email: 'not-an-email',
        password: 'password123',
        rememberMe: false,
      })
      vi.advanceTimersByTime(600)

      await expect(loginPromise).rejects.toThrow('올바른 이메일 형식이 아닙니다')
    })
  })

  describe('logout', () => {
    it('should clear sessionStorage on logout', async () => {
      const loginPromise = mockAuthService.login({
        email: 'admin@hchat.ai',
        password: 'Admin123!',
        rememberMe: false,
      })
      vi.advanceTimersByTime(600)
      await loginPromise

      expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeTruthy()

      const logoutPromise = mockAuthService.logout()
      vi.advanceTimersByTime(300)
      await logoutPromise

      expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeNull()
      expect(sessionStorage.getItem('hchat_admin_user')).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('should return null when no token exists', async () => {
      const promise = mockAuthService.getCurrentUser()
      vi.advanceTimersByTime(400)
      const user = await promise

      expect(user).toBeNull()
    })

    it('should return user from sessionStorage', async () => {
      sessionStorage.setItem('hchat_admin_auth_token', 'test-token')
      sessionStorage.setItem(
        'hchat_admin_user',
        JSON.stringify({
          id: '1',
          email: 'admin@hchat.ai',
          name: '관리자',
          role: 'admin',
          organization: '현대자동차그룹', // Zod 스키마에 필수 필드 추가
        }),
      )

      const promise = mockAuthService.getCurrentUser()
      vi.advanceTimersByTime(400)
      const user = await promise

      expect(user).not.toBeNull()
      expect(user!.email).toBe('admin@hchat.ai')
    })

    it('should return null for user data that fails Zod validation', async () => {
      sessionStorage.setItem('hchat_admin_auth_token', 'test-token')
      sessionStorage.setItem(
        'hchat_admin_user',
        JSON.stringify({
          id: '1',
          email: 'not-an-email', // 잘못된 이메일 형식
          name: '관리자',
          role: 'superadmin', // 허용되지 않는 role
          organization: '현대자동차그룹',
        }),
      )

      const promise = mockAuthService.getCurrentUser()
      vi.advanceTimersByTime(400)
      const user = await promise

      expect(user).toBeNull() // Zod 검증 실패로 null 반환
    })

    it('should return null for invalid JSON', async () => {
      sessionStorage.setItem('hchat_admin_auth_token', 'test-token')
      sessionStorage.setItem('hchat_admin_user', 'invalid-json')

      const promise = mockAuthService.getCurrentUser()
      vi.advanceTimersByTime(400)
      const user = await promise

      expect(user).toBeNull()
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
