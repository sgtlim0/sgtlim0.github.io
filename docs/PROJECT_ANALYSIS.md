# H Chat Wiki — 프로젝트 심층 분석

> 최종 업데이트: 2026-03-07 | Phase 54 완료 기준 (실측 데이터 반영)

---

## 1. 프로젝트 개요

**H Chat Wiki**는 현대차그룹 생성형 AI 서비스(H Chat)의 문서 포털, 마케팅 사이트, 관리자 대시보드, 사용자 챗 인터페이스, LLM 라우터, 데스크톱 앱, 모바일 앱, 그리고 컴포넌트 카탈로그를 통합한 **npm workspaces 모노레포**입니다.

| 항목 | 수치 |
|------|------|
| 앱 | 8개 (Wiki, HMG, Admin, User, LLM Router, Desktop, Mobile, Storybook) |
| 패키지 | 2개 (@hchat/tokens, @hchat/ui) |
| 배포 | 8개 URL (GitHub Pages 1, Vercel 7) |
| TS/TSX 파일 | **516개** |
| 총 코드 라인 | **48,025줄** (TS/TSX) |
| @hchat/ui | 234파일, 28,327줄 (전체의 59%) |
| UI 컴포넌트 | 132개 |
| 서비스 파일 | 40개 |
| 커스텀 훅 | 60개 |
| 페이지 | 55개 (page.tsx) |
| Storybook | 135 파일 |
| 단위 테스트 | 53파일, **707개** |
| E2E 테스트 | 18파일 |
| Interaction Tests | 6파일, 28개 |
| CSS 디자인 토큰 | 194개 (light + dark) |
| AI 모델 카탈로그 | 86개 |
| Git 커밋 | **108개** (57일간) |
| 완료 Phase | **54개** |

### 프로젝트 성장 추이

| 지표 | Phase 27 | Phase 35 | Phase 44 | Phase 54 |
|------|----------|----------|----------|----------|
| TS/TSX LOC | 27,983 | 40,060 | 44,797 | **48,025** |
| 파일 수 | 409 | 463 | 486 | **516** |
| 컴포넌트 | 87 | 128 | 132 | **132** |
| 서비스 | 8 | 20 | 30 | **40** |
| 테스트 | 0 | 284 | 608 | **707** |
| Storybook | 103 | 126 | 135 | **135** |
| 커밋 | 70 | 97 | 103 | **108** |

---

## 2. 기술 스택

| 레이어 | 기술 | 버전 |
|--------|------|------|
| **프레임워크** | Next.js (App Router, Static Export) | 16.1.1 |
| **언어** | TypeScript | 5 |
| **UI** | React | 19.2.3 |
| **스타일** | Tailwind CSS | 4 |
| **빌드** | Turborepo | 2 |
| **컴포넌트 문서** | Storybook (nextjs-vite) | 9.1.19 |
| **아이콘** | Lucide React | 0.575+ |
| **Excel 파싱** | SheetJS (xlsx) | 0.18.5 |
| **마크다운** | react-markdown, gray-matter, rehype-highlight, remark-gfm | - |
| **단위 테스트** | Vitest | 4.0.18 |
| **E2E** | Playwright | 1.58.2 |
| **성능** | Lighthouse CI | 0.14.0 |
| **접근성** | axe-core (Playwright), Storybook addon-a11y | 4.11.1 |
| **코드 품질** | Prettier + Husky + lint-staged | 3.8.1 / 9.1.7 / 16.3.2 |
| **린팅** | ESLint | 9 |

---

## 3. 모노레포 구조

```
hchat-wiki/
├── packages/
│   ├── tokens/              # @hchat/tokens — CSS 변수 (light/dark, 194개)
│   └── ui/                  # @hchat/ui — 234파일, 28,327줄
│       └── src/
│           ├── admin/         # 107파일 (컴포넌트 + auth + services 24개 + marketplace 6개)
│           ├── user/          # 34파일 (Chat + SSE + 서비스)
│           ├── roi/           # 27파일 (대시보드 + SVG 차트 5종)
│           ├── llm-router/    # 22파일 (86 모델 + 스트리밍)
│           ├── mobile/        # 12파일 (PWA + 스와이프)
│           ├── hmg/           # 9파일 (마케팅)
│           ├── desktop/       # 8파일 (에이전트 + 도구)
│           ├── i18n/          # 5파일 (ko/en)
│           └── root           # 10파일 (Badge, Theme, Toast 등)
├── apps/
│   ├── wiki/                # 마크다운 위키 — 28 콘텐츠, 1,509줄
│   ├── hmg/                 # HMG 마케팅 — 4 페이지, 717줄
│   ├── admin/               # 관리자 패널 — 24+ 페이지, 1,535줄
│   ├── user/                # 사용자 앱 — 5 페이지, 392줄
│   ├── llm-router/          # LLM 라우터 — 10 페이지, 2,889줄
│   ├── desktop/             # 데스크톱 — 5 페이지, 829줄
│   ├── mobile/              # 모바일 — 4 탭, 90줄
│   └── storybook/           # Storybook — 135 파일, 6,559줄
├── tests/e2e/               # Playwright E2E — 18 파일
├── docs/                    # 프로젝트 문서 — 23 파일
└── .github/workflows/       # CI/CD — 3 워크플로우
```

