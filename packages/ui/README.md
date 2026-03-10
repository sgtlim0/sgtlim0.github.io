# @hchat/ui

H Chat 모노레포의 공유 UI 라이브러리. 137+ 컴포넌트, 69 훅, 9 Provider를 도메인별로 구성.

## 설치

```bash
# 모노레포 내 앱에서 (package.json)
"dependencies": {
  "@hchat/ui": "workspace:*"
}
```

## 컴포넌트 카탈로그

### Layout

| 컴포넌트 | 설명 | Import |
|----------|------|--------|
| BaseLayout | 공통 레이아웃 (header, sidebar, main) | `@hchat/ui` |
| VirtualList | 가상 스크롤 리스트 (대용량 데이터) | `@hchat/ui` |
| InfiniteList | 무한 스크롤 리스트 | `@hchat/ui` |
| DraggableList | 드래그 앤 드롭 정렬 리스트 | `@hchat/ui` |
| AnimatedList | 애니메이션 리스트 (추가/제거 트랜지션) | `@hchat/ui` |
| ResponsiveContainer | 반응형 컨테이너 (breakpoint 기반) | `@hchat/ui` |

### Navigation

| 컴포넌트 | 설명 | Import |
|----------|------|--------|
| Breadcrumb | 계층 경로 네비게이션 | `@hchat/ui` |
| Tabs / TabPanel | 탭 인터페이스 (underline, pill, boxed) | `@hchat/ui` |
| Pagination | 페이지네이션 컨트롤 | `@hchat/ui` |
| Stepper / StepperContent | 다단계 진행 표시 (수평/수직) | `@hchat/ui` |

### Overlay

| 컴포넌트 | 설명 | Import |
|----------|------|--------|
| Modal | 모달 다이얼로그 (sm/md/lg/xl/full) | `@hchat/ui` |
| Tooltip | 툴팁 (top/bottom/left/right) | `@hchat/ui` |
| Portal | React Portal 컨테이너 | `@hchat/ui` |
| CommandPalette | Cmd+K 커맨드 팔레트 | `@hchat/ui` |
| SearchOverlay | 전체화면 검색 오버레이 | `@hchat/ui` |
| ToastContainer | 토스트 알림 큐 | `@hchat/ui` |

### Form

| 컴포넌트 | 설명 | Import |
|----------|------|--------|
| DynamicForm | 설정 기반 동적 폼 생성 | `@hchat/ui` |
| FormField | 폼 필드 (text, number, select, textarea 등) | `@hchat/ui` |
| Select | 커스텀 셀렉트/콤보박스 | `@hchat/ui` |
| ExportButton | 데이터 내보내기 (CSV/JSON) | `@hchat/ui` |
| CopyButton | 클립보드 복사 버튼 | `@hchat/ui` |

### Display

| 컴포넌트 | 설명 | Import |
|----------|------|--------|
| Avatar / AvatarGroup | 사용자 아바타 (이니셜, 이미지, 상태) | `@hchat/ui` |
| Accordion / AccordionItem | 아코디언 (단일/다중 펼침) | `@hchat/ui` |
| Badge | 상태 배지 (color variants) | `@hchat/ui` |
| Skeleton* | 로딩 스켈레톤 (Pulse, Text, Card, Table, Image, Chart) | `@hchat/ui` |
| OptimizedImage | 지연 로딩 + blur placeholder 이미지 | `@hchat/ui` |
| Transition | CSS 트랜지션 래퍼 (fade, slide, scale, zoom) | `@hchat/ui` |
| ErrorPage / NotFoundPage | 에러/404 페이지 | `@hchat/ui` |
| NotificationBanner | 푸시 알림 배너 | `@hchat/ui` |
| ThemeCustomizer | 테마 색상 커스터마이저 | `@hchat/ui` |
| EmptyState | 빈 상태 안내 | `@hchat/ui` |
| ErrorBoundary | React 에러 바운더리 | `@hchat/ui` |

### 도메인별 컴포넌트

