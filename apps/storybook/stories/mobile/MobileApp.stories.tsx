import type { Meta, StoryObj } from '@storybook/react'
import { MobileApp } from '@hchat/ui/mobile'

const meta: Meta<typeof MobileApp> = {
  title: 'Mobile/MobileApp',
  component: MobileApp,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div
        style={{
          height: '812px',
          maxWidth: '480px',
          margin: '0 auto',
          border: '1px solid #ddd',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
