import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { default as ColorPicker } from '@hchat/ui/ColorPicker'

const meta: Meta<typeof ColorPicker> = {
  title: 'Shared/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof ColorPicker>

export const HexInput: Story = {
  render: () => (
    <div className="max-w-xs mx-auto p-6">
      <ColorPicker initialColor="#3b82f6" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Preview should show initial color
    const preview = canvasElement.querySelector('[data-testid="color-preview"]')
    expect(preview).toBeTruthy()
    expect(preview?.textContent).toContain('#3b82f6')

    // Type a new HEX value
    const hexInput = canvas.getByLabelText('HEX color input')
    await userEvent.clear(hexInput)
    await userEvent.type(hexInput, '#ef4444')

    await waitFor(() => {
      const updatedPreview = canvasElement.querySelector('[data-testid="color-preview"]')
      expect(updatedPreview?.textContent).toContain('#ef4444')
    })
  },
}

export const RGBSliders: Story = {
  render: () => (
    <div className="max-w-xs mx-auto p-6">
      <ColorPicker initialColor="#000000" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find RGB sliders
    const redSlider = canvas.getByLabelText('Red channel')
    const greenSlider = canvas.getByLabelText('Green channel')
    const blueSlider = canvas.getByLabelText('Blue channel')

    expect(redSlider).toBeTruthy()
    expect(greenSlider).toBeTruthy()
    expect(blueSlider).toBeTruthy()

    // Verify initial slider values
    expect(redSlider).toHaveAttribute('value', '0')
  },
}

export const Presets: Story = {
  render: () => (
    <div className="max-w-xs mx-auto p-6">
      <ColorPicker initialColor="#000000" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click a preset color (red)
    const redPreset = canvas.getByLabelText('Select color #ef4444')
    await userEvent.click(redPreset)

    await waitFor(() => {
      const preview = canvasElement.querySelector('[data-testid="color-preview"]')
      expect(preview?.textContent).toContain('#ef4444')
    })

    // Click another preset (blue)
    const bluePreset = canvas.getByLabelText('Select color #3b82f6')
    await userEvent.click(bluePreset)

    await waitFor(() => {
      const preview = canvasElement.querySelector('[data-testid="color-preview"]')
      expect(preview?.textContent).toContain('#3b82f6')
    })
  },
}
