# H Chat Wiki — 모노레포 Storybook 구현 방안

## 1. 개요

현재 flat 구조의 hchat-wiki (Next.js 16 + Tailwind CSS 4)를 **npm workspaces 모노레포**로 전환하고, 공유 UI 컴포넌트 패키지를 분리하여 Storybook으로 문서화합니다.

### 목표

1. 위키 앱과 UI 컴포넌트를 독립 패키지로 분리
2. Storybook에서 UI 컴포넌트를 격리 테스트 + 시각적 문서화
3. `.pen` 디자인 토큰 ↔ CSS 변수 일치 검증
4. 향후 hchat-v2-extension 컴포넌트까지 동일 Storybook에서 관리

### 왜 모노레포인가?

| 기준 | Flat 구조 (기존안) | 모노레포 (이번안) |
|------|-------------------|------------------|
| UI 재사용 | Next.js에 종속 | `@hchat/ui` 독립 패키지 |
| Storybook 빌드 | Next.js와 동일 `node_modules` | 전용 워크스페이스, 의존성 격리 |
| Extension 통합 | 별도 레포에서 참조 불가 | `packages/extension-ui` 추가 가능 |
| CI/CD | 단일 파이프라인 | 워크스페이스별 독립 빌드/배포 |
| 디자인 토큰 | 앱별 중복 정의 | `@hchat/tokens` 단일 소스 |

---

## 2. 모노레포 구조

### 2.1 전체 디렉토리

```
hchat-wiki/                          # 루트 워크스페이스
├── package.json                     # workspaces 선언, 루트 스크립트
├── turbo.json                       # Turborepo 파이프라인 설정
├── tsconfig.base.json               # 공유 TypeScript 설정
├── .github/
│   └── workflows/
│       ├── deploy.yml               # (수정) GitHub Pages 배포
│       └── storybook.yml            # (생성) Storybook 빌드/배포
│
├── packages/
│   ├── tokens/                      # @hchat/tokens — 디자인 토큰
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts             # 토큰 export
│   │   │   ├── colors.ts            # 색상 토큰
│   │   │   └── typography.ts        # 타이포그래피 토큰
│   │   ├── styles/
│   │   │   └── tokens.css           # CSS 변수 정의 (light + dark)
│   │   └── tsconfig.json
│   │
│   └── ui/                          # @hchat/ui — 공유 UI 컴포넌트
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── index.ts             # barrel export
│       │   ├── Badge.tsx
│       │   ├── NavItem.tsx
│       │   ├── NavGroupHeader.tsx
│       │   ├── SearchBar.tsx
│       │   ├── FeatureCard.tsx
│       │   ├── Breadcrumb.tsx
│       │   ├── TableOfContents.tsx
│       │   ├── PageNavigation.tsx
│       │   ├── ThemeToggle.tsx
│       │   └── MarkdownRenderer.tsx
│       └── styles/
│           └── components.css       # 컴포넌트 전용 스타일 (선택)
│
├── apps/
│   ├── wiki/                        # @hchat/wiki — Next.js 위키 앱
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── next.config.ts
│   │   ├── postcss.config.mjs
│   │   ├── app/
│   │   │   ├── globals.css          # @hchat/tokens CSS import + 앱 전용 스타일
│   │   │   ├── layout.tsx
│   │   │   └── [[...slug]]/
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # 앱 전용 (next/link 의존)
│   │   │   ├── HomePage.tsx         # 앱 전용 (next/link 의존)
│   │   │   ├── DocsLayout.tsx       # @hchat/ui 조합
│   │   │   └── ThemeProvider.tsx    # 앱 전용 (localStorage)
│   │   ├── lib/
│   │   │   ├── markdown.ts
│   │   │   ├── navigation.ts
│   │   │   └── headings.ts
│   │   ├── content/                 # 마크다운 콘텐츠
│   │   └── public/                  # 정적 에셋
│   │
│   └── storybook/                   # @hchat/storybook — Storybook 앱
│       ├── package.json
│       ├── tsconfig.json
│       ├── .storybook/
│       │   ├── main.ts
│       │   ├── preview.tsx
│       │   └── manager.ts
│       └── stories/
│           ├── foundations/          # 디자인 토큰 문서
│           │   ├── Colors.mdx
│           │   ├── Typography.mdx
│           │   └── DesignTokens.mdx
│           ├── atoms/               # @hchat/ui 컴포넌트 스토리
│           │   ├── Badge.stories.tsx
│           │   ├── NavItem.stories.tsx
│           │   ├── NavGroupHeader.stories.tsx
│           │   ├── SearchBar.stories.tsx
│           │   └── ThemeToggle.stories.tsx
│           ├── molecules/
│           │   ├── Breadcrumb.stories.tsx
│           │   ├── TableOfContents.stories.tsx
│           │   ├── PageNavigation.stories.tsx
│           │   ├── FeatureCard.stories.tsx
│           │   └── MarkdownRenderer.stories.tsx
│           ├── organisms/           # 앱 조합 스토리 (Next.js 모킹)
│           │   ├── Sidebar.stories.tsx
│           │   ├── HomePage.stories.tsx
│           │   └── DocsLayout.stories.tsx
│           └── fixtures/
│               └── pages.ts         # 테스트 데이터
│
├── design/                          # 디자인 파일 (비코드)
│   ├── wiki.pen
│   └── design1.pen
│
└── docs/                            # 프로젝트 문서
    ├── MONOREPO_STORYBOOK_PLAN.md
    └── STORYBOOK_IMPLEMENTATION.md
```

