# H Chat Wiki - 현대차그룹 생성형 AI 서비스

npm workspaces 기반 모노레포 프로젝트로, H Chat(현대차그룹 생성형 AI 서비스, wrks.ai)의 위키, 공식사이트, 관리자 패널, 사용자 앱, LLM 라우터 등을 포함합니다.

## 프로젝트 개요

H Chat Wiki는 현대차그룹의 생성형 AI 서비스를 문서화하고 데모하는 통합 플랫폼입니다:

- **Wiki**: 마크다운 기반 문서화 시스템 (포트폴리오 허브)
- **HMG 공식사이트**: 현대 공식 H Chat 정보 제공
- **Admin 패널**: 관리자용 대시보드 및 모니터링 도구 (ROI 분석, 사용자 관리, 감사 로그)
- **User 앱**: 최종 사용자용 채팅, 번역, 문서 작성, OCR, 마이페이지 등 기능
- **LLM Router**: 86개 AI 모델 관리 및 테스트 플레이그라운드
- **Storybook**: UI 컴포넌트 문서 및 커뮤니티
- **Desktop**: PWA 기반 데스크톱 AI 챗 (별도 레포: hchat-desktop)

## 모노레포 구조

```
hchat-wiki/
├── packages/
│   ├── tokens/          # @hchat/tokens — CSS 디자인 토큰 (light/dark)
│   └── ui/              # @hchat/ui — 공유 UI 컴포넌트
│       └── src/
│           ├── hmg/     # HMG 공식사이트 컴포넌트
│           ├── admin/   # Admin 관리자 패널 컴포넌트
│           ├── roi/     # ROI 대시보드 컴포넌트
│           ├── user/    # 사용자 앱 컴포넌트
│           ├── llm-router/ # LLM Router 컴포넌트
│           └── i18n/    # 다국어 지원 (한영)
├── apps/
│   ├── wiki/            # @hchat/wiki — Next.js 마크다운 위키 (GitHub Pages)
│   ├── hmg/             # @hchat/hmg — Next.js HMG 공식사이트 (Vercel)
│   ├── admin/           # @hchat/admin — Next.js 관리자 패널 (Vercel)
│   ├── user/            # @hchat/user — Next.js 사용자 앱 (Vercel)
│   ├── llm-router/      # @hchat/llm-router — Next.js LLM 라우터 (Vercel)
│   ├── desktop/         # @hchat/desktop — 데스크톱 앱 (별도 레포 연동, Vercel)
│   └── storybook/       # @hchat/storybook — Storybook 9 컴포넌트 문서 (Vercel)
├── design/              # 디자인 파일 (.pen)
└── docs/                # 설계 및 구현 문서
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
| Playwright | 1.58.2 | E2E 테스트 |

## 앱 소개

| 앱 | 설명 | URL | 개발 포트 |
|---|---|---|---|
| Wiki | 마크다운 기반 문서화 위키 (포트폴리오 허브) | https://sgtlim0.github.io | 3000 |
| HMG | HMG 공식사이트 데모 | https://hchat-hmg.vercel.app | 3001 |
| Admin | 관리자 패널 (대시보드, ROI, 부서 관리, 감사 로그, SSO) | https://hchat-admin.vercel.app | 3002 |
| User | 사용자 앱 (채팅, 번역, 문서 작성, OCR, 마이페이지) | https://hchat-user.vercel.app | 3003 |
| LLM Router | AI 모델 관리 및 테스트 플레이그라운드 (86개 모델) | https://hchat-llm-router.vercel.app | 3004 |
| Storybook | UI 컴포넌트 문서 (73개+ 스토리) | https://hchat-storybook.vercel.app | 6006 |
| Desktop | PWA 데스크톱 AI 챗 (React 19, Zustand, 15페이지) | https://hchat-desktop.vercel.app | 5173 |

## 시작하기

### 설치

```bash
# 의존성 설치
npm install
```

### 개발 서버 실행

각 앱을 독립적으로 실행할 수 있습니다:

```bash
# Wiki (localhost:3000)
npm run dev:wiki

# HMG 공식사이트 (localhost:3001)
npm run dev:hmg

# Admin 패널 (localhost:3002)
npm run dev:admin

