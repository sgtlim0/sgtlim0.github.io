// ─────────────────────────────────────────────
// H Chat API Client SDK
// Type-safe client derived from docs/openapi.yaml
// ─────────────────────────────────────────────

import type {
  AdminDashboard,
  AdminNotification,
  AdminSettings,
  AdminSettingsUpdate,
  AdminUser,
  AlertRule,
  AnalyticsData,
  AnalyzeRequest,
  AnalyzeResponse,
  ApiKeyInfo,
  Assistant,
  BenchmarkResult,
  ChatRequest,
  ChatResponse,
  ChatRoom,
  ChatSendRequest,
  ChatSendResponse,
  ChatStreamEvent,
  ChartData,
  CsrfTokenResponse,
  FinetuneDataset,
  FinetuneJob,
  HealthResponse,
  KnowledgeGraph,
  LoginRequest,
  LoginResponse,
  MarketplaceAgent,
  Model,
  Permission,
  PromptVersion,
  RagDocument,
  RagSearchResponse,
  RealtimeMetrics,
  Role,
  RoomMessage,
  SsoConnection,
  SsoTestResult,
  SttResult,
  Tenant,
  TtsResult,
  User,
} from './apiTypes'

// ─────────────────────────────────────────────
// SDK Configuration
// ─────────────────────────────────────────────

export interface ApiSdkOptions {
  /** Base URL for the API (e.g. http://localhost:3003) */
  readonly baseUrl: string
  /** API version prefix (default: 'v1') */
  readonly version?: 'v1'
  /** Optional auth token provider */
  readonly getToken?: () => string | null
  /** Optional CSRF token provider */
  readonly getCsrfToken?: () => string | null
  /** Custom fetch implementation (defaults to globalThis.fetch) */
  readonly fetch?: typeof globalThis.fetch
}

// ─────────────────────────────────────────────
// SDK Error
// ─────────────────────────────────────────────

export class ApiSdkError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ApiSdkError'
  }
}

// ─────────────────────────────────────────────
// Namespace Interfaces
// ─────────────────────────────────────────────

export interface ChatNamespace {
  send(body: ChatRequest): Promise<ChatResponse>
  stream(body: ChatRequest): AsyncIterable<ChatStreamEvent>
  sendMessage(body: ChatSendRequest): Promise<ChatSendResponse>
  getHistory(): Promise<unknown[]>
  getAssistants(): Promise<Assistant[]>
}

export interface AnalyzeNamespace {
  analyze(body: AnalyzeRequest): Promise<AnalyzeResponse>
}

export interface ResearchNamespace {
  search(body: { query: string; num_sources?: number }): Promise<import('./apiTypes').ResearchResponse>
}

export interface HealthNamespace {
  check(): Promise<HealthResponse>
}

export interface CsrfNamespace {
  getToken(): Promise<CsrfTokenResponse>
}

export interface AuthNamespace {
  login(body: LoginRequest): Promise<LoginResponse>
  logout(): Promise<void>
  me(): Promise<User>
}

export interface AdminNamespace {
  getDashboard(): Promise<AdminDashboard>
  getUsers(): Promise<AdminUser[]>
  getSettings(): Promise<AdminSettings>
  updateSettings(body: AdminSettingsUpdate): Promise<AdminSettings>
  getRealtimeMetrics(): Promise<RealtimeMetrics>
  getNotifications(): Promise<AdminNotification[]>
  getWidgetLayout(): Promise<{ layout: unknown[]; widgets: unknown[] }>
  getWorkflows(): Promise<unknown[]>
}

export interface EnterpriseNamespace {
  getTenants(): Promise<Tenant[]>
  getMarketplaceAgents(): Promise<MarketplaceAgent[]>
  getRoles(): Promise<Role[]>
  getPermissions(): Promise<Permission[]>
  getSsoConnections(): Promise<SsoConnection[]>
  testSsoConnection(): Promise<SsoTestResult>
}

export interface AiEngineNamespace {
  getAnalytics(): Promise<AnalyticsData>
  ragSearch(query: string): Promise<RagSearchResponse>
  getRagDocuments(): Promise<RagDocument[]>
  getPromptVersions(): Promise<PromptVersion[]>
  getPromptAbTests(): Promise<unknown[]>
  getBenchmarks(): Promise<BenchmarkResult[]>
}

