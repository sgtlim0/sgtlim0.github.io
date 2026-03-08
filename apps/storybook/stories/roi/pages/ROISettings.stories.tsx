import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ROISettings } from '@hchat/ui/roi'

const meta: Meta<typeof ROISettings> = {
  title: 'ROI/Pages/ROISettings',
  component: ROISettings,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/roi/settings' } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ROISettings>

export const Default: Story = {}
