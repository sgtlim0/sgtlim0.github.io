# H Chat 프로젝트 — 전체 현황

> 마지막 업데이트: 2026-03-08 | **Phase 1~70 + Phase A~D + 기술 부채 전체 완료**

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
| 앱 | 10개 (wiki, hmg, admin, user, llm-router, desktop, mobile, extension, ai-core, storybook) |
| 패키지 | 7개 (tokens, ui, ui-core, ui-admin, ui-user, ui-roi, ui-llm-router) |
| TS/TSX 파일 | 940개 (packages/ui 308 + apps 632) |
| Python 파일 | 13개 (apps/ai-core/) |
| 총 코드 라인 | ~117,900줄 (packages/ui 36,293 + apps 81,617) |
| UI 컴포넌트 | 137개 (default export) |
| 커스텀 훅 | 69개 |
| 서비스 파일 | 48개 |
| Zod 스키마 | 9 파일, 40+ 타입 |
| 페이지 | 55개 (page.tsx) |
| Storybook | 144 스토리 파일 |
| 단위 테스트 | 128 파일, 2,647 테스트 |
| E2E 테스트 | 18 파일 |
| 테스트 커버리지 | **83.1% stmts**, 69.7% branch, 84.1% funcs |
| 보안 헤더 | 7/7 앱 (CSP + HSTS + X-Frame + Referrer + Permissions) |
| CSRF 보호 | 4 API Routes (chat, stream, research, analyze) |
| 'use client' | 138개 파일 (구조적 최적값) |
| Git 커밋 | 213개 |
| 완료 Phase | **74개** (1~70 + A~D) + 기술 부채 + 커버리지 80%+ 달성 |
| CI 워크플로우 | 4개 (ci, deploy, e2e, lighthouse) |
| 9/9 앱 빌드 | ✅ 전체 성공 |

---

## 아키텍처

```
Chrome Extension (MV3) ──┐
  Vite + React 19          ▼
  blocklist (20+6)     Frontend (Next.js 16.1.6) ── API Gateway (/api/*) ── AI Core (FastAPI :8000)
  PII sanitize           PWA + IndexedDB (idb)      Zod + CSRF + Rate Limit  Multi-LLM (OpenAI/Anthropic/Google)
                         ko/en i18n                  Mock ↔ Real switch       Token Entropy Encoder
                         Web Vitals + Sentry         serviceFactory           /chat, /research, /analyze
                         Security Headers (7/7)      CSP + HSTS               Docker Prod + k6
```

---

## 완료된 Phase 전체 목록

<details>
<summary>Phase 1~61 (클릭하여 펼치기)</summary>

### Phase 1~35 ✅
Wiki + HMG + Admin(24p) + User(5p) + LLM Router(10p) + Desktop(5p) + Mobile(4tab) + Storybook + E2E 18파일 + 단위테스트 20파일

### Phase 36~38 ✅
단위 테스트 확장 (505→608), 코드 품질 (console.log 0), Storybook Interaction Tests 28개

### Phase 39~54 ✅
서비스 레이어 20개 (멀티테넌트, 마켓플레이스, 분석, RAG, 프롬프트, SSO, RBAC, 벤치마크, 피드백, 알림, 팀채팅, 파인튜닝, 시각화, 지식그래프, 음성)

### Phase 55~61 ✅
| Phase | 핵심 성과 |
|-------|----------|
| 55 | Admin 12개 페이지 |
| 56-57 | serviceRegistry (27서비스, 12도메인) |
| 58 | XSS 제거, MSW 39 endpoints |
| 59 | ISR, Lighthouse CI, Web Vitals |
| 60 | Docker, DB 스키마, API Client |
| 61 | 5개 서브패키지, re-export 하위 호환 |

</details>

### AI Platform 프로토타입 (Week 1~3) ✅

| Week | 핵심 파일 |
|------|----------|
| 1 | `apps/ai-core/`, `tokenEntropyEncoder.ts`, `docker-compose.yml` |
| 2 | `/api/chat`, `/api/research`, `schemas/`, `sseService.ts` |
| 3 | `ChatPage.tsx`, `ResearchPanel`, `CompressionBadge`, `SourceAttribution` |

### PWA + Extension 로드맵 (Phase A~D) ✅

| Phase | 핵심 성과 |
|-------|----------|
| **A** | 4 hooks 추출, ChatPage 599→325줄, manifest+SW+CSP |
| **B** | idb 8.0.2, IndexedDB 마이그레이션, 오프라인 배너, InstallBanner |
| **C** | MV3 Extension (Vite), 4모드 Popup, PII 살균, /analyze API |
| **D** | useExtensionContext, PageContextBanner, blocklist(20+6), CORS |

### Phase 62~70 ✅

| Phase | 핵심 성과 |
|-------|----------|
| **62** | Zod 스키마 3개 (admin/llmRouter/user, 40+ 타입) |
| **63** | 테스트 80→128 파일, 1,261→2,647 tests (**83.1% 달성**) |
| **64** | 'use client' 146→138 |
| **65** | RealAuthService, RealChatService, RealAdminService + serviceFactory |
| **66** | Multi-provider LLM (OpenAI/Anthropic/Google) + realSseService |
| **67** | dynamic import, lazy/debounce/throttle 유틸 |
| **68** | ko/en 2개 언어, LanguageToggle |
| **69** | Sentry 통합, Web Vitals (6 metrics), alertConfig, useMonitoring |
| **70** | Docker prod, k6 부하테스트, 배포 체크리스트 |

