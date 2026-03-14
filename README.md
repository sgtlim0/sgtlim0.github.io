# H Chat Wiki - 현대차그룹 생성형 AI 서비스

npm workspaces 기반 모노레포 프로젝트로, H Chat(현대차그룹 생성형 AI 서비스, wrks.ai)의 위키, 공식사이트, 관리자 패널, 사용자 앱, LLM 라우터, 데스크톱 앱, 모바일 앱 등을 포함합니다.

## 프로젝트 개요

H Chat Wiki는 현대차그룹의 생성형 AI 서비스를 문서화하고 데모하는 통합 플랫폼입니다:

- **Wiki**: 마크다운 기반 문서화 시스템 (포트폴리오 허브, 28개 콘텐츠)
- **HMG 공식사이트**: 현대 공식 H Chat 정보 제공
- **Admin 패널**: 관리자용 대시보드 및 모니터링 도구 (실시간 대시보드, ROI 분석, 사용자 관리, 감사 로그)
- **User 앱**: 최종 사용자용 채팅, 번역, 문서 작성, OCR, 마이페이지 등 기능
- **LLM Router**: 86개 AI 모델 관리, SSE 스트리밍 플레이그라운드, 모델 비교
- **Desktop**: 데스크톱 AI 챗 인터페이스 (에이전트 관리, 도구 통합)
- **Mobile**: 모바일 AI 챗 앱 (PWA, 스와이프 제스처, 반응형 UI)
- **Extension**: Chrome Extension MV3 (콘텐츠 추출, PII 살균, 블록리스트)
- **AI Core**: Python FastAPI 백엔드 (LLM 라우팅, chat/research/analyze)
- **Storybook**: UI 컴포넌트 문서 및 카탈로그 (209 스토리 파일)

## 프로젝트 규모

| 항목 | 수량 |
|------|------|
| 앱 | 10개 (모노레포) + 2개 (별도 레포) |
| 패키지 | 7개 (tokens, ui, ui-core, ui-admin, ui-user, ui-roi, ui-llm-router) |
| @hchat/ui 소스 | 497 파일 (78 컴포넌트 + 80 훅 + 65 admin + 25 roi + 기타) |
| 페이지 (page.tsx) | 55개 |
| 서비스 파일 | 48개 |
| 위키 콘텐츠 | 28개 (apps/wiki/content/) |
| 설계/아키텍처 문서 | 45개 (docs/) |
| 단위 테스트 | **239 파일, 5,997 테스트** (Vitest) |
| 테스트 커버리지 | **~90% stmts, ~82% branches** |
| E2E 테스트 | 21 파일, 10 프로젝트 (Playwright) |
| Storybook | 209 스토리 + 80 interaction tests |
| MSW Mock | 42 endpoints, 8 domains |
| AI 모델 (LLM Router) | 86개 |
| CSS 디자인 토큰 | 194개 (light + dark) |
| CI 워크플로우 | 5개 (ci, deploy, e2e, lighthouse, dependabot) |
| 완료 Phase | 101 |
| Worker 수 | 135+ |

## 모노레포 구조

```
hchat-wiki/
├── packages/
│   ├── tokens/          # @hchat/tokens — CSS 디자인 토큰 (light/dark, 194개)
│   └── ui/              # @hchat/ui — 공유 UI 컴포넌트 (497 파일)
│       └── src/
│           ├── [78개 최상위 컴포넌트]
│           ├── admin/     # Admin 컴포넌트 + auth + services (65 파일)
│           ├── user/      # User 컴포넌트 + hooks + services (6 파일)
│           ├── roi/       # ROI 대시보드 + SVG 차트 (25 파일)
│           ├── llm-router/# LLM Router + services (8 파일)
│           ├── hmg/       # HMG 컴포넌트 (8 파일)
│           ├── desktop/   # Desktop 컴포넌트 (6 파일)
│           ├── mobile/    # Mobile 컴포넌트 (7 파일)
│           ├── hooks/     # 공유 훅 (80 파일)
│           ├── i18n/      # 다국어 지원 (한/영)
│           ├── schemas/   # Zod 검증 스키마 (9 파일, 40+ 타입)
│           ├── utils/     # 유틸리티 (sanitize, logger, featureFlags, workerUtils)
│           ├── client/    # API 클라이언트 (ServiceFactory, Mock/Real)
│           └── mocks/     # MSW 핸들러 (42 endpoints, 8 domains)
├── apps/
│   ├── wiki/            # @hchat/wiki — Next.js 마크다운 위키 (GitHub Pages)
│   ├── hmg/             # @hchat/hmg — Next.js HMG 공식사이트 (Vercel)
│   ├── admin/           # @hchat/admin — Next.js 관리자 패널 (Vercel)
│   ├── user/            # @hchat/user — Next.js 사용자 앱 (Vercel)
│   ├── llm-router/      # @hchat/llm-router — Next.js LLM 라우터 (Vercel)
│   ├── desktop/         # @hchat/desktop — Next.js 데스크톱 앱 (Vercel)
│   ├── mobile/          # @hchat/mobile — Next.js 모바일 앱 (Vercel)
│   ├── extension/       # @hchat/extension — Chrome Extension MV3 (Vite + React 19)
│   ├── ai-core/         # Python FastAPI 백엔드 (LLM 라우팅, chat/research/analyze)
│   └── storybook/       # @hchat/storybook — Storybook 9 컴포넌트 문서 (Vercel)
├── tests/
│   ├── e2e/             # Playwright E2E 테스트 (21 파일)
│   └── load/            # k6 부하 테스트 (6 시나리오)
├── docker/              # Docker Compose (dev + prod) + DB 스키마 + 마이그레이션
├── design/              # 디자인 파일 (.pen)
└── docs/                # 설계 및 구현 문서 (45 파일)
```

