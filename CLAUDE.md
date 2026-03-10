# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

npm workspaces monorepo for H Chat — Wiki, HMG site, Admin panel (with ROI dashboard), User app, LLM Router app, Desktop app, Mobile PWA, Chrome Extension, AI Core backend, and shared Storybook.

## Monorepo Structure

```
hchat-wiki/
├── packages/
│   ├── tokens/          # @hchat/tokens — Design token CSS variables (light/dark)
│   └── ui/              # @hchat/ui — Shared UI components (308 files)
│       └── src/
│           ├── admin/   # Admin components + services (84 files)
│           ├── user/    # User components (Chat, SSE streaming, hooks)
│           ├── roi/     # ROI dashboard (charts, filters, pages)
│           ├── llm-router/  # LLM Router components (86 AI models)
│           ├── hmg/     # HMG components (GNB, HeroBanner, Footer)
│           ├── desktop/ # Desktop components (Sidebar, AgentCard, ToolGrid)
│           ├── mobile/  # Mobile PWA components
│           ├── i18n/    # Internationalization (ko/en)
│           ├── mocks/   # MSW handlers (8 domains, 39 endpoints)
│           ├── schemas/ # Zod validation schemas (9 files)
│           ├── hooks/   # Shared hooks (useNetworkStatus, usePWAInstall, etc.)
│           ├── utils/   # Utilities (sanitize, errorMonitoring, webVitals)
│           └── client/  # API client (ServiceFactory, Mock/Real switching)
├── apps/
│   ├── wiki/            # @hchat/wiki — Next.js 16 markdown wiki (GitHub Pages)
│   ├── hmg/             # @hchat/hmg — Next.js 16 HMG site (Vercel)
│   ├── admin/           # @hchat/admin — Next.js 16 admin panel + ROI (Vercel)
│   ├── user/            # @hchat/user — Next.js 16 user app with chat (Vercel)
│   ├── llm-router/      # @hchat/llm-router — Next.js 16 LLM router (Vercel)
│   ├── desktop/         # @hchat/desktop — Next.js 16 desktop app (Vercel)
│   ├── mobile/          # @hchat/mobile — Next.js 16 mobile PWA (Vercel)
│   ├── extension/       # @hchat/extension — Chrome Extension (Vite + React 19, MV3)
│   ├── ai-core/         # Python FastAPI backend (LLM routing, chat, research)
│   └── storybook/       # @hchat/storybook — Storybook 9 (Vercel)
├── design/              # wiki.pen, design1.pen
├── docker/              # docker-compose.prod.yml, init.sql
└── docs/                # 36 design/architecture documents
```

## Commands

```bash
npm install              # Install all workspace dependencies
npm run build            # Turbo: build all apps
npm run build:wiki       # Wiki only → apps/wiki/out/
npm run build:hmg        # HMG only → apps/hmg/out/
npm run build:admin      # Admin only → apps/admin/out/
npm run build:user       # User only → apps/user/out/
npm run build:llm-router # LLM Router only → apps/llm-router/out/
npm run build:desktop    # Desktop only → apps/desktop/out/
npm run build:mobile     # Mobile only → apps/mobile/out/
npm run build:storybook  # Storybook only → apps/storybook/storybook-static/
npm run dev:wiki         # Wiki dev at localhost:3000
npm run dev:hmg          # HMG dev at localhost:3001
npm run dev:admin        # Admin dev at localhost:3002
npm run dev:user         # User dev at localhost:3003
npm run dev:llm-router   # LLM Router dev at localhost:3004
npm run dev:desktop      # Desktop dev at localhost:5173
npm run dev:mobile       # Mobile dev at localhost:3005
npm run dev:storybook    # Storybook dev at localhost:6006
npm test                 # Vitest: run all unit tests (4,306 tests)
npm run test:coverage    # Coverage report (89.9% statements)
npm run test:e2e         # Playwright E2E tests (21 files)
npm run docker:prod      # Start production Docker stack
```

