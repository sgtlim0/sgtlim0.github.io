// ─────────────────────────────────────────────
// API Types — Generated from docs/openapi.yaml
// ─────────────────────────────────────────────

// ===================== Common =====================

export interface ApiSuccessResponse<T> {
  readonly success: boolean
  readonly data?: T
  readonly error?: string
  readonly meta?: {
    readonly total: number
    readonly page: number
    readonly limit: number
  }
}

export interface ValidationError {
  readonly error: string
  readonly details?: Record<string, unknown>
}

export interface ErrorResponse {
  readonly error: string
}

// ===================== Chat =====================

export interface ChatMessage {
  readonly role: 'user' | 'assistant'
  readonly content: string
}

export interface ChatRequest {
  readonly message: string
  readonly history?: readonly ChatMessage[]
  readonly use_compression?: boolean
  readonly assistantId?: string
  readonly conversationId?: string
}

export interface CompressionStats {
  readonly compressed: boolean
  readonly original_tokens: number
  readonly compressed_tokens: number
  readonly compression_ratio: number
}

export interface ChatResponse {
  readonly response: string
  readonly stats?: CompressionStats
}

export interface ChatSendRequest {
  readonly conversationId: string
  readonly content: string
}

export interface ChatSendResponse {
  readonly id: string
  readonly role: 'assistant'
  readonly content: string
  readonly timestamp: string
}

// ===================== Analyze =====================

export type AnalyzeMode = 'summarize' | 'explain' | 'research' | 'translate'

export interface AnalyzeRequest {
  readonly text: string
  readonly mode: AnalyzeMode
  readonly url?: string
  readonly title?: string
}

export interface AnalyzeResponse {
  readonly result: string
  readonly mode: AnalyzeMode
}

// ===================== Research =====================

export interface ResearchRequest {
  readonly query: string
  readonly num_sources?: number
}

export interface SourceItem {
  readonly title: string
  readonly url: string
  readonly snippet: string
}

export interface ResearchResponse {
  readonly query: string
  readonly summary: string
  readonly sources: readonly SourceItem[]
  readonly num_sources_used: number
}

// ===================== Health =====================

export interface HealthResponse {
  readonly status: 'ok' | 'degraded'
  readonly aiCore: boolean
  readonly proxy: boolean
  readonly upstream?: Record<string, unknown>
}

export interface AiCoreHealthResponse {
  readonly status: 'ok'
  readonly service: string
  readonly version: string
}

// ===================== CSRF =====================

export interface CsrfTokenResponse {
  readonly csrfToken: string
}

// ===================== Auth =====================

export interface LoginRequest {
  readonly email: string
  readonly password: string
}

export interface User {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly role: 'admin' | 'manager' | 'viewer' | 'user'
  readonly organization: string
}

export interface LoginResponse {
  readonly token: string
  readonly user: User
}

// ===================== Admin =====================

export interface AdminStatItem {
  readonly label: string
  readonly value: string
}

export interface AdminModelUsageItem {
  readonly label: string
  readonly value: number
  readonly color: string
}

export interface AdminDashboard {
  readonly stats: readonly AdminStatItem[]
  readonly modelUsage: readonly AdminModelUsageItem[]
}

export interface AdminUser {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly role: string
  readonly status: 'active' | 'inactive'
  readonly lastActive: string
}

export interface AdminSettings {
  readonly defaultModel: string
  readonly maxTokens: number
  readonly theme: 'light' | 'dark' | 'system'
  readonly language: 'ko' | 'en'
}

export interface AdminSettingsUpdate {
  readonly defaultModel?: string
  readonly maxTokens?: number
  readonly theme?: string
  readonly language?: string
}

export interface RealtimeMetrics {
  readonly activeUsers: number
  readonly requestsPerMinute: number
  readonly avgLatency: number
  readonly errorRate: number
}

export interface AdminNotification {
  readonly id: string
  readonly title: string
  readonly message: string
  readonly type: 'info' | 'warning' | 'error'
  readonly read: boolean
  readonly createdAt: string
}

