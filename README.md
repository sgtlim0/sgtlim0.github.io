# H Chat Wiki - 현대차그룹 생성형 AI 서비스

npm workspaces 기반 모노레포 프로젝트로, H Chat(현대차그룹 생성형 AI 서비스, wrks.ai)의 위키, 공식사이트, 관리자 패널, 사용자 앱, LLM 라우터, 데스크톱 앱, 모바일 앱 등을 포함합니다.

## 프로젝트 개요

H Chat Wiki는 현대차그룹의 생성형 AI 서비스를 문서화하고 데모하는 통합 플랫폼입니다:

- **Wiki**: 마크다운 기반 문서화 시스템 (포트폴리오 허브)
- **HMG 공식사이트**: 현대 공식 H Chat 정보 제공
- **Admin 패널**: 관리자용 대시보드 및 모니터링 도구 (실시간 대시보드, ROI 분석, 사용자 관리, 감사 로그)
- **User 앱**: 최종 사용자용 채팅, 번역, 문서 작성, OCR, 마이페이지 등 기능
- **LLM Router**: 86개 AI 모델 관리, SSE 스트리밍 플레이그라운드, 모델 비교
- **Desktop**: 데스크톱 AI 챗 인터페이스 (에이전트 관리, 도구 통합)
- **Mobile**: 모바일 AI 챗 앱 (PWA, 스와이프 제스처, 반응형 UI)
- **Storybook**: UI 컴포넌트 문서 및 카탈로그 (126 스토리 파일)
- **별도 레포**: Desktop PWA (hchat-desktop), Chrome Extension (hchat-v2-extension)

## 프로젝트 규모

| 항목 | 수량 |
|------|------|
| 앱 | 8개 (모노레포) + 2개 (별도 레포) |
| UI 패키지 | 2개 (@hchat/tokens, @hchat/ui) |
| TS/TSX 파일 | 516개 |
| 총 코드 라인 | **48,025줄** (TS/TSX) |
| @hchat/ui | 234파일, 28,327줄 (59%) |
| UI 컴포넌트 | 132개 |
| 서비스 파일 | 33개 (+타입 파일) |
| 페이지 | 55개 (page.tsx) |
| 커스텀 훅 | 60개 |
| Storybook | 135 파일 |
| CSS 디자인 토큰 | 194개 (light + dark) |
| 단위 테스트 | 53 파일, 707 테스트 (Vitest) |
| E2E 테스트 | 18 파일 (Playwright) |
| Interaction Tests | 6 파일, 28 테스트 |
| AI 모델 (LLM Router) | 86개 |
| 완료 Phase | 54개 |
| Git 커밋 | 109개 |

## 모노레포 구조

```
hchat-wiki/
├── packages/
│   ├── tokens/          # @hchat/tokens — CSS 디자인 토큰 (light/dark, 194개)
│   └── ui/              # @hchat/ui — 공유 UI 컴포넌트 (23,385줄, 195파일)
│       └── src/
│           ├── admin/     # Admin 컴포넌트 (68파일) + auth + services
│           ├── user/      # User 컴포넌트 (34파일) + services
│           ├── roi/       # ROI 대시보드 (27파일) + SVG 차트
│           ├── llm-router/# LLM Router (22파일) + services
│           ├── mobile/    # Mobile 컴포넌트 (12파일)
│           ├── hmg/       # HMG 컴포넌트 (9파일)
│           ├── desktop/   # Desktop 컴포넌트 (8파일)
│           └── i18n/      # 다국어 지원 (5파일, 한영)
├── apps/
│   ├── wiki/            # @hchat/wiki — Next.js 마크다운 위키 (GitHub Pages)
│   ├── hmg/             # @hchat/hmg — Next.js HMG 공식사이트 (Vercel)
│   ├── admin/           # @hchat/admin — Next.js 관리자 패널 (Vercel)
│   ├── user/            # @hchat/user — Next.js 사용자 앱 (Vercel)
│   ├── llm-router/      # @hchat/llm-router — Next.js LLM 라우터 (Vercel)
│   ├── desktop/         # @hchat/desktop — Next.js 데스크톱 앱 (Vercel)
│   ├── mobile/          # @hchat/mobile — Next.js 모바일 앱 (Vercel)
│   └── storybook/       # @hchat/storybook — Storybook 9 컴포넌트 문서 (Vercel)
├── tests/e2e/           # Playwright E2E 테스트 (18파일)
├── design/              # 디자인 파일 (.pen)
└── docs/                # 설계 및 구현 문서 (23파일)
```