## Package Dependency Graph

```
@hchat/tokens  ←  @hchat/ui  ←  @hchat/wiki
                       ↑        ←  @hchat/hmg
                       ↑        ←  @hchat/admin
                       ↑        ←  @hchat/user
                       ↑        ←  @hchat/llm-router
                       ↑        ←  @hchat/desktop
                       ↑        ←  @hchat/mobile
                       ↑        ←  @hchat/extension
               @hchat/storybook

@hchat/admin  →  apps/ai-core (FastAPI, via API proxy)
```

## Tech Stack

- Next.js 16.1.6 (App Router, Static Export), TypeScript 5, React 19.2.3, Tailwind CSS 4
- Turborepo for build orchestration
- Storybook 9 with nextjs-vite framework
- Design tokens: CSS variables in `packages/tokens/styles/tokens.css`
- SheetJS (xlsx) for browser-local Excel file parsing in ROI dashboard
- MSW (Mock Service Worker) for API mocking in tests and development
- Docker Compose (PostgreSQL 16 + Redis 7 + FastAPI) for local infrastructure
- Zod for runtime validation (9 schema files, 40+ types)
- idb (IndexedDB) for client-side persistence
- Feature Flags: localStorage-based runtime toggle (`packages/ui/src/utils/featureFlags.ts`, 4 default flags)
- Structured Logging: `createLogger()` with JSON output (prod), console (dev), log buffering, captureError integration (`packages/ui/src/utils/logger.ts`)
- Web Workers: `createWorkerClient()` promise wrapper with SSR fallback (`packages/ui/src/utils/workerUtils.ts`), used for xlsx parsing
- API Versioning: `/api/v1/*` endpoints with `X-API-Version` header and deprecation sunset headers (`apps/user/app/api/v1/`)

## Architecture

### Design Tokens (`packages/tokens/`)
CSS variables for Wiki, HMG, Admin, and ROI themes (light + dark). Each app imports via `@import "../../../packages/tokens/styles/tokens.css"` in its globals.css and maps to Tailwind via `@theme inline`.

**Important**: Tailwind CSS 4 requires `@source "../../../packages/ui/src";` in app globals.css to scan cross-package utility classes. Glob patterns do not work — use directory paths only.

### Component Library (`packages/ui/`, 400 files)

**Shared** (14 components):
- `@hchat/ui` — Badge, ThemeProvider, ThemeToggle, FeatureCard, Skeleton, Toast, ErrorBoundary, EmptyState, LanguageToggle, FeatureFlagProvider, LogProvider, OptimizedImage, CommandPalette, HotkeyProvider

**HMG** (8 components):
- `@hchat/ui/hmg` — GNB, HeroBanner, TabFilter, Footer, HmgStatCard, StepItem, DownloadItem, PillButton

**Admin** (35+ components):
- `@hchat/ui/admin` — StatusBadge, MonthPicker, StatCard, DataTable, BarChartRow, UserCard, SettingsRow, AdminDashboard, AdminUsageHistory, AdminStatistics, AdminUserManagement, AdminSettings, AdminProviderStatus, AdminModelPricing, AdminFeatureUsage, AdminPromptLibrary, AdminAgentMonitoring, DepartmentManagement, AuditLogViewer, SSOConfigPanel, LoginPage, NotificationBell, NotificationCenter, NotificationPanel, NotificationPreferences, WidgetCard, CustomDashboard, WidgetCatalogPanel, WidgetRenderer, WorkflowBuilder, WorkflowCanvas, WorkflowNodeCard, WorkflowNodeCatalog, WorkflowTemplateGallery, TenantManagement, TenantSelector, AlertRuleBuilder, AnalyticsDashboard, BenchmarkDashboard, FeedbackDashboard, KnowledgeGraphView, RAGSearchPage, ChatAnalyticsPage, FineTuneDashboard, PromptVersionManager, RBACManager, TeamChatRoom, VoiceInterface, LiveLineChart, LiveModelDistribution, LiveActivityFeed, LiveMetricCard, AgentMarketCard, AgentMarketGrid
- `@hchat/ui/admin/auth` — AuthProvider, ProtectedRoute, useAuth hook, authService, mockAuthService, realAuthService
- `@hchat/ui/admin/services` — AdminServiceProvider, enterpriseApi, apiService + 20 domain services (realtime, tenant, marketplace, analytics, rag, promptVersion, sso, benchmark, chatAnalytics, rbac, alertRule, feedback, teamChat, advancedChart, finetun, knowledgeGraph, voice, notification, widget, workflow)

