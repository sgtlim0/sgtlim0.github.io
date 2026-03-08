import type { AuthService } from './authService'
import type { AuthUser, LoginCredentials } from './types'
import { loginCredentialsSchema, authUserSchema } from '../../schemas/auth'
import { tokenStorage } from '../../utils/tokenStorage'
import { hashPassword, verifyPassword } from './crypto'
import { generateToken, verifyToken } from './token'

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

// 사전 해싱된 비밀번호 저장소 (초기화 시 생성)
let passwordHashes: Record<string, string> = {}
let initialized = false

const MOCK_PASSWORDS: Record<string, string> = {
  'admin@hchat.ai': 'Admin123!',
  'manager@hchat.ai': 'Manager123!',
}

async function ensureInitialized(): Promise<void> {
  if (initialized) {
    return
  }
  const entries = Object.entries(MOCK_PASSWORDS)
  const hashes = await Promise.all(
    entries.map(async ([email, password]) => {
      const hash = await hashPassword(password)
      return [email, hash] as const
    }),
  )
  passwordHashes = Object.fromEntries(hashes)
  initialized = true
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

class MockAuthService implements AuthService {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    // Zod 검증
    const validated = loginCredentialsSchema.parse(credentials)

    await ensureInitialized()
    await delay(500)

    const user = MOCK_USERS[validated.email]
    const storedHash = passwordHashes[validated.email]

    if (!user || !storedHash) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    const isValid = await verifyPassword(validated.password, storedHash)
    if (!isValid) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    // HMAC-SHA256 서명된 JWT 토큰 생성
    const token = await generateToken({
      email: validated.email,
      role: user.role,
      sub: user.id,
    })

    // Security: always use sessionStorage to mitigate XSS token theft
    tokenStorage.setToken(token)
    tokenStorage.setUser(user)

    return user
  }

  async logout(): Promise<void> {
    await delay(200)
    tokenStorage.clear()
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    await delay(300)

    const token = tokenStorage.getToken()
    if (!token) {
      return null
    }

    // JWT 서명 및 만료 검증
    const payload = await verifyToken(token)
    if (!payload) {
      tokenStorage.clear()
      return null
    }

    const user = tokenStorage.getUser<AuthUser>()
    if (!user) {
      return null
    }

    try {
      return authUserSchema.parse(user)
    } catch {
      return null
    }
  }

  isAuthenticated(): boolean {
    return tokenStorage.isAuthenticated()
  }
}

export const mockAuthService = new MockAuthService()

// 테스트용: 비밀번호 해시 초기화 상태 리셋
export function _resetForTesting(): void {
  initialized = false
  passwordHashes = {}
}