### 의존성 그래프

```
@hchat/tokens (59줄, CSS 변수 194개)
       ↓
@hchat/ui (28,327줄, 132 컴포넌트, 40 서비스, 60 훅)  ← 전체의 59%
       ↓
  ┌────┼────┬────┬────┬────┬────┬────┐
  ↓    ↓    ↓    ↓    ↓    ↓    ↓    ↓
Wiki  HMG Admin User  LLM  Desk  Mobi SB
1.5K  717 1.5K  392  2.9K  829   90  6.6K (줄)
  ↓    ↓    ↓    ↓    ↓    ↓    ↓    ↓
 GH  Vercel ×7
Pages
```

### LOC 분포

```
@hchat/ui        28,327줄  ██████████████████████████████  59.0%
storybook         6,559줄  ███████                        13.7%
llm-router        2,889줄  ████                            6.0%
admin             1,535줄  ██                              3.2%
wiki              1,509줄  ██                              3.1%
desktop             829줄  █                               1.7%
hmg                 717줄  █                               1.5%
user                392줄  ▌                               0.8%
mobile               90줄  ▏                               0.2%
tokens               59줄  ▏                               0.1%
tests (53파일)     ~5,100줄  ██████                         10.6%
─────────────────────────────────────────
총계             48,025줄
```

---

## 4. 서비스 레이어 분석 (40개 파일)

프로젝트의 핵심 비즈니스 로직. 모두 동일한 패턴: **Interface → Mock → Provider → Hooks → Component**

### 4.1 서비스 도메인 맵

| 구간 | 서비스 | Phase | 핵심 기능 |
|------|--------|-------|----------|
| **기반** | authService, mockApiService, apiService | 16-22 | 인증, Provider Pattern |
| **실시간** | realtimeService, notificationService, sseService, streamingService | 29-32 | setInterval, WebSocket Mock, SSE |
| **커스터마이징** | widgetService, workflowService | 33-34 | 10종 위젯, 8종 노드 |
| **앱 서비스** | chatService, assistantService, userService, llmRouterService, mobileService | 18-35 | CRUD, localStorage |
| **엔터프라이즈** | tenantService, marketplaceService, ssoService | 39-44 | 멀티테넌트, 마켓, SAML |
| **AI 엔진** | analyticsService, ragService, promptVersionService, benchmarkService | 41-47 | 이상탐지, 벡터검색, diff, 랭킹 |
| **인텔리전스** | chatAnalyticsService, rbacService, feedbackService | 45-48 | 클러스터링, 26권한, A/B |
| **협업** | alertRuleService, teamChatService | 49-50 | 조건빌더, 멘션/스레드 |
| **AI 고도화** | finetunService, advancedChartService, knowledgeGraphService, voiceService | 51-54 | 파인튜닝, D3, NER, STT/TTS |

### 4.2 Admin 서비스 LOC Top 10

| 서비스 | LOC | 기능 |
|--------|-----|------|
| workflowService | 623 | 8종 노드, SVG 엣지, 4 템플릿 |
| mockApiService | 450 | Admin Mock API 전체 |
| widgetService | 373 | 10종 위젯, CSS Grid |
| promptVersionService | 321 | diff, A/B, 롤백 |
| hooks.ts | 310 | 19개 데이터 훅 |
| notificationService | 295 | WebSocket Mock, 18 템플릿 |
| workflowHooks.ts | 275 | 워크플로우 편집 훅 |
| ragService | 273 | 벡터 검색, 6문서 |
| ssoService | 260 | Okta/Azure AD, JWT |
| rbacService | 244 | 26 Permission, 위임 |

### 4.3 배럴 Export 구조

