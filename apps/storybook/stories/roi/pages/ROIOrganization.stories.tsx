import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ROIOrganization, ROIDataProvider } from '@hchat/ui'

const meta: Meta<typeof ROIOrganization> = {
  title: 'ROI/Pages/ROIOrganization',
  component: ROIOrganization,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/roi/organization' } },
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
type Story = StoryObj<typeof ROIOrganization>

export const Default: Story = {}