### 2.2 패키지 의존성 그래프

```
@hchat/tokens  ←  @hchat/ui  ←  @hchat/wiki
                       ↑
               @hchat/storybook
```

- `@hchat/tokens`: 외부 의존성 없음 (CSS 변수 + TS 상수)
- `@hchat/ui`: `@hchat/tokens` + React + lucide-react
- `@hchat/wiki`: `@hchat/ui` + `@hchat/tokens` + Next.js + 마크다운 라이브러리
- `@hchat/storybook`: `@hchat/ui` + `@hchat/tokens` + Storybook + Next.js 모킹

---

## 3. 루트 설정 파일

### 3.1 `package.json` (루트)

```json
{
  "name": "hchat-wiki-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "dev": "npm run dev -w @hchat/wiki",
    "build": "turbo run build",
    "build:wiki": "npm run build -w @hchat/wiki",
    "build:storybook": "npm run build -w @hchat/storybook",
    "storybook": "npm run dev -w @hchat/storybook",
    "lint": "turbo run lint",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "turbo": "^2.4.0",
    "typescript": "^5"
  }
}
```

### 3.2 `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "out/**", "storybook-static/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### 3.3 `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules"]
}
```

---

## 4. 패키지별 설정

### 4.1 `packages/tokens`

#### `packages/tokens/package.json`

```json
{
  "name": "@hchat/tokens",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./styles": "./styles/tokens.css"
  },
  "scripts": {
    "lint": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5"
  }
}
```

#### `packages/tokens/styles/tokens.css`

기존 `app/globals.css`에서 디자인 토큰만 분리:

```css
/* Light Mode (기본) */
:root {
  --primary: #2563EB;
  --primary-light: #EFF6FF;
  --bg-page: #FFFFFF;
  --bg-sidebar: #F8FAFC;
  --bg-card: #F8FAFC;
  --bg-hero: #EFF6FF;
  --bg-hover: #F1F5F9;
  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --text-tertiary: #94A3B8;
  --border: #E2E8F0;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Dark Mode */
.dark {
  --primary: #3B82F6;
  --primary-light: #1E3A5F;
  --bg-page: #111827;
  --bg-sidebar: #1F2937;
  --bg-card: #1F2937;
  --bg-hero: #1E3A5F;
  --bg-hover: #374151;
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-tertiary: #64748B;
  --border: #374151;
}
```

#### `packages/tokens/src/index.ts`

```typescript
/** 디자인 토큰 — JS 상수로도 참조 가능 */
export const colors = {
  light: {
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    bgPage: '#FFFFFF',
    bgSidebar: '#F8FAFC',
    bgCard: '#F8FAFC',
    bgHero: '#EFF6FF',
    bgHover: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    border: '#E2E8F0',
  },
  dark: {
    primary: '#3B82F6',
    primaryLight: '#1E3A5F',
    bgPage: '#111827',
    bgSidebar: '#1F2937',
    bgCard: '#1F2937',
    bgHero: '#1E3A5F',
    bgHover: '#374151',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    border: '#374151',
  },
} as const

export const typography = {
  fontSans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  sizeXs: '12px',
  sizeSm: '13px',
  sizeBase: '14px',
  sizeLg: '16px',
  sizeXl: '20px',
  size2xl: '24px',
  size3xl: '32px',
  weightNormal: '400',
  weightMedium: '500',
  weightSemibold: '600',
  weightBold: '700',
} as const
```

### 4.2 `packages/ui`

#### `packages/ui/package.json`

```json
{
  "name": "@hchat/ui",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.tsx"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "dependencies": {
    "@hchat/tokens": "*",
    "lucide-react": "^0.575.0"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  },
  "scripts": {
    "lint": "tsc --noEmit",
    "clean": "rm -rf dist"
  }
}
```

#### `packages/ui/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "paths": {
      "@hchat/tokens": ["../tokens/src"],
      "@hchat/tokens/*": ["../tokens/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules"]
}
```

#### `packages/ui/src/index.ts`

```typescript
// Atoms
export { Badge, type BadgeProps } from './Badge'
export { NavItem, type NavItemProps } from './NavItem'
export { NavGroupHeader, type NavGroupHeaderProps } from './NavGroupHeader'
export { SearchBar, type SearchBarProps } from './SearchBar'
export { ThemeToggle, type ThemeToggleProps } from './ThemeToggle'

