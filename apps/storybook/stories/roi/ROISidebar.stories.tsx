import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ROISidebar } from '@hchat/ui'

const meta: Meta<typeof ROISidebar> = {
  title: 'ROI/ROISidebar',
  component: ROISidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/roi/overview' } },
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof ROISidebar>

export const Default: Story = {}
export const UploadActive: Story = {
  parameters: { nextjs: { appDirectory: true, navigation: { pathname: '/roi/upload' } } },
}
export const SettingsActive: Story = {
  parameters: { nextjs: { appDirectory: true, navigation: { pathname: '/roi/settings' } } },
}