# User 앱 (localhost:3003)
npm run dev:user

# LLM Router (localhost:3004)
npm run dev:llm-router

# Storybook (localhost:6006)
npm run dev:storybook
```

또는 모든 앱을 동시에 실행하려면:

```bash
# 터미널에서 각각 다른 탭으로 실행
npm run dev:wiki &
npm run dev:hmg &
npm run dev:admin &
npm run dev:user &
npm run dev:llm-router &
npm run dev:storybook &
```

### 빌드

```bash
# 모든 앱 빌드 (Turborepo 사용)
npm run build

# 특정 앱만 빌드
npm run build:wiki
npm run build:hmg
npm run build:admin
npm run build:user
npm run build:llm-router
npm run build:storybook
```

## 패키지 의존성

```
@hchat/tokens
    ↓
@hchat/ui ← 공유 UI 컴포넌트
    ↓
    ├── @hchat/wiki
    ├── @hchat/hmg
    ├── @hchat/admin
    ├── @hchat/user
    ├── @hchat/llm-router
    ├── @hchat/desktop
    └── @hchat/storybook
```

- **@hchat/tokens**: 모든 앱에서 CSS 변수로 import (80+ 디자인 토큰)
- **@hchat/ui**: 공유 컴포넌트를 경로별로 export (100+ 컴포넌트)
  - `@hchat/ui`: 기본 컴포넌트 (Badge, ThemeProvider, FeatureCard, Skeleton, Toast, ErrorBoundary, EmptyState)
  - `@hchat/ui/hmg`: HMG 컴포넌트
  - `@hchat/ui/admin`: Admin 컴포넌트 + 서비스 레이어
  - `@hchat/ui/roi`: ROI 대시보드 컴포넌트 (5가지 차트 타입)
  - `@hchat/ui/user`: User 앱 컴포넌트 + 서비스 레이어
  - `@hchat/ui/llm-router`: LLM Router 컴포넌트 + 서비스 레이어
  - `@hchat/ui/i18n`: 다국어 지원 (한영)

## 주요 기능

### Wiki (@hchat/wiki)
- 마크다운 기반 콘텐츠
- 자동 사이드바 네비게이션
- 문법 강조 (Syntax Highlighting)
- GitHub Pages 배포

### HMG 공식사이트 (@hchat/hmg)
- 홈페이지, 출판물, 가이드, 대시보드 페이지
- Global Navigation Bar (GNB)
- Hero Banner, 카드 레이아웃
- 반응형 디자인

### Admin 패널 (@hchat/admin)
- 대시보드 (메트릭, 사용량)
- ROI 분석 (Adoption, Productivity, Organization, Sentiment, Analysis)
- 부서별 관리
- 사용자 관리
- 감사 로그 조회
- SSO 설정
- 모델 가격 관리
- 프롬프트 라이브러리
- 에이전트 모니터링
- 기능 사용 현황

### User 앱 (@hchat/user)
- 채팅 인터페이스 (SSE 스트리밍)
- 다양한 Assistant (채팅, 번역, 문서 작성, OCR 등)
- 커스텀 Assistant 생성 기능
- 파일 업로드
- 마이페이지

### LLM Router (@hchat/llm-router)
- 86개 AI 모델 관리 (OpenAI, Anthropic, Google, Mistral, Ollama 등)
- 모델 테스트 플레이그라운드
- API 키 관리
- 10개 페이지 인터페이스
- 대시보드 및 통계

### Desktop (@hchat/desktop)
- PWA 기반 AI 챗 애플리케이션 (React 19, TypeScript 5.9, Vite 7)
- 15개 페이지: Home, Chat, Group Chat, Agent, Swarm, Debate, AI Tools, Image Gen 등
- 16개 Zustand 스토어, Dexie IndexedDB 영속성
- Modal Serverless 백엔드 (FastAPI)
- 667개 테스트, 83% 커버리지
- 별도 레포: https://github.com/sgtlim0/hchat-desktop

### 공유 UX 컴포넌트 (@hchat/ui)
- **Skeleton**: 로딩 상태용 스켈레톤 컴포넌트 (Pulse, Text, Card, Table, Chart)
- **Toast**: 전역 토스트 알림 시스템 (success, error, warning, info)
- **ErrorBoundary**: React 에러 바운더리 + 폴백 UI
- **EmptyState**: 빈 상태 안내 컴포넌트
- **Form Validation**: validate(), useFormValidation(), patterns 유틸리티

### Storybook
- 모든 UI 컴포넌트의 인터랙티브 카탈로그 (73개+ 스토리)
- 다크 모드 테마 toggle
- 접근성 검사 (WCAG 2.1 AA)
- 컴포넌트별 Props 문서

## 다국어 지원

Admin과 User 앱에서 한글/영문 다국어 지원:

```typescript
// @hchat/ui/i18n에서 제공
import { useLanguage } from '@hchat/ui/i18n'

