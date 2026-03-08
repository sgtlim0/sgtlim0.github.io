# H Chat 프로젝트 TODO 리스트

> 마지막 업데이트: 2026-03-08 | Phase A+B 완료 (훅 분리 + IndexedDB + 오프라인 + PWA)

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
| TS/TSX 파일 | 635개 |
| Python 파일 | 12개 (apps/ai-core/) |
| 총 코드 라인 | ~60,000줄 (TS/TSX + Python) |
| UI 컴포넌트 | 160개 |
| 서비스 파일 | 42개 |
| 페이지 | 56개 (page.tsx) |
| 커스텀 훅 | 66개 (exported functions) |
| Storybook | 135 스토리 파일 |
| 단위 테스트 | 80 파일, 1,261 테스트 |
| E2E 테스트 | 18 파일 |
| Interaction Tests | 6 파일, 28 테스트 |
| MSW 핸들러 | 39 endpoints (8 도메인) |
| 'use client' | 136개 파일 |
| Git 커밋 | 134개 |
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

## 레퍼런스 구현 심층분석 결과 (~/Desktop/hchat/)

> 6개 병렬 에이전트로 38개 파일 분석 완료 (2026-03-08)
> 대상: backend(9), frontend(19), extension(8), 총 ~1,200 LOC

### 레퍼런스 vs 모노레포 핵심 차이

| 영역 | 레퍼런스 (Desktop) | 모노레포 (hchat-wiki) | 조치 |
|------|-------------------|----------------------|------|
| Next.js | 14, React 18, Tailwind 3 | 16, React 19, Tailwind 4 | 모노레포 기준 유지 |
| 백엔드 | 동기식 FastAPI + requests | 비동기 FastAPI + httpx | 모노레포 우수 |
| SSE | AsyncGenerator 패턴 | Subscribe/callback 패턴 | 현행 유지 (결정됨) |
| 저장소 | IndexedDB (idb) | IndexedDB (idb 8.0.2) | ✅ 완료 (Phase B) |
| 세션 관리 | sessionId 1급 시민 | sessionId optional | ✅ 타입 추가 완료 |
| ChatPage | 훅 분리 (4개), ~200줄 | 훅 분리 (4개), 305줄 | ✅ 완료 (Phase A) |
| PWA | manifest + SW + Install | manifest + SW + InstallBanner | ✅ 완료 (Phase A+B) |
| Extension | MV3 (content+popup) | MV3 (Vite+React 19+TW4) | ✅ 완료 (Phase C) |
| /analyze | 4모드 분석 엔드포인트 | FastAPI + API Gateway | ✅ 완료 (Phase C) |
| 컨텍스트 윈도우 | historyRef 슬라이딩 20 | historyRef 슬라이딩 20 | ✅ 완료 (Phase A) |
| 콘텐츠 살균 | 없음 | sanitize.ts (6패턴 PII 마스킹) | ✅ 완료 (Phase C) |

### 반영 우선순위: 레퍼런스에서 가져올 것