| 도메인 | Import | 주요 컴포넌트 |
|--------|--------|--------------|
| HMG | `@hchat/ui/hmg` | GNB, HeroBanner, TabFilter, Footer, HmgStatCard, StepItem, DownloadItem, PillButton |
| Admin | `@hchat/ui/admin` | AdminDashboard, StatCard, DataTable, LoginPage, DepartmentManagement, AuditLogViewer, SSOConfigPanel, Live*, Notification*, Widget*, Workflow* |
| ROI | `@hchat/ui/roi` | ROIOverview, ROIAdoption, ROIProductivity, ROIAnalysis, ROIOrganization, ROISentiment, ROIReports, ROISettings, ROIDataUpload, KPICard, DateFilter, DepartmentFilter |
| ROI Charts | `@hchat/ui/roi/charts` | MiniLineChart, DonutChart, MiniBarChart, AreaChart, RadarChart (순수 SVG/CSS) |
| User | `@hchat/ui/user` | ChatPage, DocsPage, MyPage, OCRPage, TranslationPage, MessageBubble, ChatSidebar, AssistantGrid, FileUploadZone, CustomAssistantModal |
| LLM Router | `@hchat/ui/llm-router` | LRNavbar, ModelTable, CodeBlock, ProviderBadge, PriceCell, DocsSidebar |
| Desktop | `@hchat/ui/desktop` | DesktopSidebar, DesktopChatBubble, AgentCard, ToolGrid, SwarmPanel, DebateArena |
| Mobile | `@hchat/ui/mobile` | MobileApp, MobileTabBar, MobileChatList, MobileChatView, MobileHeader, MobileSettingsPage |

## 훅 카탈로그

### 공유 훅 (`@hchat/ui`)

| 훅 | 설명 |
|----|------|
| useTheme | 다크모드 토글 |
| useToast / useToastQueue | 토스트 알림 관리 |
| useFormValidation | 폼 검증 (patterns, rules) |
| useFormBuilder | 동적 폼 빌더 (FieldConfig 기반) |
| useCommandPalette | 커맨드 팔레트 상태 |
| useHotkeys / useHotkeyRegistry | 키보드 단축키 등록/실행 |
| useSearch | 전체 검색 (fuzzy match) |
| useModal / useModalManager | 모달 열기/닫기/스택 |
| useSelect | 셀렉트 드롭다운 상태 |
| useTabs | 탭 전환 |
| useStepper | 다단계 스텝 |
| useAccordion | 아코디언 펼침/접기 |
| usePagination | 페이지네이션 |
| useVirtualList | 가상 스크롤 |
| useInfiniteScroll | 무한 스크롤 (IntersectionObserver) |
| useDragAndDrop | 드래그 앤 드롭 |
| useAnimatedList | 리스트 애니메이션 |
| useTransition | CSS 트랜지션 상태 |
| useTooltip | 툴팁 위치/표시 |
| usePortal | React Portal 관리 |
| useBreadcrumb | 브레드크럼 경로 |
| useClipboard | 클립보드 복사/읽기 |
| useUndoRedo | Undo/Redo 스택 |
| usePersistedState | localStorage 영속 상태 |
| useThemeCustomizer | 테마 색상 커스터마이징 |
| useAnalytics | 이벤트 추적/페이지뷰 |
| useDataExport | CSV/JSON 내보내기 |
| usePushNotification | 푸시 알림 권한/표시 |
| useMediaQuery | 미디어 쿼리 매칭 |
| useWindowSize | 윈도우 크기 |
| useBreakpoint | 반응형 breakpoint |
| useNetworkStatus | 네트워크 온/오프라인 |
| usePWAInstall | PWA 설치 프롬프트 |
| useMonitoring | 에러 모니터링 통합 |
| useAsyncData | 비동기 데이터 페칭 |

### 도메인 훅

| 도메인 | 훅 |
|--------|-----|
| Admin Services | useDashboard, useUsageHistory, useStatistics, useUsers, useUserSearch, useSettings, useProviders, useModels, useMonthlyCosts, useFeatureUsage, usePrompts, useAgentStatus, useAgentLogs, useDailyTrend, useNotifications, useNotificationBadge, useDashboardLayout, useWidgetCatalog, useWorkflowEditor, useWorkflowExecution |
| User | useConversations, useAssistants, useChat, useResearch, useExtensionContext |
| LLM Router | hooks via `@hchat/ui/llm-router/services` (모델 필터, 스트리밍, API 키) |
| Mobile | hooks via `@hchat/ui/mobile/services` (터치 최적화) |

## Provider 카탈로그

