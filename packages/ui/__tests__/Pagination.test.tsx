import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { usePagination } from '../src/hooks/usePagination'
import Pagination from '../src/Pagination'

// ─── usePagination hook tests ───────────────────────────────────────────────

describe('usePagination', () => {
  describe('initial state', () => {
    it('computes totalPages from totalItems and pageSize', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, pageSize: 10 }),
      )
      expect(result.current.totalPages).toBe(10)
      expect(result.current.page).toBe(1)
    })

    it('rounds up totalPages for partial pages', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 95, pageSize: 10 }),
      )
      expect(result.current.totalPages).toBe(10)
    })

    it('handles 0 totalItems', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 0, pageSize: 10 }),
      )
      expect(result.current.totalPages).toBe(1)
      expect(result.current.page).toBe(1)
      expect(result.current.canNext).toBe(false)
      expect(result.current.canPrev).toBe(false)
    })

    it('respects initialPage', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, pageSize: 10, initialPage: 5 }),
      )
      expect(result.current.page).toBe(5)
    })

    it('clamps initialPage to valid range', () => {
      const { result: overMax } = renderHook(() =>
        usePagination({ totalItems: 50, pageSize: 10, initialPage: 99 }),
      )
      expect(overMax.current.page).toBe(5)

      const { result: underMin } = renderHook(() =>
        usePagination({ totalItems: 50, pageSize: 10, initialPage: -1 }),
      )
      expect(underMin.current.page).toBe(1)
    })
  })

  describe('navigation', () => {
    it('nextPage increments page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 50, pageSize: 10 }),
      )
      act(() => result.current.nextPage())
      expect(result.current.page).toBe(2)
    })

    it('prevPage decrements page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 50, pageSize: 10, initialPage: 3 }),
      )
      act(() => result.current.prevPage())
      expect(result.current.page).toBe(2)
    })

    it('nextPage does not exceed totalPages', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 30, pageSize: 10, initialPage: 3 }),
      )
      act(() => result.current.nextPage())
      expect(result.current.page).toBe(3)
    })

    it('prevPage does not go below 1', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 30, pageSize: 10, initialPage: 1 }),
      )
      act(() => result.current.prevPage())
      expect(result.current.page).toBe(1)
    })

    it('setPage navigates to specific page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, pageSize: 10 }),
      )
      act(() => result.current.setPage(7))
      expect(result.current.page).toBe(7)
    })

    it('setPage clamps out-of-range values', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 50, pageSize: 10 }),
      )
      act(() => result.current.setPage(100))
      expect(result.current.page).toBe(5)

      act(() => result.current.setPage(0))
      expect(result.current.page).toBe(1)
    })
  })

  describe('canNext / canPrev', () => {
    it('canNext is true when not on last page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 50, pageSize: 10, initialPage: 3 }),
      )
      expect(result.current.canNext).toBe(true)
    })

    it('canNext is false on last page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 50, pageSize: 10, initialPage: 5 }),
      )
      expect(result.current.canNext).toBe(false)
    })

    it('canPrev is true when not on first page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 50, pageSize: 10, initialPage: 2 }),
      )
      expect(result.current.canPrev).toBe(true)
    })

    it('canPrev is false on first page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 50, pageSize: 10, initialPage: 1 }),
      )
      expect(result.current.canPrev).toBe(false)
    })
  })

  describe('startIndex / endIndex', () => {
    it('computes correct indices for first page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 95, pageSize: 10 }),
      )
      expect(result.current.startIndex).toBe(0)
      expect(result.current.endIndex).toBe(10)
    })

    it('computes correct indices for middle page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 95, pageSize: 10, initialPage: 5 }),
      )
      expect(result.current.startIndex).toBe(40)
      expect(result.current.endIndex).toBe(50)
    })

    it('clamps endIndex to totalItems on last page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 95, pageSize: 10, initialPage: 10 }),
      )
      expect(result.current.startIndex).toBe(90)
      expect(result.current.endIndex).toBe(95)
    })

    it('handles 0 totalItems', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 0, pageSize: 10 }),
      )
      expect(result.current.startIndex).toBe(0)
      expect(result.current.endIndex).toBe(0)
    })
  })

  describe('pageRange with ellipsis', () => {
    it('shows all pages when totalPages is small', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 50, pageSize: 10, siblingCount: 1 }),
      )
      expect(result.current.pageRange).toEqual([1, 2, 3, 4, 5])
    })

    it('shows right ellipsis when current is near start', () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 200,
          pageSize: 10,
          initialPage: 1,
          siblingCount: 1,
        }),
      )
      // [1, 2, 'ellipsis', 20]
      const range = result.current.pageRange
      expect(range[0]).toBe(1)
      expect(range).toContain('ellipsis')
      expect(range[range.length - 1]).toBe(20)
    })

    it('shows left ellipsis when current is near end', () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 200,
          pageSize: 10,
          initialPage: 20,
          siblingCount: 1,
        }),
      )
      const range = result.current.pageRange
      expect(range[0]).toBe(1)
      expect(range).toContain('ellipsis')
      expect(range[range.length - 1]).toBe(20)
    })

    it('shows both ellipses when current is in the middle', () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 200,
          pageSize: 10,
          initialPage: 10,
          siblingCount: 1,
        }),
      )
      const range = result.current.pageRange
      expect(range[0]).toBe(1)
      expect(range[1]).toBe('ellipsis')
      expect(range).toContain(9)
      expect(range).toContain(10)
      expect(range).toContain(11)
      expect(range[range.length - 2]).toBe('ellipsis')
      expect(range[range.length - 1]).toBe(20)
    })

    it('includes current page and siblings in range', () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 200,
          pageSize: 10,
          initialPage: 10,
          siblingCount: 2,
        }),
      )
      const range = result.current.pageRange
      expect(range).toContain(8)
      expect(range).toContain(9)
      expect(range).toContain(10)
      expect(range).toContain(11)
      expect(range).toContain(12)
    })

    it('handles single page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 5, pageSize: 10 }),
      )
      expect(result.current.pageRange).toEqual([1])
      expect(result.current.totalPages).toBe(1)
    })
  })
})