## 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 16.1.1 | 모든 앱의 프레임워크 (App Router, Static Export) |
| TypeScript | 5 | 타입 안정성 |
| Tailwind CSS | 4 | 유틸리티 기반 스타일링 |
| React | 19.2.3 | UI 라이브러리 |
| Turborepo | 2 | 모노레포 빌드 오케스트레이션 |
| Storybook | 9 | 컴포넌트 개발 환경 |
| Vitest | 4 | 단위 테스트 |
| Playwright | 1.58.2 | E2E 테스트 |
| Lighthouse CI | 0.14.0 | 성능/접근성 모니터링 |

## 앱 소개

| 앱 | 설명 | URL | 포트 |
|---|---|---|---|
| Wiki | 마크다운 기반 문서화 위키 (포트폴리오 허브) | https://sgtlim0.github.io | 3000 |
| HMG | HMG 공식사이트 데모 | https://hchat-hmg.vercel.app | 3001 |
| Admin | 관리자 패널 (실시간 모니터링, ROI, 부서 관리, 감사 로그, SSO) | https://hchat-admin.vercel.app | 3002 |
| User | 사용자 앱 (채팅, 번역, 문서 작성, OCR, 마이페이지) | https://hchat-user.vercel.app | 3003 |
| LLM Router | AI 모델 관리 및 테스트 플레이그라운드 (86개 모델) | https://hchat-llm-router.vercel.app | 3004 |
| Desktop | 데스크톱 AI 챗 (에이전트, 도구 통합) | https://hchat-desktop.vercel.app | 5173 |
| Mobile | 모바일 AI 챗 (PWA, 스와이프 제스처) | https://hchat-mobile.vercel.app | 3005 |
| Storybook | UI 컴포넌트 문서 (126 스토리 파일) | https://hchat-storybook.vercel.app | 6006 |

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

## 패키지 의존성

```
@hchat/tokens (194 CSS 변수)
    ↓
@hchat/ui (23,385줄, 128 컴포넌트, 60 훅)
    ↓
    ├── @hchat/wiki       (1,509줄)
    ├── @hchat/hmg        (717줄)
    ├── @hchat/admin      (1,535줄)
    ├── @hchat/user       (392줄)
    ├── @hchat/llm-router (2,900줄)
    ├── @hchat/desktop    (829줄)
    ├── @hchat/mobile     (90줄)
    └── @hchat/storybook  (5,809줄)
```

- **@hchat/tokens**: CSS 변수로 import (194개 디자인 토큰, light + dark)
- **@hchat/ui**: 공유 컴포넌트를 경로별로 export (128개 컴포넌트)
  - `@hchat/ui`: Badge, ThemeProvider, FeatureCard, Skeleton, Toast, ErrorBoundary, EmptyState
  - `@hchat/ui/admin`: Admin 컴포넌트 + 서비스 레이어 (46 exports)
  - `@hchat/ui/user`: User 앱 컴포넌트 + 서비스 레이어
  - `@hchat/ui/roi`: ROI 대시보드 컴포넌트 (5가지 SVG 차트)
  - `@hchat/ui/llm-router`: LLM Router 컴포넌트 + 서비스 레이어
  - `@hchat/ui/hmg`: HMG 컴포넌트
  - `@hchat/ui/desktop`: Desktop 컴포넌트 (Sidebar, ChatBubble, AgentCard, ToolGrid)
  - `@hchat/ui/mobile`: Mobile 컴포넌트 (TabBar, SwipeableChat, PWA)
  - `@hchat/ui/i18n`: 다국어 지원 (한영)

## 주요 기능

### Wiki (@hchat/wiki)
- 마크다운 기반 콘텐츠 (28페이지, 5섹션)
- 자동 사이드바 네비게이션
- 문법 강조 (Syntax Highlighting)
- GitHub Pages 배포

### HMG 공식사이트 (@hchat/hmg)
- 4 페이지: Home, Publications, Guide, Dashboard
- GNB + Hero Banner + 반응형
- i18n 다국어 (한/영 49키)

### Admin 패널 (@hchat/admin)
- **24+ 페이지** (기본 14 + ROI 10)
- 실시간 모니터링 대시보드 (라이브 차트, 메트릭 카드, 활동 피드)
- ROI 분석 (Adoption, Productivity, Organization, Sentiment, Analysis)
- 대시보드 커스터마이징 (10종 위젯, CSS Grid, localStorage 레이아웃)
- AI 워크플로우 빌더 (SVG 노드 에디터, 8종 노드, 4개 템플릿)
- 알림 시스템 (NotificationBell, NotificationPanel, Mock WebSocket)
- 멀티테넌트 관리 (테넌트 전환, CSS 변수 동적 오버라이드, 플랜 관리)
- AI 에이전트 마켓플레이스 (10개 에이전트, 8 카테고리, 설치/제거/평점)
- 분석 엔진 (z-score 이상 탐지, 선형 회귀 예측, 자동 인사이트)
- RAG 문서 검색 (벡터 검색 모의, 관련도 정렬, 문서 CRUD)
- 프롬프트 버전 관리 (히스토리, diff, A/B 테스트, 롤백)
- SSO/SAML 실연동 (Okta/Azure AD, JWT RS256, 세션, 감사 로그)
- 부서 관리, 감사 로그
- 인증/인가 (AuthProvider + ProtectedRoute)