// Molecules
export { Breadcrumb, type BreadcrumbProps } from './Breadcrumb'
export { TableOfContents, type TableOfContentsProps } from './TableOfContents'
export { PageNavigation, type PageNavigationProps } from './PageNavigation'
export { FeatureCard, type FeatureCardProps } from './FeatureCard'
export { MarkdownRenderer, type MarkdownRendererProps } from './MarkdownRenderer'
```

### 4.3 `apps/wiki`

#### `apps/wiki/package.json`

```json
{
  "name": "@hchat/wiki",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "clean": "rm -rf .next out"
  },
  "dependencies": {
    "@hchat/tokens": "*",
    "@hchat/ui": "*",
    "gray-matter": "^4.0.3",
    "highlight.js": "^11.11.1",
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-markdown": "^10.1.0",
    "rehype-highlight": "^7.0.2",
    "remark-gfm": "^4.0.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.1",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

#### `apps/wiki/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"],
      "@hchat/tokens": ["../../packages/tokens/src"],
      "@hchat/tokens/*": ["../../packages/tokens/*"],
      "@hchat/ui": ["../../packages/ui/src"],
      "@hchat/ui/*": ["../../packages/ui/src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

#### `apps/wiki/app/globals.css`

```css
/* 토큰 CSS 가져오기 */
@import "@hchat/tokens/styles";

/* Tailwind */
@import "tailwindcss";

/* Tailwind v4 커스텀 테마 */
@theme inline {
  --color-primary: var(--primary);
  --color-primary-light: var(--primary-light);
  --color-bg-page: var(--bg-page);
  --color-bg-sidebar: var(--bg-sidebar);
  --color-bg-card: var(--bg-card);
  --color-bg-hero: var(--bg-hero);
  --color-bg-hover: var(--bg-hover);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-tertiary: var(--text-tertiary);
  --color-border: var(--border);
}

/* 앱 전용 글로벌 스타일 */
body {
  background-color: var(--bg-page);
  color: var(--text-primary);
  font-family: var(--font-sans);
}

/* highlight.js, 스크롤바 등 앱 전용 */
```

### 4.4 `apps/storybook`

#### `apps/storybook/package.json`

```json
{
  "name": "@hchat/storybook",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "storybook dev -p 6006",
    "build": "storybook build -o storybook-static",
    "clean": "rm -rf storybook-static"
  },
  "dependencies": {
    "@hchat/tokens": "*",
    "@hchat/ui": "*",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-markdown": "^10.1.0",
    "rehype-highlight": "^7.0.2",
    "remark-gfm": "^4.0.1",
    "lucide-react": "^0.575.0"
  },
  "devDependencies": {
    "@storybook/nextjs": "^8.5.0",
    "@storybook/addon-essentials": "^8.5.0",
    "@storybook/addon-themes": "^8.5.0",
    "@storybook/addon-a11y": "^8.5.0",
    "@storybook/addon-interactions": "^8.5.0",
    "@storybook/test": "^8.5.0",
    "@tailwindcss/postcss": "^4",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "storybook": "^8.5.0",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

#### `apps/storybook/.storybook/main.ts`

```typescript
import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-themes',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
}

export default config
```

> **참고**: `@storybook/nextjs`를 사용하여 `next/link`, `next/navigation` 모킹을 자동 처리합니다. organisms 스토리에서 Next.js 의존 컴포넌트를 직접 import할 수 있습니다.

#### `apps/storybook/.storybook/preview.tsx`

```tsx
import type { Preview } from '@storybook/react'
import { withThemeByClassName } from '@storybook/addon-themes'
import '@hchat/tokens/styles'

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: { Light: '', Dark: 'dark' },
      defaultTheme: 'Light',
    }),
    // 배경색을 토큰에서 가져오도록 래핑
    (Story) => (
      <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh', padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
    viewport: {
      viewports: {
        wikiDesktop: { name: 'Wiki Desktop', styles: { width: '1440px', height: '900px' } },
        wikiContent: { name: 'Content Area', styles: { width: '1160px', height: '900px' } },
        wikiSidebar: { name: 'Sidebar Only', styles: { width: '280px', height: '900px' } },
      },
    },
  },
}

