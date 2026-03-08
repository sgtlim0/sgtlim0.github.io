# H Chat 프로젝트 TODO 리스트

> 마지막 업데이트: 2026-03-08 | AI Platform 프로토타입 Week 3 + PWA/Extension 분석 완료 기준

---

## 현재 배포 상태

| 앱 | URL | 상태 |
|---|---|---|
| Wiki | https://sgtlim0.github.io | ✅ |
| HMG | https://hchat-hmg.vercel.app | ✅ |
| Admin | https://hchat-admin.vercel.app | ✅ |
| User | https://hchat-user.vercel.app | ✅ |
| LLM Router | https://hchat-llm-router.vercel.app | ✅ |
| Desktop | https://hchat-desktop.vercel.app | ✅ |
| Mobile | https://hchat-mobile.vercel.app | ✅ |
| Storybook | https://hchat-storybook.vercel.app | ✅ |

---

## 프로젝트 수치 현황 (실측 2026-03-08)

| 항목 | 수량 |
|------|------|
| 앱 (모노레포) | 7+1 (storybook) |
| 패키지 | 7개 (tokens, ui, ui-core, ui-admin, ui-user, ui-roi, ui-llm-router) |
| TS/TSX 파일 | 568개 |
| Python 파일 | 12개 (apps/ai-core/) |
| 총 코드 라인 | ~60,000줄 (TS/TSX + Python) |
| UI 컴포넌트 | 160개 |
| 서비스 파일 | 42개 |
| 페이지 | 56개 (page.tsx) |
| 커스텀 훅 | 61개 |
| Storybook | 160 스토리 |
| 단위 테스트 | 77 파일, 1,214 테스트 |
| E2E 테스트 | 18 파일 |
| Interaction Tests | 6 파일, 28 테스트 |
| MSW 핸들러 | 39 endpoints (8 도메인) |
| Git 커밋 | 133개 |
| 완료 Phase | 61개 |

---

## 완료된 Phase (1~61)

<details>
<summary>Phase 1~54 (클릭하여 펼치기)</summary>

### Phase 1~35 ✅
Wiki + HMG + Admin(24p) + User(5p) + LLM Router(10p) + Desktop(5p) + Mobile(4tab) + Storybook + E2E 18파일 + 단위테스트 20파일

### Phase 36: 단위 테스트 확장 ✅
17개 신규 테스트 파일, 505→608 테스트, 커버리지 15%→35%

### Phase 37: 코드 품질 + 패키지 분리 준비 ✅
console.log 0개, 커버리지 임계값 30%, @hchat/ui exports 6→16 경로

### Phase 38: Storybook Interaction Tests ✅
6파일 28 인터랙션 (NotificationBell, CategoryFilter, ChatSearchBar, WidgetCard, WorkflowNodeCard, Toast)

### Phase 39~54 ✅
서비스 레이어 20개 (멀티테넌트, 마켓플레이스, 분석, RAG, 프롬프트, SSO, RBAC, 벤치마크, 피드백, 알림, 팀채팅, 파인튜닝, 시각화, 지식그래프, 음성)

</details>

### Phase 55: UI 컴포넌트 구현 ✅
12개 Admin 페이지 구현

### Phase 56-57: 서비스 레지스트리 ✅
serviceRegistry (27서비스, 12도메인, 엔드포인트+의존성 맵)

### Phase 58: 보안/성능/MSW/테스트 ✅
XSS 제거, 이미지 최적화, MSW 39 endpoints, 커버리지 40% 임계값

### Phase 59: 성능 최적화 ✅
빌드 에러 0개, ISR, Lighthouse CI, Web Vitals

### Phase 60: 프로덕션 준비 ✅
Docker Compose, DB 스키마, API Client, 에러 모니터링, 헬스체크

### Phase 61: @hchat/ui 서브패키지 분리 ✅
5개 서브패키지, re-export 하위 호환, xlsx 격리

---

## AI Platform 프로토타입 구현 (Phase 61 이후)