| 인덱스 파일 | Export 수 |
|------------|----------|
| `admin/index.ts` | **51** |
| `llm-router/index.ts` | 19 |
| `roi/index.ts` | 19 |
| `index.ts` (root) | 17 |
| `mobile/index.ts` | 15 |
| `desktop/index.ts` | 13 |
| `marketplace/index.ts` | 8 |
| `hmg/index.ts` | 8 |
| `user/index.ts` | 7 |

---

## 5. 앱별 분석

### Wiki (1,509줄)
- 28 마크다운 페이지, 5 섹션 (chat, tools, browser, settings, desktop)
- Sidebar 네비게이션, 코드 하이라이팅, GitHub Pages 배포

### HMG (717줄)
- 4 페이지 (Home, Publications, Guide, Dashboard)
- i18n 49키, 탭 필터링, GNB + Hero + Footer

### Admin (1,535줄 앱 + 28,327줄 UI)
- 24+ 페이지 (기본 14 + ROI 10)
- 40개 서비스, 인증, Dynamic Import 16페이지
- Phase 39-54 신규: 멀티테넌트, 마켓플레이스, 분석 엔진, RAG, 프롬프트 버전, SSO, RBAC, 벤치마크, 피드백, 알림 규칙, 팀 채팅, 파인튜닝, D3 시각화, 지식 그래프, 음성

### User (392줄)
- 5 페이지 (Chat, Docs, OCR, Translation, My)
- SSE 스트리밍, 커스텀 어시스턴트, localStorage

### LLM Router (2,889줄)
- 10 페이지, 86 AI 모델, SSE Playground
- 7 프로바이더 레이턴시, 모델 비교

### Desktop (829줄)
- 5 페이지 (Chat, Agents, Swarm, Debate, Tools)
- 24 전용 토큰 (`--dt-*`)

### Mobile (90줄)
- 4 탭, PWA 480px, 스와이프 제스처

### Storybook (6,559줄)

| 카테고리 | 파일 수 |
|---------|---------|
| Admin | 37 (Interaction 포함) |
| ROI | 24 |
| User | 23 |
| HMG | 12 |
| LLM Router | 7 |
| Shared | 6 (Interaction 포함) |
| Desktop | 6 |
| Mobile | 6 |
| Wiki (atoms/molecules/organisms) | 13 |
| Design System | 1 |

---

## 6. 코드 품질 & 테스트

### 6.1 품질 지표

| 지표 | 결과 | 평가 |
|------|------|------|
| `any` 타입 | **0개** | 우수 |
| `console.log` (소스) | **2개** (docs 코드 예시 내) | 우수 |
| `TODO/FIXME` | **2개** | 우수 |
| 800줄+ 파일 | **1개** (mockData.ts) | 우수 |
| 평균 파일 크기 | **93.1줄** | 소형 파일 원칙 |
| 커버리지 임계값 | statements 30%, branches 20% | 설정됨 |
| 하드코딩 시크릿 | **0개** | 안전 |

### 6.2 테스트 현황

| 카테고리 | 파일 | 테스트 수 |
|---------|------|----------|
| 단위 (Vitest) | 53 | **707** |
| E2E (Playwright) | 18 | 6 프로젝트 |
| Interaction (play) | 6 | 28 |
| **합계** | **77** | **735+** |

### 6.3 CI/CD 파이프라인

```
git push → GitHub Actions
  ├── ci.yml ─── type-check → lint → test → build (Turbo)
  │              └── Lighthouse CI (perf>=80, a11y>=85)
  ├── deploy.yml ── Wiki → GitHub Pages
  └── e2e.yml ──── Playwright (admin, hmg, wiki, user)

git push → Vercel (자동 배포 ×7)
```

---

## 7. 보안 평가

| 항목 | 상태 |
|------|------|
| 하드코딩 시크릿 | **안전** — .env 0개, API 키 노출 없음 |
| `any` 타입 | **안전** — 0개 |
| XSS | **주의** — dangerouslySetInnerHTML 1개 |
| 인증 | **양호** — AuthProvider + RBAC 26 Permission |
| SSO | **양호** — Okta/Azure AD SAML, JWT RS256 설계 완료 |
| API 프록시 | **양호** — 서버사이드 키 보호 패턴 |

---

## 8. 기술 부채

### CRITICAL

| 영역 | 현황 | 목표 |
|------|------|------|
| Mock → Real API | 40개 서비스 전체 Mock | MSW → 실제 API 연결 |
| 테스트 커버리지 | ~35% (707개, Admin 대형 페이지 미테스트) | 80%+ |

### HIGH

