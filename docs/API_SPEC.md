# Enterprise API 스펙

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

## User API

### Chat
```
POST   /api/chat/send
Body: { message: string, assistantId: string }
Response: SSE stream

GET    /api/chat/history
Query: ?assistantId=string&page=1
Response: { messages: Message[], total: number }
```

### Assistants
```
GET    /api/assistants
POST   /api/assistants  { name, description, systemPrompt, model }
PATCH  /api/assistants/:id
DELETE /api/assistants/:id
```

## LLM Router API

### Models
```
GET    /api/models
Query: ?provider=string&category=string
Response: { models: LLMModel[] }
```

### API Keys
```
GET    /api/keys
POST   /api/keys  { name: string }
DELETE /api/keys/:id
POST   /api/keys/:id/regenerate
```

### Usage
```
GET    /api/usage
Query: ?period=7d|30d|90d
Response: { usage: UsageStats }
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
