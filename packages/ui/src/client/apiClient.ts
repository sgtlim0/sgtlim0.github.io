type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiClientConfig {
  baseURL: string
  getToken?: () => string | null
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: { total: number; page: number; limit: number }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiClient {
  private config: ApiClientConfig

  constructor(config: ApiClientConfig) {
    this.config = config
  }

  async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = this.config.getToken?.()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>),
      ...((options?.headers as Record<string, string>) ?? {}),
    }

    const response = await globalThis.fetch(`${this.config.baseURL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      throw new ApiError(
        response.status,
        (errorBody as { error?: string }).error ?? response.statusText,
      )
    }

    const json = (await response.json()) as ApiResponse<T>
    if (json.success === false) {
      throw new ApiError(400, json.error ?? 'Request failed')
    }
    return (json.data ?? json) as T
  }

  get<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'GET' })
  }

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE' })
  }
}
