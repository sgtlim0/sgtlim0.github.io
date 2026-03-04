import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MiniLineChart } from '@hchat/ui'

const monthlyData = [
  { label: '9월', value: 320 },
  { label: '10월', value: 450 },
  { label: '11월', value: 520 },
  { label: '12월', value: 480 },
  { label: '1월', value: 610 },
  { label: '2월', value: 720 },
]

const meta: Meta<typeof MiniLineChart> = {
  title: 'ROI/MiniLineChart',
  component: MiniLineChart,
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
type Story = StoryObj<typeof MiniLineChart>

export const Default: Story = { args: { data: monthlyData } }
export const CustomColor: Story = {
  args: { data: monthlyData, color: 'var(--roi-chart-3, #F59E0B)' },
}
export const Tall: Story = { args: { data: monthlyData, height: 300 } }
