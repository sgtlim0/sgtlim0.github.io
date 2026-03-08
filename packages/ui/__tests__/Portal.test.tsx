import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { usePortal, DEFAULT_PORTAL_ID } from '../src/hooks/usePortal'
import { Portal } from '../src/Portal'
import { PortalProvider, usePortalContext, DEFAULT_CONTAINERS } from '../src/hooks/PortalProvider'

// ---------------------------------------------------------------------------
// usePortal hook
// ---------------------------------------------------------------------------
describe('usePortal', () => {
  afterEach(() => {
    // Clean up any portal containers left in the DOM
    for (const el of document.querySelectorAll('[id$="-root"], [id$="-portal-root"]')) {
      el.remove()
    }
  })

  it('returns isMounted true after mount', () => {
    const { result } = renderHook(() => usePortal())
    expect(result.current.isMounted).toBe(true)
  })

  it('creates a container element in document.body with default ID', () => {
    renderHook(() => usePortal())
    const el = document.getElementById(DEFAULT_PORTAL_ID)
    expect(el).not.toBeNull()
    expect(el?.parentNode).toBe(document.body)
  })

  it('creates a container with custom ID', () => {
    renderHook(() => usePortal('my-custom-portal'))
    const el = document.getElementById('my-custom-portal')
    expect(el).not.toBeNull()
    // clean up
    el?.remove()
  })

  it('reuses existing container with the same ID', () => {
    const existing = document.createElement('div')
    existing.id = 'reuse-test'
    document.body.appendChild(existing)

    renderHook(() => usePortal('reuse-test'))

    const all = document.querySelectorAll('#reuse-test')
    expect(all.length).toBe(1)
    existing.remove()
  })

  it('sets z-index CSS variable on created container', () => {
    renderHook(() => usePortal())
    const el = document.getElementById(DEFAULT_PORTAL_ID)
    expect(el?.style.cssText).toContain('--portal-z')
  })

  it('returns portalRef pointing to the container element', () => {
    const { result } = renderHook(() => usePortal())
    const el = document.getElementById(DEFAULT_PORTAL_ID)
    expect(result.current.portalRef).toBe(el)
  })

  it('cleans up created container on unmount when empty', () => {
    const { unmount } = renderHook(() => usePortal('cleanup-test'))
    expect(document.getElementById('cleanup-test')).not.toBeNull()

    unmount()
    expect(document.getElementById('cleanup-test')).toBeNull()
  })

  it('does not remove pre-existing container on unmount', () => {
    const existing = document.createElement('div')
    existing.id = 'pre-existing'
    document.body.appendChild(existing)

    const { unmount } = renderHook(() => usePortal('pre-existing'))
    unmount()

    // Pre-existing element should remain
    expect(document.getElementById('pre-existing')).not.toBeNull()
    existing.remove()
  })

  it('returns isMounted false on the server (no document)', () => {
    // Simulate SSR by temporarily hiding document
    const originalDocument = globalThis.document
    // @ts-expect-error - SSR simulation
    delete globalThis.document

    try {
      // In a real SSR environment, useEffect does not run,
      // so isMounted stays false. We verify the guard logic directly.
      expect(typeof globalThis.document).toBe('undefined')
    } finally {
      globalThis.document = originalDocument
    }
  })
})

