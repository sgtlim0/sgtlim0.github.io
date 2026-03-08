import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within, userEvent } from '@storybook/test'
import CustomAssistantModal from '@hchat/ui/user/components/CustomAssistantModal'

const meta: Meta<typeof CustomAssistantModal> = {
  title: 'User/Molecules/CustomAssistantModal/Interactions',
  component: CustomAssistantModal,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CustomAssistantModal>

export const CloseModal: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    onSave: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const closeBtn = canvas.getByLabelText('닫기')
    await userEvent.click(closeBtn)
    await expect(args.onClose).toHaveBeenCalledTimes(1)
  },
}