| # | 우선순위 | 항목 | 레퍼런스 파일 | 모노레포 대상 | 난이도 |
|---|----------|------|--------------|--------------|--------|
| 1 | **CRITICAL** | ChatPage 훅 분리 | hooks/useChat.ts, useResearch.ts | packages/ui/src/user/hooks/ | 중간 |
| 2 | **CRITICAL** | IndexedDB 마이그레이션 | lib/db.ts | packages/ui/src/user/services/indexedDbService.ts | 중간 |
| 3 | **HIGH** | 세션 관리 도입 | lib/types.ts (sessionId) | ChatMessage 타입 + chatService | 중간 |
| 4 | **HIGH** | API 히스토리 슬라이딩 윈도우 | hooks/useChat.ts (historyRef, 20) | useChat 훅에 통합 | 낮음 |
| 5 | **HIGH** | /analyze 엔드포인트 | backend/main.py (/analyze) | apps/ai-core/routers/analyze.py | 낮음 |
| 6 | **HIGH** | PWA 기본 설정 | manifest.json + sw.js | apps/user/public/ | 낮음 |
| 7 | **MEDIUM** | Extension 기본 구조 | extension/src/* | apps/extension/ (Vite) | 중간 |
| 8 | **MEDIUM** | 콘텐츠 살균 (PII 마스킹) | (미구현) | packages/ui/src/utils/sanitize.ts | 낮음 |
| 9 | **MEDIUM** | InstallBanner 컴포넌트 | components/InstallBanner.tsx | packages/ui/src/user/components/ | 낮음 |
| 10 | **MEDIUM** | PageContextBanner | components/PageContextBanner.tsx | packages/ui/src/user/components/ | 낮음 |
| 11 | **LOW** | 한국어 불용어 확장 | optimizer/entropy_encoder.py (70개) | stopwords.ts (현재 72개, 차이 대조) | 낮음 |
| 12 | **LOW** | InputArea 자동 높이 | components/InputArea.tsx | ChatSearchBar 개선 | 낮음 |

### 보안 이슈 (레퍼런스에서 절대 가져오면 안 되는 것)

| 심각도 | 레퍼런스 문제 | 모노레포 대응 |
|--------|-------------|--------------|
| CRITICAL | Extension `<all_urls>` host_permissions | optional_host_permissions 사용 |
| CRITICAL | Popup → FastAPI 직접 호출 (localhost:8000) | API Gateway 경유 강제 |
| HIGH | CORS `["*"]` 설정 | 특정 도메인 + Extension ID만 허용 |
| HIGH | PII/민감 데이터 미살균 | sanitize.ts 유틸 구현 |
| MEDIUM | background.ts에 추출 로직 중복 | content.ts에서만 추출, 메시지 전달 |
| MEDIUM | 하드코딩된 localhost URL | 환경변수 기반 설정 |

### 타입 스키마 정규화 필요

| 필드 | 레퍼런스 | 모노레포 | 통합 방안 |
|------|---------|---------|----------|
| 타임스탬프 | `createdAt: number` (epoch) | `timestamp: string` (ISO) | **epoch number 채택** (정렬/비교 유리) |
| 압축 정보 | `CompressionInfo { original, compressed, ratio }` | `CompressionStats { originalTokens, compressedTokens, reductionPct }` | **모노레포 유지** (더 상세) |
| 세션 | `sessionId: string` | 없음 | **추가** |
| 모드 | `'chat' \| 'research'` | `mode?: 'chat' \| 'research'` | 동일, 유지 |
| Extension | `ExtensionContext { text, url, title, mode }` | 없음 | **추가** |

---

## 통합 구현 로드맵: PWA + Extension (4주)

> 상세: [`docs/PWA_EXTENSION_IMPLEMENTATION_PLAN.md`](./PWA_EXTENSION_IMPLEMENTATION_PLAN.md)

### Phase A: ChatPage 훅 분리 + PWA 기본 (Week 1) ✅

| # | 작업 | 파일 | 상태 |
|---|------|------|------|
| A-1 | useConversations 훅 추출 | `packages/ui/src/user/hooks/useConversations.ts` (175줄) | ✅ |
| A-2 | useChat 훅 추출 (슬라이딩 윈도우 포함) | `packages/ui/src/user/hooks/useChat.ts` (178줄) | ✅ |
| A-3 | useResearch 훅 추출 | `packages/ui/src/user/hooks/useResearch.ts` (92줄) | ✅ |
| A-4 | useAssistants 훅 추출 | `packages/ui/src/user/hooks/useAssistants.ts` (80줄) | ✅ |
| A-5 | ChatPage 리팩토링 (599→305줄) | `packages/ui/src/user/pages/ChatPage.tsx` | ✅ |
| A-6 | 세션 관리 타입 추가 (sessionId) | `packages/ui/src/user/services/types.ts` | ✅ |
| A-7 | PWA manifest.json + 아이콘 | `apps/user/public/manifest.json` | ✅ |
| A-8 | Service Worker (3-tier 캐싱) | `apps/user/public/sw.js` (73줄) | ✅ |
| A-9 | layout.tsx PWA 메타데이터 | `apps/user/app/layout.tsx` | ✅ |
| A-10 | CSP 헤더 수정 (worker-src) | `apps/user/next.config.ts` | ✅ |

### Phase B: IndexedDB + 오프라인 (Week 2) ✅

| # | 작업 | 파일 | 상태 |
|---|------|------|------|
| B-1 | idb 8.0.2 + fake-indexeddb 6.0.0 설치 | `packages/ui/package.json` | ✅ |
| B-2 | IndexedDB 서비스 구현 (5 CRUD + singleton) | `packages/ui/src/user/services/indexedDbService.ts` (99줄) | ✅ |
| B-3 | useConversations 비동기 전환 (IndexedDB) | `packages/ui/src/user/hooks/useConversations.ts` | ✅ |
| B-4 | localStorage → IndexedDB 마이그레이션 로직 | `indexedDbService.ts` (migrateFromLocalStorage) | ✅ |
| B-5 | useNetworkStatus 훅 | `packages/ui/src/hooks/useNetworkStatus.ts` (38줄) | ✅ |
| B-6 | usePWAInstall 훅 | `packages/ui/src/hooks/usePWAInstall.ts` (54줄) | ✅ |
| B-7 | InstallBanner 컴포넌트 | `packages/ui/src/user/components/InstallBanner.tsx` (27줄) | ✅ |
| B-8 | 오프라인 UI (배너 + 입력 차단) | `ChatPage.tsx` (WifiOff 배너 + isOnline guard) | ✅ |
| B-9 | IndexedDB 테스트 16개 (fake-indexeddb) | `__tests__/indexedDbService.test.ts` (277줄) | ✅ |

### Phase C: Chrome Extension 기본 (Week 3) ✅

| # | 작업 | 파일 | 상태 |
|---|------|------|------|
| C-1 | Extension 프로젝트 셋업 (Vite + React 19 + TW4) | `apps/extension/` (11 files) | ✅ |
| C-2 | manifest.json (MV3, optional_host_permissions) | `apps/extension/public/manifest.json` | ✅ |
| C-3 | content.ts (텍스트 추출, 5000자 제한) | `apps/extension/src/content.ts` (40줄) | ✅ |
| C-4 | background.ts (컨텍스트 메뉴 + storage relay) | `apps/extension/src/background.ts` (67줄) | ✅ |
| C-5 | Popup.tsx (4모드: 요약/설명/리서치/번역) | `apps/extension/src/popup/Popup.tsx` (257줄) | ✅ |
| C-6 | PII 살균 유틸 (6패턴 마스킹) | `packages/ui/src/utils/sanitize.ts` (41줄) | ✅ |
| C-7 | FastAPI /analyze (4모드 프롬프트) | `apps/ai-core/routers/analyze.py` (64줄) | ✅ |
| C-8 | API Gateway /api/analyze (Zod 검증) | `apps/user/app/api/analyze/route.ts` (46줄) | ✅ |
| - | PII 살균 테스트 16개 | `packages/ui/__tests__/sanitize.test.ts` | ✅ |

### Phase D: Extension ↔ PWA 통합 + 보안 (Week 4) ✅

| # | 작업 | 파일 | 상태 |
|---|------|------|------|
| D-1 | useExtensionContext 훅 (URL params + postMessage) | `packages/ui/src/user/hooks/useExtensionContext.ts` (71줄) | ✅ |
| D-2 | PageContextBanner 컴포넌트 | `packages/ui/src/user/components/PageContextBanner.tsx` (63줄) | ✅ |
| D-3 | ChatPage Extension 통합 | `packages/ui/src/user/pages/ChatPage.tsx` | ✅ |
| D-4 | 민감 사이트 차단 (20도메인 + 6패턴) | `apps/extension/src/utils/blocklist.ts` + `packages/ui/src/utils/blocklist.ts` | ✅ |
| D-5 | Extension CORS (EXTENSION_ORIGIN 환경변수) | `apps/ai-core/main.py` | ✅ |
| D-6 | blocklist 테스트 15개 | `packages/ui/__tests__/blocklist.test.ts` | ✅ |

---

## 기존 Phase 계획 (Phase 62~70)

> 상세 계획: [`docs/NEXT_PHASE_PLAN_62_70.md`](./NEXT_PHASE_PLAN_62_70.md)

| Phase | 작업 | 설명 | 병렬 |
|-------|------|------|------|
| 62 | Zod Validation | 입력 검증 전체 서비스 적용 | 62+63 |
| 63 | 테스트 커버리지 80% | 1,214 → ~2,000 tests | 62+63 |
| 64 | Server Component | 'use client' 136 → <80 | - |
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
| 6 | HIGH | 'use client' 136개 | Phase 64 (기존 210→136 개선) |
| 7 | HIGH | Mock → Real API | Phase 65-66 |
| 8 | RESOLVED | ChatPage 599줄 모놀리식 | Phase A 완료 (4훅 분리 → 305줄) |
| 9 | RESOLVED | localStorage → IndexedDB | Phase B 완료 (idb + 마이그레이션) |
| 10 | MEDIUM | CSRF 보호 | csrf.ts 유틸 구현, 실적용 대기 |
| 11 | MEDIUM | LLM Router 번들 36MB | Phase 67 |
| 12 | RESOLVED | PII 콘텐츠 살균 유틸 | Phase C 완료 (sanitize.ts, 6패턴) |
| 13 | LOW | i18n | Phase 68 |
| 14 | LOW | 한국어 불용어 대조 확인 | 레퍼런스 70개 vs 모노레포 72개 |
