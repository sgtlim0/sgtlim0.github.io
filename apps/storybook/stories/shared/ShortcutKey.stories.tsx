import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, expect } from '@storybook/test'
import { ShortcutKey } from '@hchat/ui'

const meta: Meta<typeof ShortcutKey> = {
  title: 'Shared/ShortcutKey',
  component: ShortcutKey,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof ShortcutKey>

export const SingleKey: Story = {
  args: { keys: 'escape' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Should render at least one <kbd> element
    const kbds = canvas.getAllByText(/Esc/i)
    await expect(kbds.length).toBeGreaterThanOrEqual(1)
  },
}

export const KeyCombo: Story = {
  args: { keys: 'mod+shift+p' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Should render multiple kbd elements joined by "+"
    const plusSigns = canvas.getAllByText('+')
    await expect(plusSigns.length).toBe(2)

    // The "P" key should be present
    await expect(canvas.getByText('P')).toBeInTheDocument()
  },
}
