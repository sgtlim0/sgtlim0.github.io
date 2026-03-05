# H Chat Wiki — 프로젝트 심층 분석

> 최종 업데이트: 2026-03-05 | Phase 27 완료 기준 (실측 데이터 반영)

---

## 1. 프로젝트 개요

**H Chat Wiki**는 현대차그룹 생성형 AI 서비스(H Chat)의 문서 포털, 마케팅 사이트, 관리자 대시보드, 사용자 챗 인터페이스, LLM 라우터, 그리고 컴포넌트 카탈로그를 통합한 **npm workspaces 모노레포**입니다.

| 항목 | 수치 |
|------|------|
| 앱 | 6개 (Wiki, HMG, Admin, User, LLM Router, Storybook) |
| 배포 | 7개 URL (GitHub Pages 1, Vercel 6) |
| 전체 소스 파일 | 510개 (409 TS/TSX + 83 MD + 18 CSS) |
| 총 코드 라인 | **27,983줄** (TS/TSX) |
| UI 컴포넌트 | 87개 |
| 페이지 | 44개 (page.tsx 기준) |
| Wiki 콘텐츠 | 28개 마크다운 (5 카테고리) |
| Storybook 스토리 | 103개 (97% 커버리지) |
| E2E 테스트 | 18개 파일 (728줄, 6 프로젝트) |
| CSS 디자인 토큰 | 155개 변수 (light + dark, 193줄) |
| 커스텀 훅 | 42개 |
| AI 모델 카탈로그 | 86개 |
| 문서 | 23개 (12,940줄) |
| 완료 Phase | 27개 |

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
│   │   └── styles/tokens.css  # 155개 디자인 토큰
│   └── ui/                  # @hchat/ui — 공유 UI 컴포넌트 (15,017줄)
│       └── src/
│           ├── index.ts       # 200+ 메인 배럴 export
│           ├── Skeleton.tsx    # 5종 스켈레톤
│           ├── Toast.tsx       # 4종 알림
│           ├── EmptyState.tsx  # 빈 상태 UI
│           ├── ErrorBoundary.tsx # 에러 경계
│           ├── validation.ts   # 폼 유효성 검증
│           ├── hmg/           # HMG 컴포넌트 (8)
│           ├── admin/         # Admin 컴포넌트 (21) + auth (5) + services
│           ├── user/          # User 컴포넌트 (17) + services
│           ├── roi/           # ROI 대시보드 (18) + charts (5)
│           ├── llm-router/    # LLM Router (6) + services
│           └── i18n/          # 국제화 (ko/en)
├── apps/
│   ├── wiki/                # 마크다운 위키 — 28 콘텐츠 페이지
│   ├── hmg/                 # HMG 마케팅 — 4 페이지
│   ├── admin/               # 관리자 패널 — 24 페이지 (ROI 10 포함)
│   ├── user/                # 사용자 앱 — 5 페이지
│   ├── llm-router/          # LLM 라우터 — 10 페이지
│   └── storybook/           # Storybook — 103 스토리
├── tests/e2e/               # Playwright E2E — 18 파일 (728줄)
├── docs/                    # 프로젝트 문서 — 23 파일 (12,940줄)
├── design/                  # .pen 디자인 파일
└── .github/workflows/       # CI/CD — 3 워크플로우
```

### 의존성 그래프

```
@hchat/tokens (252줄, CSS 변수 155개)
       ↓
@hchat/ui (15,017줄, 컴포넌트 87개, 훅 42개)  ← 전체 코드의 53.7%
       ↓
  ┌────┼────┬────┬────┬────┐
  ↓    ↓    ↓    ↓    ↓    ↓
Wiki  HMG Admin User  LLM  Storybook
1.5K  643  694  292  2.4K  4.3K (줄)
  ↓    ↓    ↓    ↓    ↓    ↓
 GH  Vercel ×5
