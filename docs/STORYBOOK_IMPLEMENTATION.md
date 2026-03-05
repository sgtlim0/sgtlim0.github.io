# H Chat Wiki — Storybook 구현 방안

## 1. 개요

현재 hchat-wiki 레포지토리(Next.js 16 + Tailwind CSS 4)의 9개 컴포넌트를 Storybook으로 문서화하고, `.pen` 디자인 파일의 6개 재사용 컴포넌트를 React 코드로 1:1 매핑하여 디자인-코드 일관성을 검증하는 구현 방안입니다.

### 목표

1. 위키 컴포넌트 9개를 Storybook에서 격리 테스트
2. `.pen` 디자인 토큰 ↔ CSS 변수 일치 검증
3. 라이트/다크 모드 시각적 회귀 테스트
4. 향후 hchat-v2-extension의 12개 컴포넌트까지 확장할 기반 구축

---

## 2. 현재 위키 레포 분석

### 2.1 기술 스택

| 기술 | 버전 | 비고 |
|------|------|------|
| Next.js | 16.1.1 | App Router, `output: 'export'` |
| React | 19.2.3 | |
| Tailwind CSS | 4 | `@theme inline` + CSS 변수 |
| TypeScript | 5 | |
| lucide-react | 0.575.0 | 아이콘 |
| react-markdown | 10.1.0 | 마크다운 렌더링 |

### 2.2 컴포넌트 인벤토리 (9개)

| 컴포넌트 | 파일 | 줄 수 | 타입 | Next.js 의존성 |
|----------|------|-------|------|---------------|
| `Sidebar` | Sidebar.tsx | 139 | Client | `next/link`, `next/navigation` |
| `HomePage` | HomePage.tsx | 128 | Client | `next/link` |
| `DocsLayout` | DocsLayout.tsx | 87 | Client | 없음 |
| `MarkdownRenderer` | MarkdownRenderer.tsx | ~110 | Client | 없음 |
| `Breadcrumb` | Breadcrumb.tsx | 36 | Server-safe | 없음 |
| `TableOfContents` | TableOfContents.tsx | ~57 | Server-safe | 없음 |
| `PageNavigation` | PageNavigation.tsx | 55 | Server-safe | 없음 |
| `ThemeProvider` | ThemeProvider.tsx | 80 | Client | 없음 (localStorage) |
| `ThemeToggle` | ThemeToggle.tsx | 22 | Client | ThemeProvider 의존 |

### 2.3 디자인 토큰 현황

`app/globals.css`에 정의된 CSS 변수 — Tailwind v4 `@theme inline` 매핑:

```
:root (Light)                    .dark (Dark)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--primary: #2563EB              --primary: #3B82F6
--bg-page: #FFFFFF              --bg-page: #111827
--bg-sidebar: #F8FAFC           --bg-sidebar: #1F2937
--bg-card: #F8FAFC              --bg-card: #1F2937
--bg-hero: #EFF6FF              --bg-hero: #1E3A5F
--text-primary: #0F172A         --text-primary: #F1F5F9
--text-secondary: #64748B       --text-secondary: #94A3B8
--border: #E2E8F0               --border: #374151
```

### 2.4 .pen 디자인 파일 컴포넌트 매핑

| .pen 컴포넌트 | ID | 대응하는 React 컴포넌트 | 매핑 상태 |
|--------------|-----|----------------------|----------|
| `Wiki/NavItem` | `pKthN` | `Sidebar` 내 `renderNavItem()` | ✅ 구현됨 |
| `Wiki/NavGroupHeader` | `2ITpx` | `Sidebar` 내 그룹 헤더 | ✅ 구현됨 |
| `Wiki/FeatureCard` | `ZUwkZ` | `HomePage` 내 기능 카드 | ✅ 구현됨 |
| `Wiki/Badge` | `iE8nD` | `DocsLayout` 내 뱃지 | ✅ 구현됨 |
| `Wiki/Breadcrumb` | `b4345` | `Breadcrumb.tsx` | ✅ 구현됨 |
| `Wiki/SearchBar` | `7d4mW` | `Sidebar` 내 검색바 | ✅ 구현됨 |

