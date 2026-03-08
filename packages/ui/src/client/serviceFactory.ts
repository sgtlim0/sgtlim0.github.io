import { ApiClient } from './apiClient'
import { tokenStorage } from '../utils/tokenStorage'
import type { AuthService } from '../admin/auth/authService'
import type { AdminApiService } from '../admin/services/apiService'
import { RealAuthService } from '../admin/auth/realAuthService'
import { RealAdminService } from '../admin/services/realAdminService'
import { RealChatService } from '../user/services/realChatService'

/** API mode determining whether mock or real services are used. */
export type ApiMode = 'mock' | 'real'

/**
 * Reads the API mode from the NEXT_PUBLIC_API_MODE environment variable.
 * Defaults to 'mock' in SSR or when the variable is not set.
 * @returns 'mock' or 'real'
 */
export function getApiMode(): ApiMode {
  if (typeof window !== 'undefined') {
    return (process.env.NEXT_PUBLIC_API_MODE as ApiMode) ?? 'mock'
  }
  return 'mock'
}

/**
 * Returns the base API URL from NEXT_PUBLIC_API_URL (default: http://localhost:3000/api).
 * @returns API base URL string
 */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'
}

/**
 * Returns the AI Core backend URL from NEXT_PUBLIC_AI_CORE_URL (default: http://localhost:8000).
 * @returns AI Core base URL string
 */
export function getAiCoreUrl(): string {
  return process.env.NEXT_PUBLIC_AI_CORE_URL ?? 'http://localhost:8000'
}

let clientInstance: ApiClient | null = null

/**
 * Returns (or creates) a singleton ApiClient configured with the base API URL
 * and an automatic token provider from sessionStorage.
 * @returns Shared ApiClient instance
 */
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
 * Returns RealAuthService when mode is 'real', dynamically loads MockAuthService otherwise.
 */
export async function createAuthService(): Promise<AuthService> {
  if (getApiMode() === 'real') {
    return new RealAuthService(getApiClient())
  }
  const { mockAuthService } = await import('../admin/auth/mockAuthService')
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
 * Returns RealAdminService when mode is 'real', dynamically loads MockApiService otherwise.
 */
export async function createAdminService(): Promise<AdminApiService> {
  if (getApiMode() === 'real') {
    return new RealAdminService(getApiClient())
  }
  const { mockApiService } = await import('../admin/services/mockApiService')
  return mockApiService
}
