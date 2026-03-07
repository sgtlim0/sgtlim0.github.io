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
| TS/TSX 파일 | 516개 |
| 총 코드 라인 | **48,025줄** (TS/TSX) |
| @hchat/ui | 28,327줄 |
| UI 컴포넌트 | 132개 |
| 서비스 파일 | 40개 |
| 페이지 | 55개 (page.tsx 기준) |
| Wiki 콘텐츠 | 28개 마크다운 (5 카테고리) |
| Storybook | 135 파일 |
| 단위 테스트 | 53 파일, 707 테스트 |
| E2E 테스트 | 18개 파일 (6 프로젝트) |
| Interaction Tests | 6 파일, 28 테스트 |
| CSS 디자인 토큰 | 194개 변수 (light + dark) |
| 커스텀 훅 | 61개 |
| AI 모델 카탈로그 | 86개 |
| Git 커밋 | 107개 |
| 완료 Phase | 54개 |

### Phase 27 → 35 성장

| 지표 | Phase 27 | Phase 35 | 변화 |
|------|----------|----------|------|
| TS/TSX LOC | 27,983 | 40,060 | +43% |
| 컴포넌트 | 87 | 128 | +47% |
| 페이지 | 44 | 55 | +25% |
| 커스텀 훅 | 42 | 60 | +43% |
| 앱 | 6 | 8 | +2 (Desktop, Mobile) |
| Storybook 파일 | 103 | 126 | +22% |
| 단위 테스트 | 0 | 284 | 신규 |
| CSS 토큰 | 155 | 194 | +25% |

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
│   ├── tokens/              # @hchat/tokens — CSS 변수 (light/dark)
│   │   └── styles/tokens.css  # 194개 디자인 토큰
│   └── ui/                  # @hchat/ui — 공유 UI 컴포넌트 (23,385줄)
│       └── src/
│           ├── index.ts       # 17 메인 배럴 export
│           ├── admin/         # Admin 컴포넌트 (68파일) + auth + services
│           ├── user/          # User 컴포넌트 (34파일) + services
│           ├── roi/           # ROI 대시보드 (27파일) + charts (5)
│           ├── llm-router/    # LLM Router (22파일) + services
│           ├── mobile/        # Mobile 컴포넌트 (12파일)
│           ├── hmg/           # HMG 컴포넌트 (9파일)
│           ├── desktop/       # Desktop 컴포넌트 (8파일)
│           └── i18n/          # 국제화 (5파일, ko/en)
├── apps/
│   ├── wiki/                # 마크다운 위키 — 28 콘텐츠 페이지
│   ├── hmg/                 # HMG 마케팅 — 4 페이지
│   ├── admin/               # 관리자 패널 — 24 페이지 (ROI 10 포함)
│   ├── user/                # 사용자 앱 — 5 페이지
│   ├── llm-router/          # LLM 라우터 — 10 페이지
│   ├── desktop/             # 데스크톱 앱 — 5 페이지
│   ├── mobile/              # 모바일 앱 — 4 탭 (PWA)
│   └── storybook/           # Storybook — 126 스토리 파일
├── tests/e2e/               # Playwright E2E — 18 파일
├── docs/                    # 프로젝트 문서 — 23 파일
├── design/                  # .pen 디자인 파일
└── .github/workflows/       # CI/CD — 3 워크플로우
```

### 의존성 그래프

```
@hchat/tokens (59줄, CSS 변수 194개)
       ↓
@hchat/ui (23,385줄, 컴포넌트 128개, 훅 60개)  ← 전체 코드의 58.4%
       ↓
  ┌────┼────┬────┬────┬────┬────┬────┐
  ↓    ↓    ↓    ↓    ↓    ↓    ↓    ↓
Wiki  HMG Admin User  LLM  Desk  Mobi SB
1.5K  717 1.5K  392  2.9K  829   90  5.8K (줄)
  ↓    ↓    ↓    ↓    ↓    ↓    ↓    ↓
 GH  Vercel ×7
