import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { EmptyState } from '@hchat/ui'

const meta: Meta<typeof EmptyState> = {
  title: 'Shared/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof EmptyState>

export const Default: Story = {
  args: {
    title: '데이터가 없습니다',
    description: '아직 등록된 항목이 없습니다.',
  },
}

export const WithAction: Story = {
  args: {
    title: '대화 내역이 없습니다',
    description: '새 대화를 시작해보세요.',
    action: { label: '새 대화 시작', onClick: () => {} },
  },
}

export const CustomIcon: Story = {
  args: {
    icon: '🔍',
    title: '검색 결과가 없습니다',
    description: '다른 검색어로 시도해보세요.',
  },
}