---

## 3. Storybook 설정

### 3.1 프레임워크 선택: `@storybook/nextjs`

Next.js App Router + `next/link` + `next/navigation` 의존성을 자동 처리하기 위해 Next.js 전용 프레임워크를 사용합니다.

```bash
npx storybook@latest init --type nextjs
```

### 3.2 설치 패키지

```bash
npm install -D \
  @storybook/nextjs \
  @storybook/addon-essentials \
  @storybook/addon-themes \
  @storybook/addon-a11y \
  @storybook/addon-interactions \
  @storybook/test \
  storybook
```

### 3.3 디렉토리 구조

```
hchat-wiki/
├── .storybook/
│   ├── main.ts                # Storybook 설정
│   ├── preview.tsx            # 글로벌 데코레이터, 테마, CSS
│   └── manager.ts             # Storybook UI 커스텀 (브랜딩)
├── stories/
│   ├── foundations/            # 디자인 토큰 문서화
│   │   ├── Colors.mdx
│   │   ├── Typography.mdx
│   │   └── DesignTokens.mdx
│   ├── atoms/                 # .pen 재사용 컴포넌트 1:1 매핑
│   │   ├── Badge.stories.tsx
│   │   ├── NavItem.stories.tsx
│   │   ├── NavGroupHeader.stories.tsx
│   │   ├── SearchBar.stories.tsx
│   │   └── ThemeToggle.stories.tsx
│   ├── molecules/             # 복합 컴포넌트
│   │   ├── Breadcrumb.stories.tsx
│   │   ├── TableOfContents.stories.tsx
│   │   ├── PageNavigation.stories.tsx
│   │   ├── FeatureCard.stories.tsx
│   │   └── MarkdownRenderer.stories.tsx
│   └── organisms/             # 페이지 레벨 컴포넌트
│       ├── Sidebar.stories.tsx
│       ├── HomePage.stories.tsx
│       └── DocsLayout.stories.tsx
├── components/                # (기존) React 컴포넌트
├── app/globals.css            # (기존) 디자인 토큰
└── wiki.pen                   # (기존) 디자인 파일
```

### 3.4 `.storybook/main.ts`

```typescript
import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-themes',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {
      nextConfigPath: '../next.config.ts',
    },
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: 'tag',
  },
}

export default config
```

### 3.5 `.storybook/preview.tsx`

```tsx
import type { Preview } from '@storybook/react'
import { withThemeByClassName } from '@storybook/addon-themes'
import '../app/globals.css'

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: {
        '☀️ Light': '',
        '🌙 Dark': 'dark',
      },
      defaultTheme: '☀️ Light',
    }),
  ],
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true }, // CSS 변수로 배경 제어
    viewport: {
      viewports: {
        wikiDesktop: {
          name: 'Wiki Desktop (1440px)',
          styles: { width: '1440px', height: '900px' },
        },
        wikiContent: {
          name: 'Content Area (1160px)',
          styles: { width: '1160px', height: '900px' },
        },
        wikiSidebar: {
          name: 'Sidebar Only (280px)',
          styles: { width: '280px', height: '900px' },
        },
      },
    },
  },
}

export default preview
```

### 3.6 `.storybook/manager.ts`

```typescript
import { addons } from '@storybook/manager-api'

addons.setConfig({
  theme: {
    base: 'light',
    brandTitle: 'H Chat Wiki Design System',
    brandUrl: 'https://hchat-wiki.vercel.app',
    colorPrimary: '#2563EB',
    colorSecondary: '#3B82F6',
  },
})
```

---

## 4. 컴포넌트 추출 계획

