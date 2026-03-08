import { describe, it, expect } from 'vitest'
import { render, screen, within, act } from '@testing-library/react'
import React from 'react'
import Breadcrumb, { BreadcrumbProvider, useBreadcrumbContext } from '../src/Breadcrumb'
import type { BreadcrumbItem } from '../src/Breadcrumb'
import { useBreadcrumb } from '../src/hooks/useBreadcrumb'
import { renderHook } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Breadcrumb Component Tests
// ---------------------------------------------------------------------------

describe('Breadcrumb', () => {
  const defaultItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'Users' },
  ]

  describe('rendering', () => {
    it('renders all breadcrumb items', () => {
      render(<Breadcrumb items={defaultItems} />)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
    })

    it('renders nothing when items array is empty', () => {
      const { container } = render(<Breadcrumb items={[]} />)
      expect(container.querySelector('nav')).toBeNull()
    })

    it('renders single item without separator', () => {
      render(<Breadcrumb items={[{ label: 'Home' }]} />)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.queryByText('/')).toBeNull()
    })

    it('renders icons when provided', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Home', href: '/', icon: <span data-testid="home-icon">H</span> },
        { label: 'Page' },
      ]
      render(<Breadcrumb items={items} />)
      expect(screen.getByTestId('home-icon')).toBeInTheDocument()
    })
  })

  describe('separators', () => {
    const twoItems: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Page' },
    ]

    it('uses default "/" separator', () => {
      render(<Breadcrumb items={twoItems} />)
      const nav = screen.getByRole('navigation')
      const separators = within(nav).getAllByText('/')
      expect(separators.length).toBe(1)
    })

    it('uses custom ">" separator', () => {
      render(<Breadcrumb items={twoItems} separator=">" />)
      const nav = screen.getByRole('navigation')
      const separators = within(nav).getAllByText('>')
      expect(separators.length).toBe(1)
    })

    it('uses custom arrow separator', () => {
      render(<Breadcrumb items={twoItems} separator="->" />)
      const nav = screen.getByRole('navigation')
      const separators = within(nav).getAllByText('->')
      expect(separators.length).toBe(1)
    })

    it('hides separators from assistive technology', () => {
      render(<Breadcrumb items={twoItems} />)
      const nav = screen.getByRole('navigation')
      const separators = within(nav).getAllByText('/')
      separators.forEach((sep) => {
        expect(sep).toHaveAttribute('aria-hidden', 'true')
      })
    })

    it('renders multiple separators for multiple items', () => {
      render(<Breadcrumb items={defaultItems} />)
      const nav = screen.getByRole('navigation')
      // 2 between main items + 1 in the mobile ellipsis
      const separators = within(nav).getAllByText('/')
      expect(separators.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('links', () => {
    it('renders links for non-last items with href', () => {
      render(<Breadcrumb items={defaultItems} />)
      const homeLink = screen.getByRole('link', { name: 'Home' })
      expect(homeLink).toHaveAttribute('href', '/')
      const adminLink = screen.getByRole('link', { name: 'Admin' })
      expect(adminLink).toHaveAttribute('href', '/admin')
    })

    it('does not render last item as a link', () => {
      render(<Breadcrumb items={defaultItems} />)
      const usersText = screen.getByText('Users')
      expect(usersText.tagName).not.toBe('A')
    })

    it('renders non-link items without href as span', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Category' },
        { label: 'Subcategory' },
        { label: 'Current' },
      ]
      render(<Breadcrumb items={items} />)
      const category = screen.getByText('Category')
      expect(category.tagName).toBe('SPAN')
    })
  })

  describe('accessibility', () => {
    it('renders nav with aria-label="breadcrumb"', () => {
      render(<Breadcrumb items={defaultItems} />)
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveAttribute('aria-label', 'breadcrumb')
    })

    it('wraps items in an ordered list', () => {
      render(<Breadcrumb items={defaultItems} />)
      const nav = screen.getByRole('navigation')
      const list = nav.querySelector('ol')
      expect(list).toBeInTheDocument()
    })

    it('renders each item in a list item', () => {
      const twoItems: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Page' },
      ]
      render(<Breadcrumb items={twoItems} />)
      const nav = screen.getByRole('navigation')
      const listItems = nav.querySelectorAll('ol > li')
      expect(listItems.length).toBe(2)
    })

    it('marks the last item with aria-current="page"', () => {
      render(<Breadcrumb items={defaultItems} />)
      const current = screen.getByText('Users')
      expect(current).toHaveAttribute('aria-current', 'page')
    })

    it('does not mark non-last items with aria-current', () => {
      render(<Breadcrumb items={defaultItems} />)
      const homeLink = screen.getByRole('link', { name: 'Home' })
      expect(homeLink).not.toHaveAttribute('aria-current')
    })
  })

  describe('className prop', () => {
    it('applies custom className', () => {
      render(<Breadcrumb items={defaultItems} className="my-custom-class" />)
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('my-custom-class')
    })

    it('includes default text-sm class', () => {
      render(<Breadcrumb items={defaultItems} />)
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('text-sm')
    })
  })

  describe('JSON-LD', () => {
    it('does not render JSON-LD by default', () => {
      const { container } = render(<Breadcrumb items={defaultItems} />)
      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeNull()
    })

    it('renders JSON-LD when jsonLd prop is true', () => {
      const { container } = render(<Breadcrumb items={defaultItems} jsonLd />)
      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeInTheDocument()

      const data = JSON.parse(script!.textContent!)
      expect(data['@context']).toBe('https://schema.org')
      expect(data['@type']).toBe('BreadcrumbList')
      expect(data.itemListElement).toHaveLength(3)
      expect(data.itemListElement[0].position).toBe(1)
      expect(data.itemListElement[0].name).toBe('Home')
      expect(data.itemListElement[0].item).toBe('/')
      expect(data.itemListElement[2].name).toBe('Users')
      expect(data.itemListElement[2].item).toBeUndefined()
    })
  })
})

