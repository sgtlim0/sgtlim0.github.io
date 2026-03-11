import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { Switch } from '@hchat/ui'

const meta: Meta<typeof Switch> = {
  title: 'Shared/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof Switch>

// ---- 3 Color Variants ----

export const ColorVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Switch initialChecked color="primary" label="Primary" aria-label="Primary switch" />
      <Switch initialChecked color="success" label="Success" aria-label="Success switch" />
      <Switch initialChecked color="danger" label="Danger" aria-label="Danger switch" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const tracks = canvas.getAllByTestId('switch-track')

    // All 3 switches should render checked
    await expect(tracks).toHaveLength(3)
    await expect(tracks[0]).toHaveAttribute('data-checked', 'true')
    await expect(tracks[1]).toHaveAttribute('data-checked', 'true')
    await expect(tracks[2]).toHaveAttribute('data-checked', 'true')

    // Verify color attributes
    await expect(tracks[0]).toHaveAttribute('data-color', 'primary')
    await expect(tracks[1]).toHaveAttribute('data-color', 'success')
    await expect(tracks[2]).toHaveAttribute('data-color', 'danger')

    // Toggle the primary switch off
    await userEvent.click(tracks[0])

    await waitFor(() => {
      expect(tracks[0]).toHaveAttribute('data-checked', 'false')
    })
  },
}

// ---- Disabled State ----

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Switch disabled label="Disabled off" aria-label="Disabled off" />
      <Switch disabled initialChecked label="Disabled on" aria-label="Disabled on" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const tracks = canvas.getAllByTestId('switch-track')

    // Both should be disabled
    await expect(tracks[0]).toHaveAttribute('data-disabled', 'true')
    await expect(tracks[1]).toHaveAttribute('data-disabled', 'true')

    // Disabled off stays off after click attempt
    await userEvent.click(tracks[0])
    await expect(tracks[0]).toHaveAttribute('data-checked', 'false')

    // Disabled on stays on after click attempt
    await userEvent.click(tracks[1])
    await expect(tracks[1]).toHaveAttribute('data-checked', 'true')
  },
}