현재 일부 UI 요소가 부모 컴포넌트 안에 인라인으로 존재합니다.
Storybook에서 개별 테스트를 위해 독립 컴포넌트로 추출합니다.

### 4.1 추출 대상

| 현재 위치 | 추출 컴포넌트 | .pen 매핑 | 파일 |
|-----------|-------------|-----------|------|
| `Sidebar.tsx` 내 `renderNavItem()` | `NavItem` | `Wiki/NavItem` | `components/NavItem.tsx` |
| `Sidebar.tsx` 내 그룹 헤더 JSX | `NavGroupHeader` | `Wiki/NavGroupHeader` | `components/NavGroupHeader.tsx` |
| `Sidebar.tsx` 내 검색바 JSX | `SearchBar` | `Wiki/SearchBar` | `components/SearchBar.tsx` |
| `HomePage.tsx` 내 기능 카드 JSX | `FeatureCard` | `Wiki/FeatureCard` | `components/FeatureCard.tsx` |
| `DocsLayout.tsx` 내 뱃지 JSX | `Badge` | `Wiki/Badge` | `components/Badge.tsx` |

### 4.2 추출 원칙

```
1. Props 인터페이스를 export하여 Storybook argTypes 자동 생성
2. 순수 Presentational 컴포넌트로 추출 (상태 없음)
3. 부모 컴포넌트는 추출된 컴포넌트를 import하여 사용
4. .pen 디자인 파일의 속성과 1:1 대응하는 props 설계
```

### 4.3 추출 예시 — `NavItem`

**Before** (Sidebar.tsx 인라인):
```tsx
const renderNavItem = (item: NavItemConfig) => {
  const active = isActiveSlug(pathname, item.slug);
  const Icon = iconMap[item.icon];
  return (
    <Link href={slugToHref(item.slug)}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ...`}>
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{item.title}</span>
    </Link>
  );
};
```

**After** (components/NavItem.tsx):
```tsx
import Link from 'next/link';
import type { ComponentType } from 'react';

export interface NavItemProps {
  title: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
  active?: boolean;
}

export default function NavItem({ title, href, icon: Icon, active = false }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
        active
          ? 'bg-primary-light text-primary font-medium'
          : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
      }`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{title}</span>
    </Link>
  );
}
```

---

## 5. 스토리 작성 명세

### 5.1 Atoms (5개 스토리 파일, 16개 변형)

#### `Badge.stories.tsx`

| Story | args | 설명 |
|-------|------|------|
| `V2` | `{ label: 'v2' }` | 기본 뱃지 |
| `V3` | `{ label: 'v3' }` | 최신 버전 |
| `CoreFeature` | `{ label: '핵심 기능' }` | 한글 뱃지 |
| `Beginner` | `{ label: '초보자 가이드' }` | 긴 텍스트 |

#### `NavItem.stories.tsx`

| Story | args | 설명 |
|-------|------|------|
| `Default` | `{ title: 'AI 채팅', icon: MessageSquare, href: '/chat/ai-chat' }` | 비활성 상태 |
| `Active` | `{ ..., active: true }` | 활성 상태 (배경 하이라이트) |
| `NoIcon` | `{ title: 'FAQ', href: '/faq' }` | 아이콘 없음 |

#### `NavGroupHeader.stories.tsx`

| Story | args | 설명 |
|-------|------|------|
| `Expanded` | `{ title: 'AI 대화', isOpen: true }` | 펼침 (▼) |
| `Collapsed` | `{ title: 'AI 대화', isOpen: false }` | 접힘 (▶) |

#### `SearchBar.stories.tsx`

| Story | args | 설명 |
|-------|------|------|
| `Default` | `{ placeholder: '문서 검색...' }` | 기본 상태 |
| `Focused` | `{ focused: true }` | 포커스 상태 |

#### `ThemeToggle.stories.tsx`