export interface CollaborationNamespace {
  getAlertRules(): Promise<AlertRule[]>
  getChatRooms(): Promise<ChatRoom[]>
  getRoomMessages(roomId: string): Promise<RoomMessage[]>
}

export interface AdvancedNamespace {
  getFinetuneJobs(): Promise<FinetuneJob[]>
  getFinetuneDatasets(): Promise<FinetuneDataset[]>
  getCharts(): Promise<ChartData>
  getKnowledgeGraph(): Promise<KnowledgeGraph>
  speechToText(): Promise<SttResult>
  textToSpeech(): Promise<TtsResult>
}

export interface ModelsNamespace {
  list(provider?: string): Promise<Model[]>
  streamOutput(id: string): AsyncIterable<ChatStreamEvent>
  getApiKeys(): Promise<ApiKeyInfo[]>
}

export interface HChatApiClient {
  readonly chat: ChatNamespace
  readonly analyze: AnalyzeNamespace
  readonly research: ResearchNamespace
  readonly health: HealthNamespace
  readonly csrf: CsrfNamespace
  readonly auth: AuthNamespace
  readonly admin: AdminNamespace
  readonly enterprise: EnterpriseNamespace
  readonly aiEngine: AiEngineNamespace
  readonly collaboration: CollaborationNamespace
  readonly advanced: AdvancedNamespace
  readonly models: ModelsNamespace
}

// ─────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────

function buildHeaders(
  options: ApiSdkOptions,
  method: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const token = options.getToken?.()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const needsCsrf = method !== 'GET' && method !== 'HEAD'
  if (needsCsrf) {
    const csrf = options.getCsrfToken?.()
    if (csrf) {
      headers['X-CSRF-Token'] = csrf
    }
  }

  return headers
}

async function request<T>(
  options: ApiSdkOptions,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const fetchFn = options.fetch ?? globalThis.fetch
  const url = `${options.baseUrl}${path}`
  const headers = buildHeaders(options, method)

  const init: RequestInit = {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  }

  const response = await fetchFn(url, init)

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const typed = errorBody as { error?: string; details?: Record<string, unknown> }
    throw new ApiSdkError(
      response.status,
      typed.error ?? response.statusText,
      typed.details,
    )
  }

  const json = await response.json()

  // Handle wrapped { success, data } responses
  if (
    typeof json === 'object' &&
    json !== null &&
    'success' in json
  ) {
    const wrapped = json as { success: boolean; data?: T; error?: string }
    if (wrapped.success === false) {
      throw new ApiSdkError(400, wrapped.error ?? 'Request failed')
    }
    return (wrapped.data ?? json) as T
  }

  return json as T
}

