import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect } from '@storybook/test'
import { Pagination } from '@hchat/ui'

function PaginationDemo() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  return (
    <div className="p-6">
      <div className="mb-4 text-sm text-gray-500">
        Current page: {page} | Page size: {pageSize}
      </div>
      <Pagination
        totalItems={200}
        pageSize={pageSize}
        initialPage={page}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  )
}

const meta: Meta = {
  title: 'Shared/Pagination',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const WithEllipsis: Story = {
  render: () => <PaginationDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify pagination nav exists
    const nav = canvas.getByRole('navigation', { name: 'pagination' })
    expect(nav).toBeTruthy()

    // Verify item count info
    const info = canvas.getByTestId('pagination-info')
    expect(info.textContent).toContain('of 200')

    // Click "Next" button
    const nextBtn = canvas.getByRole('button', { name: 'Next' })
    await userEvent.click(nextBtn)

    // Click a page number button
    const page3 = canvas.getByRole('button', { name: 'Page 3' })
    await userEvent.click(page3)
  },
}

export const SmallDataset: Story = {
  render: () => (
    <div className="p-6">
      <Pagination
        totalItems={25}
        pageSize={10}
        showPageSizeSelector={false}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const nav = canvas.getByRole('navigation', { name: 'pagination' })
    expect(nav).toBeTruthy()

    // Should show 3 pages total
    expect(canvas.getByRole('button', { name: 'Page 3' })).toBeTruthy()
  },
}
