import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import OCRPage from '@hchat/ui/user/pages/OCRPage'

const meta: Meta<typeof OCRPage> = {
  title: 'User/Pages/OCRPage',
  component: OCRPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/ocr' } },
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
type Story = StoryObj<typeof OCRPage>

export const Default: Story = {}