Pages
```

### LOC 분포

```
@hchat/ui        23,385줄  ██████████████████████████████  58.4%
storybook         5,809줄  ███████                        14.5%
llm-router        2,900줄  ████                            7.2%
admin             1,535줄  ██                              3.8%
wiki              1,509줄  ██                              3.8%
desktop             829줄  █                               2.1%
hmg                 717줄  █                               1.8%
user                392줄  ▌                               1.0%
mobile               90줄  ▏                               0.2%
tokens               59줄  ▏                               0.1%
────────────────────────────────────────────
총계             40,060줄
```

**인사이트**: `@hchat/ui`가 전체 코드의 **58.4%**를 차지하며, 앱들은 얇은 Shell 역할. 비즈니스 로직과 UI가 공유 패키지에 집중된 올바른 모노레포 패턴.

---

## 4. 앱별 상세 분석

### 4.1 Wiki (`apps/wiki/`)

| 항목 | 내용 |
|------|------|
| **URL** | https://sgtlim0.github.io |
| **배포** | GitHub Pages (GitHub Actions) |
| **LOC** | 1,509줄 (23파일) |
| **라우팅** | `[[...slug]]` catch-all route |
| **콘텐츠** | `content/` 디렉토리 (28 마크다운) |
| **섹션** | chat(6), tools(7), browser(3), settings(3), desktop(3) |

**아키텍처**: Sidebar 네비게이션 + 마크다운 렌더링. `gray-matter`로 frontmatter 파싱, `react-markdown` + `rehype-highlight`로 렌더링.

### 4.2 HMG (`apps/hmg/`)

| 항목 | 내용 |
|------|------|
| **URL** | https://hchat-hmg.vercel.app |
| **배포** | Vercel |
| **LOC** | 717줄 (9파일) |
| **페이지** | Home, Publications, Guide, Dashboard |
| **특징** | i18n (한/영 49키), 탭 필터링, 다운로드 핸들러 |

**아키텍처**: GNB + I18nProvider. Publications에 탭 기반 카테고리 필터링 (가이드, 릴리즈 노트, 기술 문서). 6개 FeatureCard, 4개 HmgStatCard.

### 4.3 Admin (`apps/admin/`)

| 항목 | 내용 |
|------|------|
| **URL** | https://hchat-admin.vercel.app |
| **배포** | Vercel |
| **LOC** | 1,535줄 (38파일) |
| **페이지** | 24개 (기본 14 + ROI 10) |
| **인증** | AuthProvider + ProtectedRoute |
| **서비스** | 19 커스텀 훅, 14 API 메서드 |
| **Dynamic Import** | 16페이지 |

**페이지 목록**:
- **기본**: Dashboard, Usage, Statistics, Users, Settings, Providers, Models, Features, Prompts, Agents, Departments, Audit Logs, SSO, Login
- **ROI**: Overview, Adoption, Productivity, Analysis, Organization, Sentiment, Reports, Settings, Upload, (Index)

**서비스 레이어**:
```
AdminApiService (Interface)
       ↓
MockApiService (100-300ms 지연)
       ↓
AdminServiceProvider (Context)
       ↓
