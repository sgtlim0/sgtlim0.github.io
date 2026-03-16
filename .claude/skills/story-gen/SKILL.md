---
name: story-gen
description: React 컴포넌트의 Storybook 9 스토리를 자동 생성합니다. Props를 분석하여 Default, WithData, Loading, Error, Dark, Mobile, Interactive 7가지 변형을 생성합니다.
---

# Storybook Story Generator

컴포넌트 Props 인터페이스를 분석하여 Storybook 9 스토리를 자동 생성합니다.

## 활성화 시점

- 컴포넌트 생성/수정 직후
- Storybook 스토리 누락 발견 시
- 컴포넌트 인터랙션 테스트 필요 시

## 7가지 변형

| 변형 | 목적 | 필수 |
|------|------|------|
| Default | 기본 상태 렌더링 | O |
| WithData | 실제 데이터로 렌더링 | O |
| Loading | 로딩/스켈레톤 상태 | 조건부 |
| Error | 에러 상태 | 조건부 |
| Dark | 다크 모드 | O |
| Mobile | 모바일 뷰포트 (375px) | 조건부 |
| Interactive | play function 인터랙션 테스트 | O |

## 핵심 규칙

1. **Storybook 9** + `@storybook/nextjs-vite` 프레임워크
2. **addon-themes**: `themeOverride: 'dark'` 파라미터로 다크 모드 테스트
3. **addon-a11y**: 접근성 자동 검사 활성화
4. **play function**: `@storybook/test`의 `userEvent`, `within`, `expect` 사용
5. **MSW**: `packages/ui/src/mocks/handlers.ts`의 핸들러 연동
6. **파일 위치**: `packages/ui/__tests__/stories/{category}/` 또는 컴포넌트 옆

## 코드 템플릿

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { {Component} } from '@hchat/ui/{path}/{Component}'

const meta: Meta<typeof {Component}> = {
  title: '{Category}/{Component}',
  component: {Component},
  tags: ['autodocs'],
  parameters: {
    layout: 'centered', // 또는 'fullscreen', 'padded'
  },
  argTypes: {
    // Props에서 자동 추론, 필요 시 커스텀 control 추가
  },
}
export default meta

type Story = StoryObj<typeof {Component}>

// 1. Default
export const Default: Story = {
  args: {
    // 최소 필수 props
  },
}

// 2. WithData
export const WithData: Story = {
  args: {
    // 리얼리스틱 데이터로 채운 props
  },
}

// 3. Loading (컴포넌트가 loading prop 지원 시)
export const Loading: Story = {
  args: { loading: true },
}

// 4. Error (컴포넌트가 error prop 지원 시)
export const Error: Story = {
  args: { error: '데이터를 불러올 수 없습니다' },
}

// 5. Dark
export const Dark: Story = {
  args: { ...Default.args },
  parameters: {
    themes: { themeOverride: 'dark' },
  },
}

// 6. Mobile
export const Mobile: Story = {
  args: { ...Default.args },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

// 7. Interactive (play function)
export const Interactive: Story = {
  args: { ...WithData.args },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 인터랙션 예시
    const button = canvas.getByRole('button')
    await userEvent.click(button)

    // 결과 검증
    await expect(canvas.getByText('결과')).toBeInTheDocument()
  },
}
```

## Props 분석 규칙

| Props 타입 | argType control |
|-----------|----------------|
| `string` | `text` |
| `number` | `number` |
| `boolean` | `boolean` |
| `enum / union` | `select` |
| `() => void` | `action` |
| `ReactNode` | 텍스트로 기본값 |

## 카테고리 분류

| 카테고리 | 경로 | 예시 |
|---------|------|------|
| Shared | `Shared/` | Badge, Toast, ErrorBoundary |
| Admin | `Admin/` | AdminDashboard, DataTable |
| User | `User/` | ChatPage, MessageBubble |
| HMG | `HMG/` | GNB, HeroBanner |
| ROI | `ROI/` | ROIOverview, KPICard |
| LLM Router | `LLMRouter/` | ModelTable, StreamingPlayground |
| Desktop | `Desktop/` | DesktopSidebar, AgentCard |
| Mobile | `Mobile/` | MobileApp, MobileChatView |

## 참조 문서

- `docs/STORYBOOK_IMPLEMENTATION.md`
- `docs/COMPONENT_CATALOG.md`
- `apps/storybook/.storybook/main.ts` — Storybook 설정
