import { ApiClient } from './apiClient'
import { tokenStorage } from '../utils/tokenStorage'

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
