import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import React, { useRef } from 'react'
import TableOfContents from '../src/TableOfContents'
import type { TableOfContentsProps } from '../src/TableOfContents'
import { useTableOfContents } from '../src/hooks/useTableOfContents'
import type { TocItem } from '../src/hooks/useTableOfContents'

// ---------------------------------------------------------------------------
// Mock IntersectionObserver
// ---------------------------------------------------------------------------

type IntersectionCallback = (entries: IntersectionObserverEntry[]) => void

let observerCallback: IntersectionCallback | null = null
let observedElements: HTMLElement[] = []

const mockObserve = vi.fn((el: HTMLElement) => {
  observedElements.push(el)
})
const mockDisconnect = vi.fn()

class MockIntersectionObserver {
  constructor(callback: IntersectionCallback) {
    observerCallback = callback
  }
  observe = mockObserve
  unobserve = vi.fn()
  disconnect = mockDisconnect
}

function triggerIntersection(entries: Partial<IntersectionObserverEntry>[]) {
  if (!observerCallback) return
  act(() => {
    observerCallback!(entries as IntersectionObserverEntry[])
  })
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createHeadingDOM() {
  const container = document.createElement('div')
  const headings = [
    { tag: 'h1', id: 'intro', text: 'Introduction' },
    { tag: 'h2', id: 'getting-started', text: 'Getting Started' },
    { tag: 'h3', id: 'install', text: 'Installation' },
    { tag: 'h2', id: 'usage', text: 'Usage' },
    { tag: 'h4', id: 'advanced', text: 'Advanced Usage' },
  ]

  headings.forEach(({ tag, id, text }) => {
    const el = document.createElement(tag)
    el.id = id
    el.textContent = text
    container.appendChild(el)
  })

  document.body.appendChild(container)
  return container
}

const sampleItems: TocItem[] = [
  { id: 'intro', text: 'Introduction', level: 1 },
  { id: 'getting-started', text: 'Getting Started', level: 2 },
  { id: 'install', text: 'Installation', level: 3 },
  { id: 'usage', text: 'Usage', level: 2 },
  { id: 'advanced', text: 'Advanced Usage', level: 4 },
]

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  observerCallback = null
  observedElements = []
  mockObserve.mockClear()
  mockDisconnect.mockClear()
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// useTableOfContents Hook Tests
// ---------------------------------------------------------------------------

describe('useTableOfContents', () => {
  describe('heading extraction', () => {
    it('extracts headings from the document', () => {
      createHeadingDOM()

      const { result } = renderHook(() => useTableOfContents())

      expect(result.current.items).toHaveLength(5)
      expect(result.current.items[0]).toEqual({
        id: 'intro',
        text: 'Introduction',
        level: 1,
      })
      expect(result.current.items[2]).toEqual({
        id: 'install',
        text: 'Installation',
        level: 3,
      })
    })

    it('returns empty items when no headings exist', () => {
      const { result } = renderHook(() => useTableOfContents())
      expect(result.current.items).toHaveLength(0)
    })

    it('skips headings without id', () => {
      const el = document.createElement('h2')
      el.textContent = 'No ID'
      document.body.appendChild(el)

      const { result } = renderHook(() => useTableOfContents())
      expect(result.current.items).toHaveLength(0)
    })

    it('skips headings without text content', () => {
      const el = document.createElement('h2')
      el.id = 'empty'
      el.textContent = ''
      document.body.appendChild(el)

      const { result } = renderHook(() => useTableOfContents())
      expect(result.current.items).toHaveLength(0)
    })

    it('respects custom selector', () => {
      createHeadingDOM()

      const { result } = renderHook(() =>
        useTableOfContents({ selector: 'h2' }),
      )

      expect(result.current.items).toHaveLength(2)
      expect(result.current.items[0].text).toBe('Getting Started')
      expect(result.current.items[1].text).toBe('Usage')
    })

    it('scopes extraction to containerRef', () => {
      // Create headings outside container
      const outside = document.createElement('h2')
      outside.id = 'outside'
      outside.textContent = 'Outside'
      document.body.appendChild(outside)

      // Create container with headings
      const container = document.createElement('div')
      const inside = document.createElement('h2')
      inside.id = 'inside'
      inside.textContent = 'Inside'
      container.appendChild(inside)
      document.body.appendChild(container)

      function TestWrapper() {
        const ref = useRef<HTMLDivElement>(null)
        return <div ref={ref} />
      }

      const { result } = renderHook(() => {
        const ref = useRef<HTMLDivElement>(container as unknown as HTMLDivElement)
        return useTableOfContents({ containerRef: ref })
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].text).toBe('Inside')
    })
  })

  describe('activeId tracking', () => {
    it('starts with null activeId', () => {
      const { result } = renderHook(() => useTableOfContents())
      expect(result.current.activeId).toBeNull()
    })

    it('updates activeId when heading becomes visible', () => {
      createHeadingDOM()

      const { result } = renderHook(() => useTableOfContents())

      const introEl = document.getElementById('intro')!
      triggerIntersection([
        {
          target: introEl,
          isIntersecting: true,
          boundingClientRect: { top: 50 } as DOMRect,
        },
      ])

      expect(result.current.activeId).toBe('intro')
    })

    it('selects topmost visible heading when multiple are visible', () => {
      createHeadingDOM()

      const { result } = renderHook(() => useTableOfContents())

      const introEl = document.getElementById('intro')!
      const usageEl = document.getElementById('usage')!

      // First trigger intro so it's stored in the map
      triggerIntersection([
        {
          target: introEl,
          isIntersecting: true,
          boundingClientRect: { top: 50 } as DOMRect,
        },
      ])

      // Then trigger usage — both are now in the map
      triggerIntersection([
        {
          target: usageEl,
          isIntersecting: true,
          boundingClientRect: { top: 200 } as DOMRect,
        },
      ])

      expect(result.current.activeId).toBe('intro')
    })

    it('does not update activeId for non-intersecting entries', () => {
      createHeadingDOM()

      const { result } = renderHook(() => useTableOfContents())

      const introEl = document.getElementById('intro')!
      triggerIntersection([
        {
          target: introEl,
          isIntersecting: false,
          boundingClientRect: { top: -100 } as DOMRect,
        },
      ])

      expect(result.current.activeId).toBeNull()
    })
  })

  describe('scrollTo', () => {
    it('calls scrollIntoView on the target element', () => {
      createHeadingDOM()

      const introEl = document.getElementById('intro')!
      introEl.scrollIntoView = vi.fn()

      const { result } = renderHook(() => useTableOfContents())

      act(() => {
        result.current.scrollTo('intro')
      })

      expect(introEl.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      })
    })

    it('does nothing when element does not exist', () => {
      const { result } = renderHook(() => useTableOfContents())

      // Should not throw
      act(() => {
        result.current.scrollTo('nonexistent')
      })
    })
  })

  describe('observer lifecycle', () => {
    it('observes all heading elements', () => {
      createHeadingDOM()

      renderHook(() => useTableOfContents())

      expect(mockObserve).toHaveBeenCalledTimes(5)
    })

    it('disconnects observer on unmount', () => {
      createHeadingDOM()

      const { unmount } = renderHook(() => useTableOfContents())
      unmount()

      expect(mockDisconnect).toHaveBeenCalled()
    })

    it('does not create observer when no items', () => {
      renderHook(() => useTableOfContents())
      expect(mockObserve).not.toHaveBeenCalled()
    })
  })

  describe('SSR safety', () => {
    it('handles missing IntersectionObserver gracefully', () => {
      vi.stubGlobal('IntersectionObserver', undefined)
      createHeadingDOM()

      const { result } = renderHook(() => useTableOfContents())

      // Items are still extracted (document exists in jsdom)
      expect(result.current.items.length).toBeGreaterThan(0)
      expect(result.current.activeId).toBeNull()
    })
  })
})

