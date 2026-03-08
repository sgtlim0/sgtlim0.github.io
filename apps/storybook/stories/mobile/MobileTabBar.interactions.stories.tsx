import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within, userEvent } from '@storybook/test'
import { MobileTabBar } from '@hchat/ui/mobile'

const meta: Meta<typeof MobileTabBar> = {
  title: 'Mobile/MobileTabBar/Interactions',
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

export const RendersAllTabs: Story = {
  args: { activeTab: 'chat' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('채팅')).toBeInTheDocument()
    await expect(canvas.getByText('도우미')).toBeInTheDocument()
    await expect(canvas.getByText('기록')).toBeInTheDocument()
    await expect(canvas.getByText('설정')).toBeInTheDocument()
  },
}

export const ClickTab: Story = {
  args: { activeTab: 'chat', onTabChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const settingsTab = canvas.getByText('설정')
    await userEvent.click(settingsTab)
    await expect(args.onTabChange).toHaveBeenCalledWith('settings')
  },
}
