import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within, userEvent } from '@storybook/test'
import { WidgetCard } from '@hchat/ui/admin'
import type { WidgetConfig } from '@hchat/ui/admin'

const sampleWidget: WidgetConfig = {
  id: 'widget-test-1',
  type: 'metric-card',
  title: 'Active Users',
  size: 'md',
  visible: true,
  position: { x: 0, y: 0 },
  settings: {},
}

const meta: Meta<typeof WidgetCard> = {
  title: 'Admin/Widgets/WidgetCard/Interactions',
  component: WidgetCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: 20 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const DeleteWidget: Story = {
  args: {
    widget: sampleWidget,
    editing: true,
    onRemove: fn(),
    onResize: fn(),
    onToggle: fn(),
    children: (
      <div className="h-24 flex items-center justify-center text-sm text-gray-400">Content</div>
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const deleteBtn = canvas.getByTitle('삭제')
    await userEvent.click(deleteBtn)

    await expect(args.onRemove).toHaveBeenCalledWith('widget-test-1')
  },
}

export const ToggleVisibility: Story = {
  args: {
    widget: sampleWidget,
    editing: true,
    onRemove: fn(),
    onToggle: fn(),
    children: <div className="h-24" />,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const toggleBtn = canvas.getByTitle('숨기기')
    await userEvent.click(toggleBtn)

    await expect(args.onToggle).toHaveBeenCalledWith('widget-test-1')
  },
}

export const CycleSize: Story = {
  args: {
    widget: sampleWidget,
    editing: true,
    onResize: fn(),
    children: <div className="h-24" />,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const resizeBtn = canvas.getByTitle('사이즈 변경')
    await userEvent.click(resizeBtn)

    await expect(args.onResize).toHaveBeenCalled()
  },
}

export const ShowsWidgetTitle: Story = {
  args: {
    widget: sampleWidget,
    children: <div className="h-24" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Active Users')).toBeInTheDocument()
    await expect(canvas.getByText('M')).toBeInTheDocument()
  },
}

export const HiddenWidget: Story = {
  args: {
    widget: { ...sampleWidget, visible: false },
    editing: true,
    onToggle: fn(),
    children: <div className="h-24" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('숨김')).toBeInTheDocument()
  },
}
