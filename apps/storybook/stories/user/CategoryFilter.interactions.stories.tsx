import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within, userEvent } from '@storybook/test'
import CategoryFilter from '@hchat/ui/user/components/CategoryFilter'

const categories = ['전체', '채팅', '업무', '번역', '정리']

const meta: Meta<typeof CategoryFilter> = {
  title: 'User/Atoms/CategoryFilter/Interactions',
  component: CategoryFilter,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof CategoryFilter>

export const SelectCategory: Story = {
  args: {
    categories,
    activeCategory: '전체',
    onSelect: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const chatTab = canvas.getByRole('tab', { name: '채팅' })
    await userEvent.click(chatTab)
    await expect(args.onSelect).toHaveBeenCalledWith('채팅')
  },
}

export const SelectMultipleCategories: Story = {
  args: {
    categories,
    activeCategory: '전체',
    onSelect: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('tab', { name: '번역' }))
    await expect(args.onSelect).toHaveBeenCalledWith('번역')

    await userEvent.click(canvas.getByRole('tab', { name: '정리' }))
    await expect(args.onSelect).toHaveBeenCalledWith('정리')

    await expect(args.onSelect).toHaveBeenCalledTimes(2)
  },
}

export const ActiveTabHighlighted: Story = {
  args: {
    categories,
    activeCategory: '번역',
    onSelect: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const activeTab = canvas.getByRole('tab', { name: '번역' })
    await expect(activeTab).toHaveAttribute('aria-selected', 'true')

    const inactiveTab = canvas.getByRole('tab', { name: '전체' })
    await expect(inactiveTab).toHaveAttribute('aria-selected', 'false')
  },
}

export const AllTabsRendered: Story = {
  args: {
    categories,
    activeCategory: '전체',
    onSelect: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const cat of categories) {
      await expect(canvas.getByRole('tab', { name: cat })).toBeInTheDocument()
    }
  },
}
