import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within, userEvent } from '@storybook/test'
import DataTable from '@hchat/ui/admin/DataTable'

const sampleRows = [
  { date: '2026-03-02', user: 'user01', type: 'AI 채팅', model: 'Claude 3.5', tokens: '2,450', cost: '₩12', status: 'success' as const },
  { date: '2026-03-02', user: 'user03', type: '그룹 채팅', model: 'GPT-4', tokens: '8,900', cost: '₩45', status: 'success' as const },
  { date: '2026-03-01', user: 'user02', type: '도구 사용', model: 'Gemini', tokens: '1,200', cost: '₩6', status: 'error' as const },
]

const meta: Meta<typeof DataTable> = {
  title: 'Admin/Molecules/DataTable/Interactions',
  component: DataTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof DataTable>

export const RendersAllRows: Story = {
  args: { rows: sampleRows },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('user01')).toBeInTheDocument()
    await expect(canvas.getByText('user03')).toBeInTheDocument()
    await expect(canvas.getByText('user02')).toBeInTheDocument()
  },
}

export const ClickDetailButton: Story = {
  args: { rows: sampleRows, onViewDetail: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const detailBtn = canvas.getByLabelText('user01 2026-03-02 상세 보기')
    await userEvent.click(detailBtn)
    await expect(args.onViewDetail).toHaveBeenCalledWith(0)
  },
}

export const EmptyStateMessage: Story = {
  args: { rows: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('데이터가 없습니다.')).toBeInTheDocument()
  },
}
