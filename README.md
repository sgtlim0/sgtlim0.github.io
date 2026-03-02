# H Chat Wiki - 현대차그룹 생성형 AI 서비스

npm workspaces 기반 모노레포 프로젝트로, H Chat(현대차그룹 생성형 AI 서비스, wrks.ai)의 위키, 공식사이트, 관리자 패널, 사용자 앱 등을 포함합니다.

## 프로젝트 개요

H Chat Wiki는 현대차그룹의 생성형 AI 서비스를 문서화하고 데모하는 통합 플랫폼입니다:

- **Wiki**: 마크다운 기반 문서화 시스템
- **HMG 공식사이트**: 현대 공식 H Chat 정보 제공
- **Admin 패널**: 관리자용 대시보드 및 모니터링 도구
- **User 앱**: 최종 사용자용 채팅, 번역, 문서 작성 등 기능
- **Storybook**: UI 컴포넌트 문서 및 커뮤니티

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
│           └── i18n/    # 다국어 지원 (한영)
├── apps/
│   ├── wiki/            # @hchat/wiki — Next.js 마크다운 위키 (GitHub Pages)
│   ├── hmg/             # @hchat/hmg — Next.js HMG 공식사이트 (Vercel)
│   ├── admin/           # @hchat/admin — Next.js 관리자 패널 (Vercel)
│   ├── user/            # @hchat/user — Next.js 사용자 앱 (Vercel 예정)
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
| Wiki | 마크다운 기반 문서화 위키 | https://sgtlim0.github.io | 3000 |
| HMG | HMG 공식사이트 데모 | https://hchat-hmg.vercel.app | 3001 |
| Admin | 관리자 패널 (대시보드, ROI, 부서 관리, 감사 로그, SSO) | https://hchat-admin.vercel.app | 3002 |
| User | 사용자 앱 (채팅, 번역, 문서 작성, OCR, 마이페이지) | 배포 예정 | 3003 |
| Storybook | UI 컴포넌트 문서 | https://hchat-wiki-storybook.vercel.app | 6006 |

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
    └── @hchat/storybook
```

- **@hchat/tokens**: 모든 앱에서 CSS 변수로 import
- **@hchat/ui**: 공유 컴포넌트를 경로별로 export
  - `@hchat/ui`: 기본 컴포넌트 (Badge, ThemeProvider, FeatureCard)
  - `@hchat/ui/hmg`: HMG 컴포넌트
  - `@hchat/ui/admin`: Admin 컴포넌트
  - `@hchat/ui/roi`: ROI 대시보드 컴포넌트
  - `@hchat/ui/user`: User 앱 컴포넌트

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
- 채팅 인터페이스
- 다양한 Assistant (채팅, 번역, 문서 작성, OCR 등)
- 파일 업로드
- 마이페이지

### Storybook
- 모든 UI 컴포넌트의 인터랙티브 카탈로그
- 다크 모드 테마 toggle
- 접근성 검사
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

## 배포

### Wiki (GitHub Pages)
- GitHub Actions 자동 배포
- 빌드 결과: `apps/wiki/out/`
- URL: https://sgtlim0.github.io

### HMG / Admin / Storybook (Vercel)
- Vercel Git 연동 자동 배포
- Separate projects on Vercel
- 각 앱별 독립적인 배포 설정

### User (Vercel 예정)
- 개발 중인 배포 예정

## 프로젝트 규모

| 항목 | 수량 |
|---|---|
| 앱 | 5개 |
| UI 패키지 | 2개 |
| UI 컴포넌트 | 60개+ |
| 페이지 | 40개+ |
| Storybook 스토리 | 46개+ |
| CSS 토큰 변수 | ~80개 |

## 스크립트

### 개발
```bash
npm run dev:wiki          # Wiki 개발 서버
npm run dev:hmg           # HMG 개발 서버
npm run dev:admin         # Admin 개발 서버
npm run dev:user          # User 개발 서버
npm run dev:storybook     # Storybook 개발 서버
```

### 빌드
```bash
npm run build             # 모든 앱 빌드
npm run build:wiki        # Wiki만 빌드
npm run build:hmg         # HMG만 빌드
npm run build:admin       # Admin만 빌드
npm run build:user        # User만 빌드
npm run build:storybook   # Storybook만 빌드
```

### 품질 관리
```bash
npm run lint              # 모든 앱 ESLint
npm run test:e2e          # 모든 E2E 테스트
npm run test:e2e:ui       # UI 모드로 E2E 테스트
npm run test:e2e:admin    # Admin 전용 E2E 테스트
npm run test:e2e:hmg      # HMG 전용 E2E 테스트
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
│   │   └── public/           # 정적 자산
│   │
│   ├── hmg/
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # 로컬 컴포넌트
│   │   └── public/           # 정적 자산
│   │
│   ├── admin/
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # 로컬 컴포넌트
│   │   └── public/           # 정적 자산
│   │
│   ├── user/
│   │   ├── app/              # Next.js App Router
│   │   └── components/       # 로컬 컴포넌트
│   │
│   └── storybook/
│       ├── .storybook/       # Storybook 설정
│       └── stories/          # 스토리 정의
│
├── packages/
│   ├── tokens/
│   │   └── styles/
│   │       └── tokens.css    # 디자인 토큰 CSS 변수
│   │
│   └── ui/
│       └── src/
│           ├── index.ts      # 기본 export
│           ├── hmg/          # HMG 컴포넌트
│           ├── admin/        # Admin 컴포넌트
│           ├── roi/          # ROI 대시보드 컴포넌트
│           ├── user/         # User 앱 컴포넌트
│           └── i18n/         # 다국어 지원
│
├── docs/                     # 설계 및 구현 문서
├── design/                   # 디자인 파일
├── turbo.json                # Turborepo 설정
├── package.json              # Root 워크스페이스 정의
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

## 라이선스

MIT

## 기여

이 프로젝트는 현대차그룹 내부 프로젝트입니다.

---

**Last Updated**: 2026-03-03
**Monorepo Version**: 0.1.0
