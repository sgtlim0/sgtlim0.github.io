# H Chat Phase 61-65 Plan

> Based on: Phase 60 completion + Deep Analysis Report
> Date: 2026-03-07 | 122 commits, 60 phases, 874 tests

---

## Phase 61: @hchat/ui Package Split

**Goal**: 31K LOC single package -> domain sub-packages

### Tasks
- [ ] `@hchat/ui-core` extract (Badge, Theme, Toast, Skeleton, ErrorBoundary, EmptyState) ~1,500 LOC
- [ ] `@hchat/ui-admin` extract (admin/ 16,800 LOC -> independent package)
- [ ] `@hchat/ui-user` extract (user/ 3,800 LOC)
- [ ] `@hchat/ui-roi` extract (roi/ 2,600 LOC, isolate xlsx dependency)
- [ ] `@hchat/ui-llm-router` extract (llm-router/ 3,900 LOC)
- [ ] Update Turborepo dependency graph
- [ ] Update all app imports (codemod or manual)
- [ ] Update Storybook aliases
- [ ] Verify all 8 app builds pass
- [ ] Verify 874+ tests pass

### Success Criteria
- Each sub-package builds independently
- No app bundles unused domain code
- xlsx only in @hchat/ui-roi
- All tests pass

### Risk
- Import path changes across 55 page.tsx files
- Storybook resolution aliases
- Circular dependency potential between admin <-> roi

---

## Phase 62: Test Coverage 80%

**Goal**: 40% -> 80% coverage (874 -> ~1,800 tests)

### Tasks
- [ ] Admin service integration tests with MSW (20 services x 3 tests = 60)
- [ ] Admin component deep tests (54 components, currently 20 -> 45 tested)
- [ ] User flow integration tests (Chat send -> SSE stream -> display)
- [ ] ROI data pipeline tests (Excel upload -> parse -> aggregate -> display)
- [ ] LLM Router model filtering/comparison tests
- [ ] Desktop/Mobile component tests (15 components -> 12 tested)
- [ ] Provider + Hook integration tests (8 Context providers)
- [ ] Error boundary + edge case tests
- [ ] Raise vitest thresholds: 40% -> 60% -> 80%

### Priority Order
1. MSW integration tests (highest impact, foundation ready)
2. Admin large page tests (WorkflowBuilder, NotificationCenter, RBACManager)
3. User ChatPage deep tests (SSE streaming, message persistence)
4. ROI data pipeline (Excel -> aggregation -> charts)

### Success Criteria
- 80%+ statements/lines coverage
- CI enforces 80% threshold
- All critical paths have integration tests

---

## Phase 63: Real API Transition (Phase 1)

**Goal**: Mock -> Real API for core services (auth, chat, admin dashboard)

### Prerequisites
- Phase 60 ApiClient + ServiceFactory ready
- Phase 58 MSW handlers ready
- Docker Compose (PostgreSQL + Redis) ready

### Tasks
- [ ] Prisma schema from docker/init.sql
- [ ] `@hchat/api` package (API routes for Next.js)
- [ ] Real AuthService (JWT RS256, bcrypt, session management)
- [ ] Real ChatService (PostgreSQL CRUD, message history)
- [ ] Real AdminDashboardService (aggregated stats from DB)
- [ ] ServiceFactory: `NEXT_PUBLIC_API_MODE=real` switches to real services
- [ ] Seed data script (dev environment)
- [ ] API route tests with real DB (Docker test container)

### Services to Migrate (Priority 1)
| Service | Endpoints | Complexity |
|---------|-----------|-----------|
| auth | 3 | Medium |
| chat | 2 | High (SSE) |
| admin-dashboard | 3 | Medium |
| users | 3 | Low |

### Success Criteria
- Login -> Chat -> View Dashboard works with real DB
- MSW tests still pass (mock mode unchanged)
- `API_MODE=mock` and `API_MODE=real` both work

---

## Phase 64: Real API Transition (Phase 2) + AI Provider Integration

**Goal**: Remaining services + actual AI model calls

### Tasks
- [ ] Real LLM Router (OpenAI, Anthropic, Google AI SDK integration)
- [ ] Real SSE streaming (actual model responses, not mock)
- [ ] Real RAG service (vector search with pgvector)
- [ ] Real Analytics service (aggregated from audit_logs)
- [ ] Real RBAC service (DB-backed roles/permissions)
- [ ] Rate limiting middleware (Redis-based)
- [ ] API key management (hash + prefix pattern)
- [ ] Cost tracking per user/department

### AI Provider Setup
```
OpenAI:     GPT-4o, GPT-4o-mini
Anthropic:  Claude 3.5 Sonnet, Claude 3.5 Haiku
Google:     Gemini Pro, Gemini Flash
```

### Success Criteria
- Real AI responses in chat
- Cost tracking per conversation
- Rate limiting prevents abuse
- All 27 services have real implementations

---

## Phase 65: Production Launch

**Goal**: Complete production deployment

### Tasks
- [ ] Production PostgreSQL (managed: Supabase/Neon/RDS)
- [ ] Production Redis (managed: Upstash/ElastiCache)
- [ ] Sentry real integration (replace wrapper)
- [ ] Environment variables in Vercel
- [ ] Domain configuration (custom domains)
- [ ] SSL/TLS verification
- [ ] Load testing with k6 (100 concurrent users)
- [ ] Security audit (OWASP ZAP scan)
- [ ] Rollback plan documentation
- [ ] On-call rotation setup
- [ ] User acceptance testing (UAT)
- [ ] Go-live checklist execution (docs/PRODUCTION_CHECKLIST.md)

### Monitoring Stack
- Sentry: Error tracking + performance
- Lighthouse CI: Weekly performance audits
- Vercel Analytics: Web Vitals
- Custom: healthCheck utility for service status

### Success Criteria
- All PRODUCTION_CHECKLIST.md items checked
- <2s LCP on all pages
- <0.1 CLS on all pages
- 0 critical security findings
- 99.9% uptime target set

---

## Timeline & Dependencies

```
Phase 61 (UI Split)        ──┐
Phase 62 (Coverage 80%)    ──┼── Parallel possible
                             │
Phase 63 (Real API v1)     ──┘── Depends on 61 (clean imports)
                             │
Phase 64 (Real API v2)     ──── Depends on 63
                             │
Phase 65 (Production)      ──── Depends on 64
```

## Success Metrics

| Metric | Phase 60 | Phase 65 Target |
|--------|---------|-----------------|
| Test Coverage | 40% | 80%+ |
| UI Packages | 1 (31K) | 5+ sub-packages |
| Mock Services | 27/27 | 0/27 (all real) |
| Build Errors | 0 | 0 |
| AI Providers | 0 | 3 (OpenAI, Anthropic, Google) |
| DB | Mock/localStorage | PostgreSQL + Redis |
| Monitoring | Wrapper only | Sentry + Lighthouse + Vitals |
| Production | Dev only | Live with custom domain |
