# @hchat/ui

H Chat 모노레포의 공유 UI 컴포넌트 패키지. 128개 컴포넌트를 도메인별로 구성합니다.

## 구조

```
packages/ui/
├── src/
│   ├── index.ts           # 공통 컴포넌트 export
│   ├── Badge.tsx          # 상태 배지
│   ├── ThemeProvider.tsx   # 다크모드 Provider
│   ├── ThemeToggle.tsx     # 테마 토글 버튼
│   ├── FeatureCard.tsx     # 기능 소개 카드
│   ├── Skeleton.tsx        # 로딩 스켈레톤 (Pulse, Text, Card, Table, Chart)
│   ├── Toast.tsx           # 전역 토스트 알림 (success, error, warning, info)
│   ├── ErrorBoundary.tsx   # React 에러 바운더리
│   ├── EmptyState.tsx      # 빈 상태 안내
│   ├── validation.ts       # 폼 검증 유틸리티 (validate, useFormValidation, patterns)
│   ├── hmg/               # HMG 공식사이트 (GNB, Hero, Footer 등)
│   ├── admin/             # Admin 패널 + 실시간 대시보드 + 알림 + 위젯 + 워크플로우 + 서비스 레이어
│   │   ├── services/      # MockApiService, AuthProvider, enterpriseApi, realtimeService
│   │   ├── Live*.tsx      # 실시간 컴포넌트 (MetricCard, LineChart, ActivityFeed, ModelDistribution)
│   │   ├── Notification*.tsx  # 알림 시스템 (Bell, Panel, Preferences, Center)
│   │   ├── Widget*.tsx    # 대시보드 커스터마이징 (Card, CatalogPanel, Renderer, CustomDashboard)
│   │   └── Workflow*.tsx  # AI 워크플로우 빌더 (NodeCard, Canvas, NodeCatalog, TemplateGallery, Builder)
│   ├── roi/               # ROI 대시보드 (5종 SVG 차트, 10페이지)
│   ├── user/              # User 앱 + 서비스 레이어 (7개 훅)
│   │   └── services/      # chatService (localStorage CRUD)
│   ├── llm-router/        # LLM Router + 서비스 레이어 (8개 훅)
│   │   └── services/      # 86개 AI 모델 카탈로그 + SSE 스트리밍 + API 키 유틸
│   ├── desktop/           # Desktop 앱 (Sidebar, ChatBubble, AgentCard, ToolGrid)
│   ├── mobile/            # Mobile 앱 컴포넌트
│   └── i18n/              # 다국어 지원 (ko/en, 49키)
├── __tests__/             # 단위 테스트 (20파일, 259 테스트)
└── package.json
```

## 사용법

```typescript
// 공통 컴포넌트
import { Badge, ThemeProvider, Skeleton, Toast } from '@hchat/ui'

// HMG 컴포넌트
import { GNB, HeroBanner, Footer } from '@hchat/ui/hmg'

// Admin 컴포넌트 + 서비스
import { AdminDashboard, StatCard } from '@hchat/ui/admin'
import { AdminServiceProvider } from '@hchat/ui/admin/services'

// User 컴포넌트 + 서비스
import { ChatPage, MessageBubble } from '@hchat/ui/user'
import { UserServiceProvider } from '@hchat/ui/user/services'

// LLM Router 컴포넌트 + 서비스
import { ModelTable, ProviderBadge } from '@hchat/ui/llm-router'
import { LlmRouterServiceProvider } from '@hchat/ui/llm-router/services'

// ROI 대시보드
import { ROIOverview, DonutChart, RadarChart } from '@hchat/ui'
```

## 규모

| 항목 | 수치 |
|------|------|
| 컴포넌트 | 128개 |
| 커스텀 훅 | 58개 (Admin 29+, User 7, LLM Router 8+) |
| Storybook 스토리 | 151개 (97% 커버리지) |
| 단위 테스트 | 20파일, 259 테스트 |
| src LOC | 23,385줄 |

## 테스트