Pages
```

### LOC 분포

```
@hchat/ui       15,017줄  ████████████████████████████  53.7%
storybook        4,267줄  ████████                      15.2%
llm-router       2,367줄  ████                           8.5%
wiki             1,518줄  ███                            5.4%
admin              694줄  █                              2.5%
hmg                643줄  █                              2.3%
user               292줄  ▌                              1.0%
tokens             252줄  ▌                              0.9%
e2e tests          728줄  █                              2.6%
─────────────────────────────────────────────
총계            27,983줄
```

**인사이트**: `@hchat/ui`가 전체 코드의 **53.7%**를 차지하며, 앱들은 얇은 Shell 역할. 비즈니스 로직과 UI가 공유 패키지에 집중된 올바른 모노레포 패턴.

---

## 4. 앱별 상세 분석

### 4.1 Wiki (`apps/wiki/`)

| 항목 | 내용 |
|------|------|
| **URL** | https://sgtlim0.github.io |
| **배포** | GitHub Pages (GitHub Actions) |
| **LOC** | 1,518줄 |
| **라우팅** | `[[...slug]]` catch-all route |
| **콘텐츠** | `content/` 디렉토리 (28 마크다운) |
| **섹션** | chat(7), tools(7), browser(3), settings(3), desktop(3) |

**아키텍처**: Sidebar 네비게이션 + 마크다운 렌더링. `gray-matter`로 frontmatter 파싱, `react-markdown` + `rehype-highlight`로 렌더링.

### 4.2 HMG (`apps/hmg/`)

| 항목 | 내용 |
|------|------|
| **URL** | https://hchat-hmg.vercel.app |
| **배포** | Vercel |
| **LOC** | 643줄 |
| **페이지** | Home, Publications, Guide, Dashboard |
| **특징** | i18n (한/영 49키), 탭 필터링, 다운로드 핸들러 |

**아키텍처**: GNB + I18nProvider. Publications에 탭 기반 카테고리 필터링 (가이드, 릴리즈 노트, 기술 문서). 6개 FeatureCard, 4개 HmgStatCard.

### 4.3 Admin (`apps/admin/`)

| 항목 | 내용 |
|------|------|
| **URL** | https://hchat-admin.vercel.app |
| **배포** | Vercel |
| **LOC** | 694줄 (앱) + UI 컴포넌트 다수 |
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
- SSO 설정
- 대량 작업 (bulk operations)
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
| **LOC** | 292줄 (앱) + UI 컴포넌트 다수 |
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
| **LOC** | 2,367줄 |
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

**기능**: 모델 비교 테이블 (가격, 컨텍스트 윈도우, 성능), API 키 관리, 사용량 통계, 월간 사용 추이.

### 4.6 Storybook (`apps/storybook/`)

| 항목 | 내용 |
|------|------|
| **URL** | https://hchat-wiki-storybook.vercel.app |
| **배포** | Vercel |
| **LOC** | 4,267줄 |
| **스토리** | 103개 |
| **커버리지** | 97% |

**카테고리별 분포**:
| 카테고리 | 스토리 수 | 구성 |
|----------|----------|------|
| ROI | 24 | Charts 5, Atoms 7, Pages 9, Misc 3 |
| Admin | 21 | Atoms 3, Molecules 4, Organisms 13, Pages 1 |
| User | 21 | Components 16, Pages 5 |
| Wiki | 13 | Atoms 5, Molecules 5, Organisms 3 |
| HMG | 12 | Atoms 3, Molecules 5, Pages 4 |
| LLM Router | 6 | Components 6 |
| Shared | 5 | EmptyState, ErrorBoundary, LanguageToggle, Skeleton, Toast |
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
packages/tokens/styles/tokens.css (155 CSS 변수, 193줄)
    ↓  @import
apps/*/app/globals.css
    ↓  @theme inline
Tailwind CSS 4 유틸리티 클래스
    ↓  className
React 컴포넌트
```

**토큰 범주**:
| 범주 | Wiki | HMG | Admin | ROI | User | LLM Router |
|------|------|-----|-------|-----|------|-----------|
| Primary/Accent | 5 | 6 | 5 | - | 3 | 3 |
| Background | 6 | 3 | 4 | 4 | 2 | 4 |
| Text | 3 | 3 | - | 3 | 3 | 3 |
| Border | 2 | 2 | - | 2 | 1 | 1 |
| Status | - | - | 3 | - | - | - |
| Chart | - | - | - | 5 | - | - |
| Table | - | 2 | 2 | - | - | - |
| Sidebar | - | - | - | 4 | - | 2 |
| Misc | - | - | - | 2 | - | 2 |
| **소계** | 16 | 16 | 14 | 20 | 9 | 15 |

### 5.3 Dynamic Import (코드 스플리팅)

23개 페이지에 적용:
- **Admin**: 16페이지 (ROI 8 + 기본 8)
- **User**: 5페이지
- **LLM Router**: 2페이지
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

### 5.5 SSE 스트리밍 (User 앱)

```
사용자 입력
    ↓
streamResponse(message, category)
    ↓
카테고리별 목 응답 선택 (chat, work, translation, summary)
    ↓
청크 분할 (50ms + 랜덤 30ms 지연)
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

### 6.2 E2E 테스트 (Playwright)

**18개 테스트 파일, 728줄, 6개 프로젝트**:

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

### 6.3 CI/CD 파이프라인

```
git push → GitHub Actions
  ├── ci.yml ─── type-check → lint → build (Turbo)
  │              └── Lighthouse CI (perf>=80, a11y>=85)
  ├── deploy.yml ── Wiki 빌드 → GitHub Pages
  └── e2e.yml ──── Playwright (admin, hmg, wiki, user)
                    └── Artifact: playwright-report (7일 보존)

git push → Vercel (자동)
  ├── HMG, Admin, User, LLM Router, Storybook
  └── 각 앱별 vercel.json 설정
