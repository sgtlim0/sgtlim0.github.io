import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ROIAnalysis, ROIDataProvider } from '@hchat/ui/roi'

const meta: Meta<typeof ROIAnalysis> = {
  title: 'ROI/Pages/ROIAnalysis',
  component: ROIAnalysis,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/roi/analysis' } },
  },
  decorators: [
    (Story) => (
      <ROIDataProvider>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
          <Story />
        </div>
      </ROIDataProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ROIAnalysis>

export const Default: Story = {}
