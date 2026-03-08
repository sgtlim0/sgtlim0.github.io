import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import InsightCard from '@hchat/ui/roi/InsightCard'

const meta: Meta<typeof InsightCard> = {
  title: 'ROI/Atoms/InsightCard/Interactions',
  component: InsightCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof InsightCard>

export const RendersPositiveInsight: Story = {
  args: {
    type: 'positive',
    title: 'AI 도입 효과 우수',
    description: '월간 업무 시간 절감이 15% 증가했습니다.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('AI 도입 효과 우수')).toBeInTheDocument()
    await expect(canvas.getByText(/15% 증가/)).toBeInTheDocument()
  },
}

export const RendersWarningInsight: Story = {
  args: {
    type: 'warning',
    title: '일부 부서 활용률 저조',
    description: '마케팅 부서의 AI 활용률이 20% 미만입니다.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('일부 부서 활용률 저조')).toBeInTheDocument()
    await expect(canvas.getByText(/마케팅 부서/)).toBeInTheDocument()
  },
}
