import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within, userEvent } from '@storybook/test'
import SettingsRow from '@hchat/ui/admin/SettingsRow'

const meta: Meta<typeof SettingsRow> = {
  title: 'Admin/Molecules/SettingsRow/Interactions',
  component: SettingsRow,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 600 }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof SettingsRow>

export const ToggleSwitch: Story = {
  args: { label: 'Claude 3.5 Sonnet', description: '일일 한도: 100,000 토큰', enabled: true, onToggle: fn(), onEdit: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const toggle = canvas.getByRole('switch')
    await expect(toggle).toHaveAttribute('aria-checked', 'true')

    await userEvent.click(toggle)
    await expect(args.onToggle).toHaveBeenCalledWith(false)
  },
}

export const ClickEditButton: Story = {
  args: { label: 'GPT-4 Turbo', description: '일일 한도: 50,000 토큰', enabled: false, onToggle: fn(), onEdit: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const editBtn = canvas.getByLabelText('GPT-4 Turbo 수정')
    await userEvent.click(editBtn)
    await expect(args.onEdit).toHaveBeenCalledTimes(1)
  },
}
