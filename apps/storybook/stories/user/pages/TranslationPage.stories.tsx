import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import TranslationPage from '@hchat/ui/user/pages/TranslationPage'

const meta: Meta<typeof TranslationPage> = {
  title: 'User/Pages/TranslationPage',
  component: TranslationPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/translation' } },
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
type Story = StoryObj<typeof TranslationPage>

export const Default: Story = {}
