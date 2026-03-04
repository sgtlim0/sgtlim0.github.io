import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ROIOverview, ROIDataProvider } from '@hchat/ui'

const meta: Meta<typeof ROIOverview> = {
  title: 'ROI/Pages/ROIOverview',
  component: ROIOverview,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/roi/overview' } },
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
type Story = StoryObj<typeof ROIOverview>

export const Default: Story = {}