// ---------------------------------------------------------------------------
// useBreadcrumb Hook Tests
// ---------------------------------------------------------------------------

describe('useBreadcrumb', () => {
  it('generates breadcrumbs from pathname', () => {
    const { result } = renderHook(() => useBreadcrumb('/admin/users'))
    expect(result.current.items).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Admin', href: '/admin' },
      { label: 'Users' },
    ])
  })

  it('returns only home for root path', () => {
    const { result } = renderHook(() => useBreadcrumb('/'))
    expect(result.current.items).toEqual([{ label: 'Home' }])
  })

  it('handles trailing slashes', () => {
    const { result } = renderHook(() => useBreadcrumb('/admin/'))
    expect(result.current.items).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Admin' },
    ])
  })

  it('converts kebab-case to Title Case', () => {
    const { result } = renderHook(() => useBreadcrumb('/user-management'))
    expect(result.current.items[1].label).toBe('User Management')
  })

  it('converts snake_case to Title Case', () => {
    const { result } = renderHook(() => useBreadcrumb('/audit_logs'))
    expect(result.current.items[1].label).toBe('Audit Logs')
  })

  it('uses custom labelMap with full path', () => {
    const { result } = renderHook(() =>
      useBreadcrumb('/admin/roi', {
        labelMap: { '/admin': 'Admin Panel', '/admin/roi': 'ROI Dashboard' },
      }),
    )
    expect(result.current.items).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Admin Panel', href: '/admin' },
      { label: 'ROI Dashboard' },
    ])
  })

  it('uses custom labelMap with segment name', () => {
    const { result } = renderHook(() =>
      useBreadcrumb('/admin/settings', {
        labelMap: { settings: 'Preferences' },
      }),
    )
    expect(result.current.items[2].label).toBe('Preferences')
  })

  it('excludes home when includeHome is false', () => {
    const { result } = renderHook(() =>
      useBreadcrumb('/admin/users', { includeHome: false }),
    )
    expect(result.current.items).toEqual([
      { label: 'Admin', href: '/admin' },
      { label: 'Users' },
    ])
  })

  it('customizes home label and href', () => {
    const { result } = renderHook(() =>
      useBreadcrumb('/docs', { homeLabel: 'Dashboard', homeHref: '/dashboard' }),
    )
    expect(result.current.items[0]).toEqual({ label: 'Dashboard', href: '/dashboard' })
  })

  it('returns empty array for root path when home excluded', () => {
    const { result } = renderHook(() =>
      useBreadcrumb('/', { includeHome: false }),
    )
    expect(result.current.items).toEqual([])
  })

  it('handles deeply nested paths', () => {
    const { result } = renderHook(() => useBreadcrumb('/admin/roi/overview'))
    expect(result.current.items).toHaveLength(4)
    expect(result.current.items[3]).toEqual({ label: 'Overview' })
    expect(result.current.items[2]).toEqual({ label: 'Roi', href: '/admin/roi' })
  })

  it('returns different items when pathname changes', () => {
    const { result, rerender } = renderHook(
      ({ path }) => useBreadcrumb(path),
      { initialProps: { path: '/admin' } },
    )
    expect(result.current.items).toHaveLength(2)
    rerender({ path: '/admin/users' })
    expect(result.current.items).toHaveLength(3)
  })
})

// ---------------------------------------------------------------------------
// BreadcrumbProvider Tests
// ---------------------------------------------------------------------------

describe('BreadcrumbProvider', () => {
  function TestConsumer() {
    const { items, setItems } = useBreadcrumbContext()
    return (
      <div>
        <span data-testid="count">{items.length}</span>
        <button onClick={() => setItems([{ label: 'Home' }, { label: 'Test' }])}>
          Set
        </button>
      </div>
    )
  }

  it('provides default empty items', () => {
    render(
      <BreadcrumbProvider>
        <TestConsumer />
      </BreadcrumbProvider>,
    )
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('allows setting items via context', () => {
    render(
      <BreadcrumbProvider>
        <TestConsumer />
      </BreadcrumbProvider>,
    )
    const button = screen.getByText('Set')
    act(() => {
      button.click()
    })
    expect(screen.getByTestId('count').textContent).toBe('2')
  })

  it('throws when used outside provider', () => {
    // Suppress React error boundary console noise
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow(
      'useBreadcrumbContext must be used within a BreadcrumbProvider',
    )
    spy.mockRestore()
  })
})