**User** (21 components):
- `@hchat/ui/user` — UserGNB, ChatSidebar, AssistantCard, AssistantGrid, CategoryFilter, ChatSearchBar, ChatSearchPanel, FileUploadZone, StepProgress, EngineSelector, ProjectTable, SubscriptionCard, UsageTable, MessageBubble, StreamingIndicator, CustomAssistantModal, MarkdownRenderer, ChatPage, DocsPage, MyPage, OCRPage, TranslationPage
- `@hchat/ui/user/services` — UserServiceProvider, chatService, mockChatService, userService, mockUserService, assistantService, indexedDbService, researchService, sseService, realSseService, realChatService
- `@hchat/ui/user/hooks` — useChat, useAssistants, useConversations, useResearch, useExtensionContext

**LLM Router** (8 components):
- `@hchat/ui/llm-router` — LRNavbar, ModelTable, CodeBlock, ProviderBadge, PriceCell, DocsSidebar, ModelComparison, StreamingPlayground
- `@hchat/ui/llm-router/services` — LlmRouterServiceProvider, llmRouterService, mockLlmRouterService, streamingService

**Desktop** (6 components):
- `@hchat/ui/desktop` — DesktopSidebar, DesktopChatBubble, AgentCard, ToolGrid, SwarmPanel, DebateArena

**Mobile** (7 components):
- `@hchat/ui/mobile` — MobileApp, MobileAssistantList, MobileChatList, MobileChatView, MobileHeader, MobileSettingsPage, MobileTabBar

**Shared Hooks** (36 files in `packages/ui/src/hooks/`):
- Data: useAsyncData, usePersistedState, useOfflineQueue, useSearch, useDataExport, useInfiniteScroll, useVirtualList
- UI: useModal, useModalManager, useTooltip, useTabs, useAccordion, useStepper, useSelect, usePagination, usePortal, useBreadcrumb, useToastQueue, useAnimatedList, useTransition, useDragAndDrop, useFormBuilder
- Platform: useNetworkStatus, usePWAInstall, usePushNotification, useMonitoring, useAnalytics, useHotkeys, useCommandPalette, useClipboard, useBreakpoint, useMediaQuery, useWindowSize, useThemeCustomizer, useUndoRedo

**i18n** — Internationalization (ko/en/zh language support)

**ROI** (17 components):
- `@hchat/ui` (ROI) — ROISidebar, ROIOverview, ROIAdoption, ROIProductivity, ROIAnalysis, ROIOrganization, ROISentiment, ROIReports, ROISettings, ROIDataUpload, ROIDataContext, KPICard, ChartPlaceholder, InsightCard, SurveyBar, HeatmapCell, DateFilter, DepartmentFilter
- `@hchat/ui` (ROI Charts) — MiniLineChart, DonutChart, MiniBarChart, AreaChart, RadarChart (pure SVG/CSS, no chart library)

### Wiki App (`apps/wiki/`)
Markdown wiki with Sidebar + catch-all route. Content in `apps/wiki/content/`.

### HMG App (`apps/hmg/`)
4 pages: Home (`/`), Publications (`/publications`), StepGuide (`/guide`), Dashboard (`/dashboard`). Publications supports tab filtering and download handlers.