useAdmin* 훅 19개
```

**엔터프라이즈 API**:
- 부서 관리 (31개 목 데이터)
- 사용자 관리 (48개 목 데이터)
- 감사 로그 (150+ 레코드)
- SSO 설정, 대량 작업 (bulk operations)
- 프록시 패턴으로 API 키 보호

**인증**:
- 2개 역할: admin, manager
- 데모 계정: `admin@hchat.ai` / `Admin123!`
- localStorage (기억하기) / sessionStorage (세션)

### 4.4 User (`apps/user/`)

| 항목 | 내용 |
|------|------|
| **URL** | https://hchat-user.vercel.app |
| **배포** | Vercel |
| **LOC** | 392줄 (11파일) |
| **페이지** | Chat, Docs, OCR, Translation, My Page |
| **서비스** | 7 커스텀 훅, 10 API 메서드 |
| **Dynamic Import** | 5페이지 |

**핵심 기능**:
- **실시간 채팅**: SSE 스트리밍 (카테고리별 응답: chat, work, translation, summary)
- **대화 관리**: localStorage 기반 CRUD, 검색
- **커스텀 어시스턴트**: 19개 공식 + 사용자 생성 (8 이모지 프리셋, 6 컬러)
- **파일 업로드**: 드래그앤드롭, OCR, 번역
- **문서 작성**: 5단계 워크플로우

### 4.5 LLM Router (`apps/llm-router/`)

| 항목 | 내용 |
|------|------|
| **URL** | https://hchat-llm-router.vercel.app |
| **배포** | Vercel |
| **LOC** | 2,900줄 (20파일) |
| **페이지** | 10개 (Landing, Models, Docs, Playground, Dashboard×4, Login, Signup) |
| **모델** | 86개 AI 모델, 20+ 프로바이더 |
| **Dynamic Import** | 2페이지 |

**AI 모델 카탈로그**:
| 프로바이더 | 모델 수 |
|-----------|---------|
| OpenAI | 13 |
| Google | 10 |
| Meta | 9 |
| Anthropic | 7 |
| Mistral | 6 |
| Cohere | 4 |
| DeepSeek | 2 |
| 기타 | 35 |

**기능**: 모델 비교 테이블 (가격, 컨텍스트 윈도우, 성능), API 키 관리, 사용량 통계, SSE 스트리밍 플레이그라운드, 7 프로바이더 레이턴시 프로파일.

### 4.6 Desktop (`apps/desktop/`)

| 항목 | 내용 |
|------|------|
| **URL** | https://hchat-desktop.vercel.app |
| **배포** | Vercel |
| **LOC** | 829줄 (13파일) |
| **페이지** | Chat, Agent, Swarm, Debate, Tools |
| **토큰** | `--dt-*` 접두사 24개 |

**컴포넌트**: DesktopSidebar (접이식), DesktopChatBubble (토큰 카운트), AgentCard (상태/제어), ToolGrid (활성/비활성).

### 4.7 Mobile (`apps/mobile/`)

| 항목 | 내용 |
|------|------|
| **배포** | Vercel |
| **LOC** | 90줄 (3파일) |
| **탭** | Chat, Assistants, History, Settings |
| **특징** | PWA, 스와이프 제스처, 480px 최적화 |

**컴포넌트**: MobileBottomNav, MobileHeader, SwipeableChat, MobileAssistantCard, MobileHistoryItem, MobileSettingsToggle, MobileSearchBar (총 7개).

### 4.8 Storybook (`apps/storybook/`)

| 항목 | 내용 |
|------|------|
| **URL** | https://hchat-storybook.vercel.app |
| **배포** | Vercel |
| **LOC** | 5,809줄 (130파일) |
| **스토리 파일** | 126개 |

**카테고리별 분포**:
| 카테고리 | 스토리 파일 수 | 구성 |
|----------|--------------|------|
| Admin | 31 | Atoms, Molecules, Organisms, Pages |
| ROI | 24 | Charts 5, Atoms 7, Pages 9, Misc 3 |
| User | 21 | Components 16, Pages 5 |
| HMG | 12 | Atoms 3, Molecules 5, Pages 4 |
| LLM Router | 7 | Components 7 |
| Desktop | 6 | Components 6 |
| Mobile | 6 | Components 6 |
| Shared | 5 | EmptyState, ErrorBoundary, LanguageToggle, Skeleton, Toast |
| Wiki | 5 | Atoms 5 |
| Organisms | 3 | Sidebar, MarkdownRenderer, SearchOverlay |
| Molecules | 5 | Cards, Navigation |
| Design System | 1 | DesignTokens |

---

## 5. 아키텍처 패턴

### 5.1 Service Layer Pattern (Provider Pattern)

3개 앱(Admin, User, LLM Router)에서 동일한 패턴 사용:

```
Interface (서비스 계약)
    ↓
Mock Implementation (100-300ms 지연, localStorage 영속)
    ↓
Context Provider (React Context)
    ↓
Custom Hooks (useData<T> 패턴)
    ↓
Component (UI 렌더링)
```

| 앱 | 훅 수 | API 메서드 | 목 데이터 |
|----|-------|-----------|----------|
| Admin | 19 | 14 | 부서 31, 사용자 48, 감사로그 150+ |
| User | 7 | 10 | 어시스턴트 19, 대화 N개 |
| LLM Router | 7 | 9 | AI 모델 86개 |

### 5.2 Design Token System

```
packages/tokens/styles/tokens.css (194 CSS 변수)
    ↓  @import