| Story | 설명 |
|-------|------|
| `Light` | 라이트 모드 (Sun 아이콘) |
| `Dark` | 다크 모드 (Moon 아이콘) |

### 5.2 Molecules (5개 스토리 파일, 15개 변형)

#### `Breadcrumb.stories.tsx`

| Story | items | 설명 |
|-------|-------|------|
| `TwoLevels` | `[홈, 빠른 시작]` | 2단계 경로 |
| `ThreeLevels` | `[홈, AI 대화, AI 채팅]` | 3단계 경로 |
| `HomeOnly` | `[홈]` | 루트 페이지 |

#### `TableOfContents.stories.tsx`

| Story | headings | 설명 |
|-------|----------|------|
| `WithHeadings` | h2 3개 + h3 5개 | 일반적인 TOC |
| `DeepNesting` | h2 2개 + h3 10개 | 깊은 중첩 |
| `Empty` | `[]` | 헤딩 없음 |

#### `PageNavigation.stories.tsx`

| Story | prev/next | 설명 |
|-------|-----------|------|
| `BothLinks` | prev + next | 양쪽 모두 |
| `FirstPage` | next only | 첫 페이지 |
| `LastPage` | prev only | 마지막 페이지 |

#### `FeatureCard.stories.tsx`

| Story | args | 설명 |
|-------|------|------|
| `Default` | `{ title: '멀티 AI', description: '...', icon: Zap }` | 기본 카드 |
| `Hovered` | pseudo-state: hover | 호버 효과 |
| `Grid` | 6개 카드 그리드 | 홈페이지 레이아웃 |

#### `MarkdownRenderer.stories.tsx`

| Story | content | 설명 |
|-------|---------|------|
| `BasicMarkdown` | h1, h2, p, ul | 기본 마크다운 |
| `CodeBlock` | TypeScript 코드 블록 | 구문 강조 |
| `Table` | 마크다운 테이블 | 표 렌더링 |
| `Mixed` | 실제 페이지 콘텐츠 | 종합 테스트 |

### 5.3 Organisms (3개 스토리 파일, 9개 변형)

#### `Sidebar.stories.tsx`

| Story | 설명 | viewport |
|-------|------|----------|
| `Default` | 전체 사이드바 (라이트) | wikiSidebar |
| `AllCollapsed` | 모든 그룹 접힘 | wikiSidebar |
| `WithActivePage` | `/chat/ai-chat` 활성 | wikiSidebar |

#### `HomePage.stories.tsx`

| Story | 설명 | viewport |
|-------|------|----------|
| `Default` | 히어로 + 기능 카드 6개 | wikiContent |
| `DarkMode` | 다크 모드 홈 | wikiContent |

#### `DocsLayout.stories.tsx`

| Story | page props | viewport |
|-------|-----------|----------|
| `AIChat` | ai-chat.md 데이터 | wikiContent |
| `Changelog` | changelog.md 데이터 | wikiContent |
| `NoBadges` | faq.md (뱃지 없음) | wikiContent |
| `ShortContent` | 짧은 콘텐츠 (TOC 없음) | wikiContent |

---

## 6. .pen 디자인 토큰 검증 자동화

### 6.1 토큰 비교 스크립트

`.pen` 파일의 변수와 `globals.css`의 CSS 변수 불일치를 자동 감지합니다.