## 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 16.1.6 | 모든 앱의 프레임워크 (App Router, Static Export) |
| React | 19.2.3 | UI 라이브러리 |
| TypeScript | 5 | 타입 안정성 (strict mode, `any` 0건) |
| Tailwind CSS | 4 | 유틸리티 기반 스타일링 |
| Turborepo | 2 | 모노레포 빌드 오케스트레이션 |
| Storybook | 9 | 컴포넌트 개발 환경 |
| Vitest | 4 | 단위 테스트 |
| Playwright | 1.58.2 | E2E 테스트 (10 프로젝트) |
| Lighthouse CI | 0.14.0 | 성능/접근성 모니터링 |
| PostgreSQL | 16 | 데이터베이스 (Docker) |
| Redis | 7 | 캐시/세션 (Docker) |
| Zod | - | 런타임 입력 검증 (9 스키마, 40+ 타입) |
| MSW | - | API 모킹 (42 endpoints) |

## 앱 소개

| 앱 | 설명 | URL | 포트 |
|---|---|---|---|
| Wiki | 마크다운 기반 문서화 위키 (28개 콘텐츠, 6개 섹션) | https://sgtlim0.github.io | 3000 |
| HMG | HMG 공식사이트 데모 (4 페이지) | https://hchat-hmg.vercel.app | 3001 |
| Admin | 관리자 패널 (28 페이지: 대시보드, ROI, 모니터링, SSO, 감사 로그) | https://hchat-admin.vercel.app | 3002 |
| User | 사용자 앱 (5 페이지: 채팅, 번역, 문서, OCR, 마이페이지) | https://hchat-user.vercel.app | 3003 |
| LLM Router | AI 모델 관리 (9 페이지: 86개 모델, 플레이그라운드, 비교) | https://hchat-llm-router.vercel.app | 3004 |
| Desktop | 데스크톱 AI 챗 (5 페이지: 에이전트, Swarm, Debate, 도구) | https://hchat-desktop.vercel.app | 5173 |
| Mobile | 모바일 AI 챗 (PWA, 스와이프 제스처) | https://hchat-mobile.vercel.app | 3005 |
| Extension | Chrome Extension MV3 (콘텐츠 추출, PII 살균) | - | - |
| AI Core | Python FastAPI (LLM 라우팅, chat/research/analyze) | - | 8000 |
| Storybook | UI 컴포넌트 문서 (209 스토리) | https://hchat-storybook.vercel.app | 6006 |

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev:wiki          # Wiki (localhost:3000)
npm run dev:hmg           # HMG (localhost:3001)
npm run dev:admin         # Admin (localhost:3002)
npm run dev:user          # User (localhost:3003)
npm run dev:llm-router    # LLM Router (localhost:3004)
npm run dev:desktop       # Desktop (localhost:5173)
npm run dev:mobile        # Mobile (localhost:3005)
npm run dev:storybook     # Storybook (localhost:6006)
```

### 빌드

```bash
npm run build             # 모든 앱 빌드 (Turborepo)
npm run build:wiki        # Wiki만 빌드
npm run build:admin       # Admin만 빌드
# ... 각 앱별 build:* 스크립트 사용 가능
```

### 인프라 (Docker)

```bash
npm run docker:prod       # 프로덕션 스택 (PostgreSQL 16 + Redis 7 + AI Core)
npm run db:seed           # 개발용 샘플 데이터
```

## 패키지 의존성

```
@hchat/tokens (194 CSS 변수, light + dark)
    ↓