const { language, t, toggleLanguage } = useLanguage()
```

## 다크 모드

모든 앱에서 ThemeProvider를 통한 다크 모드 지원:

```typescript
import { ThemeProvider, ThemeToggle } from '@hchat/ui'

export default function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />
      {/* ... */}
    </ThemeProvider>
  )
}
```

## 성능 최적화

### 번들 분석 (Bundle Analyzer)

`@next/bundle-analyzer`를 통한 번들 크기 분석:

```bash
# Admin 앱 번들 분석 (브라우저에서 HTML 리포트 자동 오픈)
npm run analyze:admin
```

### 코드 스플리팅 (Dynamic Import)

22개 페이지에 `next/dynamic`을 적용하여 초기 번들 크기를 최적화합니다:

- **Admin**: ROI 8개 페이지 + 비ROI 8개 페이지 (departments, audit-logs, sso, providers, models, prompts, agents, features)
- **User**: 5개 페이지 (chat, translate, docs, ocr, my-page)
- **LLM Router**: 1개 페이지 (models)

로딩 중에는 `@hchat/ui`의 Skeleton 컴포넌트가 fallback으로 표시됩니다.

### Turbo 빌드 캐시

`turbo.json`에 `inputs` 필드를 설정하여 관련 없는 파일(docs, e2e 등) 변경 시 불필요한 리빌드를 방지합니다.

## E2E 테스트

Playwright를 이용한 포괄적인 E2E 테스트 커버리지:

```bash
# 모든 E2E 테스트 실행
npm run test:e2e

# UI 모드로 대화형 실행
npm run test:e2e:ui

# 특정 앱 테스트만 실행
npm run test:e2e:wiki
npm run test:e2e:admin
npm run test:e2e:hmg
npm run test:e2e:user
npm run test:e2e:llm-router

