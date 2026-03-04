import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ROIDataUpload, ROIDataProvider } from '@hchat/ui'

const meta: Meta<typeof ROIDataUpload> = {
  title: 'ROI/Pages/ROIDataUpload',
  component: ROIDataUpload,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/roi/upload' } },
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
type Story = StoryObj<typeof ROIDataUpload>

export const Default: Story = {}