export default preview
```

#### `apps/storybook/.storybook/manager.ts`

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

## 5. 컴포넌트 추출 계획

### 5.1 분류 기준

| 분류 | 조건 | 위치 |
|------|------|------|
| **@hchat/ui** | Next.js 의존 없음, 순수 Presentational | `packages/ui/src/` |
| **앱 전용** | `next/link`, `next/navigation`, localStorage 의존 | `apps/wiki/components/` |

### 5.2 추출 대상 (현재 인라인 → @hchat/ui)

| 현재 위치 | 추출 컴포넌트 | .pen 매핑 | 파일 |
|-----------|-------------|-----------|------|
| `Sidebar.tsx` 내 `renderNavItem()` | `NavItem` | `Wiki/NavItem` (pKthN) | `packages/ui/src/NavItem.tsx` |
| `Sidebar.tsx` 내 그룹 헤더 JSX | `NavGroupHeader` | `Wiki/NavGroupHeader` (2ITpx) | `packages/ui/src/NavGroupHeader.tsx` |
| `Sidebar.tsx` 내 검색바 JSX | `SearchBar` | `Wiki/SearchBar` (7d4mW) | `packages/ui/src/SearchBar.tsx` |
| `HomePage.tsx` 내 기능 카드 JSX | `FeatureCard` | `Wiki/FeatureCard` (ZUwkZ) | `packages/ui/src/FeatureCard.tsx` |
| `DocsLayout.tsx` 내 뱃지 JSX | `Badge` | `Wiki/Badge` (iE8nD) | `packages/ui/src/Badge.tsx` |

### 5.3 이동 대상 (현재 독립 컴포넌트 → @hchat/ui)

| 현재 파일 | @hchat/ui 파일 | 비고 |
|-----------|---------------|------|
| `components/Breadcrumb.tsx` | `packages/ui/src/Breadcrumb.tsx` | Next.js 의존 없음 |
| `components/TableOfContents.tsx` | `packages/ui/src/TableOfContents.tsx` | Next.js 의존 없음 |
| `components/PageNavigation.tsx` | `packages/ui/src/PageNavigation.tsx` | Next.js 의존 없음 |
| `components/ThemeToggle.tsx` | `packages/ui/src/ThemeToggle.tsx` | ThemeProvider context만 사용 |
| `components/MarkdownRenderer.tsx` | `packages/ui/src/MarkdownRenderer.tsx` | react-markdown 의존 |

### 5.4 앱 전용으로 유지

| 컴포넌트 | 이유 | 위치 |
|----------|------|------|
| `Sidebar` | `next/link`, `next/navigation`, 라우터 상태 | `apps/wiki/components/` |
| `HomePage` | `next/link`, 라우팅 의존 | `apps/wiki/components/` |
| `DocsLayout` | 앱 레이아웃 조합 (Sidebar, Breadcrumb, TOC) | `apps/wiki/components/` |
| `ThemeProvider` | `localStorage`, `useSyncExternalStore` | `apps/wiki/components/` |

### 5.5 NavItem의 next/link 처리

`NavItem`은 현재 `next/link`에 의존합니다. UI 패키지에서 Next.js 의존을 제거하기 위해 **렌더 프롭 패턴**을 사용합니다:

```tsx
// packages/ui/src/NavItem.tsx
import type { ComponentType, ReactNode } from 'react'

