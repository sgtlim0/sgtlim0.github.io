import type { Meta, StoryObj } from '@storybook/react'
import { MobileChatView } from '@hchat/ui/mobile'
import type { MobileChatMessage } from '@hchat/ui/mobile'

const mockMessages: MobileChatMessage[] = [
  { role: 'user', content: '현대자동차 2024년 매출 실적을 요약해줘.' },
  {
    role: 'assistant',
    content:
      '현대자동차의 2024년 연간 매출은 약 162.7조 원으로, 전년 대비 7.3% 증가했습니다. 주요 성장 동력은 전기차 라인업 확대와 북미 시장에서의 판매 호조입니다.',
  },
  { role: 'user', content: '전기차 판매량은 어떻게 돼?' },
  {
    role: 'assistant',
    content:
      '2024년 현대자동차의 전기차 판매량은 약 42만 대로, 전년 대비 31% 증가했습니다. 아이오닉 5와 아이오닉 6가 주요 판매 모델입니다.',
  },
]

const meta: Meta<typeof MobileChatView> = {
  title: 'Mobile/MobileChatView',
  component: MobileChatView,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '600px', maxWidth: '480px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    modelName: 'GPT-4o',
    messages: mockMessages,
  },
}

export const Streaming: Story = {
  args: {
    modelName: 'Claude 3.5',
    messages: mockMessages,
    isStreaming: true,
  },
}
