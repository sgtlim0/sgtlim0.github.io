import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ROIProductivity, ROIDataProvider } from '@hchat/ui/roi'

const meta: Meta<typeof ROIProductivity> = {
  title: 'ROI/Pages/ROIProductivity',
  component: ROIProductivity,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/roi/productivity' } },
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
type Story = StoryObj<typeof ROIProductivity>

export const Default: Story = {}
