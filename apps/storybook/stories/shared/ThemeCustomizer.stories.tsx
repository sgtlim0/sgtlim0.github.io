import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect } from '@storybook/test'
import { ThemeCustomizer } from '@hchat/ui'

const meta: Meta<typeof ThemeCustomizer> = {
  title: 'Shared/ThemeCustomizer',
  component: ThemeCustomizer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof ThemeCustomizer>

export const Default: Story = {
  args: {
    className: 'max-w-md mx-auto',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify main heading
    expect(canvas.getByText('Theme Customizer')).toBeTruthy()

    // Verify preset section exists
    expect(canvas.getByText('Presets')).toBeTruthy()

    // Verify color section exists
    expect(canvas.getByText('Colors')).toBeTruthy()

    // Verify preview section exists
    expect(canvas.getByText('Preview')).toBeTruthy()

    // Click first preset button (should be available)
    const presetButtons = canvas.getAllByRole('button', { pressed: false })
    if (presetButtons.length > 0) {
      await userEvent.click(presetButtons[0])
    }
  },
}

export const PresetSwitching: Story = {
  args: {
    className: 'max-w-md mx-auto',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find all preset buttons (they have aria-pressed attribute)
    const presetButtons = canvasElement.querySelectorAll('button[aria-pressed]')
    expect(presetButtons.length).toBeGreaterThanOrEqual(2)

    // Click second preset
    if (presetButtons.length >= 2) {
      await userEvent.click(presetButtons[1])
    }

    // Click reset button
    const resetButton = canvas.getByText('Reset')
    await userEvent.click(resetButton)
  },
}
