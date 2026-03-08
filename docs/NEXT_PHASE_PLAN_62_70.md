# H Chat Phase 62-70 Plan

> Based on: Phase 61 completion + Deep Analysis Report v2
> Date: 2026-03-08 | 125 commits, 61 phases, ~958 tests

---

## Overview

```
Phase 62: Zod + Input Validation       ──┐
Phase 63: Test Coverage 80%             ──┼── Parallel (62+63)
                                          │
Phase 64: Server Component Migration    ──┤
Phase 65: Real API v1 (Auth+Chat+Admin) ──┘── Depends on 62
                                          │
Phase 66: Real API v2 (AI Providers)    ──── Depends on 65
Phase 67: Bundle & Performance          ──── Parallel with 66
                                          │
Phase 68: i18n Full Coverage            ──┐
Phase 69: Monitoring & Observability    ──┼── Parallel (68+69)
                                          │
Phase 70: Production Launch             ──── Depends on all
```

---

## Phase 62: Zod Validation + Security Hotfix

**Goal**: 0 -> complete input validation + CVE fixes

### URGENT: Security Hotfixes (Day 1)
- [ ] Upgrade Next.js 16.1.1 -> 16.1.6+ (3 DoS CVEs)
- [ ] Isolate xlsx in Web Worker (Prototype Pollution + ReDoS, no fix)
- [ ] Add security headers to all next.config.ts (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- [ ] Switch mock auth token from localStorage to sessionStorage (XSS mitigation)

### Tasks
- [ ] Install zod in @hchat/ui-core
- [ ] Create shared schemas: `packages/ui/src/schemas/`
  - [ ] auth.schema.ts (login, register, token)
  - [ ] chat.schema.ts (message, conversation)
  - [ ] admin.schema.ts (user, settings, dashboard)
  - [ ] roi.schema.ts (upload, filters, kpi)
  - [ ] llm-router.schema.ts (model, provider, request)
- [ ] Add validation to all service methods (42 files)
- [ ] Add validation to API client (request/response)
- [ ] Create `useValidatedForm` hook
- [ ] Unit tests for all schemas (edge cases, error messages)

### Success Criteria
- Every service method validates input with zod
- Every API endpoint has request/response schemas
- Schema tests cover edge cases
- 0 unvalidated user input paths

### Estimated
- Files: +15 schema files, ~40 service edits
- LOC: +2,000
- Tests: +100

---

## Phase 63: Test Coverage 80%

**Goal**: 40% -> 80% coverage (~958 -> ~2,000 tests)

### Tasks
- [ ] MSW integration tests (8 domains x 5 handlers = 40 tests)
- [ ] Admin service deep tests (20 untested services)
- [ ] Admin component tests (32 untested components)
- [ ] User ChatPage integration test (SSE + persistence)
- [ ] ROI data pipeline test (Excel upload -> parse -> aggregate -> chart)
- [ ] LLM Router model catalog tests (filter, search, compare)
- [ ] Desktop/Mobile component tests (+10)
- [ ] Provider + Context integration tests (8 providers)
- [ ] Error boundary + edge case tests
- [ ] Raise vitest thresholds: 40% -> 60% -> 80%

### Priority Order
1. MSW integration (foundation, highest impact)
2. Admin large pages (WorkflowBuilder, RBAC, AlertRule)
3. User ChatPage (SSE streaming, message persistence)
4. ROI pipeline (Excel -> aggregation -> charts)

### Success Criteria
- 80%+ statements/lines coverage
- CI enforces 80% threshold
- All critical paths have integration tests

### Estimated
- Files: +40 test files
- Tests: +1,000
- LOC: +8,000

---

## Phase 64: Server Component Migration

**Goal**: 209 'use client' -> minimize to interactive-only components

### Tasks
- [ ] Audit 209 'use client' files — categorize as:
  - Static (can be server component) — ~60 estimated
  - Interactive (must stay client) — ~120
  - Mixed (split needed) — ~30
- [ ] Convert static pages to server components (Admin stats, HMG pages)
- [ ] Split mixed components (server wrapper + client island)
- [ ] Move data fetching to server components where possible
- [ ] Update Storybook for mixed components
- [ ] Performance benchmark before/after

### Success Criteria
- 'use client' reduced from 209 to <130
- LCP improvement measurable
- No functionality regression

### Estimated
- Files: ~60 edits
- LOC: net -500 (simpler client components)

---

## Phase 65: Real API v1 (Auth + Chat + Admin)

**Goal**: Mock -> Real for core services

### Prerequisites
- Phase 62 (Zod schemas for request/response validation)
- Docker Compose (PostgreSQL + Redis) ready
- API Client + ServiceFactory ready

### Tasks
- [ ] Prisma schema from docker/init.sql
- [ ] `@hchat/api` package (shared API routes)
- [ ] Real AuthService (JWT RS256, bcrypt, session)
- [ ] Real ChatService (PostgreSQL CRUD, SSE streaming)
- [ ] Real AdminDashboardService (aggregated stats)
- [ ] Real UserService (profile, preferences)
- [ ] ServiceFactory: `NEXT_PUBLIC_API_MODE=real` switches
- [ ] Seed data script for dev environment
- [ ] API route tests with Docker test container
- [ ] .env.example with all required variables

### Services to Migrate
| Service | Endpoints | Complexity |
|---------|-----------|-----------|
| auth | 3 | Medium |
| chat | 2 | High (SSE) |
| admin-dashboard | 3 | Medium |
| users | 3 | Low |
| Total | 11 | - |

### Success Criteria
- Login -> Chat -> Dashboard works with real DB
- MSW tests still pass (mock mode unchanged)
- Both API_MODE=mock and API_MODE=real work

### Estimated
- Files: +30 (API routes, Prisma, real services)
- LOC: +4,000

---

## Phase 66: Real API v2 + AI Provider Integration

**Goal**: Remaining services + actual AI model calls

### Tasks
- [ ] Real LLM Router (OpenAI, Anthropic, Google AI SDK)
- [ ] Real SSE streaming (actual model responses)
- [ ] Real RAG service (pgvector for vector search)
- [ ] Real Analytics service (from audit_logs)
- [ ] Real RBAC service (DB-backed roles/permissions)
- [ ] Rate limiting middleware (Redis-based)
- [ ] API key management (hash + prefix)
- [ ] Cost tracking per user/department
- [ ] AI Provider health check + fallback

### AI Providers
```
OpenAI:     GPT-4o, GPT-4o-mini
Anthropic:  Claude Sonnet 4.6, Claude Haiku 4.5
Google:     Gemini 2.5 Pro, Gemini 2.5 Flash
```

### Success Criteria
- Real AI responses in chat
- Cost tracking per conversation
- Rate limiting prevents abuse
- Provider fallback on failure

### Estimated
- Files: +40
- LOC: +5,000

---

## Phase 67: Bundle & Performance Optimization

**Goal**: LLM Router 36MB -> <5MB, overall performance improvement

### Tasks
- [ ] LLM Router bundle analysis + tree shaking
- [ ] mockData.ts code-split (1,099 LOC -> lazy import)
- [ ] lucide-react -> specific icon imports (45MB -> ~2MB)
- [ ] Dynamic imports for heavy components (charts, editors)
- [ ] Image optimization audit (all apps)
- [ ] `poweredByHeader: false`, `compress: true` in all next.config
- [ ] Tailwind @source scope narrowing per app
- [ ] Bundle size CI check (fail on regression)

### Success Criteria
- LLM Router .next < 5MB
- All apps LCP < 2s
- CLS < 0.1
- Bundle size tracked in CI

### Estimated
- Files: ~30 edits
- LOC: net -1,000

---

## Phase 68: i18n Full Coverage

**Goal**: HMG 49 keys -> all apps multi-language

### Tasks
- [ ] Expand i18n infrastructure to all apps
- [ ] Extract strings from Admin (largest: 16,893 LOC)
- [ ] Extract strings from User, LLM Router, ROI
- [ ] Add Korean (ko), English (en), Chinese (zh) locale files
- [ ] Language switcher in all app headers
- [ ] RTL layout support preparation
- [ ] Locale-aware date/number formatting

### Success Criteria
- All user-facing strings in locale files
- 3 languages: ko, en, zh
- Language toggle in every app

### Estimated
- Files: +50 (locale files + edits)
- LOC: +3,000

---

## Phase 69: Monitoring & Observability

**Goal**: Production-ready monitoring stack

### Tasks
- [ ] Sentry integration (replace errorMonitoring wrapper)
- [ ] Structured logging (pino or winston)
- [ ] Request tracing (correlation IDs)
- [ ] Web Vitals dashboard (Vercel Analytics or custom)
- [ ] Health check endpoint per app (/api/health)
- [ ] Uptime monitoring (Uptime Robot or Better Stack)
- [ ] Alert configuration (Slack/Teams notifications)
- [ ] Performance budget enforcement in CI

### Success Criteria
- Sentry catches all unhandled errors
- Every request has correlation ID
- Web Vitals tracked in dashboard
- Alerts for degradation

### Estimated
- Files: +20
- LOC: +2,000

---

## Phase 70: Production Launch

**Goal**: Go live with full production infrastructure

### Tasks
- [ ] Managed PostgreSQL (Supabase or Neon)
- [ ] Managed Redis (Upstash)
- [ ] Custom domain configuration
- [ ] SSL/TLS verification
- [ ] Environment variables in Vercel (all apps)
- [ ] Load testing with k6 (100 concurrent users)
- [ ] Security audit (OWASP ZAP scan)
- [ ] Backup & restore procedures
- [ ] Rollback plan documentation
- [ ] On-call rotation setup
- [ ] User acceptance testing (UAT)
- [ ] Go-live checklist (docs/PRODUCTION_CHECKLIST.md)
- [ ] Post-launch monitoring (72h)

### Success Criteria
- All PRODUCTION_CHECKLIST items checked
- LCP < 2s, CLS < 0.1 on all pages
- 0 critical security findings
- 99.9% uptime target set
- Backup tested and verified

---

## Timeline & Parallelism

```
Week 1-2:  Phase 62 (Zod) + Phase 63 (Tests)     [PARALLEL]
Week 3:    Phase 64 (Server Components)
Week 4-5:  Phase 65 (Real API v1)
Week 6-7:  Phase 66 (AI Providers) + Phase 67 (Perf) [PARALLEL]
Week 8-9:  Phase 68 (i18n) + Phase 69 (Monitoring) [PARALLEL]
Week 10:   Phase 70 (Production Launch)
```

## Cumulative Metrics Target

| Metric | Phase 61 | Phase 70 |
|--------|----------|----------|
| Total LOC | 57,207 | ~80,000 |
| Test Coverage | 40% | 80%+ |
| Tests | ~958 | ~2,500+ |
| Zod Schemas | 0 | 50+ |
| 'use client' | 209 | <130 |
| AI Providers | 0 | 3 |
| Mock Services | 27/27 | 0/27 |
| DB | Docker local | Managed cloud |
| Languages | 1 (partial) | 3 (ko/en/zh) |
| Monitoring | Wrapper | Sentry+Vitals |
