import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { NumberInput } from '@hchat/ui'

const meta: Meta<typeof NumberInput> = {
  title: 'Shared/NumberInput',
  component: NumberInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ padding: 24, maxWidth: 240 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof NumberInput>

// ---- Default ----

export const Default: Story = {
  args: {
    initialValue: 5,
    'aria-label': 'Default number',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByTestId('number-input-field')
    await expect(input).toHaveValue('5')
  },
}

// ---- Range Constrained (min/max/step) ----

function RangeDemo() {
  const [value, setValue] = useState(0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <NumberInput
        initialValue={0}
        min={0}
        max={10}
        step={2}
        onChange={setValue}
        aria-label="Range input"
      />
      <span data-testid="range-display" style={{ fontSize: 12, color: '#6b7280' }}>
        Value: {value} (min 0, max 10, step 2)
      </span>
    </div>
  )
}

export const RangeConstrained: Story = {
  render: () => <RangeDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Increment from 0 -> 2
    const incBtn = canvas.getByTestId('number-input-increment')
    await userEvent.click(incBtn)

    await waitFor(() => {
      const input = canvas.getByTestId('number-input-field')
      expect(input).toHaveValue('2')
    })

    // Decrement back to 0
    const decBtn = canvas.getByTestId('number-input-decrement')
    await userEvent.click(decBtn)

    await waitFor(() => {
      const input = canvas.getByTestId('number-input-field')
      expect(input).toHaveValue('0')
    })

    // Decrement button should be disabled at min
    await expect(decBtn).toBeDisabled()
  },
}
