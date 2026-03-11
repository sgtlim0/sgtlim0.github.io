import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, expect } from '@storybook/test'
import { PageSkeleton } from '@hchat/ui'

const meta: Meta<typeof PageSkeleton> = {
  title: 'Shared/PageSkeleton',
  component: PageSkeleton,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof PageSkeleton>

export const Dashboard: Story = {
  args: { variant: 'dashboard' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const status = canvas.getByRole('status')
    await expect(status).toHaveAttribute('aria-busy', 'true')
    await expect(status).toHaveAttribute('aria-label', 'Loading dashboard')
  },
}

export const List: Story = {
  args: { variant: 'list' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const status = canvas.getByRole('status')
    await expect(status).toHaveAttribute('aria-busy', 'true')
    await expect(status).toHaveAttribute('aria-label', 'Loading list')
  },
}
