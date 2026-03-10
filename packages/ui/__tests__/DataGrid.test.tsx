import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { useDataGrid } from '../src/hooks/useDataGrid'
import { DataGrid } from '../src/DataGrid'
import type { ColumnDef } from '../src/hooks/useDataGrid'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

interface TestRow {
  id: number
  name: string
  email: string
  age: number
}

const testData: TestRow[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 },
  { id: 2, name: 'Bob', email: 'bob@example.com', age: 25 },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', age: 35 },
  { id: 4, name: 'Diana', email: 'diana@example.com', age: 28 },
  { id: 5, name: 'Eve', email: 'eve@example.com', age: 22 },
]

const columns: ColumnDef<TestRow>[] = [
  { key: 'id', header: 'ID', sortable: true, width: 60 },
  { key: 'name', header: 'Name', sortable: true, filterable: true, width: 150 },
  { key: 'email', header: 'Email', filterable: true, width: 200 },
  { key: 'age', header: 'Age', sortable: true, filterable: true, width: 80 },
]

// ---------------------------------------------------------------------------
// useDataGrid hook tests
// ---------------------------------------------------------------------------

describe('useDataGrid', () => {
  it('returns all rows when no sort or filter is applied', () => {
    const { result } = renderHook(() => useDataGrid(testData, columns))
    expect(result.current.rows).toHaveLength(5)
    expect(result.current.sortKey).toBeNull()
    expect(result.current.sortDirection).toBe('asc')
  })

  it('returns correct totalPages based on pageSize', () => {
    const { result } = renderHook(() =>
      useDataGrid(testData, columns, { pageSize: 2 }),
    )
    expect(result.current.totalPages).toBe(3)
    expect(result.current.rows).toHaveLength(2)
  })

  it('defaults to page 1', () => {
    const { result } = renderHook(() =>
      useDataGrid(testData, columns, { pageSize: 2 }),
    )
    expect(result.current.page).toBe(1)
  })

  // --- Sorting ---

  describe('sorting', () => {
    it('sorts ascending on first click', () => {
      const { result } = renderHook(() => useDataGrid(testData, columns))

      act(() => {
        result.current.sort('name')
      })

      expect(result.current.sortKey).toBe('name')
      expect(result.current.sortDirection).toBe('asc')
      expect(result.current.rows[0].name).toBe('Alice')
      expect(result.current.rows[4].name).toBe('Eve')
    })

    it('sorts descending on second click of same column', () => {
      const { result } = renderHook(() => useDataGrid(testData, columns))

      act(() => {
        result.current.sort('name')
      })
      act(() => {
        result.current.sort('name')
      })

      expect(result.current.sortDirection).toBe('desc')
      expect(result.current.rows[0].name).toBe('Eve')
    })

    it('resets to ascending when switching columns', () => {
      const { result } = renderHook(() => useDataGrid(testData, columns))

      act(() => {
        result.current.sort('name')
      })
      act(() => {
        result.current.sort('name')
      })
      act(() => {
        result.current.sort('age')
      })

      expect(result.current.sortKey).toBe('age')
      expect(result.current.sortDirection).toBe('asc')
      expect(result.current.rows[0].age).toBe(22)
    })

    it('sorts numeric values correctly', () => {
      const { result } = renderHook(() => useDataGrid(testData, columns))

      act(() => {
        result.current.sort('age')
      })

      const ages = result.current.rows.map((r) => r.age)
      expect(ages).toEqual([22, 25, 28, 30, 35])
    })

    it('applies defaultSort on init', () => {
      const { result } = renderHook(() =>
        useDataGrid(testData, columns, {
          defaultSort: { key: 'age', direction: 'desc' },
        }),
      )

      expect(result.current.sortKey).toBe('age')
      expect(result.current.sortDirection).toBe('desc')
      expect(result.current.rows[0].age).toBe(35)
    })
  })

  // --- Filtering ---

  describe('filtering', () => {
    it('filters rows by string match (case-insensitive)', () => {
      const { result } = renderHook(() => useDataGrid(testData, columns))

      act(() => {
        result.current.setFilter('name', 'ali')
      })

      expect(result.current.rows).toHaveLength(1)
      expect(result.current.rows[0].name).toBe('Alice')
    })

    it('supports multiple filters simultaneously', () => {
      const { result } = renderHook(() => useDataGrid(testData, columns))

      act(() => {
        result.current.setFilter('name', 'a')
      })

      // 'a' matches Alice, Charlie, Diana
      expect(result.current.rows).toHaveLength(3)

      act(() => {
        result.current.setFilter('email', 'diana')
      })

      expect(result.current.rows).toHaveLength(1)
      expect(result.current.rows[0].name).toBe('Diana')
    })

    it('clears all filters', () => {
      const { result } = renderHook(() => useDataGrid(testData, columns))

      act(() => {
        result.current.setFilter('name', 'alice')
      })
      expect(result.current.rows).toHaveLength(1)

      act(() => {
        result.current.clearFilters()
      })
      expect(result.current.rows).toHaveLength(5)
      expect(result.current.filters).toEqual({})
    })

    it('removes filter when value is empty string', () => {
      const { result } = renderHook(() => useDataGrid(testData, columns))

      act(() => {
        result.current.setFilter('name', 'alice')
      })
      act(() => {
        result.current.setFilter('name', '')
      })

      expect(result.current.rows).toHaveLength(5)
    })

    it('resets page to 1 when filter changes', () => {
      const { result } = renderHook(() =>
        useDataGrid(testData, columns, { pageSize: 2 }),
      )

      act(() => {
        result.current.setPage(2)
      })
      expect(result.current.page).toBe(2)

      act(() => {
        result.current.setFilter('name', 'a')
      })
      expect(result.current.page).toBe(1)
    })

    it('filters numeric values by string representation', () => {
      const { result } = renderHook(() => useDataGrid(testData, columns))

      act(() => {
        result.current.setFilter('age', '25')
      })

      expect(result.current.rows).toHaveLength(1)
      expect(result.current.rows[0].name).toBe('Bob')
    })
  })

  // --- Pagination ---

  describe('pagination', () => {
    it('paginates rows correctly', () => {
      const { result } = renderHook(() =>
        useDataGrid(testData, columns, { pageSize: 2 }),
      )

      expect(result.current.rows).toHaveLength(2)
      expect(result.current.page).toBe(1)
      expect(result.current.totalPages).toBe(3)
    })

    it('navigates to next page', () => {
      const { result } = renderHook(() =>
        useDataGrid(testData, columns, { pageSize: 2 }),
      )

      act(() => {
        result.current.setPage(2)
      })

      expect(result.current.page).toBe(2)
      expect(result.current.rows).toHaveLength(2)
    })

    it('shows remaining rows on last page', () => {
      const { result } = renderHook(() =>
        useDataGrid(testData, columns, { pageSize: 2 }),
      )

      act(() => {
        result.current.setPage(3)
      })

      expect(result.current.rows).toHaveLength(1)
    })

    it('clamps page to valid range', () => {
      const { result } = renderHook(() =>
        useDataGrid(testData, columns, { pageSize: 2 }),
      )

      act(() => {
        result.current.setPage(99)
      })
      expect(result.current.page).toBe(3)

      act(() => {
        result.current.setPage(0)
      })
      expect(result.current.page).toBe(1)
    })

    it('returns all rows when pageSize is not specified', () => {
      const { result } = renderHook(() => useDataGrid(testData, columns))
      expect(result.current.rows).toHaveLength(5)
      expect(result.current.totalPages).toBe(1)
    })
  })

  // --- Column resize ---

  describe('column resize', () => {
    it('initializes columnWidths from column definitions', () => {
      const { result } = renderHook(() => useDataGrid(testData, columns))
      expect(result.current.columnWidths).toEqual({
        id: 60,
        name: 150,
        email: 200,
        age: 80,
      })
    })

    it('updates column width via resizeColumn', () => {
      const { result } = renderHook(() => useDataGrid(testData, columns))

      act(() => {
        result.current.resizeColumn('name', 250)
      })

      expect(result.current.columnWidths.name).toBe(250)
      // Other widths unchanged
      expect(result.current.columnWidths.id).toBe(60)
    })

    it('respects minWidth constraint', () => {
      const cols: ColumnDef<TestRow>[] = [
        { key: 'name', header: 'Name', width: 150, minWidth: 100 },
      ]
      const { result } = renderHook(() => useDataGrid(testData, cols))

      act(() => {
        result.current.resizeColumn('name', 50)
      })

      expect(result.current.columnWidths.name).toBe(100)
    })

    it('uses default minWidth of 50 when not specified', () => {
      const { result } = renderHook(() => useDataGrid(testData, columns))

      act(() => {
        result.current.resizeColumn('id', 10)
      })

      expect(result.current.columnWidths.id).toBe(50)
    })
  })

  // --- Sort + Filter combined ---

  describe('sort + filter combined', () => {
    it('applies filter before sort', () => {
      const { result } = renderHook(() => useDataGrid(testData, columns))

      act(() => {
        result.current.setFilter('name', 'a')
      })
      act(() => {
        result.current.sort('age')
      })

      // 'a' matches Alice(30), Charlie(35), Diana(28)
      expect(result.current.rows).toHaveLength(3)
      expect(result.current.rows.map((r) => r.name)).toEqual([
        'Diana',
        'Alice',
        'Charlie',
      ])
    })
  })
})

