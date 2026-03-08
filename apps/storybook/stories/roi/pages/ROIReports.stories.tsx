import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ROIReports } from '@hchat/ui/roi'

const meta: Meta<typeof ROIReports> = {
  title: 'ROI/Pages/ROIReports',
  component: ROIReports,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/roi/reports' } },
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
type Story = StoryObj<typeof ROIReports>

export const Default: Story = {}
