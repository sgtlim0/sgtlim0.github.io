import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { AgentMarketplace } from '../../../src/admin/AgentMarketplace'

const meta: Meta<typeof AgentMarketplace> = {
  title: 'Admin/AgentMarketplace',
  component: AgentMarketplace,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}
export default meta

type Story = StoryObj<typeof AgentMarketplace>

export const Default: Story = {}

export const Dark: Story = {
  parameters: {
    themes: { themeOverride: 'dark' },
  },
}

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 페이지 제목 확인
    await expect(canvas.getByText('에이전트 마켓플레이스')).toBeInTheDocument()

    // 검색 입력
    const searchInput = canvas.getByPlaceholderText('에이전트 검색...')
    await userEvent.type(searchInput, 'Research')

    // 카테고리 필터 선택
    const categorySelect = canvas.getByLabelText('카테고리 필터')
    await userEvent.selectOptions(categorySelect, 'research')

    // 정렬 변경
    const sortSelect = canvas.getByLabelText('정렬')
    await userEvent.selectOptions(sortSelect, 'rating')

    // 등록 버튼 확인
    await expect(canvas.getByText('+ 에이전트 등록')).toBeInTheDocument()
  },
}
