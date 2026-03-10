# H Chat Wiki -- Project Summary

> Last Updated: 2026-03-10 | 302+ commits | 89 phases completed

---

## Architecture

```
                          +------------------+
                          |  Chrome Extension |
                          |  MV3 + Vite + R19 |
                          |  blocklist + PII  |
                          +--------+---------+
                                   |
    +----------+----------+--------+--------+----------+----------+----------+
    |          |          |        |        |          |          |          |
  Wiki       HMG      Admin     User   LLM Router  Desktop   Mobile   Storybook
  :3000     :3001     :3002    :3003     :3004      :5173     :3005     :6006
    |          |          |        |        |          |          |          |
    +----------+----------+--------+--------+----------+----------+----------+
                                   |
                        +----------+-----------+
                        |  @hchat/ui (shared)  |
                        |  108+ components     |
                        |  42 hooks, 39 svc    |
                        +----------+-----------+
                                   |
                        +----------+-----------+
                        |  @hchat/tokens       |
                        |  194 CSS variables   |
                        +----------------------+
                                   |
                 +-----------------+-----------------+
                 |                                   |
      +----------+-----------+          +------------+-----------+
      |  API Gateway          |          |  Docker Infrastructure  |
      |  Next.js API Routes   |          |  PostgreSQL 16          |
      |  /api/v1/* (6 routes) |          |  Redis 7                |
      |  Zod + CSRF + Rate    |          |  AI Core (FastAPI)      |
      +----------+------------+          +------------+-----------+
                 |                                    |
      +----------+------------+          +------------+-----------+
      |  AI Core (FastAPI)    |          |  k6 Load Testing        |
      |  :8000                |          |  6 scenarios             |
      |  /chat /research      |          |  20-50-100 VU           |
      |  /analyze             |          +-------------------------+
      |  OpenAI/Anthropic/    |
      |  Google/Mock          |
      +----------+------------+
```

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js (App Router, Static Export) | 16.1.6 |
| Language | TypeScript | 5 |
| UI Library | React | 19.2.3 |
| Styling | Tailwind CSS | 4 |
| Build | Turborepo | 2 |
| Component Docs | Storybook | 9 |
| Unit Test | Vitest + v8 coverage | 4 |
| E2E Test | Playwright | 1.58.2 |
| Load Test | k6 | - |
| Performance | Lighthouse CI | 0.14.0 |
| Validation | Zod | - |
| Mock API | MSW (Mock Service Worker) | - |
| DB (client) | idb (IndexedDB) | 8 |
| DB (server) | PostgreSQL | 16 |
| Cache | Redis | 7 |
| Backend | FastAPI (Python) | - |
| Excel Parse | SheetJS (xlsx) | - |
| Extension Build | Vite | - |
| CI/CD | GitHub Actions | - |
| Hosting | Vercel + GitHub Pages | - |
| Dependency Mgmt | Dependabot + auto-merge | - |

---

## App Summary (10 apps)

| App | Pages | Description |
|-----|-------|-------------|
| **Wiki** | 28 content pages | Markdown documentation wiki, GitHub Pages |
| **HMG** | 4 | Official HMG site demo (Home, Publications, Guide, Dashboard) |
| **Admin** | 24+ | Admin panel with ROI dashboard, auth, SSO, audit logs, departments |
| **User** | 5 | Chat app with SSE streaming, OCR, translation, custom assistants |
| **LLM Router** | 10 | 86 AI model catalog, comparison, playground, docs |
| **Desktop** | 5 | Desktop AI chat with agent management, swarm, debate |
| **Mobile** | 4 tabs | PWA mobile chat, swipe gestures, touch-optimized |
| **Extension** | 4 modes | Chrome MV3, PII sanitization, blocklist, API proxy |
| **AI Core** | 3 routers | FastAPI backend (chat, research, analyze), multi-LLM |
| **Storybook** | 155 stories | UI component catalog with 26 interaction test files |

---

## Metrics

