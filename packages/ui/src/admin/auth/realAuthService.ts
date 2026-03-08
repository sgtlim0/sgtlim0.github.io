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

export class RealAuthService implements AuthService {
  private client: ApiClient

  constructor(client: ApiClient) {
    this.client = client
  }

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

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout')
    } catch {
      // 서버 요청 실패해도 로컬 토큰은 제거
    } finally {
      tokenStorage.clear()
    }
  }

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

  isAuthenticated(): boolean {
    return tokenStorage.isAuthenticated()
  }

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

export function createRealAuthService(): RealAuthService {
  return new RealAuthService(getApiClient())
}