### User 앱 (@hchat/user)
- 5 페이지: Chat, Docs, OCR, Translation, My Page
- SSE 스트리밍 채팅 (카테고리별 응답)
- 커스텀 Assistant 생성 (8 이모지, 6 컬러)
- 파일 업로드 (드래그앤드롭)
- localStorage 대화 영속성

### LLM Router (@hchat/llm-router)
- 10 페이지: Landing, Models, Docs, Playground, Dashboard, Compare 등
- 86개 AI 모델 (OpenAI, Anthropic, Google, Mistral, Ollama 등)
- SSE 스트리밍 플레이그라운드 (7 프로바이더 레이턴시 프로파일)
- 모델 비교 (2-3개 나란히, 가격/성능 시각화)
- API 키 관리 + 보안 유틸리티

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
- 126 스토리 파일 (Admin 31, ROI 24, User 21, HMG 12, LLM Router 7, Desktop 6, Mobile 6, Shared 5 등)
- 다크 모드 테마 toggle
- 접근성 검사 (WCAG 2.1 AA)

## 테스트

### 단위 테스트

```bash
npm test                  # Vitest 실행
npm run test:watch        # Watch 모드
npm run test:coverage     # 커버리지 리포트 (v8, lcov, html)
```

53개 파일, 707 테스트: 공통 컴포넌트, 유틸리티, 40개 서비스 레이어 (인증, 테넌트, 마켓플레이스, 분석, RAG, SSO, RBAC, 벤치마크, 피드백, 알림, 팀채팅, 파인튜닝, 시각화, 지식그래프, 음성)

### E2E 테스트

```bash
npm run test:e2e          # 전체 E2E (Playwright)
npm run test:e2e:ui       # UI 모드
npm run test:e2e:admin    # Admin 전용
npm run test:e2e:user     # User 전용
npm run test:e2e:cross    # 크로스 앱
```

18개 파일: 페이지 렌더링, 다크모드, 반응형, 접근성 (axe-core WCAG 2.1 AA), 크로스앱 네비게이션

### 성능 모니터링

```bash
npm run lighthouse        # Lighthouse CI (perf>=80, a11y>=85)
npm run analyze:admin     # Bundle Analyzer (HTML 리포트)
```

## 코드 품질

| 지표 | 결과 |
|------|------|
| `any` 타입 | 0개 (소스 코드) |
| `console.log` | 0개 (소스), 41개 (Storybook) |
| `TODO/FIXME` | 2개 |
| 800줄+ 파일 | 1개 (mockData.ts, 데이터 파일) |
| 하드코딩 시크릿 | 0개 |
| 평균 파일 크기 | 91.8줄 |

도구: Prettier + Husky + lint-staged (pre-commit), ESLint 9, TypeScript strict mode

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

CI/CD: GitHub Actions (type-check → lint → test → build → Lighthouse CI → E2E)

## 관련 프로젝트

| 프로젝트 | 레포 | 설명 | 규모 |
|---------|------|------|------|
| H Chat Extension | [hchat-v2-extension](https://github.com/sgtlim0/hchat-v2-extension) | Chrome Extension v4.5 | 107파일, 21.5K LOC, 649 테스트 |
| H Chat Desktop | [hchat-desktop](https://github.com/sgtlim0/hchat-desktop) | PWA Desktop AI 챗 | 15페이지, 667 테스트, 83% 커버리지 |

## 문서

- **[PROJECT_ANALYSIS.md](docs/PROJECT_ANALYSIS.md)** — 프로젝트 심층 분석 (아키텍처, 통계, 기술 부채)
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — 시스템 아키텍처 (Mermaid 다이어그램)
- **[API_SPEC.md](docs/API_SPEC.md)** — Mock API 계약 문서
- **[DEMO.md](docs/DEMO.md)** — 15-20분 포트폴리오 시연 스크립트
- **[TODO.md](docs/TODO.md)** — 완료 Phase 히스토리 + 다음 계획

## 라이선스

MIT

---

**Last Updated**: 2026-03-07 | **Phase**: 54 완료 | **Monorepo Version**: 0.1.0
