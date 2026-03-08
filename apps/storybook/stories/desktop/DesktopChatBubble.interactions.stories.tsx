import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import { DesktopChatBubble } from '@hchat/ui/desktop'
import type { DesktopMessage } from '@hchat/ui/desktop'

const userMessage: DesktopMessage = {
  id: 'msg-001',
  role: 'user',
  content: 'TypeScript에서 제네릭 타입을 사용하는 방법을 설명해 주세요.',
  timestamp: 1709712000000,
}

const assistantMessage: DesktopMessage = {
  id: 'msg-002',
  role: 'assistant',
  content: '제네릭(Generics)은 타입을 매개변수로 받아 재사용 가능한 컴포넌트를 만들 수 있게 해줍니다.',
  timestamp: 1709712060000,
}

const meta: Meta<typeof DesktopChatBubble> = {
  title: 'Desktop/DesktopChatBubble/Interactions',
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

export const RendersUserContent: Story = {
  args: { message: userMessage },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/TypeScript에서 제네릭 타입/)).toBeInTheDocument()
  },
}

export const RendersAssistantContent: Story = {
  args: { message: assistantMessage, modelName: 'GPT-4o' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/제네릭.*Generics/)).toBeInTheDocument()
  },
}
