import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen } from '@testing-library/react'
import { useTimeline } from '../src/hooks/useTimeline'
import type { TimelineItemData } from '../src/hooks/useTimeline'
import { Timeline, formatTimestamp } from '../src/Timeline'
import type { TimelineItem } from '../src/Timeline'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const baseItems: TimelineItemData[] = [
  {
    id: '1',
    title: 'Step 1',
    description: 'First step',
    timestamp: new Date('2025-01-10T10:00:00Z'),
    status: 'completed',
  },
  {
    id: '2',
    title: 'Step 2',
    description: 'Second step',
    timestamp: new Date('2025-01-15T12:00:00Z'),
    status: 'current',
  },
  {
    id: '3',
    title: 'Step 3',
    description: 'Third step',
    timestamp: new Date('2025-02-01T08:00:00Z'),
    status: 'upcoming',
  },
  {
    id: '4',
    title: 'Step 4',
    timestamp: new Date('2025-01-10T14:00:00Z'),
    status: 'completed',
  },
]

// ---------------------------------------------------------------------------
// useTimeline hook tests
// ---------------------------------------------------------------------------

describe('useTimeline', () => {
  // --- default behavior ---

  it('returns all items when no filter is set', () => {
    const { result } = renderHook(() =>
      useTimeline({ items: baseItems }),
    )
    expect(result.current.items).toHaveLength(4)
  })

  it('defaults to desc sort order', () => {
    const { result } = renderHook(() =>
      useTimeline({ items: baseItems }),
    )
    expect(result.current.sortOrder).toBe('desc')
  })

  it('defaults to null filter', () => {
    const { result } = renderHook(() =>
      useTimeline({ items: baseItems }),
    )
    expect(result.current.filter).toBeNull()
  })

  // --- sorting ---

  it('sorts items in descending order by default', () => {
    const { result } = renderHook(() =>
      useTimeline({ items: baseItems }),
    )
    const ids = result.current.items.map((i) => i.id)
    // Feb 1 > Jan 15 > Jan 10 14:00 > Jan 10 10:00
    expect(ids).toEqual(['3', '2', '4', '1'])
  })

  it('sorts items in ascending order', () => {
    const { result } = renderHook(() =>
      useTimeline({ items: baseItems, defaultSort: 'asc' }),
    )
    const ids = result.current.items.map((i) => i.id)
    expect(ids).toEqual(['1', '4', '2', '3'])
  })

  it('toggleSortOrder switches between asc and desc', () => {
    const { result } = renderHook(() =>
      useTimeline({ items: baseItems }),
    )

    expect(result.current.sortOrder).toBe('desc')

    act(() => {
      result.current.toggleSortOrder()
    })
    expect(result.current.sortOrder).toBe('asc')

    act(() => {
      result.current.toggleSortOrder()
    })
    expect(result.current.sortOrder).toBe('desc')
  })

  it('setSortOrder sets explicit sort order', () => {
    const { result } = renderHook(() =>
      useTimeline({ items: baseItems }),
    )

    act(() => {
      result.current.setSortOrder('asc')
    })
    expect(result.current.sortOrder).toBe('asc')
  })

  // --- filtering ---

  it('filters items by status', () => {
    const { result } = renderHook(() =>
      useTimeline({ items: baseItems }),
    )

    act(() => {
      result.current.setFilter('completed')
    })

    expect(result.current.items).toHaveLength(2)
    expect(result.current.items.every((i) => i.status === 'completed')).toBe(true)
  })

  it('filters for current status', () => {
    const { result } = renderHook(() =>
      useTimeline({ items: baseItems }),
    )

    act(() => {
      result.current.setFilter('current')
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe('2')
  })

  it('filters for upcoming status', () => {
    const { result } = renderHook(() =>
      useTimeline({ items: baseItems }),
    )

    act(() => {
      result.current.setFilter('upcoming')
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe('3')
  })

  it('clears filter when set to null', () => {
    const { result } = renderHook(() =>
      useTimeline({ items: baseItems, defaultFilter: 'completed' }),
    )

    expect(result.current.items).toHaveLength(2)

    act(() => {
      result.current.setFilter(null)
    })

    expect(result.current.items).toHaveLength(4)
  })

  it('respects defaultFilter option', () => {
    const { result } = renderHook(() =>
      useTimeline({ items: baseItems, defaultFilter: 'upcoming' }),
    )

    expect(result.current.filter).toBe('upcoming')
    expect(result.current.items).toHaveLength(1)
  })

  // --- grouping ---

  it('groups items by date', () => {
    const { result } = renderHook(() =>
      useTimeline({ items: baseItems, defaultSort: 'asc' }),
    )

    const groups = result.current.groupedByDate
    expect(groups).toHaveLength(3)
    expect(groups[0].label).toBe('2025-01-10')
    expect(groups[0].items).toHaveLength(2)
    expect(groups[1].label).toBe('2025-01-15')
    expect(groups[1].items).toHaveLength(1)
    expect(groups[2].label).toBe('2025-02-01')
    expect(groups[2].items).toHaveLength(1)
  })

  it('returns empty groups for empty items', () => {
    const { result } = renderHook(() =>
      useTimeline({ items: [] }),
    )
    expect(result.current.groupedByDate).toHaveLength(0)
  })

  // --- timestamp parsing ---

  it('handles string timestamps', () => {
    const items: TimelineItemData[] = [
      { id: 'a', title: 'A', timestamp: '2025-03-01T00:00:00Z' },
      { id: 'b', title: 'B', timestamp: '2025-01-01T00:00:00Z' },
    ]

    const { result } = renderHook(() =>
      useTimeline({ items, defaultSort: 'asc' }),
    )

    expect(result.current.items[0].id).toBe('b')
    expect(result.current.items[1].id).toBe('a')
  })

  it('handles numeric timestamps', () => {
    const items: TimelineItemData[] = [
      { id: 'a', title: 'A', timestamp: 2000 },
      { id: 'b', title: 'B', timestamp: 1000 },
    ]

    const { result } = renderHook(() =>
      useTimeline({ items, defaultSort: 'asc' }),
    )

    expect(result.current.items[0].id).toBe('b')
    expect(result.current.items[1].id).toBe('a')
  })
})

// ---------------------------------------------------------------------------
// formatTimestamp tests
// ---------------------------------------------------------------------------

describe('formatTimestamp', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for timestamps within the last minute', () => {
    const result = formatTimestamp(new Date('2025-06-15T11:59:30Z'))
    expect(result).toBe('just now')
  })

  it('returns minutes ago for timestamps within the last hour', () => {
    const result = formatTimestamp(new Date('2025-06-15T11:30:00Z'))
    expect(result).toBe('30m ago')
  })

  it('returns hours ago for timestamps within the last day', () => {
    const result = formatTimestamp(new Date('2025-06-15T06:00:00Z'))
    expect(result).toBe('6h ago')
  })

  it('returns days ago for timestamps within the last week', () => {
    const result = formatTimestamp(new Date('2025-06-13T12:00:00Z'))
    expect(result).toBe('2d ago')
  })

  it('returns formatted date for timestamps older than a week', () => {
    const result = formatTimestamp(new Date('2025-01-10T10:00:00Z'))
    expect(result).toBe('2025-01-10')
  })

  it('handles string timestamps', () => {
    const result = formatTimestamp('2025-01-10T10:00:00Z')
    expect(result).toBe('2025-01-10')
  })

  it('handles numeric timestamps', () => {
    const d = new Date('2025-01-10T10:00:00Z')
    const result = formatTimestamp(d.getTime())
    expect(result).toBe('2025-01-10')
  })
})

// ---------------------------------------------------------------------------
// Timeline component tests
// ---------------------------------------------------------------------------

const sampleItems: TimelineItem[] = [
  {
    id: '1',
    title: 'Completed Task',
    description: 'This is done',
    timestamp: new Date('2025-01-10T10:00:00Z'),
    status: 'completed',
  },
  {
    id: '2',
    title: 'Current Task',
    description: 'In progress',
    timestamp: new Date('2025-01-15T12:00:00Z'),
    status: 'current',
  },
  {
    id: '3',
    title: 'Upcoming Task',
    timestamp: new Date('2025-02-01T08:00:00Z'),
    status: 'upcoming',
  },
]

describe('Timeline component', () => {
  // --- rendering ---

  it('renders all timeline items', () => {
    render(<Timeline items={sampleItems} />)

    expect(screen.getByText('Completed Task')).toBeInTheDocument()
    expect(screen.getByText('Current Task')).toBeInTheDocument()
    expect(screen.getByText('Upcoming Task')).toBeInTheDocument()
  })

  it('renders descriptions when provided', () => {
    render(<Timeline items={sampleItems} />)

    expect(screen.getByText('This is done')).toBeInTheDocument()
    expect(screen.getByText('In progress')).toBeInTheDocument()
  })

  it('renders nothing for empty items', () => {
    const { container } = render(<Timeline items={[]} />)
    expect(container.innerHTML).toBe('')
  })

  // --- orientation ---

  it('renders vertical layout by default', () => {
    render(<Timeline items={sampleItems} />)
    const list = screen.getByRole('list')
    expect(list.className).toContain('flex-col')
  })

  it('renders horizontal layout when specified', () => {
    render(<Timeline items={sampleItems} orientation="horizontal" />)
    const list = screen.getByRole('list')
    expect(list.className).toContain('flex-row')
  })

  // --- status styling ---

  it('renders completed items with a check icon', () => {
    const { container } = render(
      <Timeline
        items={[
          { id: '1', title: 'Done', timestamp: Date.now(), status: 'completed' },
        ]}
      />,
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders current items with a dot indicator', () => {
    const { container } = render(
      <Timeline
        items={[
          { id: '1', title: 'Now', timestamp: Date.now(), status: 'current' },
        ]}
      />,
    )

    const dot = container.querySelector('span.block')
    expect(dot).toBeInTheDocument()
  })

  it('renders upcoming items with a hollow circle', () => {
    const { container } = render(
      <Timeline
        items={[
          { id: '1', title: 'Later', timestamp: Date.now(), status: 'upcoming' },
        ]}
      />,
    )

    const marker = container.querySelector('[aria-hidden="true"]')
    expect(marker).toBeInTheDocument()
    expect(marker?.className).toContain('border-2')
  })

  // --- custom icon ---

  it('renders custom icon when provided', () => {
    render(
      <Timeline
        items={[
          {
            id: '1',
            title: 'Custom',
            timestamp: Date.now(),
            status: 'completed',
            icon: <span data-testid="custom-icon">star</span>,
          },
        ]}
      />,
    )

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  // --- custom color ---

  it('applies custom color to marker', () => {
    const { container } = render(
      <Timeline
        items={[
          {
            id: '1',
            title: 'Colored',
            timestamp: Date.now(),
            status: 'completed',
            color: '#ff0000',
          },
        ]}
      />,
    )

    const marker = container.querySelector('[aria-hidden="true"]')
    expect(marker).toHaveStyle({ backgroundColor: '#ff0000' })
  })

  // --- accessibility ---

  it('has role="list" and aria-label="Timeline"', () => {
    render(<Timeline items={sampleItems} />)
    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('aria-label', 'Timeline')
  })

  it('renders items as <li> elements', () => {
    render(<Timeline items={sampleItems} />)
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)
  })

  it('renders <time> elements with dateTime attribute', () => {
    const { container } = render(<Timeline items={sampleItems} />)
    const timeElements = container.querySelectorAll('time')
    expect(timeElements).toHaveLength(3)
    timeElements.forEach((el) => {
      expect(el.getAttribute('dateTime')).toBeTruthy()
    })
  })

  // --- connector lines ---

  it('does not render connector line after the last item (vertical)', () => {
    const { container } = render(<Timeline items={sampleItems} />)
    const listItems = container.querySelectorAll('li')
    const lastItem = listItems[listItems.length - 1]
    // The connector line has class w-0.5
    const connector = lastItem.querySelector('.w-0\\.5')
    expect(connector).toBeNull()
  })

  it('renders connector lines between items (vertical)', () => {
    const { container } = render(<Timeline items={sampleItems} />)
    const listItems = container.querySelectorAll('li')
    // First and second items should have connector lines
    const firstConnector = listItems[0].querySelector('.grow')
    expect(firstConnector).toBeInTheDocument()
  })

  // --- className ---

  it('accepts className prop', () => {
    render(<Timeline items={sampleItems} className="custom-timeline" />)
    const list = screen.getByRole('list')
    expect(list).toHaveClass('custom-timeline')
  })

  // --- default status ---

  it('treats items without status as upcoming', () => {
    const { container } = render(
      <Timeline
        items={[
          { id: '1', title: 'No Status', timestamp: Date.now() },
        ]}
      />,
    )

    // Upcoming: hollow circle with border-2
    const marker = container.querySelector('[aria-hidden="true"]')
    expect(marker?.className).toContain('border-2')
  })

  // --- single item ---

  it('renders correctly with a single item', () => {
    render(
      <Timeline
        items={[
          { id: '1', title: 'Only One', timestamp: Date.now(), status: 'current' },
        ]}
      />,
    )

    expect(screen.getByText('Only One')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  // --- horizontal orientation ---

  it('renders horizontal items with marker and content', () => {
    render(
      <Timeline
        items={sampleItems}
        orientation="horizontal"
      />,
    )

    expect(screen.getByText('Completed Task')).toBeInTheDocument()
    expect(screen.getByText('Current Task')).toBeInTheDocument()
    expect(screen.getByText('Upcoming Task')).toBeInTheDocument()
  })
})
