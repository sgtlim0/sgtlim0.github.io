'use client'

import React, { useCallback } from 'react'
import { usePagination } from './hooks/usePagination'
import type { UsePaginationOptions } from './hooks/usePagination'

export interface PaginationProps extends UsePaginationOptions {
  /** Callback when page changes */
  readonly onPageChange?: (page: number) => void
  /** Callback when page size changes */
  readonly onPageSizeChange?: (pageSize: number) => void
  /** Available page size options (default: [10, 20, 50, 100]) */
  readonly pageSizeOptions?: readonly number[]
  /** Show page size selector (default: true) */
  readonly showPageSizeSelector?: boolean
  /** Show item count info "X-Y of N" (default: true) */
  readonly showItemCount?: boolean
  /** Optional className for the container */
  readonly className?: string
  /** Previous button label (default: 'Previous') */
  readonly prevLabel?: string
  /** Next button label (default: 'Next') */
  readonly nextLabel?: string
}

/**
 * Pagination component with page numbers, ellipsis, prev/next buttons,
 * page size selector, and item count display.
 *
 * Accessible with proper aria attributes:
 * - `nav[aria-label="pagination"]`
 * - `aria-current="page"` on active page
 * - `aria-disabled` on disabled buttons
 *
 * @example
 * ```tsx
 * <Pagination
 *   totalItems={200}
 *   pageSize={10}
 *   onPageChange={(page) => console.log('Page:', page)}
 *   onPageSizeChange={(size) => console.log('Size:', size)}
 * />
 * ```
 */
export default function Pagination({
  totalItems,
  pageSize,
  initialPage,
  siblingCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  showItemCount = true,
  className = '',
  prevLabel = 'Previous',
  nextLabel = 'Next',
}: PaginationProps): React.ReactElement {
  const {
    page,
    totalPages,
    pageRange,
    setPage,
    nextPage,
    prevPage,
    canNext,
    canPrev,
    startIndex,
    endIndex,
  } = usePagination({ totalItems, pageSize, initialPage, siblingCount })

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage)
      onPageChange?.(newPage)
    },
    [setPage, onPageChange],
  )

  const handlePrev = useCallback(() => {
    if (!canPrev) return
    const newPage = page - 1
    prevPage()
    onPageChange?.(newPage)
  }, [canPrev, page, prevPage, onPageChange])

  const handleNext = useCallback(() => {
    if (!canNext) return
    const newPage = page + 1
    nextPage()
    onPageChange?.(newPage)
  }, [canNext, page, nextPage, onPageChange])

  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSize = Number(e.target.value)
      onPageSizeChange?.(newSize)
    },
    [onPageSizeChange],
  )

  return (
    <nav
      aria-label="pagination"
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      {/* Item count info */}
      {showItemCount && (
        <span data-testid="pagination-info" style={{ fontSize: '0.875rem' }}>
          {totalItems === 0
            ? '0 items'
            : `${startIndex + 1}-${endIndex} of ${totalItems}`}
        </span>
      )}

      {/* Page navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canPrev}
          aria-disabled={!canPrev}
          aria-label={prevLabel}
          style={{
            padding: '0.375rem 0.75rem',
            cursor: canPrev ? 'pointer' : 'not-allowed',
            opacity: canPrev ? 1 : 0.5,
          }}
        >
          {prevLabel}
        </button>

        {pageRange.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              aria-hidden="true"
              style={{ padding: '0.375rem 0.5rem' }}
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => handlePageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              aria-label={`Page ${item}`}
              style={{
                padding: '0.375rem 0.75rem',
                fontWeight: item === page ? 700 : 400,
                cursor: 'pointer',
              }}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={handleNext}
          disabled={!canNext}
          aria-disabled={!canNext}
          aria-label={nextLabel}
          style={{
            padding: '0.375rem 0.75rem',
            cursor: canNext ? 'pointer' : 'not-allowed',
            opacity: canNext ? 1 : 0.5,
          }}
        >
          {nextLabel}
        </button>
      </div>

      {/* Page size selector */}
      {showPageSizeSelector && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="pagination-page-size" style={{ fontSize: '0.875rem' }}>
            Per page:
          </label>
          <select
            id="pagination-page-size"
            value={pageSize}
            onChange={handlePageSizeChange}
            aria-label="Items per page"
            style={{ padding: '0.25rem 0.5rem' }}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </nav>
  )
}