| Provider | Import | 용도 |
|----------|--------|------|
| AdminServiceProvider | `@hchat/ui/admin/services` | Admin Mock/Real API 전환 |
| AuthProvider | `@hchat/ui/admin/auth` | 인증 상태 (ProtectedRoute) |
| UserServiceProvider | `@hchat/ui/user/services` | User 서비스 레이어 |
| LlmRouterServiceProvider | `@hchat/ui/llm-router/services` | LLM Router 서비스 |
| I18nProvider | `@hchat/ui` | 다국어 (ko/en) |
| FeatureFlagProvider | `@hchat/ui` (utils) | 기능 플래그 토글 |
| AnalyticsProvider | `@hchat/ui` (utils) | 이벤트 추적 |
| ModalProvider | `@hchat/ui` | 모달 스택 관리 |
| UndoRedoProvider | `@hchat/ui` | Undo/Redo 컨텍스트 |

## 사용 예시

### 모달 + 폼

```tsx
import { Modal, useModal, DynamicForm, useFormBuilder } from '@hchat/ui'

function CreateUserModal() {
  const { isOpen, open, close } = useModal()
  const { fields, values, handleChange } = useFormBuilder({
    fields: [
      { name: 'name', type: 'text', label: '이름', required: true },
      { name: 'email', type: 'email', label: '이메일', required: true },
    ],
  })

  return (
    <>
      <button onClick={open}>사용자 추가</button>
      <Modal isOpen={isOpen} onClose={close} title="사용자 추가" size="md">
        <DynamicForm fields={fields} values={values} onChange={handleChange} />
      </Modal>
    </>
  )
}
```

### 가상 스크롤 리스트

```tsx
import { VirtualList } from '@hchat/ui'

function LogViewer({ logs }: { logs: string[] }) {
  return (
    <VirtualList
      items={logs}
      itemHeight={32}
      containerHeight={400}
      renderItem={(log, index) => <div key={index}>{log}</div>}
    />
  )
}
```

### Admin Provider 패턴

```tsx
import { AdminServiceProvider } from '@hchat/ui/admin/services'
import { AuthProvider, ProtectedRoute } from '@hchat/ui/admin/auth'

export default function AdminApp({ children }) {
  return (
    <AuthProvider>
      <AdminServiceProvider>
        <ProtectedRoute>{children}</ProtectedRoute>
      </AdminServiceProvider>
    </AuthProvider>
  )
}
```

### 커맨드 팔레트

```tsx
import { CommandPalette, useCommandPalette, createDefaultCommands } from '@hchat/ui'

function App() {
  const commands = createDefaultCommands({ onNavigate: (path) => router.push(path) })
  const { isOpen, toggle } = useCommandPalette()

  return <CommandPalette isOpen={isOpen} onClose={toggle} commands={commands} />
}
```

## 유틸리티 (`@hchat/ui/utils`)

- **보안**: CSRF (generateCsrfToken, validateCsrfToken), PII 새니타이즈 (sanitizePII), 블록리스트 (isBlockedSite)
- **모니터링**: errorMonitoring (Sentry-ready), healthCheck, webVitals, alertConfig (AlertManager)
- **로깅**: createLogger (JSON prod / console dev), LogProvider
- **성능**: lazy, debounce, throttle, Web Worker 유틸 (createWorkerClient)
- **검색**: fuzzyMatch, createSearchIndex, search
- **기타**: featureFlags, analytics, persistStorage (IndexedDB), dataExport, clipboard, tokenStorage

## 스키마 (`@hchat/ui/schemas`)

Zod 기반 런타임 검증 -- auth, roi, common, text, chat, admin, llmRouter, user (8 도메인, 40+ 타입).

## 테스트

```bash
npx vitest run            # 184 files, 4,192 tests
npx vitest run --coverage # 커버리지 리포트
```

## 구조

```
packages/ui/
├── src/
│   ├── index.ts          # 공통 컴포넌트 + 훅 export
│   ├── hooks/            # 공유 훅 35개
│   ├── utils/            # 유틸리티 (보안, 모니터링, 로깅, 성능)
│   ├── schemas/          # Zod 스키마 (8 도메인)
│   ├── client/           # API 클라이언트 (ServiceFactory, Mock/Real)
│   ├── mocks/            # MSW 핸들러 (42 endpoints)
│   ├── hmg/              # HMG 컴포넌트
│   ├── admin/            # Admin + 실시간 + 알림 + 위젯 + 워크플로우
│   ├── roi/              # ROI 대시보드 + SVG 차트
│   ├── user/             # User 앱 + 훅 + 서비스
│   ├── llm-router/       # LLM Router + 86 AI 모델 카탈로그
│   ├── desktop/          # Desktop 앱
│   ├── mobile/           # Mobile PWA
│   └── i18n/             # 다국어 (ko/en)
├── __tests__/            # 단위 테스트 (184 files)
└── package.json
```
