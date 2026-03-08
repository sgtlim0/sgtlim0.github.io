import { ApiClient } from './apiClient'
import { tokenStorage } from '../utils/tokenStorage'
import type { AuthService } from '../admin/auth/authService'
import type { AdminApiService } from '../admin/services/apiService'
import { mockAuthService } from '../admin/auth/mockAuthService'
import { RealAuthService } from '../admin/auth/realAuthService'
import { mockApiService } from '../admin/services/mockApiService'
import { RealAdminService } from '../admin/services/realAdminService'
import { RealChatService } from '../user/services/realChatService'

export type ApiMode = 'mock' | 'real'

export function getApiMode(): ApiMode {
  if (typeof window !== 'undefined') {
    return (process.env.NEXT_PUBLIC_API_MODE as ApiMode) ?? 'mock'
  }
  return 'mock'
}

export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'
}

export function getAiCoreUrl(): string {
  return process.env.NEXT_PUBLIC_AI_CORE_URL ?? 'http://localhost:8000'
}

let clientInstance: ApiClient | null = null

export function getApiClient(): ApiClient {
  if (!clientInstance) {
    clientInstance = new ApiClient({
      baseURL: getApiUrl(),
      getToken: () => {
        if (typeof window === 'undefined') return null
        return tokenStorage.getToken()
      },
    })
  }
  return clientInstance
}

// ========== Service Factories ==========

/**
 * Create Auth service based on NEXT_PUBLIC_API_MODE.
 * Returns RealAuthService when mode is 'real', MockAuthService otherwise.
 */
export function createAuthService(): AuthService {
  if (getApiMode() === 'real') {
    return new RealAuthService(getApiClient())
  }
  return mockAuthService
}

/**
 * Create Chat service based on NEXT_PUBLIC_API_MODE.
 * Returns RealChatService when mode is 'real'.
 * Note: mock chat uses module-level functions (chatService.ts), not a class instance.
 */
export function createChatService(): RealChatService {
  return new RealChatService(getApiClient())
}

/**
 * Create Admin API service based on NEXT_PUBLIC_API_MODE.
 * Returns RealAdminService when mode is 'real', MockApiService otherwise.
 */
export function createAdminService(): AdminApiService {
  if (getApiMode() === 'real') {
    return new RealAdminService(getApiClient())
  }
  return mockApiService
}