| 영역 | 현황 | 목표 |
|------|------|------|
| @hchat/ui 거대화 | 28,327줄, admin/ 107파일 | 도메인별 서브 패키지 분리 |
| Admin 서비스 집중 | 24 서비스가 한 디렉토리 | admin/services → 서브 모듈 |
| Admin 배럴 비대 | index.ts 51 exports | 서브경로 export (16경로 준비됨) |

### MEDIUM

| 영역 | 현황 | 목표 |
|------|------|------|
| Phase 39-54 UI 미구현 | 서비스만 있고 UI 없음 | 페이지 + 컴포넌트 구현 |
| ChatPage.tsx 429줄 | 단일 대형 컴포넌트 | 서브 컴포넌트 분리 |
| Storybook 갭 | 신규 서비스 스토리 없음 | Phase 39-54 스토리 추가 |

### LOW

| 영역 | 현황 | 목표 |
|------|------|------|
| i18n 한정 | HMG 49키만 | 전체 앱 확대 |
| mockData.ts 1,099줄 | 단일 데이터 | 프로바이더별 분리 |

---

## 9. 확장성 평가

### 강점
- **40개 서비스 통일 패턴**: Interface → Mock → Provider → Hooks, 즉시 API 교체 가능
- **타입 안전성**: `any` 0개, TypeScript strict, readonly 타입 전면 적용
- **소형 파일**: 평균 93줄, 모듈화 우수
- **테스트 인프라**: 707 단위 + 18 E2E + 28 Interaction = 753+
- **16 서브경로 export**: tree-shaking 준비 완료

### 약점
- **@hchat/ui 단일 패키지**: admin/ 변경이 전체 빌드 트리거
- **Phase 39-54 서비스만 존재**: UI/페이지 미구현으로 기능 시연 불가
- **Admin 서비스 밀집**: 24개 서비스 → 관심사 분리 필요

---

## 10. Git 히스토리

| 항목 | 수치 |
|------|------|
| 총 커밋 | **108개** |
| 기간 | 57일 (2026-01-10 ~ 03-07) |
| 일 평균 | 1.89 커밋/일 |
| Phase 속도 | 0.95 Phase/일 |
| 코드 생산성 | ~843줄/일 |

### 커밋 타입 분포

```
feat     46 ██████████████████████████  42.6%
docs     32 ██████████████████          29.6%
fix      18 ██████████                  16.7%
기타     12 ███████                     11.1%
```

---

## 11. 완료된 Phase 히스토리 (1-54)

| 구간 | Phase | 핵심 |
|------|-------|------|
| 기반 | 1-10 | Wiki 28페이지 + HMG 4페이지 + 모노레포 전환 |
| 확장 | 11-20 | Admin 24p + ROI 9p + User 5p + LLM Router 10p + E2E |
| 품질 | 21-27 | Storybook 103 + 서비스 레이어 + CI/CD + 문서 |
| 고도화 | 28-35 | 테스트 284 + 실시간 + SSE + Desktop + Mobile |
| 테스트 | 36-38 | 707 테스트, Interaction 28, exports 16경로 |
| 엔터프라이즈 | 39-44 | 멀티테넌트, 마켓플레이스, 분석, RAG, 프롬프트, SSO |
| 지능화 | 45-50 | 채팅분석, RBAC, 벤치마크, 피드백, 알림, 팀채팅 |
| AI 고도화 | 51-54 | 파인튜닝, D3 시각화, 지식그래프, 음성 |

---

## 12. 배포 현황

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

---

## 13. 관련 레포지토리

| 레포 | 설명 | 규모 |
|------|------|------|
| **hchat-v2-extension** | Chrome Extension v4.5 | 107 파일, 21.5K LOC, 649 테스트 |
| **hchat-desktop** | PWA (React 19 + Zustand 5) | 15 페이지, 667 테스트 |

---

## 14. 스크립트 레퍼런스

```bash
# 개발
npm run dev:wiki          # localhost:3000
npm run dev:hmg           # localhost:3001
npm run dev:admin         # localhost:3002
npm run dev:user          # localhost:3003
npm run dev:llm-router    # localhost:3004
npm run dev:desktop       # localhost:5173
npm run dev:mobile        # localhost:3005
npm run dev:storybook     # localhost:6006

# 빌드
npm run build             # 전체 (Turbo)
npm run build:wiki        # Wiki → out/

# 테스트
npm run test              # Vitest 단위 (707개)
npm run test:coverage     # 커버리지 리포트
npm run test:e2e          # Playwright (18파일)

# 품질
npm run format            # Prettier
npm run lighthouse        # Lighthouse CI
npm run analyze:admin     # Bundle Analyzer
```