> 상세 문서: [`docs/PROTOTYPE_IMPLEMENTATION_PLAN.md`](./PROTOTYPE_IMPLEMENTATION_PLAN.md)
> PWA + Extension 계획: [`docs/PWA_EXTENSION_IMPLEMENTATION_PLAN.md`](./PWA_EXTENSION_IMPLEMENTATION_PLAN.md)

### 아키텍처: 하이브리드 (Option C)

```
Chrome Extension (MV3) ──┐
                          ▼
Frontend (Next.js 16) ── API Gateway (/api/*) ── AI Core (FastAPI :8000)
  PWA + IndexedDB         Zod + Rate Limit        LLM Client + Encoder
```

### Week 1: FastAPI + Token Encoder TS + Docker ✅

| 구현 항목 | 파일 | 상태 |
|-----------|------|------|
| FastAPI AI Core | `apps/ai-core/` (main.py, routers/, services/, optimizer/) | ✅ |
| Token Entropy Encoder (TS) | `packages/ui/src/utils/text/tokenEntropyEncoder.ts` | ✅ |
| Korean Stopwords (72개) | `packages/ui/src/utils/text/stopwords.ts` | ✅ |
| Docker Compose 확장 | `docker-compose.yml` (PostgreSQL + Redis + AI Core) | ✅ |
| Encoder 테스트 (16개) | `packages/ui/__tests__/tokenEntropyEncoder.test.ts` | ✅ |

### Week 2: API Gateway + Research Service + SSE ✅

| 구현 항목 | 파일 | 상태 |
|-----------|------|------|
| /api/chat 프록시 | `apps/user/app/api/chat/route.ts` | ✅ |
| /api/chat/stream SSE | `apps/user/app/api/chat/stream/route.ts` | ✅ |
| /api/research 프록시 | `apps/user/app/api/research/route.ts` | ✅ |
| /api/health 헬스체크 | `apps/user/app/api/health/route.ts` | ✅ |
| Zod 검증 스키마 | `packages/ui/src/schemas/` (chat, auth, common, roi, text) | ✅ |
| Rate Limiter 유틸 | `packages/ui/src/utils/rateLimit.ts` | ✅ |
| Research Service | `packages/ui/src/user/services/researchService.ts` | ✅ |
| SSE Service 확장 | `packages/ui/src/user/services/sseService.ts` (Mock/Real) | ✅ |
| CSRF 유틸 | `packages/ui/src/utils/csrf.ts` | ✅ |
| Token Storage (보안) | `packages/ui/src/utils/tokenStorage.ts` | ✅ |

### Week 3: 프론트엔드 통합 ✅

| 구현 항목 | 파일 | 상태 |
|-----------|------|------|
| ChatPage 모드 전환 | `packages/ui/src/user/pages/ChatPage.tsx` (Chat/Research 토글) | ✅ |
| MessageBubble 확장 | `packages/ui/src/user/components/MessageBubble.tsx` (출처+압축) | ✅ |
| CompressionBadge | `packages/ui/src/user/components/CompressionBadge.tsx` | ✅ |
| SourceAttribution | `packages/ui/src/user/components/SourceAttribution.tsx` | ✅ |
| ResearchPanel | `packages/ui/src/user/components/ResearchPanel.tsx` | ✅ |
| Korean tokenizeKorean() | `packages/ui/src/utils/text/tokenEntropyEncoder.ts` (조사 분리) | ✅ |
| MessageBubble 테스트 (14개) | `packages/ui/__tests__/messageBubble.test.tsx` | ✅ |
| SourceAttribution 테스트 (7개) | `packages/ui/__tests__/sourceAttribution.test.tsx` | ✅ |
| Korean Encoder 테스트 (16개) | `packages/ui/__tests__/tokenEntropyEncoder-ko.test.ts` | ✅ |

### 분석 문서 작성 ✅