export interface NavItemProps {
  title: string
  href: string
  icon?: ComponentType<{ className?: string }>
  active?: boolean
  /** 링크 래퍼 — 기본값은 <a> 태그 */
  linkComponent?: ComponentType<{ href: string; className: string; children: ReactNode }>
}

export function NavItem({
  title,
  href,
  icon: Icon,
  active = false,
  linkComponent: LinkComp = DefaultLink,
}: NavItemProps) {
  return (
    <LinkComp
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
        active
          ? 'bg-[var(--primary-light)] text-[var(--primary)] font-medium'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
      }`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{title}</span>
    </LinkComp>
  )
}

function DefaultLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  return <a href={href} className={className}>{children}</a>
}
```

앱에서 사용:

```tsx
// apps/wiki/components/Sidebar.tsx
import { NavItem } from '@hchat/ui'
import Link from 'next/link'

<NavItem title="AI 채팅" href="/chat/ai-chat" icon={MessageSquare} linkComponent={Link} active={isActive} />
```

Storybook에서 사용:

```tsx
// apps/storybook/stories/atoms/NavItem.stories.tsx
import { NavItem } from '@hchat/ui'
// linkComponent 미지정 → 기본 <a> 태그 사용, Next.js 불필요
```

---

## 6. 마이그레이션 전략

### 6.1 파일 이동 매핑

```
[기존]                              → [모노레포]
──────────────────────────────────────────────────
package.json                       → package.json (루트, 재작성)
tsconfig.json                      → tsconfig.base.json (공유 설정)
next.config.ts                     → apps/wiki/next.config.ts
postcss.config.mjs                 → apps/wiki/postcss.config.mjs
eslint.config.mjs                  → apps/wiki/eslint.config.mjs
app/                               → apps/wiki/app/
app/globals.css                    → apps/wiki/app/globals.css (토큰 import로 변경)
  ├─ CSS 변수 정의 부분            → packages/tokens/styles/tokens.css (분리)
components/Breadcrumb.tsx          → packages/ui/src/Breadcrumb.tsx
components/TableOfContents.tsx     → packages/ui/src/TableOfContents.tsx
components/PageNavigation.tsx      → packages/ui/src/PageNavigation.tsx
components/ThemeToggle.tsx         → packages/ui/src/ThemeToggle.tsx
components/MarkdownRenderer.tsx    → packages/ui/src/MarkdownRenderer.tsx
components/Sidebar.tsx             → apps/wiki/components/Sidebar.tsx
components/HomePage.tsx            → apps/wiki/components/HomePage.tsx
components/DocsLayout.tsx          → apps/wiki/components/DocsLayout.tsx
components/ThemeProvider.tsx       → apps/wiki/components/ThemeProvider.tsx
lib/                               → apps/wiki/lib/
content/                           → apps/wiki/content/
public/                            → apps/wiki/public/
.github/workflows/deploy.yml      → .github/workflows/deploy.yml (수정)
wiki.pen                           → design/wiki.pen
design1.pen                        → design/design1.pen
```

### 6.2 import 경로 변경

```typescript
// Before (flat 구조)
import Breadcrumb from '@/components/Breadcrumb'
import { getHeadings } from '@/lib/headings'

// After (모노레포)
import { Breadcrumb } from '@hchat/ui'           // UI 패키지에서
import { getHeadings } from '@/lib/headings'      // 앱 내부는 동일
```

---

## 7. 스토리 작성 명세

### 7.1 Atoms (5파일, 16변형)

`@hchat/ui` 컴포넌트를 직접 import하여 격리 테스트합니다.

#### `Badge.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '@hchat/ui'

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Badge>

export const V2: Story = { args: { label: 'v2' } }
export const V3: Story = { args: { label: 'v3' } }
export const CoreFeature: Story = { args: { label: '핵심 기능' } }
export const Beginner: Story = { args: { label: '초보자 가이드' } }
```

#### `NavItem.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { NavItem } from '@hchat/ui'
import { MessageSquare, HelpCircle } from 'lucide-react'

const meta: Meta<typeof NavItem> = {
  title: 'Atoms/NavItem',
  component: NavItem,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 240 }}><Story /></div>],
}
export default meta

