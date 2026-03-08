# H Chat 프로젝트 — 전체 현황

> 마지막 업데이트: 2026-03-08 | **Phase 1~70 + Phase A~D 전체 완료**

---

## 배포 상태

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
| 앱 (모노레포) | 10개 (wiki, hmg, admin, user, llm-router, desktop, mobile, extension, ai-core, storybook) |
| 패키지 | 7개 (tokens, ui, ui-core, ui-admin, ui-user, ui-roi, ui-llm-router) |
| TS/TSX 파일 | 595개 (packages/ui 308 + apps 287) |
| Python 파일 | 13개 (apps/ai-core/) |
| 총 코드 라인 | ~53,700줄 (TS/TSX 36,206 + Apps 17,530) |
| UI 컴포넌트 | 162개 (exported) |
| 커스텀 훅 | 69개 |
| 서비스 파일 | 48개 |
| Zod 스키마 | 9 파일, 34+ 타입 |
| 페이지 | 55개 (page.tsx) |
| Storybook | 144 스토리 파일 |
| 단위 테스트 | 107 파일, 1,690 테스트 |
| E2E 테스트 | 18 파일 |
| 테스트 커버리지 | 57.2% stmts, 43.4% branch |
| 'use client' | 138개 파일 |
| Git 커밋 | 186개 |
| 완료 Phase | **74개** (1~70 + A~D) |
| CI 워크플로우 | 4개 (ci, deploy, e2e, lighthouse) |

---

## 아키텍처

```
Chrome Extension (MV3) ──┐
  Vite + React 19          ▼
  blocklist (20+6)     Frontend (Next.js 16.1.6) ── API Gateway (/api/*) ── AI Core (FastAPI :8000)
                         PWA + IndexedDB (idb)      Zod + Rate Limit        Multi-LLM (OpenAI/Anthropic/Google)
                         ko/en i18n                  Mock ↔ Real switch       Token Entropy Encoder
                         Web Vitals + Sentry         serviceFactory           /chat, /research, /analyze
```

---

## 완료된 Phase 전체 목록

### Phase 1~61 (기존 구현)

<details>
<summary>Phase 1~54 (클릭하여 펼치기)</summary>

#### Phase 1~35 ✅
Wiki + HMG + Admin(24p) + User(5p) + LLM Router(10p) + Desktop(5p) + Mobile(4tab) + Storybook + E2E 18파일 + 단위테스트 20파일

#### Phase 36~38 ✅
단위 테스트 확장 (505→608), 코드 품질 (console.log 0), Storybook Interaction Tests 28개

#### Phase 39~54 ✅
서비스 레이어 20개 (멀티테넌트, 마켓플레이스, 분석, RAG, 프롬프트, SSO, RBAC, 벤치마크, 피드백, 알림, 팀채팅, 파인튜닝, 시각화, 지식그래프, 음성)

</details>

| Phase | 작업 | 핵심 성과 |
|-------|------|----------|
| 55 | UI 컴포넌트 | Admin 12개 페이지 |
| 56-57 | 서비스 레지스트리 | 27서비스, 12도메인, 엔드포인트+의존성 맵 |
| 58 | 보안/성능/MSW | XSS 제거, MSW 39 endpoints, 커버리지 40% |
| 59 | 성능 최적화 | ISR, Lighthouse CI, Web Vitals |
| 60 | 프로덕션 준비 | Docker, DB 스키마, API Client, 헬스체크 |
| 61 | 패키지 분리 | 5개 서브패키지, re-export 하위 호환 |

### AI Platform 프로토타입 (Week 1~3)

| Week | 작업 | 핵심 파일 |
|------|------|----------|
| 1 | FastAPI AI Core + Token Encoder + Docker | `apps/ai-core/`, `tokenEntropyEncoder.ts` |
| 2 | API Gateway + SSE + Zod + Research | `/api/chat`, `/api/research`, `schemas/` |
| 3 | ChatPage 모드 전환 + MessageBubble + Korean NLP | `ChatPage.tsx`, `ResearchPanel`, `CompressionBadge` |

### PWA + Extension 로드맵 (Phase A~D)

| Phase | 작업 | 핵심 성과 |
|-------|------|----------|
| **A** | ChatPage 훅 분리 + PWA | 4 hooks 추출, 599→325줄, manifest+SW+CSP |
| **B** | IndexedDB + 오프라인 | idb 8.0.2, 마이그레이션, 오프라인 배너, InstallBanner |
| **C** | Chrome Extension + /analyze | MV3 Extension (Vite), 4모드 Popup, PII 살균, API Gateway |
| **D** | Extension↔PWA 통합 + 보안 | useExtensionContext, PageContextBanner, blocklist, CORS |

### Phase 62~70

