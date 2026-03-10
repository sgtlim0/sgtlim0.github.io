import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { renderHook, act as hookAct } from '@testing-library/react'
import { PageSkeleton } from '../src/PageSkeleton'
import { LoadingOverlay } from '../src/LoadingOverlay'
import { usePageLoading } from '../src/hooks/usePageLoading'

describe('PageSkeleton', () => {
  describe('dashboard variant', () => {
    it('renders header, 4 cards, and table', () => {
      const { container } = render(<PageSkeleton variant="dashboard" />)
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
      expect(screen.getByLabelText('Loading dashboard')).toBeInTheDocument()
      // 4 stat cards in grid
      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      expect(grid!.children.length).toBe(4)
    })
  })

  describe('list variant', () => {
    it('renders header and 10 list items', () => {
      const { container } = render(<PageSkeleton variant="list" />)
      expect(screen.getByLabelText('Loading list')).toBeInTheDocument()
      // 10 list items with avatar circles
      const circles = container.querySelectorAll('.rounded-full')
      expect(circles.length).toBe(10)
    })
  })

  describe('detail variant', () => {
    it('renders sidebar and content area', () => {
      const { container } = render(<PageSkeleton variant="detail" />)
      expect(screen.getByLabelText('Loading detail')).toBeInTheDocument()
      // flex layout with sidebar + content
      const flexContainer = container.querySelector('.flex.gap-6')
      expect(flexContainer).toBeInTheDocument()
    })
  })

  describe('form variant', () => {
    it('renders header, 5 form fields, and submit button', () => {
      const { container } = render(<PageSkeleton variant="form" />)
      expect(screen.getByLabelText('Loading form')).toBeInTheDocument()
      // 5 form fields: each has label (h-4 w-1/4) + input (h-10)
      const formFields = container.querySelectorAll('.space-y-2')
      expect(formFields.length).toBe(5)
    })
  })

  describe('chat variant', () => {
    it('renders sidebar and message list', () => {
      const { container } = render(<PageSkeleton variant="chat" />)
      expect(screen.getByLabelText('Loading chat')).toBeInTheDocument()
      // chat messages: 2 justify-start + 2 justify-end
      const leftMessages = container.querySelectorAll('.justify-start')
      const rightMessages = container.querySelectorAll('.justify-end')
      expect(leftMessages.length).toBe(2)
      expect(rightMessages.length).toBe(2)
    })
  })

  it('applies custom className', () => {
    const { container } = render(<PageSkeleton variant="dashboard" className="mt-8" />)
    expect(container.firstChild).toHaveClass('mt-8')
  })

  it('all variants have aria-busy="true"', () => {
    const variants = ['dashboard', 'list', 'detail', 'form', 'chat'] as const
    for (const variant of variants) {
      const { unmount } = render(<PageSkeleton variant={variant} />)
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
      unmount()
    }
  })
})

describe('LoadingOverlay', () => {
  it('renders nothing when not visible', () => {
    const { container } = render(<LoadingOverlay visible={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders overlay when visible', () => {
    render(<LoadingOverlay visible={true} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('has aria-busy attribute', () => {
    render(<LoadingOverlay visible={true} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-busy', 'true')
  })

  it('shows message when provided', () => {
    render(<LoadingOverlay visible={true} message="Loading data..." />)
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('uses message as aria-label', () => {
    render(<LoadingOverlay visible={true} message="Saving changes" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Saving changes')
  })

  it('defaults aria-label to Loading', () => {
    render(<LoadingOverlay visible={true} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Loading')
  })

  it('applies fullscreen positioning', () => {
    render(<LoadingOverlay visible={true} fullscreen={true} />)
    const overlay = screen.getByRole('progressbar')
    expect(overlay.className).toContain('fixed')
    expect(overlay.className).toContain('z-50')
  })

  it('applies contained positioning by default', () => {
    render(<LoadingOverlay visible={true} />)
    const overlay = screen.getByRole('progressbar')
    expect(overlay.className).toContain('absolute')
    expect(overlay.className).toContain('z-10')
  })

  it('applies custom className', () => {
    render(<LoadingOverlay visible={true} className="bg-white" />)
    const overlay = screen.getByRole('progressbar')
    expect(overlay.className).toContain('bg-white')
  })
})

describe('usePageLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('defaults to not loading', () => {
    const { result } = renderHook(() => usePageLoading())
    expect(result.current.isLoading).toBe(false)
  })

  it('supports initialLoading option', () => {
    const { result } = renderHook(() => usePageLoading({ initialLoading: true }))
    expect(result.current.isLoading).toBe(true)
  })

  it('startLoading sets isLoading to true', () => {
    const { result } = renderHook(() => usePageLoading())
    hookAct(() => {
      result.current.startLoading()
    })
    expect(result.current.isLoading).toBe(true)
  })

  it('stopLoading after minDisplayTime sets isLoading to false', () => {
    const { result } = renderHook(() => usePageLoading({ minDisplayTime: 300 }))

    hookAct(() => {
      result.current.startLoading()
    })
    expect(result.current.isLoading).toBe(true)

    // Advance past minDisplayTime
    hookAct(() => {
      vi.advanceTimersByTime(350)
    })

    hookAct(() => {
      result.current.stopLoading()
    })
    expect(result.current.isLoading).toBe(false)
  })

  it('enforces minimum display time to prevent flicker', () => {
    const { result } = renderHook(() => usePageLoading({ minDisplayTime: 300 }))

    hookAct(() => {
      result.current.startLoading()
    })

    // Stop immediately (elapsed < minDisplayTime)
    hookAct(() => {
      result.current.stopLoading()
    })
    // Should still be loading
    expect(result.current.isLoading).toBe(true)

    // Advance by 300ms (minDisplayTime)
    hookAct(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current.isLoading).toBe(false)
  })

  it('uses default 300ms minDisplayTime', () => {
    const { result } = renderHook(() => usePageLoading())

    hookAct(() => {
      result.current.startLoading()
    })

    hookAct(() => {
      result.current.stopLoading()
    })
    expect(result.current.isLoading).toBe(true)

    hookAct(() => {
      vi.advanceTimersByTime(299)
    })
    expect(result.current.isLoading).toBe(true)

    hookAct(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.isLoading).toBe(false)
  })

  it('startLoading cancels pending stop timer', () => {
    const { result } = renderHook(() => usePageLoading({ minDisplayTime: 300 }))

    hookAct(() => {
      result.current.startLoading()
    })

    // Stop (schedules delayed stop)
    hookAct(() => {
      result.current.stopLoading()
    })

    // Restart before timer fires
    hookAct(() => {
      result.current.startLoading()
    })

    hookAct(() => {
      vi.advanceTimersByTime(500)
    })
    // Should still be loading since we restarted
    expect(result.current.isLoading).toBe(true)
  })

  it('custom minDisplayTime works', () => {
    const { result } = renderHook(() => usePageLoading({ minDisplayTime: 500 }))

    hookAct(() => {
      result.current.startLoading()
    })

    hookAct(() => {
      result.current.stopLoading()
    })
    expect(result.current.isLoading).toBe(true)

    hookAct(() => {
      vi.advanceTimersByTime(499)
    })
    expect(result.current.isLoading).toBe(true)

    hookAct(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.isLoading).toBe(false)
  })
})
