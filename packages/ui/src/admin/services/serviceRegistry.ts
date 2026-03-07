/**
 * Service Registry — Central catalog of all 33 services
 *
 * Phase 56 준비: 서비스 도메인별 분류 + 의존성 맵
 * Phase 57 준비: MSW 핸들러 매핑을 위한 엔드포인트 레지스트리
 */

export interface ServiceDefinition {
  readonly id: string
  readonly name: string
  readonly domain: ServiceDomain
  readonly phase: number
  readonly module: string
  readonly endpoints: string[]
  readonly dependencies: string[]
}

export type ServiceDomain =
  | 'auth'
  | 'admin-core'
  | 'realtime'
  | 'customization'
  | 'user'
  | 'llm-router'
  | 'mobile'
  | 'enterprise'
  | 'ai-engine'
  | 'intelligence'
  | 'collaboration'
  | 'ai-advanced'

export const SERVICE_REGISTRY: ServiceDefinition[] = [
  // Auth & Core
  {
    id: 'auth',
    name: '인증',
    domain: 'auth',
    phase: 16,
    module: 'admin/auth',
    endpoints: ['/api/auth/login', '/api/auth/logout', '/api/auth/me'],
    dependencies: [],
  },
  {
    id: 'admin-api',
    name: 'Admin API',
    domain: 'admin-core',
    phase: 22,
    module: 'admin/services',
    endpoints: ['/api/admin/dashboard', '/api/admin/users', '/api/admin/settings'],
    dependencies: ['auth'],
  },

  // Realtime
  {
    id: 'realtime',
    name: '실시간',
    domain: 'realtime',
    phase: 29,
    module: 'admin/services',
    endpoints: ['/api/admin/realtime/metrics'],
    dependencies: ['admin-api'],
  },
  {
    id: 'notification',
    name: '알림',
    domain: 'realtime',
    phase: 32,
    module: 'admin/services',
    endpoints: ['/api/admin/notifications'],
    dependencies: ['auth'],
  },
  {
    id: 'sse',
    name: 'SSE 스트리밍',
    domain: 'realtime',
    phase: 30,
    module: 'llm-router/services',
    endpoints: ['/api/models/:id/stream'],
    dependencies: ['llm-router'],
  },

  // Customization
  {
    id: 'widget',
    name: '위젯',
    domain: 'customization',
    phase: 33,
    module: 'admin/services',
    endpoints: ['/api/admin/widgets/layout'],
    dependencies: ['admin-api'],
  },
  {
    id: 'workflow',
    name: '워크플로우',
    domain: 'customization',
    phase: 34,
    module: 'admin/services',
    endpoints: ['/api/admin/workflows'],
    dependencies: ['admin-api'],
  },

  // User & LLM
  {
    id: 'chat',
    name: '채팅',
    domain: 'user',
    phase: 18,
    module: 'user/services',
    endpoints: ['/api/chat/send', '/api/chat/history'],
    dependencies: ['auth'],
  },
  {
    id: 'assistant',
    name: '어시스턴트',
    domain: 'user',
    phase: 18,
    module: 'user/services',
    endpoints: ['/api/assistants'],
    dependencies: [],
  },
  {
    id: 'llm-router',
    name: 'LLM 라우터',
    domain: 'llm-router',
    phase: 19,
    module: 'llm-router/services',
    endpoints: ['/api/models', '/api/keys'],
    dependencies: [],
  },
  {
    id: 'mobile',
    name: '모바일',
    domain: 'mobile',
    phase: 35,
    module: 'mobile/services',
    endpoints: ['/api/mobile/chats'],
    dependencies: ['chat'],
  },

  // Enterprise (Phase 39-44)
  {
    id: 'tenant',
    name: '테넌트',
    domain: 'enterprise',
    phase: 39,
    module: 'admin/services',
    endpoints: ['/api/admin/tenants'],
    dependencies: ['auth'],
  },
  {
    id: 'marketplace',
    name: '마켓플레이스',
    domain: 'enterprise',
    phase: 40,
    module: 'admin/marketplace',
    endpoints: ['/api/admin/marketplace/agents'],
    dependencies: [],
  },
  {
    id: 'analytics',
    name: '분석 엔진',
    domain: 'ai-engine',
    phase: 41,
    module: 'admin/services',
    endpoints: ['/api/admin/analytics'],
    dependencies: ['admin-api'],
  },
  {
    id: 'rag',
    name: 'RAG 검색',
    domain: 'ai-engine',
    phase: 42,
    module: 'admin/services',
    endpoints: ['/api/admin/rag/search', '/api/admin/rag/documents'],
    dependencies: [],
  },
  {
    id: 'prompt-version',
    name: '프롬프트 버전',
    domain: 'ai-engine',
    phase: 43,
    module: 'admin/services',
    endpoints: ['/api/admin/prompts/versions', '/api/admin/prompts/ab-tests'],
    dependencies: ['admin-api'],
  },
  {
    id: 'sso',
    name: 'SSO/SAML',
    domain: 'enterprise',
    phase: 44,
    module: 'admin/services',
    endpoints: ['/api/admin/sso/connections', '/api/admin/sso/test'],
    dependencies: ['auth'],
  },

  // Intelligence (Phase 45-50)
  {
    id: 'chat-analytics',
    name: '채팅 분석',
    domain: 'intelligence',
    phase: 45,
    module: 'admin/services',
    endpoints: ['/api/admin/chat-analytics'],
    dependencies: ['chat'],
  },
  {
    id: 'rbac',
    name: 'RBAC',
    domain: 'enterprise',
    phase: 46,
    module: 'admin/services',
    endpoints: ['/api/admin/roles', '/api/admin/permissions'],
    dependencies: ['auth'],
  },
  {
    id: 'benchmark',
    name: '벤치마크',
    domain: 'ai-engine',
    phase: 47,
    module: 'admin/services',
    endpoints: ['/api/admin/benchmarks'],
    dependencies: ['llm-router'],
  },
  {
    id: 'feedback',
    name: '피드백',
    domain: 'intelligence',
    phase: 48,
    module: 'admin/services',
    endpoints: ['/api/admin/feedback'],
    dependencies: ['chat'],
  },
  {
    id: 'alert-rule',
    name: '알림 규칙',
    domain: 'collaboration',
    phase: 49,
    module: 'admin/services',
    endpoints: ['/api/admin/alert-rules'],
    dependencies: ['notification'],
  },
  {
    id: 'team-chat',
    name: '팀 채팅',
    domain: 'collaboration',
    phase: 50,
    module: 'admin/services',
    endpoints: ['/api/admin/rooms', '/api/admin/messages'],
    dependencies: ['auth'],
  },

  // AI Advanced (Phase 51-54)
  {
    id: 'finetune',
    name: '파인튜닝',
    domain: 'ai-advanced',
    phase: 51,
    module: 'admin/services',
    endpoints: ['/api/admin/finetune/jobs', '/api/admin/finetune/datasets'],
    dependencies: ['llm-router'],
  },
  {
    id: 'advanced-chart',
    name: 'D3 시각화',
    domain: 'ai-advanced',
    phase: 52,
    module: 'admin/services',
    endpoints: ['/api/admin/charts'],
    dependencies: [],
  },
  {
    id: 'knowledge-graph',
    name: '지식 그래프',
    domain: 'ai-advanced',
    phase: 53,
    module: 'admin/services',
    endpoints: ['/api/admin/knowledge-graph'],
    dependencies: ['rag'],
  },
  {
    id: 'voice',
    name: '음성',
    domain: 'ai-advanced',
    phase: 54,
    module: 'admin/services',
    endpoints: ['/api/admin/voice/stt', '/api/admin/voice/tts'],
    dependencies: [],
  },
]

export function getServicesByDomain(domain: ServiceDomain): ServiceDefinition[] {
  return SERVICE_REGISTRY.filter((s) => s.domain === domain)
}

export function getServiceById(id: string): ServiceDefinition | undefined {
  return SERVICE_REGISTRY.find((s) => s.id === id)
}

export function getAllEndpoints(): string[] {
  return SERVICE_REGISTRY.flatMap((s) => s.endpoints)
}

export function getDomainStats(): { domain: ServiceDomain; count: number; endpoints: number }[] {
  const domains = [...new Set(SERVICE_REGISTRY.map((s) => s.domain))]
  return domains.map((d) => {
    const services = getServicesByDomain(d)
    return {
      domain: d,
      count: services.length,
      endpoints: services.flatMap((s) => s.endpoints).length,
    }
  })
}