type Story = StoryObj<typeof NavItem>

export const Default: Story = {
  args: { title: 'AI 채팅', icon: MessageSquare, href: '/chat/ai-chat' },
}
export const Active: Story = {
  args: { title: 'AI 채팅', icon: MessageSquare, href: '/chat/ai-chat', active: true },
}
export const NoIcon: Story = {
  args: { title: 'FAQ', href: '/faq' },
}
```

#### 나머지 Atoms

| 파일 | 변형 |
|------|------|
| `NavGroupHeader.stories.tsx` | Expanded, Collapsed |
| `SearchBar.stories.tsx` | Default, Focused |
| `ThemeToggle.stories.tsx` | Light, Dark |

### 7.2 Molecules (5파일, 15변형)

| 파일 | 변형 |
|------|------|
| `Breadcrumb.stories.tsx` | TwoLevels, ThreeLevels, HomeOnly |
| `TableOfContents.stories.tsx` | WithHeadings, DeepNesting, Empty |
| `PageNavigation.stories.tsx` | BothLinks, FirstPage, LastPage |
| `FeatureCard.stories.tsx` | Default, Hovered, Grid(6개) |
| `MarkdownRenderer.stories.tsx` | BasicMarkdown, CodeBlock, Table, Mixed |

### 7.3 Organisms (3파일, 9변형)

Next.js 의존 컴포넌트는 `@storybook/nextjs` 프레임워크가 자동 모킹합니다.

| 파일 | 변형 | viewport |
|------|------|----------|
| `Sidebar.stories.tsx` | Default, AllCollapsed, WithActivePage | wikiSidebar |
| `HomePage.stories.tsx` | Default, DarkMode | wikiContent |
| `DocsLayout.stories.tsx` | AIChat, Changelog, NoBadges, ShortContent | wikiContent |

### 7.4 Foundations MDX (3파일)

| 파일 | 내용 |
|------|------|
| `Colors.mdx` | 12개 CSS 변수 색상 스와치 (light/dark) |
| `Typography.mdx` | 폰트, 크기, 두께 시각화 |
| `DesignTokens.mdx` | .pen vs globals.css 매핑 테이블 |

---

## 8. CI/CD 파이프라인

### 8.1 GitHub Pages (위키) — `.github/workflows/deploy.yml`

```yaml
name: Deploy Wiki to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build:wiki
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./apps/wiki/out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 8.2 Storybook — `.github/workflows/storybook.yml`

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
      - run: npm run build:storybook
      - uses: actions/upload-artifact@v4
        with:
          name: storybook-static
          path: apps/storybook/storybook-static/
