import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect } from '@storybook/test'
import { Playground } from '@hchat/ui'
import type { PropDef } from '@hchat/ui'

const samplePropDefs: readonly PropDef[] = [
  { name: 'label', type: 'string', defaultValue: 'Hello' },
  { name: 'size', type: 'select', defaultValue: 'md', options: ['sm', 'md', 'lg'] },
  { name: 'rounded', type: 'boolean', defaultValue: false },
  { name: 'opacity', type: 'range', defaultValue: 100, min: 0, max: 100, step: 10 },
]

const meta: Meta<typeof Playground> = {
  title: 'Shared/Playground',
  component: Playground,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof Playground>

export const Default: Story = {
  args: {
    componentName: 'Badge',
    propDefs: samplePropDefs,
    children: (values) => (
      <div
        style={{
          padding: '8px 16px',
          borderRadius: values.rounded ? '9999px' : '6px',
          fontSize: values.size === 'sm' ? 12 : values.size === 'lg' ? 18 : 14,
          opacity: Number(values.opacity) / 100,
          backgroundColor: '#3b82f6',
          color: '#fff',
        }}
      >
        {String(values.label)}
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify Props heading and Reset button render
    await expect(canvas.getByText('Props')).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Reset props' })).toBeInTheDocument()

    // Toggle the boolean prop
    const checkbox = canvas.getByRole('checkbox')
    await userEvent.click(checkbox)
    await expect(checkbox).toBeChecked()

    // Edit the string prop
    const labelInput = canvas.getByDisplayValue('Hello')
    await userEvent.clear(labelInput)
    await userEvent.type(labelInput, 'World')
    await expect(labelInput).toHaveValue('World')

    // Generated Code section is visible
    await expect(canvas.getByText('Generated Code')).toBeInTheDocument()
  },
}

export const ResetProps: Story = {
  args: {
    componentName: 'Button',
    propDefs: [
      { name: 'text', type: 'string', defaultValue: 'Click me' },
      { name: 'disabled', type: 'boolean', defaultValue: false },
    ],
    children: (values) => (
      <button type="button" disabled={!!values.disabled}>
        {String(values.text)}
      </button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Modify a prop then reset
    const input = canvas.getByDisplayValue('Click me')
    await userEvent.clear(input)
    await userEvent.type(input, 'Changed')
    await expect(input).toHaveValue('Changed')

    await userEvent.click(canvas.getByRole('button', { name: 'Reset props' }))
    await expect(canvas.getByDisplayValue('Click me')).toBeInTheDocument()
  },
}