// ─── Pagination component tests ─────────────────────────────────────────────

describe('Pagination component', () => {
  describe('rendering', () => {
    it('renders navigation with aria-label', () => {
      render(<Pagination totalItems={100} pageSize={10} />)
      const nav = screen.getByRole('navigation', { name: 'pagination' })
      expect(nav).toBeDefined()
    })

    it('renders Previous and Next buttons', () => {
      render(<Pagination totalItems={100} pageSize={10} />)
      expect(screen.getByLabelText('Previous')).toBeDefined()
      expect(screen.getByLabelText('Next')).toBeDefined()
    })

    it('renders page number buttons', () => {
      render(<Pagination totalItems={50} pageSize={10} />)
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByLabelText(`Page ${i}`)).toBeDefined()
      }
    })

    it('renders item count info', () => {
      render(<Pagination totalItems={100} pageSize={10} />)
      expect(screen.getByTestId('pagination-info').textContent).toBe(
        '1-10 of 100',
      )
    })

    it('renders "0 items" when totalItems is 0', () => {
      render(<Pagination totalItems={0} pageSize={10} />)
      expect(screen.getByTestId('pagination-info').textContent).toBe('0 items')
    })

    it('hides item count when showItemCount is false', () => {
      render(
        <Pagination totalItems={100} pageSize={10} showItemCount={false} />,
      )
      expect(screen.queryByTestId('pagination-info')).toBeNull()
    })

    it('renders page size selector by default', () => {
      render(<Pagination totalItems={100} pageSize={10} />)
      expect(screen.getByLabelText('Items per page')).toBeDefined()
    })

    it('hides page size selector when showPageSizeSelector is false', () => {
      render(
        <Pagination
          totalItems={100}
          pageSize={10}
          showPageSizeSelector={false}
        />,
      )
      expect(screen.queryByLabelText('Items per page')).toBeNull()
    })

    it('renders custom page size options', () => {
      render(
        <Pagination
          totalItems={100}
          pageSize={25}
          pageSizeOptions={[25, 50, 75]}
        />,
      )
      const select = screen.getByLabelText('Items per page') as HTMLSelectElement
      expect(select.options.length).toBe(3)
    })
  })

  describe('accessibility', () => {
    it('marks current page with aria-current="page"', () => {
      render(<Pagination totalItems={50} pageSize={10} initialPage={3} />)
      const currentBtn = screen.getByLabelText('Page 3')
      expect(currentBtn.getAttribute('aria-current')).toBe('page')
    })

    it('does not mark non-current pages with aria-current', () => {
      render(<Pagination totalItems={50} pageSize={10} initialPage={3} />)
      const otherBtn = screen.getByLabelText('Page 1')
      expect(otherBtn.getAttribute('aria-current')).toBeNull()
    })

    it('disables Previous button on first page', () => {
      render(<Pagination totalItems={50} pageSize={10} initialPage={1} />)
      const prevBtn = screen.getByLabelText('Previous')
      expect(prevBtn.getAttribute('aria-disabled')).toBe('true')
      expect((prevBtn as HTMLButtonElement).disabled).toBe(true)
    })

    it('disables Next button on last page', () => {
      render(<Pagination totalItems={50} pageSize={10} initialPage={5} />)
      const nextBtn = screen.getByLabelText('Next')
      expect(nextBtn.getAttribute('aria-disabled')).toBe('true')
      expect((nextBtn as HTMLButtonElement).disabled).toBe(true)
    })

    it('renders ellipsis with aria-hidden', () => {
      render(
        <Pagination
          totalItems={200}
          pageSize={10}
          initialPage={10}
          siblingCount={1}
        />,
      )
      const ellipses = screen.getAllByText('...')
      for (const el of ellipses) {
        expect(el.getAttribute('aria-hidden')).toBe('true')
      }
    })
  })

  describe('interaction', () => {
    it('calls onPageChange when clicking a page number', () => {
      const onPageChange = vi.fn()
      render(
        <Pagination
          totalItems={50}
          pageSize={10}
          onPageChange={onPageChange}
        />,
      )
      fireEvent.click(screen.getByLabelText('Page 3'))
      expect(onPageChange).toHaveBeenCalledWith(3)
    })

    it('calls onPageChange when clicking Next', () => {
      const onPageChange = vi.fn()
      render(
        <Pagination
          totalItems={50}
          pageSize={10}
          onPageChange={onPageChange}
        />,
      )
      fireEvent.click(screen.getByLabelText('Next'))
      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('calls onPageChange when clicking Previous', () => {
      const onPageChange = vi.fn()
      render(
        <Pagination
          totalItems={50}
          pageSize={10}
          initialPage={3}
          onPageChange={onPageChange}
        />,
      )
      fireEvent.click(screen.getByLabelText('Previous'))
      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('does not call onPageChange when Previous is disabled', () => {
      const onPageChange = vi.fn()
      render(
        <Pagination
          totalItems={50}
          pageSize={10}
          initialPage={1}
          onPageChange={onPageChange}
        />,
      )
      fireEvent.click(screen.getByLabelText('Previous'))
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('does not call onPageChange when Next is disabled', () => {
      const onPageChange = vi.fn()
      render(
        <Pagination
          totalItems={50}
          pageSize={10}
          initialPage={5}
          onPageChange={onPageChange}
        />,
      )
      fireEvent.click(screen.getByLabelText('Next'))
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('calls onPageSizeChange when changing page size', () => {
      const onPageSizeChange = vi.fn()
      render(
        <Pagination
          totalItems={100}
          pageSize={10}
          onPageSizeChange={onPageSizeChange}
        />,
      )
      fireEvent.change(screen.getByLabelText('Items per page'), {
        target: { value: '50' },
      })
      expect(onPageSizeChange).toHaveBeenCalledWith(50)
    })

    it('updates item count display after page navigation', () => {
      render(<Pagination totalItems={95} pageSize={10} />)
      expect(screen.getByTestId('pagination-info').textContent).toBe(
        '1-10 of 95',
      )
      fireEvent.click(screen.getByLabelText('Next'))
      expect(screen.getByTestId('pagination-info').textContent).toBe(
        '11-20 of 95',
      )
    })

    it('updates aria-current after page navigation', () => {
      render(<Pagination totalItems={50} pageSize={10} />)
      expect(
        screen.getByLabelText('Page 1').getAttribute('aria-current'),
      ).toBe('page')

      fireEvent.click(screen.getByLabelText('Page 3'))
      expect(
        screen.getByLabelText('Page 3').getAttribute('aria-current'),
      ).toBe('page')
      expect(
        screen.getByLabelText('Page 1').getAttribute('aria-current'),
      ).toBeNull()
    })
  })

  describe('custom labels', () => {
    it('renders custom prev/next labels', () => {
      render(
        <Pagination
          totalItems={50}
          pageSize={10}
          prevLabel="Back"
          nextLabel="Forward"
        />,
      )
      expect(screen.getByLabelText('Back')).toBeDefined()
      expect(screen.getByLabelText('Forward')).toBeDefined()
    })
  })
})
