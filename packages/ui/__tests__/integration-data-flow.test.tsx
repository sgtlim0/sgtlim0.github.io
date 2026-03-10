import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useState, useCallback, useMemo } from 'react'
import { useSearch } from '../src/hooks/useSearch'
import type { SearchableItem } from '../src/utils/searchEngine'
import Pagination from '../src/Pagination'
import VirtualList from '../src/VirtualList'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

function generateItems(count: number): SearchableItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    title: `Item ${i} - ${['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'][i % 5]}`,
    body: `Description for item ${i}. Category: ${['docs', 'api', 'guide'][i % 3]}`,
    category: ['docs', 'api', 'guide'][i % 3] as string,
  }))
}

// ---------------------------------------------------------------------------
// Integrated component: Search + Pagination + VirtualList
// ---------------------------------------------------------------------------

interface SearchPaginatedListProps {
  readonly items: SearchableItem[]
  readonly pageSize: number
}

function SearchPaginatedList({ items, pageSize }: SearchPaginatedListProps) {
  const { query, setQuery, results, isSearching } = useSearch(items, { debounceMs: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPageSize, setCurrentPageSize] = useState(pageSize)

  const displayItems = query.trim() ? results : items.map((item) => ({
    id: item.id,
    title: item.title,
    excerpt: item.body ?? '',
    score: 1,
    category: item.category,
  }))

  const totalItems = displayItems.length

  const startIndex = (currentPage - 1) * currentPageSize
  const endIndex = Math.min(startIndex + currentPageSize, totalItems)
  const pageItems = displayItems.slice(startIndex, endIndex)

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setCurrentPage(1) // Reset to page 1 on search
  }, [setQuery])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handlePageSizeChange = useCallback((size: number) => {
    setCurrentPageSize(size)
    setCurrentPage(1)
  }, [])

  const useVirtual = totalItems > 50

  return (
    <div>
      <input
        data-testid="search-input"
        type="text"
        placeholder="Search items..."
        value={query}
        onChange={handleSearch}
      />

      <span data-testid="total-count">{totalItems}</span>
      <span data-testid="page-count">{pageItems.length}</span>
      <span data-testid="current-page">{currentPage}</span>
      {isSearching && <span data-testid="searching">Loading...</span>}

      {useVirtual ? (
        <VirtualList
          itemCount={pageItems.length}
          itemHeight={40}
          containerHeight={400}
          label="Search results"
          renderItem={(virtualItem) => {
            const item = pageItems[virtualItem.index]
            return item ? (
              <div data-testid={`virtual-item-${item.id}`}>
                {item.title}
              </div>
            ) : null
          }}
        />
      ) : (
        <ul data-testid="plain-list">
          {pageItems.map((item) => (
            <li key={item.id} data-testid={`list-item-${item.id}`}>
              {item.title}
            </li>
          ))}
        </ul>
      )}

      <Pagination
        totalItems={totalItems}
        pageSize={currentPageSize}
        initialPage={currentPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Integration: Search + Pagination + VirtualList', () => {
  describe('basic search and pagination', () => {
    it('should display all items with pagination', () => {
      const items = generateItems(25)
      render(<SearchPaginatedList items={items} pageSize={10} />)

      expect(screen.getByTestId('total-count').textContent).toBe('25')
      expect(screen.getByTestId('page-count').textContent).toBe('10')
      expect(screen.getByTestId('current-page').textContent).toBe('1')
    })

    it('should navigate to next page', () => {
      const items = generateItems(25)
      render(<SearchPaginatedList items={items} pageSize={10} />)

      // Click page 2
      act(() => {
        fireEvent.click(screen.getByLabelText('Page 2'))
      })

      expect(screen.getByTestId('current-page').textContent).toBe('2')
      expect(screen.getByTestId('page-count').textContent).toBe('10')
    })

    it('should show last page with remaining items', () => {
      const items = generateItems(25)
      render(<SearchPaginatedList items={items} pageSize={10} />)

      act(() => {
        fireEvent.click(screen.getByLabelText('Page 3'))
      })

      expect(screen.getByTestId('current-page').textContent).toBe('3')
      expect(screen.getByTestId('page-count').textContent).toBe('5')
    })
  })

  describe('search filters results', () => {
    it('should filter items by search query', () => {
      const items = generateItems(25)
      render(<SearchPaginatedList items={items} pageSize={10} />)

      act(() => {
        fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Alpha' } })
        vi.advanceTimersByTime(1)
      })

      // Should have filtered down to only Alpha items
      const totalCount = Number(screen.getByTestId('total-count').textContent)
      expect(totalCount).toBeLessThan(25)
      expect(totalCount).toBeGreaterThan(0)
    })

    it('should reset to page 1 on search', () => {
      const items = generateItems(50)
      render(<SearchPaginatedList items={items} pageSize={10} />)

      // Go to page 3
      act(() => {
        fireEvent.click(screen.getByLabelText('Page 3'))
      })
      expect(screen.getByTestId('current-page').textContent).toBe('3')

      // Search should reset to page 1
      act(() => {
        fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Beta' } })
        vi.advanceTimersByTime(1)
      })
      expect(screen.getByTestId('current-page').textContent).toBe('1')
    })

    it('should show zero results for non-matching query', () => {
      const items = generateItems(25)
      render(<SearchPaginatedList items={items} pageSize={10} />)

      act(() => {
        fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'zzzznonexistent' } })
        vi.advanceTimersByTime(1)
      })

      expect(screen.getByTestId('total-count').textContent).toBe('0')
      expect(screen.getByTestId('page-count').textContent).toBe('0')
    })

    it('should restore all items when search is cleared', () => {
      const items = generateItems(25)
      render(<SearchPaginatedList items={items} pageSize={10} />)

      act(() => {
        fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Alpha' } })
        vi.advanceTimersByTime(1)
      })
      const filteredCount = Number(screen.getByTestId('total-count').textContent)
      expect(filteredCount).toBeLessThan(25)

      // Clear search
      act(() => {
        fireEvent.change(screen.getByTestId('search-input'), { target: { value: '' } })
      })
      expect(screen.getByTestId('total-count').textContent).toBe('25')
    })
  })

  describe('small result set uses plain list', () => {
    it('should render plain list for small datasets', () => {
      const items = generateItems(10)
      render(<SearchPaginatedList items={items} pageSize={10} />)

      expect(screen.getByTestId('plain-list')).toBeDefined()
      expect(screen.queryByRole('list', { name: 'Search results' })).toBeNull()
    })

    it('should render individual list items', () => {
      const items = generateItems(5)
      render(<SearchPaginatedList items={items} pageSize={10} />)

      expect(screen.getByTestId('list-item-item-0')).toBeDefined()
      expect(screen.getByTestId('list-item-item-4')).toBeDefined()
    })
  })

  describe('large result set uses VirtualList', () => {
    it('should render VirtualList for large datasets', () => {
      const items = generateItems(100)
      render(<SearchPaginatedList items={items} pageSize={100} />)

      expect(screen.getByRole('list', { name: 'Search results' })).toBeDefined()
    })

    it('should only render visible items in VirtualList', () => {
      const items = generateItems(100)
      render(<SearchPaginatedList items={items} pageSize={100} />)

      // VirtualList only renders visible items + overscan
      const listItems = screen.getAllByRole('listitem')
      expect(listItems.length).toBeLessThan(100)
    })
  })

  describe('pagination with search results', () => {
    it('should paginate search results', () => {
      const items = generateItems(50)
      render(<SearchPaginatedList items={items} pageSize={5} />)

      act(() => {
        fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Alpha' } })
        vi.advanceTimersByTime(1)
      })

      const totalAfterSearch = Number(screen.getByTestId('total-count').textContent)
      const pageCount = Number(screen.getByTestId('page-count').textContent)

      // If there are more results than pageSize, pageCount should equal pageSize
      if (totalAfterSearch > 5) {
        expect(pageCount).toBe(5)
      } else {
        expect(pageCount).toBe(totalAfterSearch)
      }
    })

    it('should update pagination info text', () => {
      const items = generateItems(25)
      render(<SearchPaginatedList items={items} pageSize={10} />)

      const info = screen.getByTestId('pagination-info')
      expect(info.textContent).toContain('1-10 of 25')

      act(() => {
        fireEvent.click(screen.getByLabelText('Page 2'))
      })
      expect(info.textContent).toContain('11-20 of 25')
    })
  })

  describe('page size changes', () => {
    it('should change page size and reset to page 1', () => {
      const items = generateItems(50)
      render(<SearchPaginatedList items={items} pageSize={10} />)

      // Go to page 3
      act(() => {
        fireEvent.click(screen.getByLabelText('Page 3'))
      })
      expect(screen.getByTestId('current-page').textContent).toBe('3')

      // Change page size
      act(() => {
        fireEvent.change(screen.getByLabelText('Items per page'), { target: { value: '20' } })
      })

      expect(screen.getByTestId('current-page').textContent).toBe('1')
      expect(screen.getByTestId('page-count').textContent).toBe('20')
    })
  })
})
