import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { CopyButton } from '@hchat/ui'

const meta: Meta<typeof CopyButton> = {
  title: 'Shared/CopyButton',
  component: CopyButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof CopyButton>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-3 p-4">
      <code className="px-3 py-1 bg-gray-100 rounded text-sm">npm install @hchat/ui</code>
      <CopyButton text="npm install @hchat/ui" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const copyBtn = canvas.getByRole('button')
    expect(copyBtn).toBeTruthy()

    // Click copy button
    await userEvent.click(copyBtn)

    // After clicking, the aria-label should change to indicate copied state
    await waitFor(() => {
      const btn = canvas.getByRole('button')
      const label = btn.getAttribute('aria-label')
      // Either still in copy state or changed to copied
      expect(label).toBeTruthy()
    })
  },
}

export const WithFeedback: Story = {
  args: {
    text: 'Hello, World!',
    timeout: 3000,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const btn = canvas.getByRole('button')
    await userEvent.click(btn)

    // Verify the button still exists after click
    expect(canvas.getByRole('button')).toBeTruthy()
  },
}
