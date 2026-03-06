import type { Meta, StoryObj } from '@storybook/react'
import { MobileTabBar } from '@hchat/ui/mobile'

const meta: Meta<typeof MobileTabBar> = {
  title: 'Mobile/MobileTabBar',
  component: MobileTabBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '100px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    activeTab: 'chat',
  },
}

export const Assistants: Story = {
  args: {
    activeTab: 'assistants',
  },
}

export const History: Story = {
  args: {
    activeTab: 'history',
  },
}

export const Settings: Story = {
  args: {
    activeTab: 'settings',
  },
}
