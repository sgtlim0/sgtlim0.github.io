import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect } from '@storybook/test'
import { DynamicForm } from '@hchat/ui'
import type { FieldConfig } from '@hchat/ui'

const sampleFields: FieldConfig[] = [
  { name: 'name', type: 'text', label: 'Name', required: true, placeholder: 'Enter name' },
  { name: 'email', type: 'email', label: 'Email', required: true, placeholder: 'user@example.com' },
  { name: 'password', type: 'password', label: 'Password', required: true, placeholder: 'Min 8 characters' },
  { name: 'age', type: 'number', label: 'Age', placeholder: '25' },
  { name: 'role', type: 'select', label: 'Role', options: [
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Editor' },
    { value: 'viewer', label: 'Viewer' },
  ]},
  { name: 'bio', type: 'textarea', label: 'Bio', placeholder: 'Tell us about yourself' },
  { name: 'terms', type: 'checkbox', label: 'I agree to the terms and conditions', required: true },
]

const meta: Meta<typeof DynamicForm> = {
  title: 'Shared/DynamicForm',
  component: DynamicForm,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof DynamicForm>

export const SevenFieldTypes: Story = {
  args: {
    fields: sampleFields,
    onSubmit: (values) => {
      window.alert(JSON.stringify(values, null, 2))
    },
    submitLabel: 'Create Account',
    className: 'max-w-md mx-auto p-6',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Fill in required fields
    const nameInput = canvas.getByLabelText(/Name/)
    await userEvent.type(nameInput, 'John Doe')
    expect(nameInput).toHaveValue('John Doe')

    const emailInput = canvas.getByLabelText(/Email/)
    await userEvent.type(emailInput, 'john@example.com')

    const passwordInput = canvas.getByLabelText(/Password/)
    await userEvent.type(passwordInput, 'secureP@ss1')

    // Verify submit button exists
    const submitBtn = canvas.getByRole('button', { name: 'Create Account' })
    expect(submitBtn).toBeTruthy()
  },
}

export const MinimalForm: Story = {
  args: {
    fields: [
      { name: 'search', type: 'text', label: 'Search', placeholder: 'Search...' },
    ],
    onSubmit: () => {},
    submitLabel: 'Search',
    className: 'max-w-sm mx-auto p-4',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const input = canvas.getByLabelText(/Search/)
    await userEvent.type(input, 'hello')
    expect(input).toHaveValue('hello')
  },
}
