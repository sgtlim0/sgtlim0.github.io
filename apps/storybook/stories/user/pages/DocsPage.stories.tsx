import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import DocsPage from '@hchat/ui/user/pages/DocsPage'

const meta: Meta<typeof DocsPage> = {
  title: 'User/Pages/DocsPage',
  component: DocsPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/docs' } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 24, minHeight: '100vh' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof DocsPage>

export const Default: Story = {}
