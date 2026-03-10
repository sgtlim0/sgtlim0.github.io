import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, expect } from '@storybook/test'
import { VirtualList } from '@hchat/ui'

const meta: Meta<typeof VirtualList> = {
  title: 'Shared/VirtualList',
  component: VirtualList,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof VirtualList>

export const Default: Story = {
  args: {
    itemCount: 1000,
    itemHeight: 40,
    containerHeight: 400,
    renderItem: (item) => (
      <div
        key={item.index}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          height: '100%',
          borderBottom: '1px solid #e5e7eb',
          fontSize: 14,
        }}
      >
        Row {item.index + 1}
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const list = canvas.getByRole('list')
    expect(list).toBeTruthy()

    const items = canvas.getAllByRole('listitem')
    // Virtual list renders only visible items + overscan, not all 1000
    expect(items.length).toBeLessThan(100)
    expect(items.length).toBeGreaterThan(0)
  },
}

export const LargeDataset: Story = {
  args: {
    itemCount: 10000,
    itemHeight: 36,
    containerHeight: 500,
    overscan: 10,
    label: 'Large dataset list',
    renderItem: (item) => (
      <div
        key={item.index}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: '100%',
          borderBottom: '1px solid #e5e7eb',
          fontSize: 13,
        }}
      >
        <span>Item #{item.index + 1}</span>
        <span style={{ color: '#9ca3af' }}>offset: {item.start}px</span>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const list = canvas.getByRole('list', { name: 'Large dataset list' })
    expect(list).toBeTruthy()
  },
}
