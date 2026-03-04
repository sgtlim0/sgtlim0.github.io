import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ROISentiment, ROIDataProvider } from '@hchat/ui'

const meta: Meta<typeof ROISentiment> = {
  title: 'ROI/Pages/ROISentiment',
  component: ROISentiment,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/roi/sentiment' } },
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
type Story = StoryObj<typeof ROISentiment>

export const Default: Story = {}