| Phase | 작업 | 핵심 성과 |
|-------|------|----------|
| **62** | Zod Validation | admin/llmRouter/user 3개 스키마 (34 타입) |
| **63** | 테스트 커버리지 | 80→107 파일, 1,261→1,690 tests |
| **64** | Server Component | 'use client' 146→138 |
| **65** | Real API v1 | RealAuthService, RealChatService, RealAdminService + serviceFactory |
| **66** | Real API v2 + AI | Multi-provider LLM (OpenAI/Anthropic/Google) + realSseService |
| **67** | Bundle & Perf | dynamic import, lazy/debounce/throttle 유틸 |
| **68** | i18n | ko/en 2개 언어, LanguageToggle |
| **69** | Monitoring | Sentry 통합, Web Vitals (6 metrics), alertConfig, useMonitoring |
| **70** | Production Launch | Docker prod, k6 부하테스트, 배포 체크리스트 |

---

## 주요 기술 결정

| 결정 | 선택 | 이유 |
|------|------|------|
| SSE 패턴 | Subscribe/callback | AsyncGenerator보다 에러 핸들링 용이 |
| API 프록시 | Next.js API Routes | rewrites보다 Zod 검증/Rate Limit 적용 가능 |
| Service Worker | Manual | next-pwa 대신 모노레포 호환성 |
| IndexedDB | idb 라이브러리 | singleton promise-caching, localStorage 마이그레이션 |
| Extension | Vite + React 19 | Next.js 부적합, TW4 공유 |
| Extension 보안 | optional_host_permissions | `<all_urls>` 금지, API Gateway 강제 |
| Mock↔Real | serviceFactory 패턴 | NEXT_PUBLIC_API_MODE 환경변수로 전환 |
| LLM Provider | 환경변수 기반 | LLM_PROVIDER + API KEY로 런타임 선택 |
| i18n | ko/en 2개 언어 | LanguageToggle cycling |

---

## 기술 부채 (잔여)

| # | 우선순위 | 항목 | 상태 |
|---|----------|------|------|
| 1 | PARTIAL | 테스트 커버리지 57% | 목표 80% (컴포넌트 렌더링 테스트 추가 필요) |
| 2 | PARTIAL | Zod 검증 실적용 | 스키마 정의 완료, 서비스 레이어 바인딩 미완 |
| 3 | PARTIAL | 보안 헤더 | 4/10 앱 적용 |
| 4 | MEDIUM | CSRF 실적용 | csrf.ts 유틸 구현 완료, 미적용 |
| 5 | LOW | 'use client' 138개 | 더 줄이려면 컴포넌트 구조 변경 필요 |

---

## 프로젝트 파일 구조 (핵심)

```
hchat-wiki/
├── apps/
│   ├── wiki/            # Next.js 16 Markdown Wiki (GitHub Pages)
│   ├── hmg/             # HMG 공식 사이트 (Vercel)
│   ├── admin/           # Admin 패널 + ROI 대시보드 (Vercel)
│   ├── user/            # User 앱 — Chat + PWA (Vercel)
│   │   ├── app/api/     # API Gateway (chat, stream, research, analyze, health)
│   │   └── public/      # manifest.json, sw.js
│   ├── llm-router/      # LLM 모델 비교 (86개 모델, Vercel)
│   ├── desktop/         # Desktop UI (Vercel)
│   ├── mobile/          # Mobile UI (Vercel)
│   ├── extension/       # Chrome Extension MV3 (Vite + React 19)
│   │   └── src/         # content.ts, background.ts, popup/, utils/blocklist.ts
│   ├── ai-core/         # FastAPI 백엔드 (Python)
│   │   ├── routers/     # chat.py, research.py, analyze.py
│   │   └── services/    # llm_client.py (OpenAI/Anthropic/Google)
│   └── storybook/       # Storybook 9 (144 stories, Vercel)
├── packages/
│   ├── tokens/          # CSS Design Tokens (light/dark)
│   └── ui/              # @hchat/ui 공유 컴포넌트 라이브러리
│       └── src/
│           ├── admin/   # Admin 컴포넌트 + auth + services (Real/Mock)
│           ├── user/    # User 컴포넌트 + hooks (5개) + services (Real/Mock)
│           ├── hmg/     # HMG 컴포넌트
│           ├── llm-router/ # LLM Router 컴포넌트 + 모델 카탈로그
│           ├── desktop/ # Desktop 컴포넌트
│           ├── roi/     # ROI 대시보드 + SVG 차트
│           ├── hooks/   # 공유 훅 (useNetworkStatus, usePWAInstall, useMonitoring)
│           ├── schemas/ # Zod 스키마 (admin, auth, chat, common, llmRouter, roi, text, user)
│           ├── client/  # ApiClient + serviceFactory (Mock↔Real)
│           ├── utils/   # sanitize, blocklist, performance, alertConfig, errorMonitoring, webVitals
│           ├── i18n/    # ko/en 번역 + I18nProvider + LanguageToggle
│           └── mocks/   # MSW 핸들러 (39 endpoints)
├── docker/
│   ├── docker-compose.prod.yml  # Production (ai-core + postgres + redis)
│   ├── .env.production.example
│   └── init.sql                 # DB 스키마
├── tests/
│   └── load/k6-config.js       # k6 부하테스트
└── docs/
    ├── TODO.md                  # 이 문서
    ├── DEPLOYMENT_CHECKLIST.md  # 배포 체크리스트
    ├── PROTOTYPE_IMPLEMENTATION_PLAN.md
    └── PWA_EXTENSION_IMPLEMENTATION_PLAN.md
```
