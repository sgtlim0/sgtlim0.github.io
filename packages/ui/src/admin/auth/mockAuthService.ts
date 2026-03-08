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

/**
 * Mock implementation of AuthService for development and testing.
 * Uses PBKDF2-hashed passwords and HMAC-SHA256 signed JWT tokens.
 * Stores authentication state in sessionStorage via tokenStorage.
 */
class MockAuthService implements AuthService {
  /**
   * Authenticates a user against pre-defined mock accounts.
   * Validates credentials with Zod, verifies the PBKDF2 password hash,
   * and generates a signed JWT token on success.
   * @param credentials - Email and password
   * @returns The authenticated AuthUser
   * @throws Error if email or password is invalid
   */
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

  /**
   * Logs out the current user by clearing sessionStorage tokens.
   */
  async logout(): Promise<void> {
    await delay(200)
    tokenStorage.clear()
  }

  /**
   * Retrieves the current authenticated user by verifying the stored JWT token.
   * Clears storage and returns null if the token is invalid or expired.
   * @returns The current AuthUser, or null if not authenticated
   */
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

  /**
   * Checks whether a valid token exists in storage.
   * @returns True if a token is present
   */
  isAuthenticated(): boolean {
    return tokenStorage.isAuthenticated()
  }
}

/** Singleton mock auth service instance for development/testing. */
export const mockAuthService = new MockAuthService()

/**
 * Resets the password hash initialization state. For testing only.
 */
export function _resetForTesting(): void {
  initialized = false
  passwordHashes = {}
}
