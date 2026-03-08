import type { AuthService } from './authService'
import type { AuthUser, LoginCredentials } from './types'
import { loginCredentialsSchema, authUserSchema } from '../../schemas/auth'

const MOCK_USERS: Record<string, AuthUser> = {
  'admin@hchat.ai': {
    id: '1',
    email: 'admin@hchat.ai',
    name: '관리자',
    role: 'admin',
    organization: '현대자동차그룹',
    avatarUrl: undefined,
  },
  'manager@hchat.ai': {
    id: '2',
    email: 'manager@hchat.ai',
    name: '매니저',
    role: 'manager',
    organization: '현대자동차그룹',
    avatarUrl: undefined,
  },
}

const STORAGE_KEY = 'hchat_admin_auth_token'
const USER_KEY = 'hchat_admin_user'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

class MockAuthService implements AuthService {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    // Zod 검증 추가
    const validated = loginCredentialsSchema.parse(credentials)

    await delay(500)

    const user = MOCK_USERS[validated.email]
    if (!user || !validated.password) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    const token = btoa(JSON.stringify({ email: validated.email, timestamp: Date.now() }))

    // Security: always use sessionStorage to mitigate XSS token theft
    // (localStorage persists across tabs/sessions, making stolen tokens long-lived)
    sessionStorage.setItem(STORAGE_KEY, token)
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))

    return user
  }

  async logout(): Promise<void> {
    await delay(200)
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(USER_KEY)
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    await delay(300)

    const token = sessionStorage.getItem(STORAGE_KEY)
    if (!token) {
      return null
    }

    const userStr = sessionStorage.getItem(USER_KEY)
    if (!userStr) {
      return null
    }

    try {
      const user = JSON.parse(userStr)
      // 저장된 사용자 데이터도 검증
      return authUserSchema.parse(user)
    } catch {
      return null
    }
  }

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem(STORAGE_KEY)
  }
}

export const mockAuthService = new MockAuthService()
