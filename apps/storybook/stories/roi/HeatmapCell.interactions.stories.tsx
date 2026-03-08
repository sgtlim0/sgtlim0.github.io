import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from '@storybook/test'
import { HeatmapCell } from '@hchat/ui/roi'

const meta: Meta<typeof HeatmapCell> = {
  title: 'ROI/HeatmapCell/Interactions',
  component: HeatmapCell,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <table>
        <tbody>
          <tr>
            <Story />
          </tr>
        </tbody>
      </table>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof HeatmapCell>

export const RendersHighValue: Story = {
  args: { value: '92%', level: 'high' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('92%')).toBeInTheDocument()
  },
}

export const RendersLowValue: Story = {
  args: { value: '23%', level: 'low' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('23%')).toBeInTheDocument()
  },
}