| Item | Count |
|------|-------|
| Apps | 10 |
| Packages | 2 (tokens, ui) |
| TS/TSX files | 1,114 (ui 400 + apps 714) |
| Python files | 13 |
| Total LOC | ~120,000 |
| UI components (TSX) | 108+ |
| Hook files | 42 (shared 36 + user 5 + roi 1) |
| Service files | 39 |
| Zod schema files | 9 (40+ types) |
| Pages (page.tsx) | 55 |
| CSS design tokens | 194 (light + dark) |
| Unit test files | 192 |
| Unit tests | 4,306 |
| Statement coverage | 89.9% |
| Branch coverage | 80.3% |
| Function coverage | 90.2% |
| Line coverage | 91.1% |
| E2E test files | 21 |
| Story files | 155 |
| Interaction test files | 26 |
| MSW handlers | 42 endpoints, 8 domains |
| CI workflows | 5 (ci, deploy, e2e, lighthouse, dependabot-auto-merge) |
| Git commits | 302+ |
| Docs | 40 files |

---

## Test Strategy

```
Unit (Vitest)              Integration (MSW)           E2E (Playwright)
192 files, 4,306 tests     42 mock endpoints           21 files, 6 projects
89.9% stmt coverage        8 API domains               admin, hmg, user,
v8 + lcov + html           request validation           llm-router, wiki,
                           response shaping             dark-mode, cross-browser

Storybook Interaction      Load (k6)                   Lighthouse CI
26 interaction test files  6 scenarios                 Weekly + manual
155 total story files      20-50-100 VU                FCP<3s, LCP<4s
                           smoke/chat/stream/           CLS<0.1, TBT<500ms
                           research/pages/spike         a11y>=0.9
```

**Coverage thresholds** (vitest.config.ts): statements 40%, branches 25%, functions 40%
**Actual coverage**: 89.9% stmts, 80.3% branches, 90.2% functions, 91.1% lines

---

## Security Checklist

- [x] 7/7 security headers on all apps (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection)
- [x] CSP nonce for SSR apps (middleware.ts)
- [x] CSRF protection on 4 API routes (chat, stream, research, analyze) with HMAC signing
- [x] Sliding window rate limiting on API routes
- [x] PBKDF2 password hashing (100,000 iterations)
- [x] HMAC-SHA256 JWT tokens
- [x] Zod input validation on all API endpoints
- [x] PII sanitization in Chrome Extension
- [x] Blocklist for sensitive sites (20 domains + 6 patterns)
- [x] optional_host_permissions (no `<all_urls>`)
- [x] No hardcoded secrets (0 occurrences)
- [x] Environment variable management (.env.development/.production/.test)

---

## Performance Optimizations

- Dynamic imports for ROI pages (SheetJS isolation)
- MSW mocks excluded from production bundle (async serviceFactory)
- Barrel export optimization (llm-router, mobile re-export removal)
- Web Worker for xlsx parsing (off main thread)
- HTTP cache headers (SSR middleware + Vercel headers)
- Lighthouse CI budgets: FCP<3s, LCP<4s, CLS<0.1, TBT<500ms
- Image optimization: OptimizedImage component with placeholder + SkeletonImage
- SEO: metadata, sitemap, robots across 7 apps
- `use client` directive audit: 138 files (structural minimum)
- useAsyncData common hook: deduplicated 4 hooks

---

## Infrastructure

```
Development:                         Production:
  docker-compose.yml                   docker/docker-compose.prod.yml
  +-- PostgreSQL 16-alpine             +-- ai-core (2G mem limit)
  +-- Redis 7-alpine                   +-- PostgreSQL 16 (1G mem limit)
  +-- ai-core (FastAPI :8000)          +-- Redis 7 (512M mem limit)
                                       +-- healthcheck intervals

DB Schema (docker/init.sql):
  users | conversations | messages | api_keys | audit_logs | schema_migrations

API Client (packages/ui/src/client/):
  ServiceFactory -- NEXT_PUBLIC_API_MODE=mock|real
  Mock services (dev/test) <-> Real services (production)
```

---

## Development Workflow

```
1. npm install                    # Install all workspace dependencies
2. npm run dev:<app>              # Start dev server (wiki/hmg/admin/user/llm-router/desktop/mobile/storybook)
3. npm test                       # Run 4,306 unit tests
4. npm run test:coverage          # Coverage report (89.9% stmts)
5. npm run test:e2e               # Playwright E2E (21 files)
6. npx turbo build                # Build all 9 buildable apps
7. npm run docker:prod            # Start production Docker stack

CI Pipeline (GitHub Actions):
  push/PR -> type-check -> lint -> build -> test
  weekly  -> Lighthouse CI (6 URLs, 3 runs each)
  PR      -> Dependabot auto-merge (patch/minor)
```

