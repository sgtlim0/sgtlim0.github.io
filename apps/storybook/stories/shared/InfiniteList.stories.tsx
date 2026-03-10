import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, expect, waitFor } from '@storybook/test'
import { InfiniteList } from '@hchat/ui'

interface MockItem {
  id: number
  title: string
}

function createMockFetchPage(pageSize: number = 20, totalPages: number = 5) {
  return async (page: number): Promise<MockItem[]> => {
    await new Promise((r) => setTimeout(r, 500))
    if (page > totalPages) return []
    return Array.from({ length: pageSize }, (_, i) => ({
      id: (page - 1) * pageSize + i + 1,
      title: `Item ${(page - 1) * pageSize + i + 1}`,
    }))
  }
}

const meta: Meta = {
  title: 'Shared/InfiniteList',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <InfiniteList<MockItem>
        fetchPage={createMockFetchPage()}
        renderItem={(item) => (
          <div
            key={item.id}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              fontSize: 14,
            }}
          >
            {item.title}
          </div>
        )}
        label="Mock items list"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Wait for first page to load
    await waitFor(
      () => {
        const items = canvas.getAllByRole('listitem')
        expect(items.length).toBeGreaterThan(0)
      },
      { timeout: 3000 },
    )
  },
}

export const WithEndMessage: Story = {
  render: () => (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <InfiniteList<MockItem>
        fetchPage={createMockFetchPage(5, 2)}
        renderItem={(item) => (
          <div
            key={item.id}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              fontSize: 14,
            }}
          >
            {item.title}
          </div>
        )}
        endElement={
          <div style={{ textAlign: 'center', padding: 16, color: '#6b7280' }}>
            All items loaded
          </div>
        }
        label="Short list"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await waitFor(
      () => {
        expect(canvas.getAllByRole('listitem').length).toBeGreaterThan(0)
      },
      { timeout: 3000 },
    )
  },
}
