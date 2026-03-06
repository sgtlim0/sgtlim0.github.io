import type { Meta, StoryObj } from '@storybook/react'
import { WidgetCard } from '@hchat/ui/admin'
import type { WidgetConfig } from '@hchat/ui/admin/services/widgetTypes'

const mockWidget: WidgetConfig = {
  id: 'w1',
  type: 'metric-card',
  title: '활성 사용자',
  size: 'md',
  position: { x: 0, y: 0 },
  visible: true,
}

const meta: Meta<typeof WidgetCard> = {
  title: 'Admin/Customize/WidgetCard',
  component: WidgetCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    widget: mockWidget,
    editing: false,
    children: (
      <div className="flex items-center justify-center h-20 text-sm text-text-secondary">
        위젯 콘텐츠
      </div>
    ),
  },
}

export const Editing: Story = {
  args: {
    widget: mockWidget,
    editing: true,
    onRemove: () => {},
    onResize: () => {},
    onToggle: () => {},
    children: (
      <div className="flex items-center justify-center h-20 text-sm text-text-secondary">
        편집 모드
      </div>
    ),
  },
}

export const Hidden: Story = {
  args: {
    widget: { ...mockWidget, visible: false },
    editing: true,
    onRemove: () => {},
    onResize: () => {},
    onToggle: () => {},
    children: (
      <div className="flex items-center justify-center h-20 text-sm text-text-secondary">
        숨김 위젯
      </div>
    ),
  },
}