---

## Phase History (75-89)

| Phase | Key Changes |
|-------|-------------|
| **75** | Security hardening: PBKDF2 password hashing, HMAC-SHA256 JWT, CSP nonce (unsafe-eval removal) |
| **76** | Code cleanup: mockData.ts split (1100->91 lines), unused code removal, console.error -> captureError |
| **77** | Refactoring: useAsyncData common hook extraction, BaseLayout shared component (7 apps), barrel optimization |
| **78** | CSRF HMAC signing, sliding window rate limit, 144 test files, 3,004 tests, 90.9% coverage |
| **79** | PWA offline (3-tier cache), OpenAPI spec, a11y enhancements, bundle analysis, onboarding |
| **80** | Feature Flags system, SEO (metadata/sitemap/robots), HTTP cache headers, Error Boundary per route, monitoring alerts (AlertManager + healthCheck) |
| **81** | Structured logging (createLogger + LogProvider), image optimization (OptimizedImage), DB migration system (schema_migrations), performance budgets CI, 150 files, 3,163 tests |
| **82** | API v1 versioning (6 endpoints, deprecation headers), DB seeding (5 users, 10 conversations, 50 messages), Dependabot auto-merge, 152 files, 3,198 tests |
| **83** | Web Worker xlsx parsing (workerUtils + useXlsxWorker), Command Palette (Cmd+K), PWA push notifications, keyboard shortcuts (useHotkeys + HotkeyProvider), 154 files, 3,223 tests |
| **84** | Shared hooks library expansion (useDataExport, useUndoRedo, useSearch, useDragAndDrop, useFormBuilder, useVirtualList, useThemeCustomizer, useAnalytics, usePersistedState, useInfiniteScroll, useBreadcrumb, useToastQueue) |
| **85** | UI primitive hooks (useBreakpoint, useMediaQuery, useWindowSize, useAnimatedList, useTransition, useTooltip, useTabs, useClipboard, usePagination, usePortal, useAccordion, useModal, useModalManager, useSelect, useStepper, useOfflineQueue) |
| **86** | Admin advanced services (tenant, marketplace, analytics, rag, promptVersion, sso, benchmark, chatAnalytics, rbac, alertRule, feedback, teamChat, advancedChart, finetun, knowledgeGraph, voice) |
| **87** | Admin UI components (NotificationBell/Panel/Preferences, WidgetCard/CatalogPanel/Renderer, CustomDashboard, WorkflowBuilder/Canvas/NodeCard, TenantManagement/Selector, AgentMarketCard/Grid, AlertRuleBuilder, AnalyticsDashboard, BenchmarkDashboard, etc.) |
| **88** | Storybook interaction tests (26 files), admin/user/roi/mobile interaction stories, cross-browser E2E |
| **89** | i18n zh (Chinese) support, test coverage expansion to 192 files / 4,306 tests, performance tests |

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| SSE pattern | Subscribe/callback | Better error handling than AsyncGenerator |
| API proxy | Next.js API Routes | Zod validation + Rate Limit + CSRF in one layer |
| Service Worker | Manual registration | next-pwa incompatible with monorepo |
| Client DB | idb (IndexedDB) | Singleton promise-caching, localStorage migration path |
| Extension build | Vite + React 19 | Next.js unsuitable for extensions, shared TW4 tokens |
| Extension security | optional_host_permissions | No `<all_urls>`, API Gateway enforcement |
| Mock/Real switch | serviceFactory pattern | NEXT_PUBLIC_API_MODE env var toggle |
| LLM provider | env-based selection | LLM_PROVIDER + API_KEY for runtime switching |
| i18n | ko/en manual | LanguageToggle cycling, no heavy i18n library |
| Logging | Structured JSON (prod) | createLogger with context, buffer, custom transport |
| Feature flags | localStorage | Runtime toggle without deployment, 4 default flags |
| API versioning | /api/v1/* prefix | Deprecation + Sunset headers for legacy endpoints |