### 기술 부채 해소 ✅

| 항목 | Before | After |
|------|--------|-------|
| 보안 헤더 | 4/7 앱 | **7/7 앱** (CSP+HSTS+X-Frame 등 7개 헤더) |
| Zod 서비스 바인딩 | 스키마만 정의 | **realAdmin/realChat 응답 검증 적용** |
| CSRF 보호 | 유틸만 구현 | **4 API Route 토큰 검증 적용** |
| 테스트 커버리지 | 107파일 / 57% | **128파일 / 2,647 tests / 83.1%** |
| ROIDataUpload 버그 | ZodError.errors | **ZodError.issues 수정** |
| mocks 커버리지 | 66% | **100%** |

---

## 주요 기술 결정

| 결정 | 선택 | 이유 |
|------|------|------|
| SSE 패턴 | Subscribe/callback | AsyncGenerator보다 에러 핸들링 용이 |
| API 프록시 | Next.js API Routes | Zod 검증 + Rate Limit + CSRF |
| Service Worker | Manual | next-pwa 대신 모노레포 호환성 |
| IndexedDB | idb 라이브러리 | singleton promise-caching, localStorage 마이그레이션 |
| Extension | Vite + React 19 | Next.js 부적합, TW4 공유 |
| Extension 보안 | optional_host_permissions | `<all_urls>` 금지, API Gateway 강제 |
| Mock↔Real | serviceFactory 패턴 | NEXT_PUBLIC_API_MODE 환경변수로 전환 |
| LLM Provider | 환경변수 기반 | LLM_PROVIDER + API KEY로 런타임 선택 |
| i18n | ko/en 2개 언어 | LanguageToggle cycling |
| 보안 | 7-header CSP + CSRF | 전 앱 통일, API Route 보호 |

---

## 프로젝트 파일 구조 (핵심)

```
hchat-wiki/
├── apps/
│   ├── wiki/            # Next.js 16 Markdown Wiki (GitHub Pages)
│   ├── hmg/             # HMG 공식 사이트 (Vercel)
│   ├── admin/           # Admin 패널 + ROI 대시보드 (Vercel)
│   ├── user/            # User 앱 — Chat + PWA (Vercel)
│   │   ├── app/api/     # API Gateway (chat, stream, research, analyze, health) + CSRF
│   │   └── public/      # manifest.json, sw.js
│   ├── llm-router/      # LLM 모델 비교 (86개 모델, Vercel)
│   ├── desktop/         # Desktop UI (Vercel)
│   ├── mobile/          # Mobile UI (Vercel)
│   ├── extension/       # Chrome Extension MV3 (Vite + React 19)
│   │   └── src/         # content.ts, background.ts, popup/, utils/blocklist.ts
│   ├── ai-core/         # FastAPI 백엔드 (Python)
│   │   ├── routers/     # chat.py, research.py, analyze.py
│   │   └── services/    # llm_client.py (OpenAI/Anthropic/Google/Mock)
│   └── storybook/       # Storybook 9 (144 stories, Vercel)
├── packages/
│   ├── tokens/          # CSS Design Tokens (light/dark)
│   └── ui/              # @hchat/ui 공유 컴포넌트 라이브러리
│       └── src/
│           ├── admin/   # Admin 컴포넌트 + auth(Real/Mock) + services(Real/Mock)
│           ├── user/    # User 컴포넌트 + hooks(5개) + services(Real/Mock)
│           ├── hmg/     # HMG 컴포넌트
│           ├── llm-router/ # LLM Router 컴포넌트 + 모델 카탈로그
│           ├── desktop/ # Desktop 컴포넌트
│           ├── mobile/  # Mobile 컴포넌트 + 서비스
│           ├── roi/     # ROI 대시보드 + SVG 차트 (순수 CSS, 라이브러리 없음)
│           ├── hooks/   # 공유 훅 (useNetworkStatus, usePWAInstall, useMonitoring)
│           ├── schemas/ # Zod 스키마 9개 (admin, auth, chat, common, llmRouter, roi, text, user)
│           ├── client/  # ApiClient + serviceFactory (Mock↔Real 전환)
│           ├── utils/   # sanitize, blocklist, performance, alertConfig, errorMonitoring, webVitals, csrf, rateLimit, tokenStorage, healthCheck
│           ├── i18n/    # ko/en 번역 + I18nProvider + LanguageToggle
│           └── mocks/   # MSW 핸들러 (39 endpoints)
├── docker/
│   ├── docker-compose.yml           # Dev (PostgreSQL + Redis + AI Core)
│   ├── docker-compose.prod.yml      # Prod (resource limits + healthcheck)
│   ├── .env.production.example
│   └── init.sql                     # DB 스키마 (users, conversations, messages, api_keys, audit_logs)
├── tests/
│   └── load/k6-config.js           # k6 부하테스트 (20→50→100 VU)
├── .github/workflows/               # CI: ci.yml, deploy.yml, e2e, lighthouse
└── docs/
    ├── TODO.md                      # 이 문서
    ├── DEPLOYMENT_CHECKLIST.md      # 프로덕션 배포 체크리스트
    ├── PROTOTYPE_IMPLEMENTATION_PLAN.md
    └── PWA_EXTENSION_IMPLEMENTATION_PLAN.md
```