```typescript
// scripts/validate-design-tokens.ts
import { readFileSync } from 'fs'

const cssContent = readFileSync('app/globals.css', 'utf-8')

// .pen 디자인 토큰 (wiki.pen에서 추출한 값)
const PEN_TOKENS_LIGHT = {
  '--primary': '#3478FE',      // .pen
  '--bg-page': '#F8F9FA',      // .pen
  '--bg-sidebar': '#FFFFFF',   // .pen
  '--text-primary': '#1A1A2E', // .pen
  '--border': '#E2E8F0',       // .pen
}

const CSS_TOKENS_LIGHT = {
  '--primary': '#2563EB',      // globals.css
  '--bg-page': '#FFFFFF',      // globals.css
  '--bg-sidebar': '#F8FAFC',   // globals.css
  '--text-primary': '#0F172A', // globals.css
  '--border': '#E2E8F0',       // globals.css
}

// 불일치 리포트 출력
console.log('=== Design Token Diff (.pen vs globals.css) ===')
for (const [key, penValue] of Object.entries(PEN_TOKENS_LIGHT)) {
  const cssValue = CSS_TOKENS_LIGHT[key as keyof typeof CSS_TOKENS_LIGHT]
  if (penValue !== cssValue) {
    console.log(`⚠️  ${key}: .pen=${penValue}  css=${cssValue}`)
  }
}
```

### 6.2 현재 불일치 항목

| 토큰 | `.pen` 값 | `globals.css` 값 | 액션 |
|------|----------|-------------------|------|
| `--primary` | `#3478FE` | `#2563EB` | globals.css 기준 유지 |
| `--bg-page` (light) | `#F8F9FA` | `#FFFFFF` | globals.css 기준 유지 |
| `--bg-sidebar` (light) | `#FFFFFF` | `#F8FAFC` | globals.css 기준 유지 |
| `--text-primary` (light) | `#1A1A2E` | `#0F172A` | globals.css 기준 유지 |
| `--primary` (dark) | `#5B93FF` | `#3B82F6` | globals.css 기준 유지 |
| `--bg-page` (dark) | `#0F172A` | `#111827` | globals.css 기준 유지 |

> **결론**: 구현된 코드(globals.css)를 Single Source of Truth로 하고, .pen 파일은 참고용 시안으로 위치시킵니다. Storybook에서 실제 CSS 변수 기준으로 렌더링되므로 별도 동기화 불요.

---

## 7. 구현 단계 (총 3일)

### Phase 1: 인프라 + Atoms (1일)

| # | 작업 | 산출물 | 시간 |
|---|------|--------|------|
| 1-1 | `npx storybook@latest init --type nextjs` | .storybook/ 디렉토리 | 15분 |
| 1-2 | `main.ts`, `preview.tsx`, `manager.ts` 설정 | Storybook 기본 구동 | 30분 |
| 1-3 | `globals.css` import + 테마 데코레이터 | 라이트/다크 전환 | 15분 |
| 1-4 | 5개 Atom 컴포넌트 추출 | `NavItem`, `NavGroupHeader`, `SearchBar`, `FeatureCard`, `Badge` | 2시간 |
| 1-5 | 5개 Atom 스토리 작성 (16 변형) | `stories/atoms/*.stories.tsx` | 1.5시간 |
| 1-6 | `Sidebar.tsx`, `HomePage.tsx`, `DocsLayout.tsx` 리팩토링 | 추출된 컴포넌트 import로 전환 | 1시간 |
| 1-7 | `npm run build` 검증 | 빌드 깨짐 없음 확인 | 15분 |

### Phase 2: Molecules + Organisms (1.5일)

| # | 작업 | 산출물 | 시간 |
|---|------|--------|------|
| 2-1 | Breadcrumb, TOC, PageNavigation 스토리 | 3개 파일, 9 변형 | 1.5시간 |
| 2-2 | FeatureCard, MarkdownRenderer 스토리 | 2개 파일, 7 변형 | 2시간 |
| 2-3 | 테스트 fixture 데이터 생성 | `stories/fixtures/pages.ts` | 30분 |
| 2-4 | Sidebar 스토리 (Next.js router 모킹) | 1개 파일, 3 변형 | 1.5시간 |
| 2-5 | HomePage 스토리 | 1개 파일, 2 변형 | 1시간 |
| 2-6 | DocsLayout 스토리 | 1개 파일, 4 변형 | 1.5시간 |

### Phase 3: 문서화 + CI + 배포 (0.5일)

