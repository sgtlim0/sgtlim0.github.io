import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { DataGrid } from '@hchat/ui'
import type { ColumnDef } from '@hchat/ui'

interface Employee {
  name: string
  department: string
  role: string
  salary: number
  status: string
}

const sampleData: Employee[] = [
  { name: 'Kim Minjun', department: 'Engineering', role: 'Frontend', salary: 85000, status: 'Active' },
  { name: 'Lee Soyeon', department: 'Design', role: 'UI/UX', salary: 78000, status: 'Active' },
  { name: 'Park Jiwoo', department: 'Engineering', role: 'Backend', salary: 92000, status: 'On Leave' },
  { name: 'Choi Yuna', department: 'Product', role: 'PM', salary: 88000, status: 'Active' },
  { name: 'Jung Dohyun', department: 'Engineering', role: 'DevOps', salary: 95000, status: 'Active' },
  { name: 'Han Seomin', department: 'Design', role: 'Brand', salary: 72000, status: 'Active' },
  { name: 'Kang Taeho', department: 'Engineering', role: 'Mobile', salary: 87000, status: 'Inactive' },
  { name: 'Yoon Hayoung', department: 'Product', role: 'Analyst', salary: 76000, status: 'Active' },
]

const columns: ColumnDef<Employee>[] = [
  { key: 'name', header: 'Name', sortable: true, filterable: true },
  { key: 'department', header: 'Department', sortable: true, filterable: true },
  { key: 'role', header: 'Role', sortable: true },
  { key: 'salary', header: 'Salary', sortable: true, render: (val) => `$${Number(val).toLocaleString()}` },
  { key: 'status', header: 'Status', sortable: true, filterable: true },
]

const meta: Meta = {
  title: 'Shared/DataGrid',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const SortAndFilter: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto p-6">
      <DataGrid data={sampleData} columns={columns} pageSize={5} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click Name column header to sort
    const nameHeader = canvas.getByText('Name')
    await userEvent.click(nameHeader)

    await waitFor(() => {
      const th = nameHeader.closest('th')
      expect(th?.getAttribute('aria-sort')).toBe('ascending')
    })

    // Click again to sort descending
    await userEvent.click(nameHeader)

    await waitFor(() => {
      const th = nameHeader.closest('th')
      expect(th?.getAttribute('aria-sort')).toBe('descending')
    })
  },
}

export const FilterByDepartment: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto p-6">
      <DataGrid data={sampleData} columns={columns} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find the Department filter input
    const deptFilter = canvas.getByLabelText('Filter Department')
    await userEvent.type(deptFilter, 'Engineering')

    await waitFor(() => {
      const rows = canvasElement.querySelectorAll('tbody tr')
      // Should filter to Engineering rows only
      expect(rows.length).toBeGreaterThan(0)
      rows.forEach(row => {
        const cells = row.querySelectorAll('td')
        if (cells.length > 1) {
          expect(cells[1].textContent).toContain('Engineering')
        }
      })
    })
  },
}

export const Resize: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto p-6">
      <p className="text-sm text-gray-500 mb-4">
        Drag the column borders in the header to resize columns.
      </p>
      <DataGrid data={sampleData} columns={columns} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Verify resize handles exist
    const separators = canvasElement.querySelectorAll('[role="separator"]')
    expect(separators.length).toBe(columns.length)

    // Verify grid rendered correctly
    const grid = canvasElement.querySelector('[role="grid"]')
    expect(grid).toBeTruthy()
  },
}
