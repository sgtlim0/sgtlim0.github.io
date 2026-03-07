# Enterprise API 스펙

> 최종 업데이트: 2026-03-07 | Phase 35 완료 기준
> 현재 모든 API는 Mock 구현. 실제 백엔드 연동 시 이 스펙을 기준으로 구현.

## 인증

```
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, user: User }

POST /api/auth/logout
Headers: Authorization: Bearer {token}

GET /api/auth/me
Headers: Authorization: Bearer {token}
Response: User
```

## Admin API

### Providers (AI 제공자)
```
GET    /api/admin/providers
Response: { providers: Provider[], total: number }

GET    /api/admin/providers/:id
PATCH  /api/admin/providers/:id  { status: 'active' | 'inactive' }
```

### Models (AI 모델)
```
GET    /api/admin/models
Query: ?provider=string&sort=price
Response: { models: Model[], total: number }

PATCH  /api/admin/models/:id  { inputPrice: number, outputPrice: number }
```

### Features (기능 사용량)
```
GET    /api/admin/features
Response: { features: Feature[] }
```

### Departments (부서 관리)
```
GET    /api/admin/departments
POST   /api/admin/departments  { name, managerEmail, ... }
PATCH  /api/admin/departments/:id
DELETE /api/admin/departments/:id
```

### Audit Logs (감사 로그)
```
GET    /api/admin/audit-logs
Query: ?page=1&limit=20&action=string&startDate=ISO&endDate=ISO
Response: { logs: AuditLog[], total: number, page: number }
```

### SSO
```
GET    /api/admin/sso/config
PUT    /api/admin/sso/config  { provider, entityId, ssoUrl, certificate, ... }
POST   /api/admin/sso/test
```

### Realtime Dashboard (Phase 29)
```
GET    /api/admin/realtime/metrics
Response: SSE stream { cpu, memory, requests, latency, activeUsers, errorRate }

GET    /api/admin/realtime/activities
Response: SSE stream { id, type, message, timestamp }[]
```

### Notifications (Phase 32)
```
GET    /api/admin/notifications
Query: ?unreadOnly=boolean&limit=number
Response: { notifications: Notification[], unreadCount: number }

PATCH  /api/admin/notifications/:id/read
POST   /api/admin/notifications/read-all
DELETE /api/admin/notifications/:id

GET    /api/admin/notifications/preferences
PUT    /api/admin/notifications/preferences  { email: boolean, push: boolean, ... }

WS     /api/admin/notifications/stream
```

### Widgets (Phase 33)
```
GET    /api/admin/widgets/layout
Response: { widgets: WidgetConfig[], gridLayout: GridLayout }

PUT    /api/admin/widgets/layout  { widgets: WidgetConfig[], gridLayout: GridLayout }

GET    /api/admin/widgets/catalog
Response: { widgets: WidgetType[] }
```

### Workflows (Phase 34)
```
GET    /api/admin/workflows
POST   /api/admin/workflows  { name, nodes: Node[], edges: Edge[] }
GET    /api/admin/workflows/:id
PUT    /api/admin/workflows/:id
DELETE /api/admin/workflows/:id

POST   /api/admin/workflows/:id/execute
Response: SSE stream { nodeId, status, output, duration }

GET    /api/admin/workflows/templates
Response: { templates: WorkflowTemplate[] }
```

## User API

### Chat
```
POST   /api/chat/send
Body: { message: string, assistantId: string, category: string }
Response: SSE stream (token-by-token, 30-80ms)

GET    /api/chat/history
Query: ?assistantId=string&page=1
Response: { messages: Message[], total: number }

GET    /api/chat/conversations
POST   /api/chat/conversations  { title, assistantId }
DELETE /api/chat/conversations/:id

POST   /api/chat/search
Body: { query: string }
Response: { results: SearchResult[] }
```

### Assistants
```
GET    /api/assistants
POST   /api/assistants  { name, description, systemPrompt, model, emoji, color }
PATCH  /api/assistants/:id
DELETE /api/assistants/:id
```

## LLM Router API

### Models
```
GET    /api/models
Query: ?provider=string&category=string&search=string
Response: { models: LLMModel[] }

GET    /api/models/:id
Response: LLMModel (detailed)
```

### Streaming (Phase 30)
```
POST   /api/models/:id/stream
Body: { messages: Message[], temperature: number, maxTokens: number, topP: number }
Response: SSE stream (token-by-token, provider-specific latency)

POST   /api/models/compare
Body: { modelIds: string[], prompt: string, params: StreamParams }
Response: SSE stream (parallel model responses)
```

### API Keys
```
GET    /api/keys
POST   /api/keys  { name: string }
DELETE /api/keys/:id
POST   /api/keys/:id/regenerate

POST   /api/keys/validate  { key: string }
Response: { valid: boolean, provider: string }
```

### Usage
```
GET    /api/usage
Query: ?period=7d|30d|90d
Response: { usage: UsageStats }
```

## Mobile API (Phase 35)

### Chat
```
GET    /api/mobile/chats
POST   /api/mobile/chats  { message: string, assistantId: string }
DELETE /api/mobile/chats/:id

POST   /api/mobile/chats/:id/send
Body: { message: string }
Response: SSE stream
```

### Assistants
```
GET    /api/mobile/assistants
Response: { assistants: MobileAssistant[] }
```

### Settings
```
GET    /api/mobile/settings
PUT    /api/mobile/settings  { notifications: boolean, darkMode: boolean, ... }
```

## 공통 타입

```typescript
interface Provider {
  id: string
  name: string
  status: 'active' | 'inactive' | 'error'
  models: number
  latency: number
}

interface Model {
  id: string
  name: string
  provider: string
  inputPrice: number
  outputPrice: number
  contextWindow: number
  category: string
}

interface AuditLog {
  id: string
  timestamp: string
  userId: string
  action: string
  target: string
  details: string
  ip: string
}

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'viewer'
  department: string
}

interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
}

interface WidgetConfig {
  id: string
  type: WidgetType
  title: string
  gridSpan: { col: number, row: number }
  position: { x: number, y: number }
}

interface WorkflowNode {
  id: string
  type: 'input' | 'llm' | 'transform' | 'condition' | 'output' | 'api' | 'database' | 'custom'
  label: string
  config: Record<string, unknown>
  position: { x: number, y: number }
}

interface WorkflowEdge {
  id: string
  source: string
  target: string
  label?: string
}
```

## 에러 응답

```typescript
interface ErrorResponse {
  success: false
  error: string
  code: string       // e.g., 'AUTH_REQUIRED', 'NOT_FOUND'
  details?: unknown
}
```

HTTP 상태 코드:
- 200: 성공
- 201: 생성됨
- 400: 잘못된 요청
- 401: 인증 필요
- 403: 권한 없음
- 404: 찾을 수 없음
- 429: 요청 제한 초과
- 500: 서버 오류