async function* streamSSE(
  options: ApiSdkOptions,
  method: string,
  path: string,
  body?: unknown,
): AsyncIterable<ChatStreamEvent> {
  const fetchFn = options.fetch ?? globalThis.fetch
  const url = `${options.baseUrl}${path}`
  const headers = buildHeaders(options, method)

  const response = await fetchFn(url, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const typed = errorBody as { error?: string }
    throw new ApiSdkError(
      response.status,
      typed.error ?? response.statusText,
    )
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new ApiSdkError(502, 'No stream body')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue

        const payload = trimmed.slice(5).trim()

        if (payload === '[DONE]') {
          yield { type: 'done' }
          return
        }

        if (payload.startsWith('[ERROR]')) {
          yield { type: 'error', message: payload.slice(7).trim() }
          return
        }

        yield { type: 'token', data: payload }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

// ─────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────

export function createApiClient(options: ApiSdkOptions): HChatApiClient {
  const get = <T>(path: string) => request<T>(options, 'GET', path)
  const post = <T>(path: string, body?: unknown) => request<T>(options, 'POST', path, body)
  const put = <T>(path: string, body?: unknown) => request<T>(options, 'PUT', path, body)
  const sse = (method: string, path: string, body?: unknown) => streamSSE(options, method, path, body)

  const prefix = '/api'

  return {
    chat: {
      send: (body) => post<ChatResponse>(`${prefix}/chat`, body),
      stream: (body) => sse('POST', `${prefix}/chat/stream`, body),
      sendMessage: (body) => post<ChatSendResponse>(`${prefix}/chat/send`, body),
      getHistory: () => get<unknown[]>(`${prefix}/chat/history`),
      getAssistants: () => get<Assistant[]>(`${prefix}/assistants`),
    },

    analyze: {
      analyze: (body) => post<AnalyzeResponse>(`${prefix}/analyze`, body),
    },

    research: {
      search: (body) => post<import('./apiTypes').ResearchResponse>(`${prefix}/research`, body),
    },

    health: {
      check: () => get<HealthResponse>(`${prefix}/health`),
    },

    csrf: {
      getToken: () => get<CsrfTokenResponse>(`${prefix}/csrf`),
    },

    auth: {
      login: (body) => post<LoginResponse>(`${prefix}/auth/login`, body),
      logout: () => post<void>(`${prefix}/auth/logout`),
      me: () => get<User>(`${prefix}/auth/me`),
    },

    admin: {
      getDashboard: () => get<AdminDashboard>(`${prefix}/admin/dashboard`),
      getUsers: () => get<AdminUser[]>(`${prefix}/admin/users`),
      getSettings: () => get<AdminSettings>(`${prefix}/admin/settings`),
      updateSettings: (body) => put<AdminSettings>(`${prefix}/admin/settings`, body),
      getRealtimeMetrics: () => get<RealtimeMetrics>(`${prefix}/admin/realtime/metrics`),
      getNotifications: () => get<AdminNotification[]>(`${prefix}/admin/notifications`),
      getWidgetLayout: () => get<{ layout: unknown[]; widgets: unknown[] }>(`${prefix}/admin/widgets/layout`),
      getWorkflows: () => get<unknown[]>(`${prefix}/admin/workflows`),
    },

    enterprise: {
      getTenants: () => get<Tenant[]>(`${prefix}/admin/tenants`),
      getMarketplaceAgents: () => get<MarketplaceAgent[]>(`${prefix}/admin/marketplace/agents`),
      getRoles: () => get<Role[]>(`${prefix}/admin/roles`),
      getPermissions: () => get<Permission[]>(`${prefix}/admin/permissions`),
      getSsoConnections: () => get<SsoConnection[]>(`${prefix}/admin/sso/connections`),
      testSsoConnection: () => post<SsoTestResult>(`${prefix}/admin/sso/test`),
    },

    aiEngine: {
      getAnalytics: () => get<AnalyticsData>(`${prefix}/admin/analytics`),
      ragSearch: (query) => get<RagSearchResponse>(`${prefix}/admin/rag/search?q=${encodeURIComponent(query)}`),
      getRagDocuments: () => get<RagDocument[]>(`${prefix}/admin/rag/documents`),
      getPromptVersions: () => get<PromptVersion[]>(`${prefix}/admin/prompts/versions`),
      getPromptAbTests: () => get<unknown[]>(`${prefix}/admin/prompts/ab-tests`),
      getBenchmarks: () => get<BenchmarkResult[]>(`${prefix}/admin/benchmarks`),
    },

    collaboration: {
      getAlertRules: () => get<AlertRule[]>(`${prefix}/admin/alert-rules`),
      getChatRooms: () => get<ChatRoom[]>(`${prefix}/admin/rooms`),
      getRoomMessages: (roomId) => get<RoomMessage[]>(`${prefix}/admin/messages?roomId=${encodeURIComponent(roomId)}`),
    },

    advanced: {
      getFinetuneJobs: () => get<FinetuneJob[]>(`${prefix}/admin/finetune/jobs`),
      getFinetuneDatasets: () => get<FinetuneDataset[]>(`${prefix}/admin/finetune/datasets`),
      getCharts: () => get<ChartData>(`${prefix}/admin/charts`),
      getKnowledgeGraph: () => get<KnowledgeGraph>(`${prefix}/admin/knowledge-graph`),
      speechToText: () => post<SttResult>(`${prefix}/admin/voice/stt`),
      textToSpeech: () => post<TtsResult>(`${prefix}/admin/voice/tts`),
    },

    models: {
      list: (provider) => {
        const qs = provider ? `?provider=${encodeURIComponent(provider)}` : ''
        return get<Model[]>(`${prefix}/models${qs}`)
      },
      streamOutput: (id) => sse('GET', `${prefix}/models/${encodeURIComponent(id)}/stream`),
      getApiKeys: () => get<ApiKeyInfo[]>(`${prefix}/keys`),
    },
  }
}
