import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within, userEvent } from '@storybook/test'
import TabFilter from '@hchat/ui/hmg/TabFilter'

const meta: Meta<typeof TabFilter> = {
  title: 'HMG/Molecules/TabFilter/Interactions',
  component: TabFilter,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TabFilter>

export const ClickTab: Story = {
  args: {
    tabs: ['전체', '가이드', '릴리즈 노트', '기술 문서'],
    activeTab: '전체',
    onTabChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const guideTab = canvas.getByText('가이드')
    await userEvent.click(guideTab)
    await expect(args.onTabChange).toHaveBeenCalledWith('가이드')
  },
}

export const ClickMultipleTabs: Story = {
  args: {
    tabs: ['전체', '가이드', '릴리즈 노트', '기술 문서'],
    activeTab: '전체',
    onTabChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByText('릴리즈 노트'))
    await expect(args.onTabChange).toHaveBeenCalledWith('릴리즈 노트')

    await userEvent.click(canvas.getByText('기술 문서'))
    await expect(args.onTabChange).toHaveBeenCalledWith('기술 문서')

    await expect(args.onTabChange).toHaveBeenCalledTimes(2)
  },
}
