import type { Meta, StoryObj } from '@storybook/react'
import { DesktopSidebar } from '@hchat/ui/desktop'

const meta: Meta<typeof DesktopSidebar> = {
  title: 'Desktop/DesktopSidebar',
  component: DesktopSidebar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    activeItem: 'chat',
  },
}

export const Collapsed: Story = {
  args: {
    activeItem: 'chat',
    collapsed: true,
  },
}
