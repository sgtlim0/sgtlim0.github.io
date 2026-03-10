import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { SettingsPanel } from '@hchat/ui'
import type { SettingField } from '@hchat/ui'

const sampleFields: SettingField[] = [
  {
    key: 'username',
    label: 'Username',
    type: 'text',
    value: 'admin',
    description: 'Your display name in the system.',
    category: 'Profile',
  },
  {
    key: 'email_notifications',
    label: 'Email Notifications',
    type: 'boolean',
    value: true,
    description: 'Receive notifications via email.',
    category: 'Profile',
  },
  {
    key: 'max_tokens',
    label: 'Max Tokens',
    type: 'number',
    value: 4096,
    min: 256,
    max: 32768,
    step: 256,
    description: 'Maximum token limit per request.',
    category: 'AI Settings',
  },
  {
    key: 'model',
    label: 'Default Model',
    type: 'select',
    value: 'gpt-4',
    options: [
      { value: 'gpt-4', label: 'GPT-4' },
      { value: 'claude-3', label: 'Claude 3' },
      { value: 'gemini', label: 'Gemini Pro' },
    ],
    description: 'Default AI model for new conversations.',
    category: 'AI Settings',
  },
  {
    key: 'accent_color',
    label: 'Accent Color',
    type: 'color',
    value: '#3b82f6',
    description: 'Primary accent color for the UI.',
    category: 'Appearance',
  },
  {
    key: 'font_size',
    label: 'Font Size',
    type: 'range',
    value: 14,
    min: 10,
    max: 24,
    step: 1,
    description: 'Base font size in pixels.',
    category: 'Appearance',
  },
]

const meta: Meta<typeof SettingsPanel> = {
  title: 'Shared/SettingsPanel',
  component: SettingsPanel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof SettingsPanel>

export const AllFieldTypes: Story = {
  render: () => (
    <div className="max-w-xl mx-auto p-6">
      <SettingsPanel
        fields={sampleFields}
        onSave={(values) => {
          // no-op for story
        }}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify category headers rendered
    expect(canvas.getByText('Profile')).toBeTruthy()
    expect(canvas.getByText('AI Settings')).toBeTruthy()
    expect(canvas.getByText('Appearance')).toBeTruthy()

    // Modify text field
    const usernameInput = canvasElement.querySelector('#setting-username') as HTMLInputElement
    expect(usernameInput).toBeTruthy()
    await userEvent.clear(usernameInput)
    await userEvent.type(usernameInput, 'new_admin')

    // Save button should be enabled (dirty state)
    await waitFor(() => {
      const saveBtn = canvas.getByLabelText('Save')
      expect(saveBtn).not.toBeDisabled()
    })

    // Toggle checkbox
    const checkbox = canvasElement.querySelector('#setting-email_notifications') as HTMLInputElement
    expect(checkbox).toBeTruthy()
    await userEvent.click(checkbox)

    // Reset should also be enabled
    const resetBtn = canvas.getByLabelText('Reset')
    expect(resetBtn).not.toBeDisabled()

    // Click Reset to restore defaults
    await userEvent.click(resetBtn)

    await waitFor(() => {
      const saveBtn = canvas.getByLabelText('Save')
      expect(saveBtn).toBeDisabled()
    })
  },
}