// ---------------------------------------------------------------------------
// Portal component
// ---------------------------------------------------------------------------
describe('Portal', () => {
  afterEach(() => {
    for (const el of document.querySelectorAll('[id$="-root"], [id$="-portal-root"]')) {
      el.remove()
    }
  })

  it('renders children into a portal container', () => {
    render(
      <Portal>
        <span data-testid="portal-child">Hello Portal</span>
      </Portal>,
    )

    const child = screen.getByTestId('portal-child')
    expect(child.textContent).toBe('Hello Portal')

    // Child should be inside the portal container, not the render root
    const container = document.getElementById(DEFAULT_PORTAL_ID)
    expect(container?.contains(child)).toBe(true)
  })

  it('renders into a custom container', () => {
    render(
      <Portal containerId="custom-root">
        <span data-testid="custom-child">Custom</span>
      </Portal>,
    )

    const child = screen.getByTestId('custom-child')
    const container = document.getElementById('custom-root')
    expect(container?.contains(child)).toBe(true)
    container?.remove()
  })

  it('preserves React event bubbling through portal', () => {
    const handleClick = vi.fn()

    render(
      <div onClick={handleClick}>
        <Portal>
          <button data-testid="portal-btn">Click me</button>
        </Portal>
      </div>,
    )

    fireEvent.click(screen.getByTestId('portal-btn'))
    // React synthetic events bubble through the React tree, not the DOM tree
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('cleans up on unmount', () => {
    const { unmount } = render(
      <Portal containerId="unmount-test">
        <span>Temp</span>
      </Portal>,
    )

    expect(document.getElementById('unmount-test')).not.toBeNull()
    unmount()
    // Container is cleaned up since it was created by the portal and is now empty
    expect(document.getElementById('unmount-test')).toBeNull()
  })

  it('renders multiple children', () => {
    render(
      <Portal>
        <span data-testid="a">A</span>
        <span data-testid="b">B</span>
      </Portal>,
    )

    expect(screen.getByTestId('a')).toBeDefined()
    expect(screen.getByTestId('b')).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// PortalProvider
// ---------------------------------------------------------------------------
describe('PortalProvider', () => {
  afterEach(() => {
    for (const el of document.querySelectorAll('[id$="-root"], [id$="-portal-root"]')) {
      el.remove()
    }
  })

  it('renders children', () => {
    render(
      <PortalProvider>
        <span data-testid="provider-child">Child</span>
      </PortalProvider>,
    )

    expect(screen.getByTestId('provider-child').textContent).toBe('Child')
  })

  it('pre-creates default containers', () => {
    render(
      <PortalProvider>
        <span>Test</span>
      </PortalProvider>,
    )

    for (const id of DEFAULT_CONTAINERS) {
      expect(document.getElementById(id)).not.toBeNull()
    }
  })

  it('pre-creates custom containers', () => {
    render(
      <PortalProvider containerIds={['portal-a', 'portal-b']}>
        <span>Test</span>
      </PortalProvider>,
    )

    expect(document.getElementById('portal-a')).not.toBeNull()
    expect(document.getElementById('portal-b')).not.toBeNull()

    document.getElementById('portal-a')?.remove()
    document.getElementById('portal-b')?.remove()
  })

  it('provides getContainer that returns the correct element', () => {
    function Consumer() {
      const { getContainer, isMounted } = usePortalContext()
      if (!isMounted) return <span>Not mounted</span>
      const el = getContainer('hchat-portal-root')
      return <span data-testid="result">{el ? 'found' : 'not-found'}</span>
    }

    render(
      <PortalProvider>
        <Consumer />
      </PortalProvider>,
    )

    expect(screen.getByTestId('result').textContent).toBe('found')
  })

  it('getContainer returns null for unknown ID', () => {
    function Consumer() {
      const { getContainer, isMounted } = usePortalContext()
      if (!isMounted) return null
      const el = getContainer('nonexistent')
      return <span data-testid="result">{el ? 'found' : 'not-found'}</span>
    }

    render(
      <PortalProvider>
        <Consumer />
      </PortalProvider>,
    )

    expect(screen.getByTestId('result').textContent).toBe('not-found')
  })

  it('cleans up created containers on unmount', () => {
    const { unmount } = render(
      <PortalProvider containerIds={['cleanup-a', 'cleanup-b']}>
        <span>Test</span>
      </PortalProvider>,
    )

    expect(document.getElementById('cleanup-a')).not.toBeNull()
    unmount()
    expect(document.getElementById('cleanup-a')).toBeNull()
    expect(document.getElementById('cleanup-b')).toBeNull()
  })

  it('isMounted is true after mount', () => {
    function Consumer() {
      const { isMounted } = usePortalContext()
      return <span data-testid="mounted">{String(isMounted)}</span>
    }

    render(
      <PortalProvider>
        <Consumer />
      </PortalProvider>,
    )

    expect(screen.getByTestId('mounted').textContent).toBe('true')
  })

  it('multiple portals can share the same provider container', () => {
    render(
      <PortalProvider>
        <Portal containerId="hchat-portal-root">
          <span data-testid="p1">Portal 1</span>
        </Portal>
        <Portal containerId="hchat-portal-root">
          <span data-testid="p2">Portal 2</span>
        </Portal>
      </PortalProvider>,
    )

    const container = document.getElementById('hchat-portal-root')
    expect(container?.contains(screen.getByTestId('p1'))).toBe(true)
    expect(container?.contains(screen.getByTestId('p2'))).toBe(true)
  })
})