// ---------------------------------------------------------------------------
// DataGrid component tests
// ---------------------------------------------------------------------------

describe('DataGrid', () => {
  it('renders table with correct headers', () => {
    render(<DataGrid data={testData} columns={columns} />)

    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
  })

  it('renders all data rows', () => {
    render(<DataGrid data={testData} columns={columns} />)

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(<DataGrid data={[]} columns={columns} emptyMessage="No results" />)
    expect(screen.getByText('No results')).toBeInTheDocument()
  })

  it('shows default empty state message', () => {
    render(<DataGrid data={[]} columns={columns} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  // --- Sort interaction ---

  describe('sorting interaction', () => {
    it('sorts when clicking sortable column header', () => {
      render(<DataGrid data={testData} columns={columns} />)

      const nameHeader = screen.getByText('Name')
      fireEvent.click(nameHeader)

      const rows = screen.getAllByRole('row')
      // rows[0] = header, rows[1] = filter row, rows[2..] = data rows
      const firstDataRow = rows[2]
      expect(within(firstDataRow).getByText('Alice')).toBeInTheDocument()
    })

    it('toggles sort direction on repeated clicks', () => {
      render(<DataGrid data={testData} columns={columns} />)

      const nameHeader = screen.getByText('Name')
      fireEvent.click(nameHeader)
      fireEvent.click(nameHeader)

      const rows = screen.getAllByRole('row')
      const firstDataRow = rows[2]
      expect(within(firstDataRow).getByText('Eve')).toBeInTheDocument()
    })

    it('sets aria-sort attribute on sorted column', () => {
      render(<DataGrid data={testData} columns={columns} />)

      const nameHeader = screen.getByText('Name').closest('th')
      expect(nameHeader).toHaveAttribute('aria-sort', 'none')

      fireEvent.click(screen.getByText('Name'))
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')

      fireEvent.click(screen.getByText('Name'))
      expect(nameHeader).toHaveAttribute('aria-sort', 'descending')
    })

    it('does not sort non-sortable columns', () => {
      render(<DataGrid data={testData} columns={columns} />)

      const emailHeader = screen.getByText('Email').closest('th')
      // Email is not sortable — no aria-sort
      expect(emailHeader).not.toHaveAttribute('aria-sort')

      fireEvent.click(screen.getByText('Email'))
      // Data order unchanged (first row still Alice since no sort applied)
      const rows = screen.getAllByRole('row')
      const firstDataRow = rows[2]
      expect(within(firstDataRow).getByText('Alice')).toBeInTheDocument()
    })
  })

  // --- Filter interaction ---

  describe('filtering interaction', () => {
    it('renders filter inputs for filterable columns', () => {
      render(<DataGrid data={testData} columns={columns} />)

      const filterInputs = screen.getAllByRole('textbox')
      // name, email, age are filterable = 3 inputs
      expect(filterInputs).toHaveLength(3)
    })

    it('filters data when typing in filter input', () => {
      render(<DataGrid data={testData} columns={columns} />)

      const filterInputs = screen.getAllByRole('textbox')
      // First filterable column is 'name'
      fireEvent.change(filterInputs[0], { target: { value: 'bob' } })

      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.queryByText('Alice')).not.toBeInTheDocument()
    })

    it('shows empty state when filter matches nothing', () => {
      render(<DataGrid data={testData} columns={columns} />)

      const filterInputs = screen.getAllByRole('textbox')
      fireEvent.change(filterInputs[0], { target: { value: 'zzz' } })

      expect(screen.getByText('No data available')).toBeInTheDocument()
    })
  })

  // --- Pagination interaction ---

  describe('pagination interaction', () => {
    it('renders pagination when pageSize is set', () => {
      render(<DataGrid data={testData} columns={columns} pageSize={2} />)

      expect(screen.getByText('1 / 3')).toBeInTheDocument()
      expect(screen.getByLabelText('Next page')).toBeInTheDocument()
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument()
    })

    it('navigates pages with next/prev buttons', () => {
      render(<DataGrid data={testData} columns={columns} pageSize={2} />)

      fireEvent.click(screen.getByLabelText('Next page'))
      expect(screen.getByText('2 / 3')).toBeInTheDocument()

      fireEvent.click(screen.getByLabelText('Previous page'))
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })

    it('disables previous button on first page', () => {
      render(<DataGrid data={testData} columns={columns} pageSize={2} />)
      expect(screen.getByLabelText('Previous page')).toBeDisabled()
    })

    it('disables next button on last page', () => {
      render(<DataGrid data={testData} columns={columns} pageSize={2} />)

      fireEvent.click(screen.getByLabelText('Next page'))
      fireEvent.click(screen.getByLabelText('Next page'))

      expect(screen.getByLabelText('Next page')).toBeDisabled()
    })

    it('does not render pagination when all data fits on one page', () => {
      render(<DataGrid data={testData} columns={columns} />)
      expect(screen.queryByLabelText('Next page')).not.toBeInTheDocument()
    })
  })

  // --- Column resize ---

  describe('column resize', () => {
    it('renders resize handles on column headers', () => {
      render(<DataGrid data={testData} columns={columns} />)

      const handles = screen.getAllByRole('separator')
      expect(handles.length).toBe(columns.length)
    })

    it('applies column widths as inline styles', () => {
      render(<DataGrid data={testData} columns={columns} />)

      const headers = screen.getAllByRole('columnheader')
      expect(headers[0]).toHaveStyle({ width: '60px' })
      expect(headers[1]).toHaveStyle({ width: '150px' })
    })
  })

  // --- Custom render ---

  describe('custom render', () => {
    it('uses custom render function for cells', () => {
      const customColumns: ColumnDef<TestRow>[] = [
        {
          key: 'name',
          header: 'Name',
          render: (value) => <strong data-testid="custom-cell">{String(value)}</strong>,
        },
      ]

      render(<DataGrid data={testData} columns={customColumns} />)

      const customCells = screen.getAllByTestId('custom-cell')
      expect(customCells).toHaveLength(5)
      expect(customCells[0]).toHaveTextContent('Alice')
    })
  })

  // --- Accessibility ---

  describe('accessibility', () => {
    it('has role="grid" on the table', () => {
      render(<DataGrid data={testData} columns={columns} />)
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })

    it('has role="columnheader" on header cells', () => {
      render(<DataGrid data={testData} columns={columns} />)
      const headers = screen.getAllByRole('columnheader')
      // 4 header cells + 4 filter row cells (th elements)
      expect(headers).toHaveLength(columns.length * 2)
    })

    it('has role="gridcell" on data cells', () => {
      render(<DataGrid data={testData} columns={columns} />)
      const cells = screen.getAllByRole('gridcell')
      // 5 rows * 4 columns = 20 cells
      expect(cells).toHaveLength(20)
    })

    it('filter inputs have accessible labels', () => {
      render(<DataGrid data={testData} columns={columns} />)

      expect(screen.getByLabelText('Filter Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Filter Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Filter Age')).toBeInTheDocument()
    })
  })
})
