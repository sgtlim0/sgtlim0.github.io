import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import GNB from '@hchat/ui/hmg/GNB'

const meta: Meta<typeof GNB> = {
  title: 'HMG/Molecules/GNB/Interactions',
  component: GNB,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ width: '1440px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof GNB>

export const RendersBrandAndMenu: Story = {
  args: {
    brand: '현대자동차그룹',
    menuItems: [
      { label: '회사소개', href: '/about' },
      { label: '사업영역', href: '/business' },
      { label: '기술혁신', href: '/innovation' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('현대자동차그룹')).toBeInTheDocument()
    await expect(canvas.getByText('회사소개')).toBeInTheDocument()
    await expect(canvas.getByText('사업영역')).toBeInTheDocument()
    await expect(canvas.getByText('기술혁신')).toBeInTheDocument()
  },
}