```

---

## 7. 파일 통계

### 전체 소스 파일

| 파일 유형 | 수 |
|----------|-----|
| TypeScript/TSX | 409 |
| Markdown | 83 |
| CSS | 18 |
| **합계** | **510** |

### 패키지별 TypeScript 파일 수

| 패키지/앱 | 파일 수 | LOC | 비율 |
|-----------|--------|-----|------|
| @hchat/ui | 139 | 15,017 | 53.7% |
| @hchat/storybook | 107 | 4,267 | 15.2% |
| @hchat/admin | 29 | 694 | 2.5% |
| @hchat/wiki | 21 | 1,518 | 5.4% |
| @hchat/llm-router | 14 | 2,367 | 8.5% |
| @hchat/user | 9 | 292 | 1.0% |
| @hchat/hmg | 7 | 643 | 2.3% |
| @hchat/tokens | 1 | 252 | 0.9% |
| **합계** | **327** | **25,050** | 89.5% |
| tests/e2e | 18 | 728 | 2.6% |
| 기타 (설정 등) | 64 | 2,205 | 7.9% |
| **총계** | **409** | **27,983** | 100% |

### 컴포넌트 분류

| 카테고리 | 컴포넌트 수 | 주요 항목 |
|---------|-----------|---------|
| 공유 | 8 | Badge, ThemeProvider, ThemeToggle, Toast, ErrorBoundary, EmptyState, Skeleton, LanguageToggle |
| Admin | 21 | StatCard, DataTable, StatusBadge, LoginPage, Dashboard 등 |
| Admin Auth | 5 | AuthProvider, ProtectedRoute, useAuth, authService, mockAuthService |
| ROI | 18 | ROISidebar, KPICard, InsightCard, SurveyBar, HeatmapCell 등 |
| ROI Charts | 5 | MiniLineChart, DonutChart, MiniBarChart, AreaChart, RadarChart |
| User | 17 | UserGNB, ChatSidebar, MessageBubble, StreamingIndicator 등 |
| HMG | 8 | GNB, HeroBanner, TabFilter, Footer, PillButton 등 |
| LLM Router | 6 | LRNavbar, ModelTable, CodeBlock, ProviderBadge 등 |
| **합계** | **87** | |

---

## 8. 배포 현황

| 앱 | URL | 플랫폼 | 빌드 |
|----|-----|--------|------|
| Wiki | https://sgtlim0.github.io | GitHub Pages | `next build` → `out/` |
| HMG | https://hchat-hmg.vercel.app | Vercel | Next.js |
| Admin | https://hchat-admin.vercel.app | Vercel | Next.js |
| User | https://hchat-user.vercel.app | Vercel | Next.js |
| LLM Router | https://hchat-llm-router.vercel.app | Vercel | Next.js |
| Storybook | https://hchat-wiki-storybook.vercel.app | Vercel | `storybook build` |

---

## 9. 접근성 & 국제화

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

## 10. 기술 부채 & 개선 영역

| 우선순위 | 영역 | 현재 상태 | 목표 |
|---------|------|----------|------|
| **HIGH** | 단위 테스트 | 0% | 80%+ (Vitest + Testing Library) |
| **HIGH** | API 연동 | 전체 Mock | MSW → 실제 API 연결 |
| **MEDIUM** | @hchat/ui 분리 | 15K줄 단일 패키지 | 서브 패키지 분리 (admin, user, llm-router) |
| **MEDIUM** | 실시간 대시보드 | 정적 Mock | WebSocket 실시간 |
| **LOW** | Storybook Tests | 없음 | Interaction Tests 도입 |
| **LOW** | 데스크톱 통합 | 별도 레포 | 모노레포 머지 |

---

## 11. 완료된 Phase 히스토리 (1-27)

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

---

## 12. 관련 레포지토리

| 레포 | 설명 | 규모 |
|------|------|------|
| **hchat-v2-extension** | Chrome Extension v4.5 | 107 파일, 21.5K LOC, 649 테스트 |
| **hchat-desktop** | PWA (React 19 + Zustand 5) | 15 페이지, 667 테스트 |

---

## 13. 스크립트 레퍼런스

```bash
# 개발
npm run dev:wiki          # localhost:3000
npm run dev:hmg           # localhost:3001
npm run dev:admin         # localhost:3002
npm run dev:user          # localhost:3003
npm run dev:llm-router    # localhost:3004
npm run dev:storybook     # localhost:6006

# 빌드
npm run build             # 전체 (Turbo)
npm run build:wiki        # Wiki → out/
npm run build:hmg         # HMG → out/
npm run build:admin       # Admin → out/
npm run build:user        # User → out/
npm run build:llm-router  # LLM Router → out/
npm run build:storybook   # Storybook → storybook-static/

# E2E 테스트
npm run test:e2e          # 전체
npm run test:e2e:admin    # Admin
npm run test:e2e:hmg      # HMG
npm run test:e2e:user     # User
npm run test:e2e:llm-router # LLM Router
npm run test:e2e:wiki     # Wiki
npm run test:e2e:cross    # Cross-app

# 번들 분석
npm run analyze:admin     # Admin 번들
npm run analyze:hmg       # HMG 번들
npm run analyze:user      # User 번들
npm run analyze:llm-router # LLM Router 번들

# 품질
npm run format            # Prettier
npm run lighthouse        # Lighthouse CI
```
