import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { HeatmapCell } from '@hchat/ui/roi'

const meta: Meta<typeof HeatmapCell> = {
  title: 'ROI/HeatmapCell',
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

export const High: Story = { args: { value: '92%', level: 'high' } }
export const Mid: Story = { args: { value: '65%', level: 'mid' } }
export const Low: Story = { args: { value: '23%', level: 'low' } }

export const Row = () => (
  <table>
    <tbody>
      <tr>
        <HeatmapCell value="92%" level="high" />
        <HeatmapCell value="65%" level="mid" />
        <HeatmapCell value="23%" level="low" />
        <HeatmapCell value="87%" level="high" />
      </tr>
    </tbody>
  </table>
)
