import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { Tooltip } from '@hchat/ui'

const meta: Meta<typeof Tooltip> = {
  title: 'Shared/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof Tooltip>

export const FourDirections: Story = {
  render: () => (
    <div className="flex items-center gap-8 p-16">
      <Tooltip content="Top tooltip" placement="top">
        <button className="px-4 py-2 border rounded-lg text-sm">Top</button>
      </Tooltip>
      <Tooltip content="Bottom tooltip" placement="bottom">
        <button className="px-4 py-2 border rounded-lg text-sm">Bottom</button>
      </Tooltip>
      <Tooltip content="Left tooltip" placement="left">
        <button className="px-4 py-2 border rounded-lg text-sm">Left</button>
      </Tooltip>
      <Tooltip content="Right tooltip" placement="right">
        <button className="px-4 py-2 border rounded-lg text-sm">Right</button>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Hover over the "Top" button to trigger tooltip
    const topButton = canvas.getByText('Top')
    await userEvent.hover(topButton)

    await waitFor(
      () => {
        const tooltip = document.querySelector('[data-testid="tooltip"]')
        expect(tooltip).toBeTruthy()
      },
      { timeout: 1000 },
    )

    // Unhover
    await userEvent.unhover(topButton)
  },
}

export const LongContent: Story = {
  render: () => (
    <div className="p-16 flex justify-center">
      <Tooltip
        content="This is a longer tooltip message that wraps to multiple lines for demonstration purposes."
        placement="top"
      >
        <button className="px-4 py-2 border rounded-lg text-sm">Hover for long tooltip</button>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.hover(canvas.getByText('Hover for long tooltip'))

    await waitFor(
      () => {
        const tooltip = document.querySelector('[data-testid="tooltip"]')
        expect(tooltip).toBeTruthy()
      },
      { timeout: 1000 },
    )
  },
}