apps/*/app/globals.css
    ↓  @theme inline
Tailwind CSS 4 유틸리티 클래스
    ↓  className
React 컴포넌트
```

**토큰 범주**:
| 범주 | Wiki | HMG | Admin | ROI | User | LLM Router | Desktop |
|------|------|-----|-------|-----|------|-----------|---------|
| Primary/Accent | 5 | 6 | 5 | - | 3 | 3 | 4 |
| Background | 6 | 3 | 4 | 4 | 2 | 4 | 3 |
| Text | 3 | 3 | - | 3 | 3 | 3 | 3 |
| Border | 2 | 2 | - | 2 | 1 | 1 | 2 |
| Status | - | - | 3 | - | - | - | - |
| Chart | - | - | - | 5 | - | - | - |
| Sidebar | - | - | - | 4 | - | 2 | 4 |
| Misc | - | - | 2 | 2 | - | 2 | 8 |

### 5.3 Dynamic Import (코드 스플리팅)

11개 페이지에 `ssr: false` 적용:
- **Admin**: ROI 페이지 + 기본 페이지
- **User**: 챗 관련 페이지
- **LLM Router**: 스트리밍 플레이그라운드
- **폴백**: `SkeletonCard` / `SkeletonTable` 컴포넌트

### 5.4 SVG 차트 시스템 (외부 라이브러리 없음)

5개 순수 SVG/CSS 차트:
| 차트 | 용도 | 특징 |
|------|------|------|
| MiniLineChart | 추이 시각화 | SVG polyline, 호버 툴팁 |
| MiniBarChart | 주간 비교 | 호버 툴팁, 교차 라벨 |
| DonutChart | 비율 표시 | SVG circle, stroke-dasharray |
| AreaChart | 누적 표시 | SVG path fill |
| RadarChart | 다축 비교 | SVG polygon |

### 5.5 SSE 스트리밍 (User + LLM Router)

```
사용자 입력
    ↓
streamResponse(message, category)
    ↓
카테고리별 목 응답 선택 (chat, work, translation, summary)
    ↓
청크 분할 (30-80ms 지연, 7 프로바이더 레이턴시 프로파일)
    ↓
실시간 MessageBubble 업데이트
    ↓
localStorage 저장 (chatService)
```

### 5.6 ROI 데이터 파이프라인

```
Excel 파일 (드래그앤드롭 / 클릭)
    ↓
SheetJS 파싱 (브라우저 로컬)
    ↓
ParsedRecord[] → ROIDataContext.setRecords()
    ↓
aggregateAll() → AggregatedData
    ↓
9개 ROI 페이지에서 useROIData()로 소비
```

### 5.7 실시간 대시보드 (Phase 29)

```
setInterval (1-5초)
    ↓
Mock 데이터 생성 (metrics, timeSeries, activities)
    ↓
useState 업데이트
    ↓
Live 컴포넌트 4종 렌더링
```

### 5.8 위젯 시스템 (Phase 33)

```
10종 위젯 정의 (WidgetRegistry)
    ↓
CSS Grid (span 설정)
    ↓
드래그앤드롭 레이아웃 편집
    ↓
localStorage 레이아웃 영속
```

### 5.9 AI 워크플로우 빌더 (Phase 34)

```
8종 노드 (Input, LLM, Transform, Condition, Output, API, Database, Custom)
    ↓
SVG 베지어 엣지 연결
    ↓
4개 템플릿 (번역, 요약, 분류, 파이프라인)
    ↓
Mock 순차 실행 엔진
```

---

## 6. 코드 품질 & 테스트

### 6.1 코드 품질 도구

| 도구 | 역할 | 설정 |
|------|------|------|
| Prettier | 코드 포매팅 | semi: false, singleQuote, tabWidth: 2, printWidth: 100 |
| ESLint | 정적 분석 | v9, Next.js 기본 규칙 |
| TypeScript | 타입 검사 | strict mode, v5 |
| Husky | Git 훅 | pre-commit |
| lint-staged | 스테이징 검사 | *.{ts,tsx}: prettier + eslint |

### 6.2 코드 품질 지표 (실측)

| 지표 | 결과 | 평가 |
|------|------|------|
| `any` 타입 | **0개** (소스 코드, .next 제외) | 우수 |
| `console.log` | **4개** (소스), 41개 (Storybook) | 양호 |
| `TODO/FIXME/HACK` | **2개** | 우수 |
| `dangerouslySetInnerHTML` | **1개** | 양호 |
| 800줄+ 파일 | **1개** (mockData.ts, 데이터 파일) | 우수 |
| `.env` 파일 | **0개** | 시크릿 노출 없음 |
| 하드코딩 시크릿 | **0개** | 우수 |
| 평균 파일 크기 | **91.8줄** | 소형 파일 원칙 준수 |

### 6.3 단위 테스트 (Vitest)

**20개 테스트 파일, ~284 테스트**:
- 프레임워크: Vitest 4.0.18 + @testing-library/react
- 커버리지 도구: @vitest/coverage-v8
- 명령: `npm test` / `npm run test:coverage`

### 6.4 E2E 테스트 (Playwright)

**18개 테스트 파일, 6개 프로젝트**:

| 프로젝트 | 테스트 URL | 테스트 파일 수 |
|----------|-----------|--------------|
| admin | hchat-admin.vercel.app | 2 (navigation, roi) |
| hmg | hchat-hmg.vercel.app | 1 (navigation) |
| user | hchat-user.vercel.app | 5 (chat, translation, docs, ocr, mypage) |
| llm-router | hchat-llm-router.vercel.app | 3 (landing, models, playground) |
| wiki | sgtlim0.github.io | 1 (landing) |
| dark-mode | hchat-admin.vercel.app | 1 (dark-mode) |

**횡단 테스트**:
- `dark-mode-all.spec.ts` — 전체 앱 다크모드 검증
- `a11y-all.spec.ts` — 전체 앱 접근성 (axe-core WCAG 2.1 AA)
- `responsive.spec.ts` — 반응형 레이아웃
- `cross-app.spec.ts` — 앱 간 네비게이션

**테스트 설정**: timeout 30s, viewport 1280x720, screenshot only-on-failure

### 6.5 CI/CD 파이프라인

```
git push → GitHub Actions
  ├── ci.yml ─── type-check → lint → test → build (Turbo)
  │              └── Lighthouse CI (perf>=80, a11y>=85)
  ├── deploy.yml ── Wiki 빌드 → GitHub Pages
  └── e2e.yml ──── Playwright (admin, hmg, wiki, user)
                    └── Artifact: playwright-report (7일 보존)

git push → Vercel (자동)
  ├── HMG, Admin, User, LLM Router, Desktop, Mobile, Storybook
  └── 각 앱별 vercel.json 설정
```

---

## 7. 파일 통계

### 전체 소스 파일

| 파일 유형 | 수 | LOC |
|----------|-----|-----|
| TypeScript/TSX | 463 | 40,060 |
| CSS/SCSS | 41 | 22,664 |
| Markdown (콘텐츠) | 28 | - |
| Markdown (문서) | 23 | - |
| **합계** | **555** | **62,724+** |

### 패키지별 TypeScript 파일 수

| 패키지/앱 | 파일 수 | LOC | 비율 |
|-----------|--------|-----|------|
| @hchat/ui | 195 | 23,385 | 58.4% |
| @hchat/storybook | 130 | 5,809 | 14.5% |
| @hchat/admin | 38 | 1,535 | 3.8% |
| @hchat/wiki | 23 | 1,509 | 3.8% |
| @hchat/llm-router | 20 | 2,900 | 7.2% |
| @hchat/desktop | 13 | 829 | 2.1% |
| @hchat/user | 11 | 392 | 1.0% |
| @hchat/hmg | 9 | 717 | 1.8% |
| @hchat/mobile | 3 | 90 | 0.2% |
| @hchat/tokens | 1 | 59 | 0.1% |
| **소스 합계** | **443** | **37,225** | 93.0% |
| tests/e2e | 18 | - | - |
| 기타 (설정 등) | 2 | 2,835 | 7.0% |
| **총계** | **463** | **40,060** | 100% |

### packages/ui 서브디렉토리 분포

| 서브디렉토리 | 파일 수 | 역할 |
|-------------|---------|------|
| admin/ | 68 | Admin + Auth + Services + 워크플로우 + 위젯 + 알림 |
| user/ | 34 | Chat + SSE + 어시스턴트 + 파일업로드 |
| roi/ | 27 | ROI 대시보드 + SVG 차트 |
| llm-router/ | 22 | 모델 카탈로그 + 스트리밍 |
| mobile/ | 12 | PWA 모바일 UI |
| hmg/ | 9 | HMG 마케팅 |
| desktop/ | 8 | 데스크톱 UI |
| i18n/ | 5 | 국제화 |
| root (공유) | 10 | Badge, Theme, Toast, Skeleton 등 |
| **합계** | **195** | |

### 가장 큰 파일 Top 10

| 순위 | 파일 | LOC | 비고 |
|------|------|-----|------|
| 1 | `llm-router/mockData.ts` | **1,099** | 86개 AI 모델 데이터 |
| 2 | `admin/services/workflowService.ts` | 623 | 워크플로우 빌더 서비스 |
| 3 | `admin/services/mockApiService.ts` | 450 | Admin 목 API |
| 4 | `user/pages/ChatPage.tsx` | 429 | 채팅 메인 페이지 |
| 5 | `roi/aggregateData.ts` | 406 | ROI 데이터 집계 |
| 6 | `llm-router/StreamingPlayground.tsx` | 397 | SSE 스트리밍 플레이그라운드 |
| 7 | `admin/services/widgetService.ts` | 373 | 위젯 시스템 서비스 |
| 8 | `roi/ROIDataUpload.tsx` | 346 | Excel 업로드 |
| 9 | `admin/DepartmentManagement.tsx` | 329 | 부서 관리 |
| 10 | `llm-router/services/hooks.ts` | 314 | LLM Router 훅 |

### 배럴 Export 구조

| 인덱스 파일 | Export 수 |
|------------|----------|
| `admin/index.ts` | **46** |
| `llm-router/index.ts` | 19 |
| `roi/index.ts` | 19 |
| `index.ts` (root) | 17 |
| `mobile/index.ts` | 15 |
| `desktop/index.ts` | 13 |
| `hmg/index.ts` | 8 |
| `user/index.ts` | 7 |
| `i18n/index.ts` | 4 |

### 컴포넌트 분류

| 카테고리 | 컴포넌트 수 | 주요 항목 |
|---------|-----------|---------|
| 공유 | 10 | Badge, ThemeProvider, ThemeToggle, Toast, ErrorBoundary, EmptyState, Skeleton, LanguageToggle, FeatureCard, validation |
| Admin | 21 | StatCard, DataTable, StatusBadge, LoginPage, Dashboard 등 |
| Admin Auth | 5 | AuthProvider, ProtectedRoute, useAuth, authService, mockAuthService |
| Admin Services | 4 | workflowService, widgetService, notificationService, mockApiService |
| ROI | 18 | ROISidebar, KPICard, InsightCard, SurveyBar, HeatmapCell 등 |
| ROI Charts | 5 | MiniLineChart, DonutChart, MiniBarChart, AreaChart, RadarChart |
| User | 17 | UserGNB, ChatSidebar, MessageBubble, StreamingIndicator 등 |
| HMG | 8 | GNB, HeroBanner, TabFilter, Footer, PillButton 등 |
| LLM Router | 6 | LRNavbar, ModelTable, CodeBlock, ProviderBadge 등 |
| Desktop | 4 | DesktopSidebar, DesktopChatBubble, AgentCard, ToolGrid |
| Mobile | 7 | MobileBottomNav, MobileHeader, SwipeableChat 등 |
| i18n | 3 | I18nProvider, useI18n, LanguageToggle |
| **합계** | **128** | |

---

## 8. 의존성 분석

### 루트 devDependencies (14개)

| 카테고리 | 패키지 |
|---------|--------|
| **테스트** | Playwright, Vitest, @vitest/coverage-v8, Testing Library (react, jest-dom, user-event) |
| **빌드** | Turborepo, @next/bundle-analyzer, @vitejs/plugin-react, jsdom |
| **품질** | Prettier, Husky, lint-staged |
| **접근성** | @axe-core/playwright, @lhci/cli |

### 앱별 의존성

| 앱 | deps | devDeps | 특수 의존성 |
|----|------|---------|------------|
| Wiki | 11 | 8 | react-markdown, gray-matter, rehype-highlight, remark-gfm, highlight.js |
| HMG/Admin/User/LLM Router | 6 | 8 | @hchat/tokens, @hchat/ui, lucide-react |
| Desktop/Mobile | 5 | 8 | @hchat/tokens, @hchat/ui, lucide-react |
| Storybook | 6 | 9 | Storybook 9 + addons |
| @hchat/ui | 2 | 0 | @hchat/tokens, xlsx |
| @hchat/tokens | 0 | 0 | (없음) |

---

## 9. Git 히스토리 분석

### 커밋 통계

| 항목 | 수치 |
|------|------|
| 총 커밋 | 97개 |
| 개발 기간 | 56일 (2026-01-10 ~ 03-07) |
| 평균 커밋/일 | 1.73 |
| Phase 진행 속도 | 0.63 Phase/일 |
| 코드 생산성 | ~715줄/일 |

### 커밋 타입 분포

```
feat     38 ██████████████████████  39.2%
docs     30 █████████████████       30.9%
fix      17 ██████████              17.5%
기타     12 ███████                 12.4%
```

### 가장 자주 수정된 파일

| 파일 | 수정 횟수 | 역할 |
|------|----------|------|
| docs/TODO.md | 26 | 작업 추적 |
| README.md | 16 | 프로젝트 문서 |
| package.json | 14 | 의존성 관리 |
| package-lock.json | 12 | 락 파일 |
| admin/index.ts | 9 | Admin 배럴 export |
| CLAUDE.md | 8 | AI 어시스턴트 설정 |
| AdminNav.tsx | 8 | Admin 네비게이션 |

---

## 10. 보안 평가

| 항목 | 상태 | 비고 |
|------|------|------|
| 하드코딩 시크릿 | **안전** | .env 파일 없음, API 키 노출 없음 |
| `any` 타입 | **안전** | 소스 코드 0개 |
| XSS (`dangerouslySetInnerHTML`) | **주의** | 1개 사용 — 입력 소스 확인 필요 |
| 인증 데모 계정 | **주의** | `Admin123!` 하드코딩 (Mock이므로 현재는 무해) |
| API 프록시 | **양호** | 프록시 패턴으로 서버사이드 키 보호 설계 |
| 환경변수 관리 | **양호** | .env 파일 없음, 런타임 설정 미사용 |

---

## 11. 배포 현황

| 앱 | URL | 플랫폼 | 빌드 |
|----|-----|--------|------|
| Wiki | https://sgtlim0.github.io | GitHub Pages | `next build` → `out/` |
| HMG | https://hchat-hmg.vercel.app | Vercel | Next.js |
| Admin | https://hchat-admin.vercel.app | Vercel | Next.js |
| User | https://hchat-user.vercel.app | Vercel | Next.js |
| LLM Router | https://hchat-llm-router.vercel.app | Vercel | Next.js |
| Desktop | https://hchat-desktop.vercel.app | Vercel | Next.js |
| Mobile | (Vercel) | Vercel | Next.js |
| Storybook | https://hchat-storybook.vercel.app | Vercel | `storybook build` |

---

## 12. 접근성 & 국제화

### 접근성 (a11y)

- **표준**: WCAG 2.1 AA
- **구현**: skip navigation, sr-only, focus management, semantic HTML
- **검증**: axe-core (Playwright), Storybook addon-a11y
- **테스트**: `a11y.spec.ts`, `a11y-all.spec.ts`

### 국제화 (i18n)

- **지원 언어**: 한국어 (ko), 영어 (en)
- **번역 키**: 49개 (HMG 앱)
- **구현**: I18nProvider + useI18n + LanguageToggle

---

## 13. 기술 부채 & 개선 영역

### CRITICAL

| 영역 | 현재 상태 | 영향 | 목표 |
|------|----------|------|------|
| 단위 테스트 부족 | 20/463 파일 (4.3%) | 리팩토링 안전성 부재 | 80%+ (핵심 서비스 우선) |
| 전체 Mock API | 실제 API 0% | 프로덕션 배포 불가 | MSW → 실제 API 연결 |

### HIGH

| 영역 | 현재 상태 | 영향 | 목표 |
|------|----------|------|------|
| @hchat/ui 거대화 | 23,385줄, 195파일 | 빌드 시간, 코드 탐색 | 서브 패키지 분리 |
| Admin 배럴 비대 | index.ts 46 exports | Tree-shaking 비효율 | 서브경로 export 분리 |
| Storybook Interaction Tests | 0개 | 컴포넌트 동작 검증 미비 | play 함수 도입 |

### MEDIUM

| 영역 | 현재 상태 | 영향 | 목표 |
|------|----------|------|------|
| console.log (소스) | 4개 (LLM Router) | 프로덕션 로그 노출 | 제거 또는 로거 교체 |
| ChatPage.tsx 429줄 | 단일 대형 컴포넌트 | 유지보수 어려움 | 서브 컴포넌트 분리 |
| mockData.ts 1,099줄 | 단일 데이터 파일 | 코드 탐색 불편 | 프로바이더별 분리 |

### LOW

| 영역 | 현재 상태 | 영향 | 목표 |
|------|----------|------|------|
| i18n 한정 | HMG 앱 49키만 | 다국어 확장 어려움 | 전체 앱 i18n 확대 |
| Admin 빌드 캐시 | .next 275MB | 디스크 사용량 | 캐시 정리 자동화 |

---

## 14. 확장성 평가

### 강점
- **Turborepo**: 증분 빌드, 캐싱으로 빌드 최적화
- **Static Export**: 모든 앱이 정적 빌드 → CDN 배포 용이
- **Design Token 체계**: 테마 확장이 CSS 변수 추가만으로 가능
- **Provider Pattern**: Mock → 실제 API 전환이 Interface 교체만으로 가능
- **타입 안전성**: `any` 0개, TypeScript strict mode

### 약점
- **@hchat/ui 단일 패키지**: 하나의 앱 컴포넌트 수정이 전체 빌드에 영향
- **배럴 export 비대**: admin/index.ts의 46개 export가 tree-shaking 저해
- **빌드 캐시 크기**: .next 캐시 합계 342MB (admin 275MB가 대부분)

---

## 15. 완료된 Phase 히스토리 (1-35)

| Phase | 주요 작업 | 결과물 |
|-------|----------|--------|
| 1-10 | Wiki 초기 구축 | 마크다운 위키 28 페이지 |
| 11-15 | HMG 사이트 | 4 페이지, GNB, i18n |
| 16-18 | Admin 패널 | 14 기본 페이지, 인증 시스템 |
| 19-20 | ROI 대시보드 | 9 페이지, 5 SVG 차트, Excel 업로드 |
| 21 | Storybook 73개 | 디자인 토큰, 6 카테고리 |
| 22 | 서비스 레이어 | API 추상화, Provider Pattern |
| 23 | Dynamic Import | 23 페이지 코드 스플리팅 |
| 24 | Lighthouse CI | 성능/접근성 모니터링 |
| 25 | E2E 확장 | 18 테스트 (반응형, 다크모드, a11y) |
| 26 | Storybook 103개 | +Shared 카테고리, 97% 커버리지 |
| 27 | 프로젝트 심층 분석 | 전체 문서 정비, 실측 데이터 |
| 28 | 단위 테스트 | Vitest 4, 9파일 123 테스트 |
| 29 | 실시간 대시보드 | 4종 Live 컴포넌트 |
| 30 | SSE 스트리밍 | StreamingPlayground, ModelComparison, 7 프로바이더 |
| 31 | Desktop 통합 | 모노레포 통합, 7 컴포넌트, 24 토큰 |
| 32 | 알림 시스템 | 4 UI, 2 훅, 18 템플릿 |
| 33 | 대시보드 커스터마이징 | 10종 위젯, CSS Grid, 드래그앤드롭 |
| 34 | AI 워크플로우 빌더 | 8종 노드, SVG 엣지, 4 템플릿 |
| 35 | 모바일 앱 | PWA, 7 컴포넌트, 스와이프 제스처 |
| 36 | 단위 테스트 확장 | 43파일 608테스트, 커버리지 35% |
| 37 | 코드 품질 | console.log 0개, 커버리지 30%, exports 16경로 |
| 38 | Interaction Tests | 6파일 28인터랙션 (play() 함수) |
| 39 | 멀티테넌트 | tenantService, CSS 변수 오버라이드, 3 테넌트 |
| 40 | 에이전트 마켓플레이스 | 10 에이전트, 8 카테고리, install/uninstall |
| 41 | 분석 엔진 | z-score 이상탐지, 선형회귀, 자동 인사이트 |
| 42 | RAG 문서 검색 | 벡터 검색 모의, 6문서, 3 임베딩 모델 |
| 43 | 프롬프트 버전 관리 | diff, A/B 테스트, 롤백 |
| 44 | SSO/SAML | Okta/Azure AD, JWT RS256, 감사 로그 |
| 45 | 채팅 분석 | 주제 클러스터링, 시간대 분포, 품질 메트릭 |
| 46 | RBAC | 26 Permission, 4 역할, 위임 관리 |
| 47 | AI 벤치마크 | 6 모델 랭킹, 5 추천, 히스토리 |
| 48 | 피드백 루프 | 인라인 피드백, A/B 자동화, 프롬프트 튜닝 |
| 49 | 알림 규칙 엔진 | 조건 빌더, Slack/Teams, 에스컬레이션 |
| 50 | 팀 채팅 | 채팅방, 멘션, 스레드, 리액션, AI 공유 |
| 51 | 파인튜닝 | 데이터셋, loss 추적, 평가 +16.7% |
| 52 | D3 시각화 | Treemap, Sankey, Scatter, Funnel, Gauge |
| 53 | 지식 그래프 | 12노드, NER 추출, 그래프 검색 |
| 54 | 음성 인터페이스 | STT/TTS, 회의 요약, 5 음성 모델 |

---

## 16. 관련 레포지토리

| 레포 | 설명 | 규모 |
|------|------|------|
| **hchat-v2-extension** | Chrome Extension v4.5 | 107 파일, 21.5K LOC, 649 테스트 |
| **hchat-desktop** | PWA (React 19 + Zustand 5) | 15 페이지, 667 테스트 |

---

## 17. 스크립트 레퍼런스

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
npm run build:hmg         # HMG → out/
npm run build:admin       # Admin → out/
npm run build:user        # User → out/
npm run build:llm-router  # LLM Router → out/
npm run build:desktop     # Desktop → out/
npm run build:mobile      # Mobile → out/
npm run build:storybook   # Storybook → storybook-static/

# 테스트
npm run test              # Vitest 단위 테스트
npm run test:watch        # Vitest watch 모드
npm run test:coverage     # 커버리지 리포트
npm run test:e2e          # Playwright 전체
npm run test:e2e:ui       # Playwright UI 모드
npm run test:e2e:admin    # Admin E2E
npm run test:e2e:hmg      # HMG E2E
npm run test:e2e:user     # User E2E
npm run test:e2e:llm-router # LLM Router E2E
npm run test:e2e:wiki     # Wiki E2E
npm run test:e2e:cross    # Cross-app E2E

# 번들 분석
npm run analyze:admin     # Admin 번들
npm run analyze:hmg       # HMG 번들
npm run analyze:user      # User 번들
npm run analyze:llm-router # LLM Router 번들
npm run analyze:desktop   # Desktop 번들
npm run analyze:mobile    # Mobile 번들

# 품질
npm run format            # Prettier
npm run lighthouse        # Lighthouse CI
```