| 문서 | 에이전트 | 상태 |
|------|----------|------|
| 프로토타입 구현방안 (5개 에이전트) | 아키텍처, Token, FastAPI, Research, Frontend | ✅ |
| PWA + Extension 통합방안 (8개 에이전트) | Gap분석, PWA, IndexedDB, 훅, 오프라인, Extension 매핑/보안/로드맵 | ✅ |

---

## 다음 계획: PWA + Extension (4주 로드맵)

> 상세: [`docs/PWA_EXTENSION_IMPLEMENTATION_PLAN.md`](./PWA_EXTENSION_IMPLEMENTATION_PLAN.md)

| 주차 | 작업 | 핵심 내용 | 상태 |
|------|------|-----------|------|
| Phase A (Week 1) | PWA 기반 + 훅 리팩토링 | manifest.json, SW, CSP, ChatPage 599→200줄 | 대기 |
| Phase B (Week 2) | IndexedDB + 오프라인 | idb, localStorage 마이그레이션, 오프라인 UI | 대기 |
| Phase C (Week 3) | Chrome Extension 기본 | content.ts, background.ts, Popup.tsx, /analyze | 대기 |
| Phase D (Week 4) | Extension↔PWA 통합 | useExtensionContext, 보안, E2E | 대기 |

### 핵심 설계 결정

| 항목 | 결정 | 이유 |
|------|------|------|
| SSE 패턴 | Subscribe (현행 유지) | AbortController 깔끔, Mock/Real 전환 용이 |
| API 프록시 | API Routes (현행 유지) | Zod + Rate Limit + 서버사이드 URL |
| Service Worker | 수동 구현 (next-pwa X) | 모노레포 복잡도, 최소 의존성 |
| IndexedDB | idb 라이브러리 | TS 네이티브, 기존 인터페이스 유지 |
| Extension 배치 | apps/extension/ (Vite) | 의미적 적합, 타입 공유, 빌드 독립 |
| Extension 보안 | optional_host_permissions | <all_urls> 제거, API Gateway 경유 강제 |

---

## 기존 Phase 계획 (Phase 62~70)

> 상세 계획: [`docs/NEXT_PHASE_PLAN_62_70.md`](./NEXT_PHASE_PLAN_62_70.md)

| Phase | 작업 | 설명 | 병렬 |
|-------|------|------|------|
| 62 | Zod Validation | 입력 검증 전체 서비스 적용 | 62+63 |
| 63 | 테스트 커버리지 80% | 1,214 → ~2,000 tests | 62+63 |
| 64 | Server Component | 'use client' 210 → <130 | - |
| 65 | Real API v1 | Auth+Chat+Admin DB 연동 | - |
| 66 | Real API v2 + AI | OpenAI/Anthropic/Google 통합 | 66+67 |
| 67 | Bundle & Perf | LLM Router 36MB → <5MB | 66+67 |
| 68 | i18n Full | ko/en/zh 3개 언어 | 68+69 |
| 69 | Monitoring | Sentry + Web Vitals + Alerts | 68+69 |
| 70 | Production Launch | Go-live + 부하 테스트 | - |

---

## 기술 부채

| # | 우선순위 | 항목 | 상태 |
|---|----------|------|------|
| 1 | RESOLVED | Next.js CVE 3건 | 16.1.6+ 업그레이드 완료 |
| 2 | RESOLVED | xlsx Web Worker 격리 | xlsxWorker.ts 구현 완료 |
| 3 | PARTIAL | Zod 검증 | 6개 스키마 추가 (chat, auth, common, roi, text) |
| 4 | PARTIAL | 보안 헤더 | 4/7 앱 next.config.ts 헤더 추가 |
| 5 | HIGH | 테스트 커버리지 51.81% | 목표 80% |
| 6 | HIGH | 'use client' 210개 | Phase 64 |
| 7 | HIGH | Mock → Real API | Phase 65-66 |
| 8 | MEDIUM | CSRF 보호 | csrf.ts 유틸 구현, 실적용 대기 |
| 9 | MEDIUM | LLM Router 번들 36MB | Phase 67 |
| 10 | LOW | i18n | Phase 68 |
