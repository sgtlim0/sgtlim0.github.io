import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import MyPage from '@hchat/ui/user/pages/MyPage'

const meta: Meta<typeof MyPage> = {
  title: 'User/Pages/MyPage',
  component: MyPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/my' } },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof MyPage>

export const Default: Story = {}
