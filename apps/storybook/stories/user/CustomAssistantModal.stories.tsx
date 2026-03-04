import type { Meta, StoryObj } from '@storybook/react'
import CustomAssistantModal from '@hchat/ui/user/components/CustomAssistantModal'
import { mockAssistants } from '@hchat/ui/user/services/mockData'

const meta: Meta<typeof CustomAssistantModal> = {
  title: 'User/Molecules/CustomAssistantModal',
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

export const CreateNew: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onSave: (assistant) => {},
  },
}

export const EditExisting: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onSave: (assistant) => {},
    editingAssistant: {
      ...mockAssistants[0],
      isOfficial: false,
    },
  },
}

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    onSave: (assistant) => {},
  },
}