```bash
# 루트에서 실행
npm test                  # 전체 단위 테스트
npm run test:coverage     # 커버리지 리포트
```

테스트 대상:
- 공통 컴포넌트: Badge, EmptyState, Skeleton, FeatureCard
- 유틸리티: validation (26개 테스트)
- 서비스 레이어: Admin MockApi, User chatService, LLM Router MockService, ROI aggregateData
- 실시간 서비스: realtimeService (구독/해제), realtimeHooks (메트릭/시계열/활동)
- LLM Router: streamingService (SSE 스트리밍), apiKeyUtils (마스킹/검증/생성/비용)

## 아키텍처 패턴

### Provider Pattern (서비스 레이어)

Admin, User, LLM Router 3개 앱에 Provider Pattern 적용:

```typescript
// 앱 루트에서 Provider 래핑
<AdminServiceProvider>
  <App />
</AdminServiceProvider>
```

### Mock API

100-300ms 네트워크 지연 시뮬레이션, localStorage 영속:

```typescript
const mockApiService = new MockApiService()
const users = await mockApiService.getUsers({ page: 1, limit: 10 })
```

### SVG 차트 (라이브러리 없음)

5종 순수 SVG/CSS 차트: MiniLineChart, DonutChart, MiniBarChart, AreaChart, RadarChart

### 실시간 대시보드 (Phase 29)

Mock 기반 실시간 데이터 스트리밍 (setInterval 시뮬레이션):

```typescript
import { useRealtimeMetrics, useRealtimeTimeSeries } from '@hchat/ui/admin/services/realtimeHooks'

// 2초 간격 메트릭 업데이트
const metrics = useRealtimeMetrics(2000)

// 3초 간격 시계열 데이터 (최근 20포인트 슬라이딩 윈도우)
const timeSeries = useRealtimeTimeSeries(3000, 20)
```

컴포넌트: LiveMetricCard, LiveLineChart, LiveActivityFeed, LiveModelDistribution

### SSE 스트리밍 플레이그라운드 (Phase 30)

토큰 단위 SSE 스트리밍 시뮬레이션 (프로바이더별 지연 프로파일):

```typescript
import { useStreamingChat } from '@hchat/ui/llm-router/services/streamingHooks'

const { isStreaming, streamingContent, startStream, stopStream } = useStreamingChat({
  onComplete: (result) => console.log(`Cost: ${result.estimatedCostKRW} KRW`),
})

startStream({ model: 'gpt-4o', messages: [{ role: 'user', content: 'Hello!' }] })
```

컴포넌트: StreamingPlayground, ModelComparison
유틸리티: maskAPIKey, validateAPIKey, generateAPIKey, estimateTokens, calculateCost

### Desktop 앱 (Phase 31)

Desktop 인터페이스용 에이전트 관리 및 도구 통합 컴포넌트:

컴포넌트: DesktopSidebar, DesktopChatBubble, AgentCard, ToolGrid

### 알림 시스템 (Phase 32)

Mock WebSocket 기반 실시간 알림:

```typescript
import { NotificationCenter } from '@hchat/ui/admin'

// 알림 벨 + 패널 + 환경설정 통합 컴포넌트
<NotificationCenter />
```

컴포넌트: NotificationBell, NotificationPanel, NotificationPreferences, NotificationCenter

### 대시보드 커스터마이징 (Phase 33)

CSS Grid 기반 위젯 시스템 (10종 위젯, localStorage 레이아웃 저장):

컴포넌트: WidgetCard, WidgetCatalogPanel, WidgetRenderer, CustomDashboard

### AI 워크플로우 빌더 (Phase 34)

SVG 노드 에디터 기반 워크플로우 설계 (8종 노드, 4개 템플릿):

컴포넌트: WorkflowNodeCard, WorkflowCanvas, WorkflowNodeCatalog, WorkflowTemplateGallery, WorkflowBuilder

### 모바일 컴포넌트 (Phase 35)

모바일 전용 UI 컴포넌트 및 반응형 레이아웃