@hchat/ui (497 파일, 78 컴포넌트, 80 훅, 48 서비스)
    ↓
    ├── @hchat/wiki
    ├── @hchat/hmg
    ├── @hchat/admin
    ├── @hchat/user
    ├── @hchat/llm-router
    ├── @hchat/desktop
    ├── @hchat/mobile
    ├── @hchat/extension
    └── @hchat/storybook
```

**Sub-path exports** (트리 셰이킹 지원):
- `@hchat/ui` — Badge, ThemeProvider, Modal, Toast, ErrorBoundary, Skeleton 등 (78 컴포넌트)
- `@hchat/ui/admin` — Admin 컴포넌트 + 서비스 레이어 + 인증 (65 파일)
- `@hchat/ui/user` — User 앱 컴포넌트 + 서비스 레이어
- `@hchat/ui/roi` — ROI 대시보드 컴포넌트 (5가지 SVG 차트)
- `@hchat/ui/llm-router` — LLM Router 컴포넌트 + 서비스 레이어
- `@hchat/ui/hmg` — HMG 컴포넌트 (GNB, HeroBanner, Footer)
- `@hchat/ui/desktop` — Desktop 컴포넌트 (Sidebar, ChatBubble, AgentCard, ToolGrid)
- `@hchat/ui/mobile` — Mobile 컴포넌트 (TabBar, ChatList, Settings)
- `@hchat/ui/i18n` — 다국어 지원 (한/영)

## 주요 기능

### Wiki (@hchat/wiki)
- 마크다운 기반 콘텐츠 (28페이지, 6섹션: Chat, Browser, Settings, Tools, Desktop, Guide)
- 자동 사이드바 네비게이션
- 문법 강조 (Syntax Highlighting)
- GitHub Pages 배포

### HMG 공식사이트 (@hchat/hmg)
- 4 페이지: Home, Publications, Guide, Dashboard
- GNB + Hero Banner + 반응형
- i18n 다국어 (한/영 49키)

### Admin 패널 (@hchat/admin)
- **28 페이지** (기본 14 + ROI 10 + 기타 4)
- 실시간 모니터링 대시보드 (라이브 차트, 메트릭 카드, 활동 피드)
- ROI 분석 (Adoption, Productivity, Organization, Sentiment, Analysis)
- 대시보드 커스터마이징 (10종 위젯, CSS Grid, localStorage 레이아웃)
- AI 워크플로우 빌더 (SVG 노드 에디터, 8종 노드, 4개 템플릿)
- 알림 시스템 (NotificationBell, NotificationPanel, Mock WebSocket)
- 멀티테넌트 관리 (테넌트 전환, CSS 변수 동적 오버라이드, 플랜 관리)
- AI 에이전트 마켓플레이스 (10개 에이전트, 8 카테고리, 설치/제거/평점)
- 분석 엔진 (z-score 이상 탐지, 선형 회귀 예측, 자동 인사이트)
- RAG 문서 검색, 프롬프트 버전 관리, SSO/SAML, 감사 로그
- 인증/인가 (AuthProvider + ProtectedRoute + 역할 기반)

### User 앱 (@hchat/user)
- 5 페이지: Chat, Docs, OCR, Translation, My Page
- SSE 스트리밍 채팅 (카테고리별 응답)
- 커스텀 Assistant 생성 (8 이모지, 6 컬러)
- 파일 업로드 (드래그앤드롭)
- localStorage 대화 영속성

### LLM Router (@hchat/llm-router)
- 9 페이지: Landing, Models, Docs, Playground, Dashboard, Compare 등
- 86개 AI 모델 (OpenAI, Anthropic, Google, Mistral, Ollama 등)
- SSE 스트리밍 플레이그라운드 (7 프로바이더 레이턴시 프로파일)
- 모델 비교 (2-3개 나란히, 가격/성능 시각화)

### Desktop (@hchat/desktop)
- 5 페이지: Chat, Agents, Swarm, Debate, Tools
- DesktopSidebar (접이식), DesktopChatBubble (토큰 카운트)
- AgentCard (에이전트 상태/제어), ToolGrid (도구 활성/비활성)
- 24개 전용 디자인 토큰 (`--dt-*` 접두사)

### Mobile (@hchat/mobile)
- 4 탭: Chat, Assistants, History, Settings
- PWA 모바일 앱 (480px 컨테이너)
- 스와이프 제스처 UI, 터치 최적화
- 7개 모바일 전용 컴포넌트

### Storybook (@hchat/storybook)
- 209 스토리 파일 (80 play-function interaction tests)
- 다크 모드 테마 toggle
- 접근성 검사 (WCAG 2.1 AA)

## 테스트

### 단위 테스트

```bash
npm test                  # Vitest 실행 (5,997 테스트)
npm run test:watch        # Watch 모드
npm run test:coverage     # 커버리지 리포트 (v8, lcov, html)
```

239개 파일, 5,997 테스트 (~90% stmts, ~82% branches): 공통 컴포넌트, 유틸리티, 서비스 레이어, 훅, 스키마 검증, Feature Flags, 구조화 로깅, Web Worker, API 버저닝, 오프라인 큐, 성능 최적화, Event Bus, Request Dedup, Playground

### E2E 테스트

```bash
npm run test:e2e          # 전체 E2E (Playwright)
npm run test:e2e:ui       # UI 모드
npm run test:e2e:admin    # Admin 전용
npm run test:e2e:user     # User 전용
npm run test:e2e:cross    # 크로스 앱
```

21개 파일, 10개 프로젝트: 페이지 렌더링, 다크모드, 반응형, 접근성 (axe-core WCAG 2.1 AA), 크로스앱 네비게이션, 에러 경로, 복원력, 크로스 브라우저 (Firefox, WebKit, Mobile Chrome/Safari)

### 성능 모니터링

```bash
npm run lighthouse        # Lighthouse CI (주간 자동)
npm run analyze:admin     # Bundle Analyzer (HTML 리포트)
npm run check:bundle      # 번들 크기 예산 검사
```

Lighthouse 임계값: Performance >= 70, Accessibility >= 90, FCP < 3s, LCP < 4s, CLS < 0.1

## 코드 품질

| 지표 | 결과 |
|------|------|
| `any` 타입 | 0개 (소스 코드) |
| `console.log` | 0개 (소스), 41개 (Storybook) |
| `TODO/FIXME` | 0개 |
| 800줄+ 파일 | 1개 (mockData.ts, 데이터 파일) |
| 하드코딩 시크릿 | 0개 |
| 평균 파일 크기 | ~118줄 |

도구: Prettier + Husky + lint-staged (pre-commit), ESLint, TypeScript strict mode

## 배포

| 앱 | URL | 플랫폼 |
|----|-----|--------|
| Wiki | https://sgtlim0.github.io | GitHub Pages |
| HMG | https://hchat-hmg.vercel.app | Vercel |
| Admin | https://hchat-admin.vercel.app | Vercel |
| User | https://hchat-user.vercel.app | Vercel |
| LLM Router | https://hchat-llm-router.vercel.app | Vercel |
| Desktop | https://hchat-desktop.vercel.app | Vercel |
| Mobile | https://hchat-mobile.vercel.app | Vercel |
| Storybook | https://hchat-storybook.vercel.app | Vercel |

CI/CD: GitHub Actions (type-check -> lint -> test -> build -> bundle-size -> Lighthouse CI -> E2E -> Dependabot auto-merge)

## 위키 콘텐츠 구조

운영 디렉토리: `apps/wiki/content/` (28개 파일)

```
Guide       home, quickstart, faq, changelog
Chat (6)    ai-chat, history, prompts, group-chat, debate, agent
Browser (3) bookmarks, search-card, writing-assistant
Settings (3) providers, models, usage
Tools (8)   panel, pdf, web-search, youtube, ocr, translate, deep-research, doc-template
Desktop (3) overview, features, backend
```

## 문서 (docs/)

### 핵심 문서

| 문서 | 설명 |
|------|------|
| [PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md) | 전체 프로젝트 요약 (아키텍처, 수치, Phase 이력) |
| [PHASE_100_MILESTONE.md](docs/PHASE_100_MILESTONE.md) | Phase 100 최종 달성 보고서 |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | 시스템 아키텍처 (Mermaid 다이어그램) |
| [COMPONENT_CATALOG.md](docs/COMPONENT_CATALOG.md) | 221개 컴포넌트 + 76개 훅 + 48개 서비스 카탈로그 |
| [DESIGN_TOKENS.md](docs/DESIGN_TOKENS.md) | 194개 CSS 디자인 토큰 (light/dark, 7개 앱) |

### 배포 및 운영

| 문서 | 설명 |
|------|------|
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel + GitHub Pages 배포 설정 |
| [DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md) | 프로덕션 배포 체크리스트 |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | 기여 가이드 (브랜치/테스트/배포 전략) |
| [API_SPEC.md](docs/API_SPEC.md) | Mock API 계약 문서 |

### 품질 및 테스트

| 문서 | 설명 |
|------|------|
| [COVERAGE_REPORT.md](docs/COVERAGE_REPORT.md) | 테스트 커버리지 분석 |
| [PERFORMANCE_BENCHMARKS.md](docs/PERFORMANCE_BENCHMARKS.md) | 성능 벤치마크 |
| [BUNDLE_ANALYSIS.md](docs/BUNDLE_ANALYSIS.md) | 번들 크기 최적화 내역 |
| [A11Y_ENHANCEMENTS.md](docs/A11Y_ENHANCEMENTS.md) | 접근성 개선사항 (WCAG 2.1 AA) |
| [A11Y_TESTING_GUIDE.md](docs/A11Y_TESTING_GUIDE.md) | 접근성 테스트 가이드 |

### 설계 및 구현

| 문서 | 설명 |
|------|------|
| [HCHAT_ADMIN_DESIGN.md](docs/HCHAT_ADMIN_DESIGN.md) | Admin 대시보드 설계 |
| [HCHAT_ROI_DASHBOARD_DESIGN.md](docs/HCHAT_ROI_DASHBOARD_DESIGN.md) | ROI 대시보드 설계 |
| [HCHAT_USER_FEATURES_IMPLEMENTATION.md](docs/HCHAT_USER_FEATURES_IMPLEMENTATION.md) | User 앱 기능 구현 |
| [LLM_ROUTER_UI_DESIGN.md](docs/LLM_ROUTER_UI_DESIGN.md) | LLM Router UI 명세 |
| [ADMIN_SERVICE_LAYER.md](docs/ADMIN_SERVICE_LAYER.md) | Admin 서비스 레이어 |
| [ADMIN_AUTH_IMPLEMENTATION.md](docs/ADMIN_AUTH_IMPLEMENTATION.md) | Admin 인증 구현 |

### 기타 (히스토리/로드맵)

| 문서 | 설명 |
|------|------|
| [DEMO.md](docs/DEMO.md) | 포트폴리오 시연 스크립트 |
| [TODO.md](docs/TODO.md) | 완료 Phase 히스토리 + 다음 계획 |
| [FINAL_MILESTONE.md](docs/FINAL_MILESTONE.md) | Phase 74->99 여정 및 마일스톤 |
| [MONOREPO_WORK_SUMMARY.md](docs/MONOREPO_WORK_SUMMARY.md) | 모노레포 전환 히스토리 |

<details>
<summary>전체 45개 문서 목록</summary>

**설계**: HMG_DESIGN_GUIDE_PLAN, HMG_DESIGN_IMPLEMENTATION, HCHAT_ADMIN_DESIGN, HCHAT_ROI_DASHBOARD_DESIGN, LLM_ROUTER_UI_DESIGN, HCHAT_AI_PLATFORM_IMPLEMENTATION

**구현**: ADMIN_SERVICE_LAYER, ADMIN_AUTH_IMPLEMENTATION, STORYBOOK_IMPLEMENTATION, MONOREPO_STORYBOOK_PLAN, HCHAT_USER_FEATURES_IMPLEMENTATION, HCHAT_ENTERPRISE_API_IMPLEMENTATION, LLM_ROUTER_IMPLEMENTATION_PLAN

**로드맵**: NEXT_PHASE_PLAN, NEXT_PHASE_PLAN_61_65, NEXT_PHASE_PLAN_62_70, WORKTREE_AGENT_PLAN, TOKEN_OPTIMIZER_PLAN, PROTOTYPE_IMPLEMENTATION_PLAN, PWA_EXTENSION_IMPLEMENTATION_PLAN

**분석**: DEEP_ANALYSIS_REPORT (v1/v2/v3/2026-03-08), PROJECT_ANALYSIS

**운영**: DEPLOYMENT, DEPLOYMENT_CHECKLIST, PRODUCTION_CHECKLIST, CONTRIBUTING, DEMO, DELETION_LOG

</details>

## 관련 프로젝트

| 프로젝트 | 레포 | 설명 | 규모 |
|---------|------|------|------|
| H Chat Extension | [hchat-v2-extension](https://github.com/sgtlim0/hchat-v2-extension) | Chrome Extension v4.5 | 107파일, 21.5K LOC, 649 테스트 |
| H Chat Desktop | [hchat-desktop](https://github.com/sgtlim0/hchat-desktop) | PWA Desktop AI 챗 | 15페이지, 667 테스트, 83% 커버리지 |

## 라이선스

MIT

---

**Last Updated**: 2026-03-14 | **Phase**: 101 | **Workers**: 135+ | **Tests**: 5,997 | **Docs**: 45 | **Wiki Content**: 28
