import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MiniBarChart } from '@hchat/ui'

const weeklyData = [
  { label: '1주', value: 120 },
  { label: '2주', value: 180 },
  { label: '3주', value: 150 },
  { label: '4주', value: 210 },
  { label: '5주', value: 190 },
  { label: '6주', value: 240 },
  { label: '7주', value: 200 },
  { label: '8주', value: 280 },
]

const meta: Meta<typeof MiniBarChart> = {
  title: 'ROI/MiniBarChart',
  component: MiniBarChart,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 400,
          padding: 24,
          background: 'var(--roi-card-bg, #fff)',
          borderRadius: 12,
        }}
      >
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof MiniBarChart>

export const Default: Story = { args: { data: weeklyData } }
export const CustomColor: Story = {
  args: { data: weeklyData, color: 'var(--roi-chart-3, #F59E0B)' },
}
export const Short: Story = { args: { data: weeklyData.slice(0, 4), height: 120 } }
