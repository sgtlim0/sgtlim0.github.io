import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import StatCard from '@hchat/ui/admin/StatCard'

const meta: Meta<typeof StatCard> = {
  title: 'Admin/Atoms/StatCard/Interactions',
  component: StatCard,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof StatCard>

export const RendersLabelAndValue: Story = {
  args: { label: '총 대화 수', value: '1,247' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('총 대화 수')).toBeInTheDocument()
    await expect(canvas.getByText('1,247')).toBeInTheDocument()
  },
}

export const ShowsTrendUp: Story = {
  args: { label: '이번 달 비용', value: '₩127K', trend: '12% 전월 대비', trendUp: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('₩127K')).toBeInTheDocument()
    await expect(canvas.getByText(/12% 전월 대비/)).toBeInTheDocument()
  },
}

export const ShowsTrendDown: Story = {
  args: { label: '활성 사용자', value: '38', trend: '5% 감소', trendUp: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('38')).toBeInTheDocument()
    await expect(canvas.getByText(/5% 감소/)).toBeInTheDocument()
  },
}