### Admin App (`apps/admin/`)
14 base pages: Dashboard (`/`), Usage (`/usage`), Statistics (`/statistics`), Users (`/users`), Settings (`/settings`), AI Providers (`/providers`), Model Pricing (`/models`), Feature Usage (`/features`), Prompt Library (`/prompts`), Agent Monitoring (`/agents`), Login (`/login`), Departments (`/departments`), Audit Logs (`/audit-logs`), SSO (`/sso`).

9 ROI pages under `/roi/` layout with sidebar navigation:
- Data Upload (`/roi/upload`) — Excel file upload with browser-local parsing (SheetJS)
- Overview (`/roi/overview`) — KPI cards, time savings chart, model cost donut
- Adoption (`/roi/adoption`) — Active user trends, feature adoption bars
- Productivity (`/roi/productivity`) — Weekly AI hours bar chart, savings donut
- Analysis (`/roi/analysis`) — ROI trend, cumulative savings area, interactive ROI simulator
- Organization (`/roi/organization`) — Department heatmap, model usage donut
- Sentiment (`/roi/sentiment`) — NPS trend, radar chart, survey bars
- Reports (`/roi/reports`) — Report list with preview panel
- Settings (`/roi/settings`) — ROI parameters, data sources, cost, alerts, permissions

Authentication: AuthProvider wraps admin app with mock auth service. ProtectedRoute guards admin pages. Login page at `/login` with demo credentials (admin@hchat.ai / Admin123!).

Enterprise API: Services layer in `packages/ui/src/admin/services/` provides API abstraction with mock data fallback. Enterprise types define Provider, Model, Feature, Department, AuditLog, SSO schemas. API proxy pattern protects server-side API keys.

### User App (`apps/user/`)
5 pages: Chat (`/`), Docs (`/docs`), My Page (`/my`), OCR (`/ocr`), Translation (`/translation`). Features real-time chat with SSE streaming, localStorage persistence, custom assistant creation, and file upload. Service layer with mock data and Provider Pattern (UserServiceProvider).

### LLM Router App (`apps/llm-router/`)
10 pages including Home, Models (86 AI models from OpenAI, Anthropic, Cohere, etc.), Docs, About. Features comprehensive model comparison table with pricing, context windows, and capabilities. Service layer provides model catalog with filtering and search.

### Desktop App (`apps/desktop/`)
Desktop interface for H Chat with agent management and tool integration. Components: DesktopSidebar (collapsible navigation), DesktopChatBubble (user/assistant messages with token count), AgentCard (agent status and controls), ToolGrid (tool grid with active/inactive states), SwarmPanel (multi-agent coordination), DebateArena (AI debate interface). Design tokens use `--dt-*` prefix. Dev server at localhost:5173.

### Mobile App (`apps/mobile/`)
Mobile PWA with Next.js 16 (static export). Responsive chat interface optimized for touch. Dev server at localhost:3005. Deployed to Vercel.

### Chrome Extension (`apps/extension/`)
Chrome Extension (Manifest V3) built with Vite + React 19. Features: content script injection, optional host permissions, blocklist for sensitive sites, PII sanitization. Dev with `npm run dev` (Vite watch mode).

### AI Core (`apps/ai-core/`)
Python FastAPI backend for LLM routing and AI services. Routers: chat, analyze, research. Requires Python environment with `requirements.txt`. Runs on port 8000. Docker-based deployment.

### Storybook (`apps/storybook/`)
155 story files across categories: Admin (44), User (33), ROI (26), Wiki (13), HMG (12), Mobile (8), LLM Router (7), Desktop (6), Shared (5), Design System (1). Includes 26 interaction test files with play functions. Uses vite aliases in `.storybook/main.ts` for monorepo resolution.

### Dark Mode
All apps use ThemeProvider from `@hchat/ui` with `.dark` class toggle on `<html>`. ROI tokens support dark mode via CSS variable overrides in `packages/tokens/styles/tokens.css`.

