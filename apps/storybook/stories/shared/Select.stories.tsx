import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { Select } from '@hchat/ui'
import type { SelectOption } from '@hchat/ui'

const fruitOptions: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape', disabled: true },
]

const meta: Meta<typeof Select> = {
  title: 'Shared/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof Select>

export const Searchable: Story = {
  render: () => (
    <div className="max-w-xs mx-auto p-6">
      <label className="block text-sm font-medium mb-2">Favorite Fruit</label>
      <Select
        options={fruitOptions}
        searchable
        placeholder="Search fruits..."
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open dropdown
    const trigger = canvas.getByText('Search fruits...')
    await userEvent.click(trigger)

    await waitFor(() => {
      expect(canvas.getByText('Apple')).toBeTruthy()
    })

    // Type in search
    const searchInput = canvas.getByRole('textbox', { name: 'Search options' })
    await userEvent.type(searchInput, 'ch')

    await waitFor(() => {
      expect(canvas.getByText('Cherry')).toBeTruthy()
    })
  },
}

export const MultiSelect: Story = {
  render: () => (
    <div className="max-w-xs mx-auto p-6">
      <label className="block text-sm font-medium mb-2">Select Multiple</label>
      <Select
        options={fruitOptions}
        multiple
        placeholder="Pick fruits..."
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open dropdown
    await userEvent.click(canvas.getByText('Pick fruits...'))

    await waitFor(() => {
      expect(canvas.getByText('Apple')).toBeTruthy()
    })

    // Select first option
    await userEvent.click(canvas.getByText('Apple'))

    // Select second option
    await userEvent.click(canvas.getByText('Banana'))

    // Should show "2 selected"
    await waitFor(() => {
      const trigger = canvasElement.querySelector('[role="combobox"], [tabindex="0"]')
      expect(trigger?.textContent).toContain('2 selected')
    })
  },
}
