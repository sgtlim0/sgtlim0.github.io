import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ROIAdoption, ROIDataProvider } from '@hchat/ui'

const meta: Meta<typeof ROIAdoption> = {
  title: 'ROI/Pages/ROIAdoption',
  component: ROIAdoption,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/roi/adoption' } },
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
type Story = StoryObj<typeof ROIAdoption>

export const Default: Story = {}
