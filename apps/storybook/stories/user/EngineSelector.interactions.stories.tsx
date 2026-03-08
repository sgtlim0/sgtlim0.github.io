import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within, userEvent } from '@storybook/test'
import EngineSelector from '@hchat/ui/user/components/EngineSelector'

const meta: Meta<typeof EngineSelector> = {
  title: 'User/Molecules/EngineSelector/Interactions',
  component: EngineSelector,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof EngineSelector>

export const SelectEngine: Story = {
  args: {
    selectedEngine: 'internal',
    onSelect: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const deeplOption = canvas.getByText('DeepL')
    await userEvent.click(deeplOption)
    await expect(args.onSelect).toHaveBeenCalledWith('deepl')
  },
}