// ===================== Enterprise =====================

export interface Tenant {
  readonly id: string
  readonly name: string
  readonly domain: string
  readonly status: 'active' | 'inactive'
  readonly userCount: number
}

export interface MarketplaceAgent {
  readonly id: string
  readonly name: string
  readonly category: string
  readonly rating: number
  readonly installs: number
  readonly status: string
}

export interface Role {
  readonly id: string
  readonly name: string
  readonly permissions: readonly string[]
  readonly userCount: number
}

export interface Permission {
  readonly id: string
  readonly name: string
  readonly group: string
}

export interface SsoConnection {
  readonly id: string
  readonly provider: string
  readonly status: 'active' | 'inactive'
  readonly domain: string
}

export interface SsoTestResult {
  readonly valid: boolean
  readonly message: string
}

// ===================== AI Engine =====================

export interface AnalyticsData {
  readonly anomalies: readonly unknown[]
  readonly predictions: readonly unknown[]
  readonly insights: readonly unknown[]
}

export interface RagSearchResult {
  readonly id: string
  readonly title: string
  readonly score: number
  readonly snippet: string
}

export interface RagSearchResponse {
  readonly results: readonly RagSearchResult[]
  readonly total: number
}

export interface RagDocument {
  readonly id: string
  readonly title: string
  readonly chunks: number
  readonly status: 'indexed' | 'pending' | 'error'
}

export interface PromptVersion {
  readonly id: string
  readonly name: string
  readonly version: number
  readonly status: 'active' | 'draft' | 'archived'
}

export interface BenchmarkResult {
  readonly model: string
  readonly accuracy: number
  readonly latency: number
  readonly cost: number
}

// ===================== Collaboration =====================

export interface AlertRule {
  readonly id: string
  readonly name: string
  readonly condition: string
  readonly channels: readonly string[]
  readonly enabled: boolean
}

export interface ChatRoom {
  readonly id: string
  readonly name: string
  readonly memberCount: number
  readonly lastMessage: string
  readonly updatedAt: string
}

export interface RoomMessage {
  readonly id: string
  readonly roomId: string
  readonly content: string
  readonly sender: string
  readonly timestamp: string
}

// ===================== Advanced AI =====================

export interface FinetuneJob {
  readonly id: string
  readonly model: string
  readonly status: 'pending' | 'running' | 'completed' | 'failed'
  readonly epochs: number
  readonly loss: number
  readonly improvement: string
}

export interface FinetuneDataset {
  readonly id: string
  readonly name: string
  readonly records: number
  readonly format: string
  readonly createdAt: string
}

export interface ChartData {
  readonly treemap: readonly unknown[]
  readonly sankey: readonly unknown[]
  readonly scatter: readonly unknown[]
}

export interface KnowledgeGraphNode {
  readonly id: string
  readonly label: string
  readonly type: string
}

export interface KnowledgeGraphEdge {
  readonly source: string
  readonly target: string
  readonly label: string
}

export interface KnowledgeGraph {
  readonly nodes: readonly KnowledgeGraphNode[]
  readonly edges: readonly KnowledgeGraphEdge[]
}

export interface SttResult {
  readonly text: string
  readonly confidence: number
  readonly language: string
}

export interface TtsResult {
  readonly audioUrl: string
  readonly duration: number
}

// ===================== Models =====================

export interface Model {
  readonly id: string
  readonly name: string
  readonly provider: string
  readonly inputPrice: number
  readonly outputPrice: number
  readonly contextWindow: number
}

export interface ApiKeyInfo {
  readonly id: string
  readonly name: string
  readonly prefix: string
  readonly createdAt: string
}

export interface Assistant {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly model: string
  readonly isOfficial: boolean
}

// ===================== SSE Stream Event =====================

export type ChatStreamEvent =
  | { readonly type: 'token'; readonly data: string }
  | { readonly type: 'done' }
  | { readonly type: 'error'; readonly message: string }
