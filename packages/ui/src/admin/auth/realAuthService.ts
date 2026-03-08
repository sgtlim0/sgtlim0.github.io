import type { AuthService } from './authService'
import type { AuthUser, LoginCredentials } from './types'
import { loginCredentialsSchema, authUserSchema } from '../../schemas/auth'
import { tokenStorage } from '../../utils/tokenStorage'
import type { ApiClient } from '../../client/apiClient'
import { getApiClient } from '../../client/serviceFactory'

interface LoginResponse {
  token: string
  user: AuthUser
}

/**
 * Production implementation of AuthService that communicates with a real API backend.
 * Validates credentials with Zod, stores tokens in sessionStorage, and supports token refresh.
 */
export class RealAuthService implements AuthService {
  private client: ApiClient

  /**
   * @param client - Configured ApiClient instance for making HTTP requests
   */
  constructor(client: ApiClient) {
    this.client = client
  }

  /**
   * Authenticates a user by sending credentials to the /auth/login endpoint.
   * Stores the returned JWT token and user data in sessionStorage.
   * @param credentials - Email and password
   * @returns The authenticated AuthUser
   * @throws Error if login fails
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const validated = loginCredentialsSchema.parse(credentials)

    try {
      const response = await this.client.post<LoginResponse>('/auth/login', {
        email: validated.email,
        password: validated.password,
      })

      const user = authUserSchema.parse(response.user)
      tokenStorage.setToken(response.token)
      tokenStorage.setUser(user)

      return user
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '로그인에 실패했습니다. 다시 시도해주세요.',
      )
    }
  }

  /**
   * Logs out by calling /auth/logout and clearing local tokens.
   * Local tokens are always cleared, even if the server request fails.
   */
  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout')
    } catch {
      // 서버 요청 실패해도 로컬 토큰은 제거
    } finally {
      tokenStorage.clear()
    }
  }

  /**
   * Fetches the current user's profile from /auth/profile.
   * Clears tokens if the request fails (e.g., expired token).
   * @returns The current AuthUser, or null if not authenticated
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const token = tokenStorage.getToken()
    if (!token) {
      return null
    }

    try {
      const user = await this.client.get<AuthUser>('/auth/profile')
      const validated = authUserSchema.parse(user)

      tokenStorage.setUser(validated)
      return validated
    } catch {
      tokenStorage.clear()
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

  /**
   * Requests a new JWT token via /auth/refresh.
   * Clears tokens if the refresh fails.
   * @returns The new token string, or null on failure
   */
  async refreshToken(): Promise<string | null> {
    try {
      const response = await this.client.post<{ token: string }>(
        '/auth/refresh',
      )
      tokenStorage.setToken(response.token)
      return response.token
    } catch {
      tokenStorage.clear()
      return null
    }
  }
}

/**
 * Factory function that creates a RealAuthService using the default ApiClient.
 * @returns A new RealAuthService instance
 */
export function createRealAuthService(): RealAuthService {
  return new RealAuthService(getApiClient())
}