```

### 8.3 배포 옵션

| 대상 | 배포 방식 | URL |
|------|----------|-----|
| 위키 | GitHub Pages | `sgtlim0.github.io/hchat-wiki` |
| 위키 | Vercel (현재) | `hchat-wiki.vercel.app` |
| Storybook | Vercel 별도 프로젝트 | `hchat-storybook.vercel.app` |

---

## 9. 구현 단계 (총 4일)

### Phase 0: 모노레포 전환 (0.5일)

| # | 작업 | 산출물 |
|---|------|--------|
| 0-1 | `turbo` 설치, 루트 `package.json` workspaces 설정 | 모노레포 구조 |
| 0-2 | `tsconfig.base.json` 생성, 패키지별 `tsconfig.json` | 타입 해석 |
| 0-3 | `packages/tokens/` 생성, CSS 변수 분리 | `@hchat/tokens` |
| 0-4 | `packages/ui/` 스캐폴딩 (빈 barrel export) | `@hchat/ui` |
| 0-5 | `apps/wiki/` 이동, import 경로 수정 | Next.js 앱 이동 |
| 0-6 | `apps/storybook/` 스캐폴딩 | Storybook 앱 |
| 0-7 | `npm install` + `npm run build:wiki` 검증 | 빌드 성공 |

### Phase 1: 컴포넌트 추출 + Atoms (1일)

| # | 작업 | 산출물 |
|---|------|--------|
| 1-1 | 5개 Atom 컴포넌트 추출 → `packages/ui/src/` | NavItem, NavGroupHeader, SearchBar, FeatureCard, Badge |
| 1-2 | NavItem에 linkComponent 패턴 적용 | Next.js 의존 제거 |
| 1-3 | 5개 기존 컴포넌트 이동 → `packages/ui/src/` | Breadcrumb, TOC, PageNav, ThemeToggle, MarkdownRenderer |
| 1-4 | `apps/wiki/` import 경로 일괄 수정 | `@hchat/ui`에서 import |
| 1-5 | `npm run build:wiki` 검증 | 빌드 성공 확인 |
| 1-6 | 5개 Atom 스토리 작성 (16변형) | `stories/atoms/` |
| 1-7 | `npm run storybook` 검증 | Storybook 구동 |

### Phase 2: Molecules + Organisms (1.5일)

| # | 작업 | 산출물 |
|---|------|--------|
| 2-1 | 테스트 fixture 데이터 생성 | `stories/fixtures/pages.ts` |
| 2-2 | 5개 Molecule 스토리 작성 (15변형) | `stories/molecules/` |
| 2-3 | 3개 Organism 스토리 작성 (9변형) | `stories/organisms/` |
| 2-4 | 라이트/다크 모드 전체 변형 검증 | 40개 변형 확인 |

### Phase 3: 문서화 + CI + 배포 (1일)

| # | 작업 | 산출물 |
|---|------|--------|
| 3-1 | Foundations MDX 3개 작성 | Colors, Typography, DesignTokens |
| 3-2 | Autodocs 태그 전체 추가 | 자동 문서 생성 |
| 3-3 | GitHub Actions workflow 2개 수정/생성 | deploy.yml, storybook.yml |
| 3-4 | Vercel Storybook 프로젝트 배포 | 퍼블릭 URL |
| 3-5 | README 업데이트 (모노레포 구조 설명) | README.md |
| 3-6 | 전체 빌드 검증 (`turbo run build`) | 위키 + Storybook 모두 성공 |

---

## 10. npm 스크립트 요약

### 루트

```bash
npm run dev              # 위키 dev 서버 (localhost:3000)
npm run build            # 전체 빌드 (turbo)
npm run build:wiki       # 위키만 빌드
npm run build:storybook  # Storybook만 빌드
npm run storybook        # Storybook dev (localhost:6006)
npm run lint             # 전체 lint
npm run clean            # 전체 빌드 산출물 삭제
```

### 패키지별

```bash
# packages/tokens
npm run lint -w @hchat/tokens

# packages/ui
npm run lint -w @hchat/ui

# apps/wiki
npm run dev -w @hchat/wiki
npm run build -w @hchat/wiki