# 크로스 앱 E2E 테스트
npm run test:e2e:cross
```

테스트 파일: `tests/e2e/*.spec.ts` (18개 E2E 테스트 파일)

주요 테스트 시나리오:
- 페이지 렌더링 및 네비게이션
- 사용자 상호작용 (클릭, 입력, 폼 제출)
- 다크 모드 토글 (전 앱 일관성)
- 반응형 디자인 확인 (모바일/태블릿/데스크톱)
- 접근성 검사 (axe-core WCAG 2.1 AA)
- 크로스 앱 네비게이션

## Lighthouse CI

성능 및 접근성 측정:

```bash
# Lighthouse CI 실행
npm run lighthouse

# 결과 확인
# 각 앱별 Performance, Accessibility, Best Practices, SEO 점수
```

측정 항목:
- Performance (LCP, FID, CLS)
- Accessibility (WCAG 2.1 AA)
- Best Practices
- SEO

## 접근성 (Accessibility)

WCAG 2.1 AA 표준을 준수:

- **Skip Navigation**: 메인 콘텐츠로 건너뛰기 링크
- **ARIA Labels**: 모든 인터랙티브 요소에 aria-label 추가
- **Screen Reader**: sr-only 클래스로 스크린 리더용 텍스트 제공
- **Keyboard Navigation**: 모든 기능이 키보드로 접근 가능
- **Color Contrast**: 텍스트와 배경 색상 대비 최소 4.5:1
- **Focus Indicators**: 명확한 포커스 표시
- **Form Labels**: 모든 폼 입력에 레이블 연결

```typescript
// 접근성 좋은 예
<button aria-label="메뉴 열기" onClick={toggleMenu}>
  <MenuIcon />
</button>

// 스크린 리더용 텍스트
<span className="sr-only">현재 선택됨</span>
```

## 배포

### Wiki (GitHub Pages)
- GitHub Actions 자동 배포
- 빌드 결과: `apps/wiki/out/`
- URL: https://sgtlim0.github.io

### HMG / Admin / User / LLM Router / Desktop / Storybook (Vercel)
- Vercel Git 연동 자동 배포
- 각 앱별 독립적인 배포 설정
- URLs:
  - HMG: https://hchat-hmg.vercel.app
  - Admin: https://hchat-admin.vercel.app
  - User: https://hchat-user.vercel.app
  - LLM Router: https://hchat-llm-router.vercel.app
  - Desktop: https://hchat-desktop.vercel.app
  - Storybook: https://hchat-storybook.vercel.app

## 프로젝트 규모

| 항목 | 수량 |
|---|---|
| 앱 | 7개 |
| UI 패키지 | 2개 |
| UI 컴포넌트 | 100개+ |
| 서비스 레이어 | 3개 (Admin, User, LLM Router) |
| 페이지 | 60개+ |
| Dynamic Import 페이지 | 22개 |
| Storybook 스토리 | 73개+ |
| CSS 디자인 토큰 | 80개+ |
| E2E 테스트 파일 | 18개 |
| Lighthouse CI 대상 | 6개 URL |
| AI 모델 (LLM Router) | 86개 |

## 스크립트

### 개발
```bash
npm run dev:wiki          # Wiki 개발 서버 (localhost:3000)
npm run dev:hmg           # HMG 개발 서버 (localhost:3001)
npm run dev:admin         # Admin 개발 서버 (localhost:3002)
npm run dev:user          # User 개발 서버 (localhost:3003)
npm run dev:llm-router    # LLM Router 개발 서버 (localhost:3004)
npm run dev:storybook     # Storybook 개발 서버 (localhost:6006)
```

### 빌드
```bash
npm run build             # 모든 앱 빌드 (Turborepo)
npm run build:wiki        # Wiki만 빌드
npm run build:hmg         # HMG만 빌드
npm run build:admin       # Admin만 빌드
npm run build:user        # User만 빌드
npm run build:llm-router  # LLM Router만 빌드
npm run build:storybook   # Storybook만 빌드
```

### 번들 분석
```bash
npm run analyze:admin     # Admin 번들 분석 (HTML 리포트)
npm run analyze:hmg       # HMG 번들 분석
npm run analyze:user      # User 번들 분석
npm run analyze:llm-router # LLM Router 번들 분석
```

### 품질 관리
```bash
npm run lint              # 모든 앱 ESLint
npm run test:e2e          # 모든 E2E 테스트 (Playwright)
npm run test:e2e:ui       # UI 모드로 E2E 테스트
npm run test:e2e:admin    # Admin 전용 E2E 테스트
npm run test:e2e:hmg      # HMG 전용 E2E 테스트
npm run test:e2e:user     # User 전용 E2E 테스트
npm run test:e2e:llm-router # LLM Router 전용 E2E 테스트
npm run test:e2e:wiki     # Wiki 전용 E2E 테스트
npm run test:e2e:cross    # 크로스 앱 E2E 테스트
npm run lighthouse        # Lighthouse CI 실행
npm run format            # Prettier 전체 포맷
```

## 파일 구조

```
hchat-wiki/
├── apps/
│   ├── wiki/
│   │   ├── app/              # Next.js App Router
│   │   ├── content/          # 마크다운 문서
│   │   ├── components/       # 로컬 컴포넌트
│   │   ├── lib/              # 유틸리티 함수
│   │   ├── public/           # 정적 자산
│   │   └── e2e/              # E2E 테스트
│   │
│   ├── hmg/
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # 로컬 컴포넌트
│   │   ├── public/           # 정적 자산
│   │   └── e2e/              # E2E 테스트
│   │
│   ├── admin/
│   │   ├── app/              # Next.js App Router
│   │   ├── app/roi/          # ROI 대시보드 페이지
│   │   ├── components/       # 로컬 컴포넌트
│   │   ├── public/           # 정적 자산
│   │   └── e2e/              # E2E 테스트
│   │
│   ├── user/
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # 로컬 컴포넌트
│   │   └── e2e/              # E2E 테스트
│   │
│   ├── llm-router/
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # 로컬 컴포넌트
│   │   ├── public/           # 정적 자산
│   │   └── e2e/              # E2E 테스트
│   │
│   ├── desktop/
│   │   ├── app/              # Next.js App Router (별도 레포 연동)
│   │   └── components/       # 로컬 컴포넌트
│   │
│   └── storybook/
│       ├── .storybook/       # Storybook 설정
│       └── stories/          # 스토리 정의 (73개+)
│
├── packages/
│   ├── tokens/
│   │   └── styles/
│   │       └── tokens.css    # 디자인 토큰 CSS 변수 (80개+)
│   │
│   └── ui/
│       └── src/
│           ├── index.ts      # 기본 export (Skeleton, Toast, ErrorBoundary 등)
│           ├── validation.ts # 폼 검증 유틸리티
│           ├── hmg/          # HMG 컴포넌트
│           ├── admin/        # Admin 컴포넌트 + services/
│           ├── roi/          # ROI 대시보드 컴포넌트 (5가지 차트)
│           ├── user/         # User 앱 컴포넌트 + services/
│           ├── llm-router/   # LLM Router 컴포넌트 + services/
│           └── i18n/         # 다국어 지원 (한영)
│
├── docs/                     # 설계 및 구현 문서
├── design/                   # 디자인 파일
├── turbo.json                # Turborepo 설정
├── package.json              # Root 워크스페이스 정의
├── playwright.config.ts      # E2E 테스트 설정
└── README.md                 # 이 파일
```

## 개발 가이드

### 새 컴포넌트 만들기

1. **공유 컴포넌트**는 `packages/ui/src/`에 작성
2. **앱 특화 컴포넌트**는 각 `apps/*/components/`에 작성
3. `packages/ui/src/*/index.ts`에서 export
4. Storybook 스토리 추가

### 스타일링

- 모든 앱에서 Tailwind CSS 4 사용
- `@theme inline`으로 `@hchat/tokens`의 CSS 변수 통합
- 라이트/다크 모드는 `.dark` 클래스로 처리

### 타입 안정성

- TypeScript 5 사용 필수
- `tsc --noEmit`으로 타입 검사
- 각 앱에서 `npm run type-check`

### 테스트

- Playwright E2E 테스트 사용
- `playwright.config.ts`에서 프로젝트별 구성

## 문제 해결

### 빌드 실패
1. 의존성 다시 설치: `npm install`
2. 캐시 초기화: `npm run build --clean`
3. Node.js 버전 확인 (18+ 필수)

### 포트 충돌
- 개별 앱 포트 설정이 충돌하면 `-p` 플래그로 변경:
  ```bash
  npm run dev -w @hchat/wiki -- -p 3010
  ```

### Storybook에서 컴포넌트 못 찾음
1. `packages/ui/src/*/index.ts`에서 export 확인
2. `.storybook/main.ts`의 alias 설정 확인
3. 캐시 삭제 후 재시작: `rm -rf node_modules/.cache`

## 관련 프로젝트

이 모노레포 외에 H Chat 생태계를 구성하는 별도 레포지토리:

| 프로젝트 | 레포 | 설명 | 기술 스택 |
|---------|------|------|----------|
| H Chat Extension | [hchat-v2-extension](https://github.com/sgtlim0/hchat-v2-extension) | Chrome Extension v4.5 — 16개 AI 도구, 에이전트, 토론 엔진 | TypeScript, React 18, Vite, Manifest V3 |
| H Chat Desktop | [hchat-desktop](https://github.com/sgtlim0/hchat-desktop) | PWA 데스크톱 AI 챗 — 15페이지, 멀티 에이전트 | React 19, Zustand, Dexie, Modal |

- **Extension**: 107개 소스파일, 21,500+ LOC, 649 테스트
- **Desktop**: 667 테스트, 83% 커버리지, Feature-Sliced Design

## 라이선스

MIT

## 기여

이 프로젝트는 현대차그룹 내부 프로젝트입니다.

---

**Last Updated**: 2026-03-04
**Monorepo Version**: 0.1.0
