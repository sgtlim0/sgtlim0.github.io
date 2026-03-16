---
name: page-scaffold
description: Next.js 16 App Router 페이지를 스캐폴딩합니다. Server Component page, Client Component, 전용 훅, Storybook 스토리, Vitest 테스트 5개 파일을 일괄 생성합니다.
---

# Page Scaffold

H Chat 모노레포의 10개 앱에서 사용하는 Next.js 16 페이지 스캐폴딩 스킬.

## 활성화 시점

- 새 페이지/라우트 추가
- 앱에 신규 화면 생성
- 기존 페이지 리팩토링 (컴포넌트 분리)

## 생성 파일 5개

| # | 파일 | 역할 |
|---|------|------|
| 1 | `apps/{app}/app/{route}/page.tsx` | Server Component + dynamic import |
| 2 | `packages/ui/src/{app}/{PageName}.tsx` | 'use client' Client Component |
| 3 | `packages/ui/src/{app}/use{PageName}.ts` | 페이지 전용 커스텀 훅 |
| 4 | `packages/ui/__tests__/stories/{app}/{PageName}.stories.tsx` | Storybook 스토리 |
| 5 | `packages/ui/__tests__/{app}/{PageName}.test.tsx` | Vitest 테스트 |

## 핵심 규칙

1. **Next.js 16**: async/await for params (Next.js 15+ 요구사항)
2. **Static Export**: `output: 'export'` — API Route 불가, 클라이언트 사이드 데이터 페칭
3. **dynamic import**: Skeleton fallback으로 코드 스플리팅
4. **@hchat/ui**: 공유 컴포넌트는 반드시 `@hchat/ui`에서 import
5. **다크 모드**: ThemeProvider + `.dark` 클래스 토글
6. **디자인 토큰**: 앱별 접두사 CSS 변수 사용

## 코드 템플릿

### 1. page.tsx (Server Component)

```tsx
import dynamic from 'next/dynamic'

const {PageName} = dynamic(
  () => import('@hchat/ui/{app}/{PageName}').then(m => m.{PageName}),
  {
    loading: () => (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    ),
  }
)

export default function {PageName}Page() {
  return <{PageName} />
}
```

### 2. {PageName}.tsx (Client Component)

```tsx
'use client'

import { use{PageName} } from './use{PageName}'

export function {PageName}() {
  const { data, loading, error } = use{PageName}()

  if (loading) {
    return <div className="animate-pulse p-6">로딩 중...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{/* 페이지 제목 */}</h1>
      {/* 페이지 콘텐츠 */}
    </div>
  )
}
```

### 3. use{PageName}.ts (커스텀 훅)

```typescript
'use client'

import { useState, useEffect } from 'react'

export function use{PageName}() {
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        // 데이터 로드 로직
        setData(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { data, loading, error }
}
```

### 4. {PageName}.stories.tsx

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { {PageName} } from '@hchat/ui/{app}/{PageName}'

const meta: Meta<typeof {PageName}> = {
  title: '{App}/{PageName}',
  component: {PageName},
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof {PageName}>

export const Default: Story = {}
export const Loading: Story = { parameters: { mockData: { loading: true } } }
export const Error: Story = { parameters: { mockData: { error: '데이터를 불러올 수 없습니다' } } }
export const Dark: Story = { parameters: { themes: { themeOverride: 'dark' } } }
```

### 5. {PageName}.test.tsx

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { {PageName} } from '../src/{app}/{PageName}'

describe('{PageName}', () => {
  it('렌더링된다', () => {
    render(<{PageName} />)
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('로딩 상태를 표시한다', () => {
    // 로딩 상태 테스트
  })

  it('에러를 표시한다', () => {
    // 에러 상태 테스트
  })
})
```

## 앱별 라우트 참고

| 앱 | 포트 | 기존 라우트 예시 |
|----|------|---------------|
| wiki | 3000 | `/`, `/[...slug]` |
| hmg | 3001 | `/`, `/publications`, `/guide`, `/dashboard` |
| admin | 3002 | `/`, `/usage`, `/statistics`, `/users`, `/roi/*` |
| user | 3003 | `/`, `/docs`, `/my`, `/ocr`, `/translation` |
| llm-router | 3004 | `/`, `/models`, `/docs`, `/about` |

## 참조 문서

- `docs/ARCHITECTURE.md` — 시스템 아키텍처
- `docs/HCHAT_USER_FEATURES_IMPLEMENTATION.md` — User 앱 설계
- `docs/HCHAT_ADMIN_DESIGN.md` — Admin 앱 설계