# apps/storybook
npm run dev -w @hchat/storybook
npm run build -w @hchat/storybook
```

---

## 11. 향후 확장 — Extension 통합

모노레포 구조의 핵심 장점은 **hchat-v2-extension** 컴포넌트를 추가 패키지로 통합할 수 있다는 점입니다.

### Phase 4 (추후): Extension UI 패키지 추가

```
packages/
├── tokens/              # (기존) 디자인 토큰
├── ui/                  # (기존) 위키 UI 컴포넌트
└── extension-ui/        # (추가) Extension UI 컴포넌트
    ├── package.json     # @hchat/extension-ui
    ├── src/
    │   ├── CodeBlock.tsx
    │   ├── MsgBubble.tsx
    │   ├── ModelSelector.tsx
    │   ├── PersonaSelector.tsx
    │   └── AgentStepsView.tsx
    └── mocks/
        ├── chrome-storage.ts
        ├── chrome-runtime.ts
        └── providers.ts
```

```
apps/storybook/stories/
├── atoms/               # @hchat/ui 스토리 (기존)
├── molecules/           # @hchat/ui 스토리 (기존)
├── organisms/           # 위키 앱 스토리 (기존)
└── extension/           # (추가) @hchat/extension-ui 스토리
    ├── ChatView.stories.tsx
    ├── HistoryView.stories.tsx
    └── ...
```

---

## 12. 예상 산출물 요약

| 항목 | Phase 0-3 (위키) | Phase 4 (Extension) | 합계 |
|------|-----------------|---------------------|------|
| npm 워크스페이스 | 4개 | +1개 | 5개 |
| 추출/이동 컴포넌트 | 10개 | 5개 | 15개 |
| 스토리 파일 | 13개 | 18개 | 31개 |
| 스토리 변형 | 40개 | 60개+ | 100개+ |
| MDX 문서 | 3개 | - | 3개 |
| CI 워크플로우 | 2개 | - | 2개 |
| 예상 소요 시간 | **4일** | **5.5일** | **9.5일** |

---

## 13. 체크리스트

### Phase 0 완료 기준

- [ ] `npm install` 루트에서 모든 워크스페이스 설치 성공
- [ ] `npm run build:wiki` 정적 빌드 성공 (기존 위키 동작)
- [ ] `apps/wiki/` 내에서 `@hchat/ui`, `@hchat/tokens` import 가능

### Phase 1 완료 기준

- [ ] `packages/ui/src/` 에 10개 컴포넌트 존재
- [ ] `apps/wiki/components/` 는 앱 전용 4개만 남음
- [ ] `npm run storybook` → `localhost:6006` 구동 성공
- [ ] 5개 Atom 스토리 렌더링 (라이트/다크)
- [ ] `npm run build:wiki` 빌드 여전히 성공

### Phase 2 완료 기준

- [ ] 13개 전체 스토리 파일 렌더링
- [ ] 40개 변형 라이트/다크 모두 정상
- [ ] Sidebar 스토리에서 그룹 토글 동작
- [ ] DocsLayout 스토리에서 마크다운 렌더링 정상

### Phase 3 완료 기준

- [ ] `turbo run build` 전체 성공
- [ ] GitHub Actions CI에서 위키 + Storybook 빌드 통과
- [ ] Storybook 퍼블릭 URL 배포 완료
- [ ] Foundations MDX에서 디자인 토큰 문서 확인

---

## 14. .pen 디자인 토큰 불일치 현황

| 토큰 | `.pen` 값 | `globals.css` 값 | Single Source of Truth |
|------|----------|-------------------|----------------------|
| `--primary` (light) | `#3478FE` | `#2563EB` | globals.css → `@hchat/tokens` |
| `--bg-page` (light) | `#F8F9FA` | `#FFFFFF` | globals.css → `@hchat/tokens` |
| `--bg-sidebar` (light) | `#FFFFFF` | `#F8FAFC` | globals.css → `@hchat/tokens` |
| `--text-primary` (light) | `#1A1A2E` | `#0F172A` | globals.css → `@hchat/tokens` |
| `--primary` (dark) | `#5B93FF` | `#3B82F6` | globals.css → `@hchat/tokens` |
| `--bg-page` (dark) | `#0F172A` | `#111827` | globals.css → `@hchat/tokens` |

> **결론**: `@hchat/tokens` 패키지가 Single Source of Truth. 기존 `globals.css` 값을 기준으로 토큰 패키지에 정의하고, `.pen` 파일은 참고용 시안으로 유지합니다.
