# H Chat Wiki -- Component Catalog

> 221 Components | 76 Hooks | 18 Providers | 48+ Services | 40+ Utilities

---

## Table of Contents

1. [Shared Components (76)](#shared-components-76)
2. [Admin Components (65)](#admin-components-65)
3. [User Components (28)](#user-components-28)
4. [HMG Components (8)](#hmg-components-8)
5. [ROI Components (23)](#roi-components-23)
6. [LLM Router Components (8)](#llm-router-components-8)
7. [Desktop Components (6)](#desktop-components-6)
8. [Mobile Components (7)](#mobile-components-7)
9. [Hooks (76)](#hooks-76)
10. [Providers (18)](#providers-18)
11. [Services (48+)](#services-48)
12. [Utilities (40+)](#utilities-40)
13. [Schemas (9)](#schemas-9)

---

## Shared Components (76)

Path prefix: `packages/ui/src/`

### Layout

| Component | Description | Import |
|-----------|-------------|--------|
| BaseLayout | App shell with header/sidebar/content areas | `@hchat/ui` |
| PageSkeleton | Full-page loading skeleton | `@hchat/ui` |
| Portal | Renders children into a DOM portal | `@hchat/ui` |

### Navigation

| Component | Description | Import |
|-----------|-------------|--------|
| Breadcrumb | Hierarchical navigation breadcrumb | `@hchat/ui` |
| Tabs | Tab navigation with panel content | `@hchat/ui` |
| Stepper | Multi-step wizard navigation | `@hchat/ui` |
| Pagination | Page navigation with prev/next | `@hchat/ui` |

### Overlay

| Component | Description | Import |
|-----------|-------------|--------|
| Modal | Dialog overlay with backdrop | `@hchat/ui` |
| Drawer | Slide-in panel from edge | `@hchat/ui` |
| Tooltip | Hover/focus tooltip | `@hchat/ui` |
| Popover | Click-triggered floating content | `@hchat/ui` |
| AlertDialog | Confirmation dialog with actions | `@hchat/ui` |
| SearchOverlay | Full-screen search overlay | `@hchat/ui` |
| CommandPalette | Keyboard-driven command palette | `@hchat/ui` |
| NotificationBanner | Dismissable notification bar | `@hchat/ui` |

### Form

| Component | Description | Import |
|-----------|-------------|--------|
| Select | Dropdown select input | `@hchat/ui` |
| DatePicker | Date selection input | `@hchat/ui` |
| ColorPicker | Color selection with preview | `@hchat/ui` |
| NumberInput | Numeric input with increment/decrement | `@hchat/ui` |
| TagInput | Multi-value tag input | `@hchat/ui` |
| Rating | Star/icon rating input | `@hchat/ui` |
| Switch | Toggle switch input | `@hchat/ui` |
| FormField | Form field wrapper with label/error | `@hchat/ui` |
| DynamicForm | Schema-driven dynamic form builder | `@hchat/ui` |
| FileUploader | Drag-and-drop file upload | `@hchat/ui` |

### Display

| Component | Description | Import |
|-----------|-------------|--------|
| Badge | Status/category badge | `@hchat/ui` |
| Tag | Removable tag label | `@hchat/ui` |
| Avatar | User avatar with fallback | `@hchat/ui` |
| AvatarGroup | Stacked avatar group | `@hchat/ui` |
| Skeleton | Loading placeholder | `@hchat/ui` |
| FeatureCard | Feature showcase card | `@hchat/ui` |
| EmptyState | Empty content placeholder | `@hchat/ui` |
| Toast | Notification toast | `@hchat/ui` |
| ToastContainer | Toast stack container | `@hchat/ui` |
| ProgressBar | Linear progress indicator | `@hchat/ui` |
| Timeline | Vertical timeline | `@hchat/ui` |
| Calendar | Month/week calendar view | `@hchat/ui` |
| Carousel | Image/content carousel | `@hchat/ui` |
| CopyButton | Click-to-copy button | `@hchat/ui` |
| ExportButton | Data export trigger | `@hchat/ui` |
| OfflineIndicator | Network status indicator | `@hchat/ui` |
| OptimizedImage | Lazy-loaded optimized image | `@hchat/ui` |
| LoadingOverlay | Full-area loading overlay | `@hchat/ui` |
| ErrorPage | Error display page | `@hchat/ui` |

### Data

| Component | Description | Import |
|-----------|-------------|--------|
| DataGrid | Sortable/filterable data grid | `@hchat/ui` |
| InfiniteList | Infinite scroll list | `@hchat/ui` |
| VirtualList | Virtualized long list | `@hchat/ui` |
| SelectableList | List with multi-select | `@hchat/ui` |
| DraggableList | Drag-reorderable list | `@hchat/ui` |
| AnimatedList | Animated enter/exit list | `@hchat/ui` |
| TreeView | Hierarchical tree | `@hchat/ui` |
| KanbanBoard | Kanban board with columns | `@hchat/ui` |
| KanbanCard | Kanban card item | `@hchat/ui` |

### Editor

| Component | Description | Import |
|-----------|-------------|--------|
| MarkdownEditor | Markdown editor with preview | `@hchat/ui` |
| DiffViewer | Side-by-side diff viewer | `@hchat/ui` |
| VersionHistory | Version history panel | `@hchat/ui` |

### Theme / Settings

| Component | Description | Import |
|-----------|-------------|--------|
| ThemeToggle | Light/dark mode toggle | `@hchat/ui` |
| ThemeCustomizer | Theme customization panel | `@hchat/ui` |
| SettingRow | Settings row with label/control | `@hchat/ui` |
| SettingsPanel | Settings section panel | `@hchat/ui` |
| ShortcutHelp | Keyboard shortcuts help panel | `@hchat/ui` |
| ShortcutKey | Single shortcut key display | `@hchat/ui` |

### Utility

| Component | Description | Import |
|-----------|-------------|--------|
| Accordion | Collapsible content sections | `@hchat/ui` |
| Transition | CSS transition wrapper | `@hchat/ui` |
| DragHandle | Drag handle icon for reorderable items | `@hchat/ui` |
| BatchActionBar | Bulk action toolbar | `@hchat/ui` |
| ErrorBoundary | React error boundary | `@hchat/ui` |
| ErrorRecovery | Error recovery with retry | `@hchat/ui` |
| Playground | Component playground | `@hchat/ui` |
| PropEditor | Component prop editor | `@hchat/ui` |
| ProfilerOverlay | Render profiler overlay | `@hchat/ui` |
| withProfiler | HOC for render profiling | `@hchat/ui` |
| AppNotificationCenter | App-wide notification center | `@hchat/ui` |

---

## Admin Components (65)

Path prefix: `packages/ui/src/admin/`

### Dashboard / Pages

| Component | Description | Import |
|-----------|-------------|--------|
| AdminDashboard | Main admin dashboard | `@hchat/ui/admin` |
| AdminUsageHistory | Usage history page | `@hchat/ui/admin` |
| AdminStatistics | Statistics page | `@hchat/ui/admin` |
| AdminUserManagement | User management page | `@hchat/ui/admin` |
| AdminSettings | Settings page | `@hchat/ui/admin` |
| AdminProviderStatus | AI provider status page | `@hchat/ui/admin` |
| AdminModelPricing | Model pricing page | `@hchat/ui/admin` |
| AdminFeatureUsage | Feature usage page | `@hchat/ui/admin` |
| AdminPromptLibrary | Prompt library page | `@hchat/ui/admin` |
| AdminAgentMonitoring | Agent monitoring page | `@hchat/ui/admin` |
| AdminRealtimeDashboard | Real-time metrics dashboard | `@hchat/ui/admin` |
| LoginPage | Admin login page | `@hchat/ui/admin` |

### Enterprise

| Component | Description | Import |
|-----------|-------------|--------|
| DepartmentManagement | Department CRUD management | `@hchat/ui/admin` |
| AuditLogViewer | Audit log table with filters | `@hchat/ui/admin` |
| SSOConfigPanel | SSO configuration panel | `@hchat/ui/admin` |
| TenantManagement | Multi-tenant management | `@hchat/ui/admin` |
| TenantSelector | Tenant context selector | `@hchat/ui/admin` |
| RBACManager | Role-based access control manager | `@hchat/ui/admin` |

### AI / Analytics

| Component | Description | Import |
|-----------|-------------|--------|
| AnalyticsDashboard | Analytics overview dashboard | `@hchat/ui/admin` |
| BenchmarkDashboard | Model benchmark comparison | `@hchat/ui/admin` |
| ChatAnalyticsPage | Chat analytics page | `@hchat/ui/admin` |
| FeedbackDashboard | User feedback dashboard | `@hchat/ui/admin` |
| FineTuneDashboard | Fine-tuning management | `@hchat/ui/admin` |
| KnowledgeGraphView | Knowledge graph visualization | `@hchat/ui/admin` |
| RAGSearchPage | RAG search testing page | `@hchat/ui/admin` |
| VoiceInterface | Voice interaction interface | `@hchat/ui/admin` |
| TeamChatRoom | Team collaboration chat | `@hchat/ui/admin` |

### Workflow

| Component | Description | Import |
|-----------|-------------|--------|
| WorkflowBuilder | Visual workflow builder | `@hchat/ui/admin` |
| WorkflowCanvas | Workflow drag-and-drop canvas | `@hchat/ui/admin` |
| WorkflowNodeCard | Workflow step node card | `@hchat/ui/admin` |
| WorkflowNodeCatalog | Available workflow node catalog | `@hchat/ui/admin` |
| WorkflowTemplateGallery | Workflow template gallery | `@hchat/ui/admin` |

### Widget / Dashboard Customization

| Component | Description | Import |
|-----------|-------------|--------|
| CustomDashboard | Customizable dashboard layout | `@hchat/ui/admin` |
| WidgetCard | Dashboard widget card | `@hchat/ui/admin` |
| WidgetCatalogPanel | Widget catalog browser | `@hchat/ui/admin` |
| WidgetRenderer | Dynamic widget renderer | `@hchat/ui/admin` |
| QuickStatsWidget | Quick stats widget | `@hchat/ui/admin` |
| SystemStatusWidget | System status widget | `@hchat/ui/admin` |
| RecentActivityWidget | Recent activity widget | `@hchat/ui/admin` |

### Notification

| Component | Description | Import |
|-----------|-------------|--------|
| NotificationBell | Notification bell icon with count | `@hchat/ui/admin` |
| NotificationCenter | Notification center panel | `@hchat/ui/admin` |
| NotificationPanel | Notification list panel | `@hchat/ui/admin` |
| NotificationPreferences | Notification settings | `@hchat/ui/admin` |

### Monitoring

| Component | Description | Import |
|-----------|-------------|--------|
| HealthDashboard | System health dashboard | `@hchat/ui/admin` |
| HealthTimeline | Health event timeline | `@hchat/ui/admin` |
| LiveLineChart | Real-time line chart | `@hchat/ui/admin` |
| LiveMetricCard | Real-time metric card | `@hchat/ui/admin` |
| LiveModelDistribution | Real-time model usage distribution | `@hchat/ui/admin` |
| LiveActivityFeed | Real-time activity feed | `@hchat/ui/admin` |
| RateLimitDashboard | Rate limit monitoring | `@hchat/ui/admin` |
| RateLimitCard | Rate limit status card | `@hchat/ui/admin` |
| AlertRuleBuilder | Alert rule configuration | `@hchat/ui/admin` |
| PromptVersionManager | Prompt version management | `@hchat/ui/admin` |

### Atoms

| Component | Description | Import |
|-----------|-------------|--------|
| StatusBadge | Status indicator badge | `@hchat/ui/admin` |
| MonthPicker | Month selection input | `@hchat/ui/admin` |
| StatCard | Metric stat card | `@hchat/ui/admin` |
| DataTable | Sortable data table | `@hchat/ui/admin` |
| BarChartRow | Horizontal bar chart row | `@hchat/ui/admin` |
| UserCard | User info card | `@hchat/ui/admin` |
| SettingsRow | Settings toggle row | `@hchat/ui/admin` |

### Marketplace

| Component | Description | Import |
|-----------|-------------|--------|
| AgentMarketCard | Agent marketplace card | `@hchat/ui/admin` |
| AgentMarketGrid | Agent marketplace grid | `@hchat/ui/admin` |

### Auth (packages/ui/src/admin/auth/)

| Component | Description | Import |
|-----------|-------------|--------|
| AuthProvider | Authentication context provider | `@hchat/ui/admin/auth` |
| ProtectedRoute | Route guard component | `@hchat/ui/admin/auth` |

---

## User Components (28)

Path prefix: `packages/ui/src/user/`

### Components (packages/ui/src/user/components/)

| Component | Description | Import |
|-----------|-------------|--------|
| UserGNB | User app global navigation bar | `@hchat/ui/user` |
| ChatSidebar | Conversation list sidebar | `@hchat/ui/user` |
| AssistantCard | AI assistant card | `@hchat/ui/user` |
| AssistantGrid | Assistant grid layout | `@hchat/ui/user` |
| CategoryFilter | Category filter tabs | `@hchat/ui/user` |
| ChatSearchBar | Chat search input | `@hchat/ui/user` |
| ChatSearchPanel | Full search panel with results | `@hchat/ui/user` |
| FileUploadZone | Drag-and-drop file upload area | `@hchat/ui/user` |
| StepProgress | Step progress indicator | `@hchat/ui/user` |
| EngineSelector | AI engine/model selector | `@hchat/ui/user` |
| ProjectTable | Project list table | `@hchat/ui/user` |
| SubscriptionCard | Subscription plan card | `@hchat/ui/user` |
| UsageTable | Usage data table | `@hchat/ui/user` |
| MessageBubble | Chat message bubble | `@hchat/ui/user` |
| StreamingIndicator | SSE streaming indicator | `@hchat/ui/user` |
| CustomAssistantModal | Custom assistant creation modal | `@hchat/ui/user` |
| MarkdownRenderer | Markdown content renderer | `@hchat/ui/user` |
| ResearchPanel | Deep research panel | `@hchat/ui/user` |
| CompressionBadge | Token compression badge | `@hchat/ui/user` |
| SourceAttribution | Source citation display | `@hchat/ui/user` |
| PageContextBanner | Page context banner | `@hchat/ui/user` |
| InstallBanner | PWA install banner | `@hchat/ui/user` |

### Pages (packages/ui/src/user/pages/)

| Component | Description | Import |
|-----------|-------------|--------|
| ChatPage | Main chat page | `@hchat/ui/user` |
| DocsPage | Documentation page | `@hchat/ui/user` |
| MyPage | User profile page | `@hchat/ui/user` |
| OCRPage | OCR upload page | `@hchat/ui/user` |
| TranslationPage | Translation page | `@hchat/ui/user` |

### Service Provider

| Component | Description | Import |
|-----------|-------------|--------|
| UserServiceProvider | User service context provider | `@hchat/ui/user/services` |

---

## HMG Components (8)

Path prefix: `packages/ui/src/hmg/`

| Component | Description | Import |
|-----------|-------------|--------|
| GNB | HMG global navigation bar | `@hchat/ui/hmg` |
| HeroBanner | Hero section with CTA | `@hchat/ui/hmg` |
| TabFilter | Tab-based content filter | `@hchat/ui/hmg` |
| Footer | Site footer | `@hchat/ui/hmg` |
| HmgStatCard | Statistics card | `@hchat/ui/hmg` |
| StepItem | Step guide item | `@hchat/ui/hmg` |
| DownloadItem | Download link item | `@hchat/ui/hmg` |
| PillButton | Pill-shaped button | `@hchat/ui/hmg` |

---

## ROI Components (23)

Path prefix: `packages/ui/src/roi/`

### Pages

| Component | Description | Import |
|-----------|-------------|--------|
| ROISidebar | ROI section sidebar navigation | `@hchat/ui` (roi) |
| ROIOverview | KPI overview dashboard | `@hchat/ui` (roi) |
| ROIAdoption | User adoption metrics | `@hchat/ui` (roi) |
| ROIProductivity | Productivity metrics | `@hchat/ui` (roi) |
| ROIAnalysis | ROI analysis with simulator | `@hchat/ui` (roi) |
| ROIOrganization | Department-level metrics | `@hchat/ui` (roi) |
| ROISentiment | NPS and sentiment metrics | `@hchat/ui` (roi) |
| ROIReports | Report list with preview | `@hchat/ui` (roi) |
| ROISettings | ROI configuration settings | `@hchat/ui` (roi) |
| ROIDataUpload | Excel file upload (SheetJS) | `@hchat/ui` (roi) |
| ROIDataContext | ROI data context provider | `@hchat/ui` (roi) |

### Atoms

| Component | Description | Import |
|-----------|-------------|--------|
| KPICard | KPI metric card | `@hchat/ui` (roi) |
| ChartPlaceholder | Chart loading placeholder | `@hchat/ui` (roi) |
| InsightCard | Insight summary card | `@hchat/ui` (roi) |
| SurveyBar | Survey result bar | `@hchat/ui` (roi) |
| HeatmapCell | Heatmap data cell | `@hchat/ui` (roi) |
| DateFilter | Date range filter | `@hchat/ui` (roi) |
| DepartmentFilter | Department filter dropdown | `@hchat/ui` (roi) |

### Charts (packages/ui/src/roi/charts/) -- pure SVG/CSS, no chart library

| Component | Description | Import |
|-----------|-------------|--------|
| MiniLineChart | Small line chart | `@hchat/ui` (roi/charts) |
| DonutChart | Donut/pie chart | `@hchat/ui` (roi/charts) |
| MiniBarChart | Small bar chart | `@hchat/ui` (roi/charts) |
| AreaChart | Filled area chart | `@hchat/ui` (roi/charts) |
| RadarChart | Radar/spider chart | `@hchat/ui` (roi/charts) |

---

## LLM Router Components (8)

Path prefix: `packages/ui/src/llm-router/`

| Component | Description | Import |
|-----------|-------------|--------|
| LRNavbar | LLM Router navigation bar | `@hchat/ui/llm-router` |
| ModelTable | 86-model comparison table | `@hchat/ui/llm-router` |
| ModelComparison | Side-by-side model comparison | `@hchat/ui/llm-router` |
| StreamingPlayground | Streaming API playground | `@hchat/ui/llm-router` |
| CodeBlock | Syntax-highlighted code block | `@hchat/ui/llm-router` |
| ProviderBadge | AI provider badge | `@hchat/ui/llm-router` |
| PriceCell | Pricing display cell | `@hchat/ui/llm-router` |
| DocsSidebar | Documentation sidebar | `@hchat/ui/llm-router` |

---

## Desktop Components (6)

Path prefix: `packages/ui/src/desktop/`

| Component | Description | Import |
|-----------|-------------|--------|
| DesktopSidebar | Collapsible desktop sidebar | `@hchat/ui/desktop` |
| DesktopChatBubble | Chat bubble with token count | `@hchat/ui/desktop` |
| AgentCard | Agent status and controls card | `@hchat/ui/desktop` |
| ToolGrid | Tool grid with active/inactive states | `@hchat/ui/desktop` |
| SwarmPanel | Multi-agent swarm panel | `@hchat/ui/desktop` |
| DebateArena | Agent debate arena | `@hchat/ui/desktop` |

---

## Mobile Components (7)

Path prefix: `packages/ui/src/mobile/`

| Component | Description | Import |
|-----------|-------------|--------|
| MobileApp | Mobile app shell | `@hchat/ui/mobile` |
| MobileHeader | Mobile header bar | `@hchat/ui/mobile` |
| MobileTabBar | Bottom tab navigation | `@hchat/ui/mobile` |
| MobileChatList | Chat conversation list | `@hchat/ui/mobile` |
| MobileChatView | Chat message view | `@hchat/ui/mobile` |
| MobileAssistantList | Assistant list | `@hchat/ui/mobile` |
| MobileSettingsPage | Settings page | `@hchat/ui/mobile` |

---

## Hooks (76)

Path prefix: `packages/ui/src/hooks/` (70 files) + `packages/ui/src/user/hooks/` (6 files)

### Data Hooks

| Hook | Description |
|------|-------------|
| useAsyncData | Async data fetching with loading/error states |
| useQuery | Cached data fetching (SWR-like) |
| useMutation | Data mutation with optimistic updates |
| usePersistedState | State persisted to localStorage |
| useOfflineQueue | Queue operations for offline sync |
| useSearch | Full-text search with debounce |
| useDataExport | Export data to CSV/JSON |
| useInfiniteScroll | Infinite scroll pagination |
| useVirtualList | Virtualized list rendering |
| useBatchSelect | Multi-item selection management |
| useContentVersion | Content version tracking |
| useWebhook | Webhook subscription management |
| useDedup | Request deduplication |

### UI Hooks

| Hook | Description |
|------|-------------|
| useModal | Modal open/close state |
| useModalManager | Multiple modal stack management |
| useTooltip | Tooltip positioning and visibility |
| useTabs | Tab state management |
| useAccordion | Accordion expand/collapse |
| useStepper | Step wizard state |
| useSelect | Select dropdown state |
| usePagination | Pagination state and handlers |
| usePortal | Portal container management |
| useBreadcrumb | Breadcrumb trail management |
| useToastQueue | Toast notification queue |
| useAnimatedList | List enter/exit animations |
| useTransition | CSS transition control |
| useDragAndDrop | Drag-and-drop handlers |
| useFormBuilder | Dynamic form generation |
| useMarkdownEditor | Markdown editor state |
| useDatePicker | Date picker state |
| useColorPicker | Color picker state |
| useDataGrid | Data grid sort/filter/page |
| useTimeline | Timeline navigation |
| useSettings | Settings state management |
| useTree | Tree expand/collapse state |
| useTagInput | Tag input management |
| useRating | Rating input state |
| useDrawer | Drawer open/close state |
| useCalendar | Calendar navigation state |
| useCarousel | Carousel slide state |
| useNumberInput | Number input with validation |
| useSwitch | Toggle switch state |
| usePopover | Popover positioning |
| useAlertDialog | Alert dialog state |
| useFileUpload | File upload with progress |
| useKanban | Kanban board state |

### Platform Hooks

| Hook | Description |
|------|-------------|
| useNetworkStatus | Online/offline detection |
| usePWAInstall | PWA install prompt handling |
| usePushNotification | Push notification subscription |
| useMonitoring | Error/performance monitoring |
| useAnalytics | Analytics event tracking |
| useHotkeys | Keyboard shortcut handling |
| useCommandPalette | Command palette state |
| useClipboard | Clipboard read/write |
| useBreakpoint | Responsive breakpoint detection |
| useMediaQuery | CSS media query matching |
| useWindowSize | Window dimension tracking |
| useThemeCustomizer | Theme customization state |
| useUndoRedo | Undo/redo state management |
| useRenderProfiler | Component render profiling |
| useCircuitBreaker | Circuit breaker pattern for API calls |
| useHealthMonitor | System health monitoring |
| useBenchmark | Performance benchmarking |
| usePageLoading | Page loading state |

### Cross-cutting Hooks

| Hook | Description |
|------|-------------|
| useEventBus | Publish/subscribe event bus |
| usePlayground | Component playground state |
| useNotificationCenter | Notification center state |
| useShortcutHelp | Shortcut help panel state |

### User-domain Hooks (packages/ui/src/user/hooks/)

| Hook | Description |
|------|-------------|
| useChat | Chat message send/receive with SSE |
| useAssistants | Assistant CRUD operations |
| useConversations | Conversation management |
| useResearch | Deep research session management |
| useExtensionContext | Chrome extension context bridge |

---

## Providers (18)

| Provider | Path | Description |
|----------|------|-------------|
| ThemeProvider | `src/ThemeProvider.tsx` | Light/dark theme context |
| GlobalProvider | `src/GlobalProvider.tsx` | Composed global providers |
| ToastQueueProvider | `src/ToastQueueProvider.tsx` | Toast notification queue |
| AuthProvider | `src/admin/auth/AuthProvider.tsx` | Admin authentication context |
| AdminServiceProvider | `src/admin/services/AdminServiceProvider.tsx` | Admin API service context |
| UserServiceProvider | `src/user/services/UserServiceProvider.tsx` | User API service context |
| LlmRouterServiceProvider | `src/llm-router/services/LlmRouterServiceProvider.tsx` | LLM Router service context |
| I18nProvider | `src/i18n/I18nProvider.tsx` | Internationalization (ko/en/zh) |
| HotkeyProvider | `src/hooks/HotkeyProvider.tsx` | Keyboard shortcut context |
| UndoRedoProvider | `src/hooks/UndoRedoProvider.tsx` | Undo/redo state context |
| PortalProvider | `src/hooks/PortalProvider.tsx` | Portal container context |
| ModalProvider | `src/hooks/ModalProvider.tsx` | Modal stack context |
| QueryProvider | `src/hooks/QueryProvider.tsx` | Data fetching cache context |
| EventBusProvider | `src/hooks/EventBusProvider.tsx` | Event bus pub/sub context |
| AlertDialogProvider | `src/hooks/AlertDialogProvider.tsx` | Alert dialog context |
| AnalyticsProvider | `src/utils/AnalyticsProvider.tsx` | Analytics tracking context |
| FeatureFlagProvider | `src/utils/FeatureFlagProvider.tsx` | Feature flag context |
| LogProvider | `src/utils/LogProvider.tsx` | Logging context |

---

## Services (48+)

### Admin Services (packages/ui/src/admin/services/)

| Service | Description |
|---------|-------------|
| apiService / mockApiService / realAdminService | Admin API abstraction with mock/real switch |
| enterpriseApi | Enterprise API proxy |
| analyticsService | Analytics data service |
| benchmarkService | Model benchmark service |
| chatAnalyticsService | Chat analytics service |
| feedbackService | User feedback service |
| finetunService | Fine-tuning management service |
| knowledgeGraphService | Knowledge graph service |
| ragService | RAG search service |
| promptVersionService | Prompt version management |
| ssoService | SSO configuration service |
| rbacService | RBAC management service |
| alertRuleService | Alert rule CRUD service |
| teamChatService | Team chat service |
| advancedChartService | Advanced chart data service |
| voiceService | Voice interface service |
| notificationService | Notification service |
| realtimeService | Real-time metrics service |
| widgetService | Widget management service |
| workflowService | Workflow builder service |
| tenantService | Multi-tenant service |
| marketplaceService | Agent marketplace service |
| serviceRegistry | Service registration/discovery |

### Admin Auth Services (packages/ui/src/admin/auth/)

| Service | Description |
|---------|-------------|
| authService / mockAuthService / realAuthService | Auth with mock/real switch |
| crypto | Password hashing utilities |
| token | JWT token management |

### User Services (packages/ui/src/user/services/)

| Service | Description |
|---------|-------------|
| chatService / mockUserService / realChatService | Chat API with mock/real switch |
| sseService / realSseService | Server-Sent Events streaming |
| userService | User profile service |
| assistantService | Assistant CRUD service |
| indexedDbService | IndexedDB persistence |
| researchService | Deep research service |

### LLM Router Services (packages/ui/src/llm-router/services/)

| Service | Description |
|---------|-------------|
| llmRouterService / mockLlmRouterService | 86-model catalog with mock/real switch |
| streamingService | Streaming API service |
| apiKeyUtils | API key management utilities |

### Mobile Services (packages/ui/src/mobile/services/)

| Service | Description |
|---------|-------------|
| mobileService | Mobile app service layer |

### Client Services (packages/ui/src/client/)

| Service | Description |
|---------|-------------|
| serviceFactory | Mock/Real service switch factory |
| apiClient | HTTP client with interceptors |
| apiSdk | Typed API SDK |

---

## Utilities (40+)

Path prefix: `packages/ui/src/utils/`

### Security

| Utility | Description |
|---------|-------------|
| sanitize | HTML sanitization (XSS prevention) |
| blocklist | Content blocklist filtering |
| csrf | CSRF token generation/validation |
| rateLimit | Rate limiting middleware |
| tokenStorage | Secure token storage |

### Networking

| Utility | Description |
|---------|-------------|
| circuitBreaker | Circuit breaker pattern for API calls |
| retry | Exponential backoff retry |
| requestDedup | Request deduplication |
| offlineQueue | Offline operation queue |
| queryCache | Response caching layer |
| webhookService | Webhook management |

### Monitoring

| Utility | Description |
|---------|-------------|
| errorMonitoring | Error tracking (Sentry-ready) |
| healthCheck | Health check utilities |
| webVitals | Core Web Vitals tracking |
| logger | Structured logging |
| alertConfig | Alert configuration |
| performance | Performance measurement |
| performanceProfiler | Render profiling |
| benchmark | Benchmark utilities |

### Data

| Utility | Description |
|---------|-------------|
| dataExport | CSV/JSON export |
| searchEngine | Full-text search engine |
| contentDiff | Content diff computation |
| persistStorage | Persistent storage abstraction |
| analytics | Analytics event utilities |

### UI

| Utility | Description |
|---------|-------------|
| a11y | Accessibility utilities |
| keyboardUtils | Keyboard event helpers |
| colorUtils | Color manipulation |
| avatarUtils | Avatar generation |
| dateUtils | Date formatting/parsing |
| imagePlaceholder | Image placeholder generation |
| clipboard | Clipboard utilities |
| eventBus | Event bus implementation |
| featureFlags | Feature flag system |
| workerUtils | Web Worker helpers |
| pushNotification | Push notification utilities |

### Text (packages/ui/src/utils/text/)

| Utility | Description |
|---------|-------------|
| text/index | Text processing utilities |
| text/stopwords | Stopword lists |
| text/tokenEntropyEncoder | Token entropy encoding |

---

## Schemas (9)

Path prefix: `packages/ui/src/schemas/`

| Schema | Description |
|--------|-------------|
| admin.ts | Admin entity schemas (Provider, Model, Feature, Department) |
| auth.ts | Authentication schemas (LoginInput, Token, Session) |
| chat.ts | Chat schemas (Message, Conversation, Assistant) |
| common.ts | Common schemas (Pagination, ApiResponse, ErrorResponse) |
| llmRouter.ts | LLM Router schemas (Model, Provider, Pricing) |
| roi.ts | ROI schemas (KPI, Report, DataUpload) |
| text.ts | Text processing schemas |
| user.ts | User schemas (Profile, Subscription, Usage) |
| index.ts | Schema barrel exports |

---

## MSW Mock Handlers (8 files, 42+ endpoints)

Path prefix: `packages/ui/src/mocks/handlers/`

| Handler | Domain |
|---------|--------|
| admin.ts | Admin API endpoints |
| auth.ts | Authentication endpoints |
| chat.ts | Chat API endpoints |
| models.ts | Model catalog endpoints |
| enterprise.ts | Enterprise API endpoints |
| aiEngine.ts | AI engine endpoints |
| aiAdvanced.ts | Advanced AI endpoints |
| collaboration.ts | Collaboration endpoints |
