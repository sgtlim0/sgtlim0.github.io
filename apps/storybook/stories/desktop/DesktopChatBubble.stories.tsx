import type { Meta, StoryObj } from '@storybook/react'
import { DesktopChatBubble } from '@hchat/ui/desktop'
import type { DesktopMessage } from '@hchat/ui/desktop'

const meta: Meta<typeof DesktopChatBubble> = {
  title: 'Desktop/DesktopChatBubble',
  component: DesktopChatBubble,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 600 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const userMessage: DesktopMessage = {
  id: 'msg-001',
  role: 'user',
  content: 'TypeScript에서 제네릭 타입을 사용하는 방법을 설명해 주세요.',
  timestamp: 1709712000000,
}

const assistantMessage: DesktopMessage = {
  id: 'msg-002',
  role: 'assistant',
  content:
    '제네릭(Generics)은 타입을 매개변수로 받아 재사용 가능한 컴포넌트를 만들 수 있게 해줍니다.\n\n```typescript\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n```\n\n위 예시에서 `T`는 타입 변수로, 함수 호출 시 실제 타입으로 대체됩니다.',
  timestamp: 1709712060000,
}

const assistantMessageWithTokens: DesktopMessage = {
  id: 'msg-003',
  role: 'assistant',
  content:
    'React 19의 주요 변경사항은 다음과 같습니다:\n\n1. **Server Components** 정식 지원\n2. **Actions** API를 통한 폼 처리 개선\n3. **use()** 훅으로 Promise/Context 직접 소비',
  timestamp: 1709712120000,
  tokens: 150,
}

export const UserMessage: Story = {
  args: {
    message: userMessage,
  },
}

export const AssistantMessage: Story = {
  args: {
    message: assistantMessage,
    modelName: 'GPT-4o',
  },
}

export const WithTokens: Story = {
  args: {
    message: assistantMessageWithTokens,
    modelName: 'Claude 3.5 Sonnet',
    tokens: 150,
  },
}
