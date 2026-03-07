import type { Meta, StoryObj } from '@storybook/react'
import { AgentMarketCard, MOCK_AGENTS } from '@hchat/ui/admin'

const meta: Meta<typeof AgentMarketCard> = {
  title: 'Admin/Marketplace/AgentMarketCard',
  component: AgentMarketCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360, padding: 20 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    agent: MOCK_AGENTS[0],
    installed: false,
    onInstall: (id) => {},
    onDetail: (id) => {},
  },
}

export const Installed: Story = {
  args: {
    agent: MOCK_AGENTS[1],
    installed: true,
    onInstall: (id) => {},
    onDetail: (id) => {},
  },
}

export const HighRating: Story = {
  args: {
    agent: MOCK_AGENTS[1], // 코드 리뷰어 4.9
    installed: false,
    onInstall: (id) => {},
    onDetail: (id) => {},
  },
}

export const LowInstalls: Story = {
  args: {
    agent: MOCK_AGENTS[5], // 이미지 생성 2,400
    installed: false,
    onInstall: (id) => {},
    onDetail: (id) => {},
  },
}
