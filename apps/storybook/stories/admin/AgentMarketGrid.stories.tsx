import type { Meta, StoryObj } from '@storybook/react'
import { AgentMarketGrid, MOCK_AGENTS } from '@hchat/ui/admin'

const meta: Meta<typeof AgentMarketGrid> = {
  title: 'Admin/Marketplace/AgentMarketGrid',
  component: AgentMarketGrid,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ padding: 24 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    agents: MOCK_AGENTS,
    installedIds: [],
    onInstall: (id) => {},
    onDetail: (id) => {},
  },
}

export const WithInstalled: Story = {
  args: {
    agents: MOCK_AGENTS,
    installedIds: ['agent-translator', 'agent-code-review', 'agent-sql-helper'],
    onInstall: (id) => {},
    onDetail: (id) => {},
  },
}

export const Empty: Story = {
  args: {
    agents: [],
    installedIds: [],
    onInstall: (id) => {},
    onDetail: (id) => {},
  },
}
