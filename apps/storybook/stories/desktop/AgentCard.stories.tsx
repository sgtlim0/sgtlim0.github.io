import type { Meta, StoryObj } from '@storybook/react'
import { AgentCard } from '@hchat/ui/desktop'
import type { DesktopAgent } from '@hchat/ui/desktop'

const meta: Meta<typeof AgentCard> = {
  title: 'Desktop/AgentCard',
  component: AgentCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const codingAgent: DesktopAgent = {
  id: 'agent-001',
  name: 'Code Assistant',
  description: '코드 리뷰, 리팩토링, 버그 수정을 도와주는 코딩 전문 에이전트입니다.',
  icon: '💻',
  model: 'GPT-4o',
  systemPrompt: 'You are an expert software engineer.',
  category: 'coding',
  isActive: true,
}

const inactiveAgent: DesktopAgent = {
  id: 'agent-002',
  name: 'Data Analyst',
  description: '데이터 분석과 시각화를 지원하는 분석 전문 에이전트입니다.',
  icon: '📊',
  model: 'Claude 3.5 Sonnet',
  systemPrompt: 'You are a data analysis expert.',
  category: 'analysis',
  isActive: false,
}

export const Default: Story = {
  args: {
    agent: codingAgent,
  },
}

export const InactiveAgent: Story = {
  args: {
    agent: inactiveAgent,
  },
}