| # | 작업 | 산출물 | 시간 |
|---|------|--------|------|
| 3-1 | Foundations MDX (Colors, Typography, DesignTokens) | `stories/foundations/*.mdx` | 1시간 |
| 3-2 | Autodocs 태그 추가 (`tags: ['autodocs']`) | 자동 문서 생성 | 30분 |
| 3-3 | npm scripts 추가 | `storybook`, `build-storybook` | 5분 |
| 3-4 | GitHub Actions workflow | `.github/workflows/storybook.yml` | 30분 |
| 3-5 | Chromatic 또는 별도 Vercel 프로젝트 배포 | Storybook 퍼블릭 URL | 30분 |

---

## 8. npm 스크립트

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build -o storybook-static"
  }
}
```

---

## 9. CI/CD 파이프라인

### GitHub Actions — `.github/workflows/storybook.yml`

```yaml
name: Storybook

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-storybook:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build-storybook
      - uses: actions/upload-artifact@v4
        with:
          name: storybook-static
          path: storybook-static/
```

### 배포 옵션

| 옵션 | 장점 | 단점 |
|------|------|------|
| **Chromatic** | 자동 시각적 회귀 테스트, PR 리뷰 통합 | 유료 (무료 5,000 snap/월) |
| **Vercel 별도 프로젝트** | 무료, 빠른 배포 | 시각적 회귀 테스트 없음 |
| **GitHub Pages** | 무료, 기존 인프라 | 수동 배포 설정 필요 |

> **추천**: Vercel 별도 프로젝트 (`hchat-wiki-storybook`)로 배포. `storybook-static/` 빌드 후 `vercel --prod`로 배포.

---

## 10. 테스트 fixture 데이터

```typescript
// stories/fixtures/pages.ts
import type { PageData } from '@/lib/markdown'

export const mockAIChatPage: PageData = {
  slug: 'chat/ai-chat',
  title: 'AI 채팅',
  description: '실시간 스트리밍 응답과 다양한 메시지 액션을 제공하는 AI 채팅',
  badges: ['v3', '핵심 기능'],
  content: `## 주요 기능\n\n### 실시간 스트리밍 응답\n\n모든 프로바이더에서 실시간 스트리밍...\n\n### 이미지 업로드 및 Vision 지원\n\nClaude와 GPT 모델에서 이미지 업로드를 지원합니다.\n\n## 페르소나 시스템\n\n| 페르소나 | 설명 |\n|---------|------|\n| 기본 어시스턴트 | 균형 잡힌 대화 |`,
  path: 'chat/ai-chat.md',
}

export const mockFAQPage: PageData = {
  slug: 'faq',
  title: 'FAQ',
  description: '자주 묻는 질문과 답변',
  badges: undefined,
  content: `## 일반 질문\n\n### H Chat이란?\n\nChrome Extension 기반 멀티 AI 프로바이더 어시스턴트입니다.`,
  path: 'faq.md',
}