// ---------------------------------------------------------------------------
// TableOfContents Component Tests
// ---------------------------------------------------------------------------

describe('TableOfContents', () => {
  describe('rendering', () => {
    it('renders with provided items', () => {
      render(<TableOfContents items={sampleItems} />)

      expect(screen.getByTestId('table-of-contents')).toBeInTheDocument()
      expect(screen.getByText('Introduction')).toBeInTheDocument()
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
      expect(screen.getByText('Installation')).toBeInTheDocument()
      expect(screen.getByText('Usage')).toBeInTheDocument()
      expect(screen.getByText('Advanced Usage')).toBeInTheDocument()
    })

    it('renders nothing when items are empty', () => {
      const { container } = render(<TableOfContents items={[]} />)
      expect(container.querySelector('nav')).toBeNull()
    })

    it('renders title by default', () => {
      render(<TableOfContents items={sampleItems} />)
      expect(screen.getByText('Table of Contents')).toBeInTheDocument()
    })

    it('hides title when showTitle is false', () => {
      render(<TableOfContents items={sampleItems} showTitle={false} />)
      expect(screen.queryByText('Table of Contents')).toBeNull()
    })

    it('renders custom title', () => {
      render(<TableOfContents items={sampleItems} title="On This Page" />)
      expect(screen.getByText('On This Page')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has role="navigation"', () => {
      render(<TableOfContents items={sampleItems} />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('has aria-label="Table of Contents"', () => {
      render(<TableOfContents items={sampleItems} />)
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveAttribute('aria-label', 'Table of Contents')
    })

    it('marks active item with aria-current="location"', () => {
      createHeadingDOM()

      render(<TableOfContents options={{ selector: 'h1, h2, h3, h4' }} />)

      const introEl = document.getElementById('intro')!
      triggerIntersection([
        {
          target: introEl,
          isIntersecting: true,
          boundingClientRect: { top: 50 } as DOMRect,
        },
      ])

      // Multiple elements match "Introduction" (the h1 in DOM + the button in ToC)
      const buttons = screen.getAllByText('Introduction')
      const tocButton = buttons.find((el) => el.tagName === 'BUTTON')!
      expect(tocButton).toHaveAttribute('aria-current', 'location')
    })

    it('renders items as buttons for keyboard accessibility', () => {
      render(<TableOfContents items={sampleItems} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(5)
    })
  })

  describe('interaction', () => {
    it('calls scrollTo on click', () => {
      createHeadingDOM()

      const introEl = document.getElementById('intro')!
      introEl.scrollIntoView = vi.fn()

      render(<TableOfContents items={sampleItems} />)

      // Multiple elements match "Introduction" (the h1 in DOM + the button in ToC)
      const buttons = screen.getAllByText('Introduction')
      const tocButton = buttons.find((el) => el.tagName === 'BUTTON')!
      fireEvent.click(tocButton)

      expect(introEl.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      })
    })
  })

  describe('indentation', () => {
    it('applies level-based padding classes', () => {
      const { container } = render(<TableOfContents items={sampleItems} />)
      const listItems = container.querySelectorAll('li')

      // h1 → pl-0, h2 → pl-0, h3 → pl-4, h2 → pl-0, h4 → pl-8
      expect(listItems[0].className).toContain('pl-0')
      expect(listItems[1].className).toContain('pl-0')
      expect(listItems[2].className).toContain('pl-4')
      expect(listItems[3].className).toContain('pl-0')
      expect(listItems[4].className).toContain('pl-8')
    })
  })

  describe('variants', () => {
    it('applies sidebar sticky styles', () => {
      render(
        <TableOfContents items={sampleItems} variant="sidebar" />,
      )
      const nav = screen.getByTestId('table-of-contents')
      expect(nav.className).toContain('sticky')
      expect(nav.className).toContain('top-4')
    })

    it('does not apply sticky styles for inline variant', () => {
      render(
        <TableOfContents items={sampleItems} variant="inline" />,
      )
      const nav = screen.getByTestId('table-of-contents')
      expect(nav.className).not.toContain('sticky')
    })

    it('defaults to inline variant', () => {
      render(<TableOfContents items={sampleItems} />)
      const nav = screen.getByTestId('table-of-contents')
      expect(nav.className).not.toContain('sticky')
    })
  })

  describe('className', () => {
    it('applies custom className', () => {
      render(
        <TableOfContents items={sampleItems} className="my-custom-class" />,
      )
      const nav = screen.getByTestId('table-of-contents')
      expect(nav.className).toContain('my-custom-class')
    })
  })
})