### Deployment
- Wiki: GitHub Actions → GitHub Pages (https://sgtlim0.github.io)
- HMG: Vercel (https://hchat-hmg.vercel.app)
- Admin: Vercel (https://hchat-admin.vercel.app)
- User: Vercel (https://hchat-user.vercel.app)
- LLM Router: Vercel (https://hchat-llm-router.vercel.app)
- Desktop: Vercel (https://hchat-desktop.vercel.app)
- Mobile: Vercel (https://hchat-mobile.vercel.app)
- Storybook: Vercel (https://hchat-storybook.vercel.app)
- AI Core: Docker (docker-compose.prod.yml)

Vercel projects connected via Git (auto-deploy on push to main).

### CI/CD
- GitHub Actions CI: type-check + lint + build on push/PR (`.github/workflows/ci.yml`)
- GitHub Actions Deploy: Wiki → GitHub Pages (`.github/workflows/deploy.yml`)
- GitHub Actions E2E: Playwright tests (`.github/workflows/e2e.yml`)
- Lighthouse CI: weekly schedule + manual dispatch, performance budgets (FCP<3s, LCP<4s, CLS<0.1, TBT<500ms) (`.github/workflows/lighthouse.yml`, `lighthouserc.json`)
- Dependabot: auto-merge patch/minor PRs (`.github/workflows/dependabot-auto-merge.yml`)
- Prettier + Husky + lint-staged for code quality

### Testing
- Vitest: 192 test files, 4,306 unit tests (89.9% stmts, 80.3% branches, 90.2% functions, 91.1% lines)
- MSW: 42 endpoint handlers across 8 domains (`packages/ui/src/mocks/`)
- Playwright E2E: 21 test files across 6 projects (admin, hmg, user, llm-router, wiki, dark-mode) + error-paths, resilience, cross-browser
- Storybook: 155 story files with 26 play-function interaction test files
- k6 Load: 6 scenarios (smoke, chat, stream, research, pages, spike)
- Coverage thresholds: statements 40%, branches 25%, functions 40% (actual: 89.9% stmts, 80.3% branches)
- Test location: `packages/ui/__tests__/` (all unit tests)

### Infrastructure
- Docker Compose dev: `docker-compose.yml` (PostgreSQL 16 + Redis 7 + ai-core FastAPI)
- Docker Compose prod: `docker/docker-compose.prod.yml` (resource limits: ai-core 2G, postgres 1G, redis 512M)
- DB Schema: `docker/init.sql` (users, conversations, messages, api_keys, audit_logs)
- API Client: `packages/ui/src/client/` (ServiceFactory with Mock/Real switching via `NEXT_PUBLIC_API_MODE`)
- Monitoring: `packages/ui/src/utils/errorMonitoring.ts` (Sentry-ready), `healthCheck.ts`, `webVitals.ts`, `alertConfig.ts` (AlertManager)
- Security: 7 security headers on all apps, CSP nonce (SSR apps via middleware.ts), CSRF protection, PBKDF2 password hashing, HMAC-SHA256 JWT, Zod input validation, PII sanitization, blocklist (20 domains + 6 patterns)
- DB Migration: `docker/init.sql` with `schema_migrations` tracking table, 3 migration scripts
- Structured Logging: `createLogger(context)` → JSON (prod) / console (dev), log buffer (50 entries), custom transport support, auto captureError integration
- Feature Flags: localStorage-based runtime toggle with React `useSyncExternalStore` integration (`FeatureFlagProvider.tsx`), 4 default flags (chat.streaming, roi.simulator, desktop.swarm, user.research)
- Web Workers: xlsx parsing offloaded via `xlsxWorker.ts` + `useXlsxWorker` hook, generic `workerUtils.ts` with SSR fallback
- Offline Queue: `useOfflineQueue` hook for queueing operations during network loss, automatic retry on reconnect
- PWA: Service Worker with 3-tier cache strategy, push notifications via `usePushNotification`, install prompt via `usePWAInstall`
- Environment: `.env.development`, `.env.production`, `.env.test` templates + `.env.example` reference