export const mockChangelogPage: PageData = {
  slug: 'changelog',
  title: '변경 이력',
  description: 'H Chat 버전별 업데이트 및 변경 사항',
  badges: undefined,
  content: `## v3.0.0 (2026년 3월)\n\n### 🎯 신규 기능\n\n#### 멀티 AI 프로바이더 지원\n\n- **OpenAI GPT 프로바이더 추가**\n- **Google Gemini 프로바이더 추가**\n- **총 7개 AI 모델 지원**`,
  path: 'changelog.md',
}
```

---

## 11. 확장 로드맵: hchat-v2-extension 통합

위키 Storybook이 안정화된 후, hchat-v2-extension의 컴포넌트를 동일한 Storybook에 통합합니다.

### Phase 4 (추후): Extension 컴포넌트 추가

| 단계 | 작업 | 의존성 |
|------|------|--------|
| 4-1 | Chrome API 모킹 레이어 추가 | `storybook-design-plan.md` §5 참조 |
| 4-2 | AI 프로바이더 모킹 (AsyncGenerator) | `storybook-design-plan.md` §5.3 참조 |
| 4-3 | ChatView 서브컴포넌트 추출 (5개) | `storybook-design-plan.md` §8 참조 |
| 4-4 | 12개 Extension 뷰 스토리 작성 | `storybook-design-plan.md` §6 참조 |
| 4-5 | Content Script UI 스토리 (Shadow DOM) | `storybook-design-plan.md` §7 Phase 4 참조 |

---

## 12. 예상 산출물 요약

| 항목 | Phase 1-3 (위키) | Phase 4 (Extension) | 합계 |
|------|-----------------|---------------------|------|
| 추출 컴포넌트 | 5개 | 5개 | 10개 |
| 스토리 파일 | 13개 | 18개 | 31개 |
| 스토리 변형 | 40개 | 60개+ | 100개+ |
| MDX 문서 | 3개 | - | 3개 |
| CI 워크플로우 | 1개 | - | 1개 |
| 예상 소요 시간 | **3일** | **5.5일** | **8.5일** |

---

## 13. 체크리스트

### Phase 1 완료 기준

- [ ] `npm run storybook` 실행 시 `localhost:6006`에서 Storybook 구동
- [ ] 라이트/다크 테마 토글이 Storybook 툴바에서 동작
- [ ] 5개 Atom 스토리 모두 렌더링 (Badge, NavItem, NavGroupHeader, SearchBar, ThemeToggle)
- [ ] `npm run build` 빌드 성공 (기존 위키 깨짐 없음)

### Phase 2 완료 기준

- [ ] 13개 전체 스토리 파일이 Storybook에서 렌더링
- [ ] 40개 변형 모두 라이트/다크 모드에서 정상 표시
- [ ] DocsLayout 스토리에서 실제 마크다운 렌더링 확인
- [ ] Sidebar 스토리에서 그룹 토글 인터랙션 동작

### Phase 3 완료 기준

- [ ] `npm run build-storybook` 정적 빌드 성공
- [ ] GitHub Actions CI에서 Storybook 빌드 통과
- [ ] Storybook 퍼블릭 URL 배포 완료
- [ ] Foundations MDX에서 디자인 토큰 문서 확인

---

## Phase 26: 103개 스토리 완성 (2026-03-05)

### 신규 스토리 30개

| 카테고리 | 스토리 | 수량 |
|----------|--------|------|
| Shared | Skeleton, Toast, EmptyState, ErrorBoundary, LanguageToggle | 5 |
| ROI 원자 | SurveyBar, HeatmapCell, ChartPlaceholder, MiniBarChart, MiniLineChart, ROISidebar | 6 |
| ROI 페이지 | Overview, Adoption, Productivity, Analysis, Organization, Sentiment, Reports, Settings, DataUpload | 9 |
| Admin 페이지 | LoginPage | 1 |
| User 페이지 | ChatPage, TranslationPage, DocsPage, OCRPage, MyPage | 5 |
| User 컴포넌트 | MessageBubble, StreamingIndicator, CustomAssistantModal, ChatSearchPanel | 4 |

### 결과

| 지표 | Before | After |
|------|--------|-------|
| 스토리 수 | 73개 | 103개 |
| 커버리지 | 77% | 97% |
| 카테고리 | 6개 | 7개 (+Shared) |
| Storybook URL | - | https://hchat-wiki-storybook.vercel.app |

### 설정 변경

- `apps/storybook/.storybook/main.ts`: `@hchat/ui/i18n` alias 추가
- `apps/storybook/vercel.json`: npm cache clean 추가 (idealTree 충돌 해결)

### 스킵된 컴포넌트 (비시각적 Provider/Context — 8개)

AuthProvider, ProtectedRoute, AdminServiceProvider, UserServiceProvider, LlmRouterServiceProvider, I18nProvider, ThemeProvider, ROIDataContext
