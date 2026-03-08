import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ChartPlaceholder } from '@hchat/ui/roi'

const meta: Meta<typeof ChartPlaceholder> = {
  title: 'ROI/ChartPlaceholder',
  component: ChartPlaceholder,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof ChartPlaceholder>

export const Default: Story = { args: { title: '월별 비용 추이' } }
export const WithDescription: Story = {
  args: { title: '사용자 증가', description: '데이터 로딩 중...' },
}
export const Tall: Story = { args: { title: '연간 ROI 분석', height: 400 } }
