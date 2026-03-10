import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, render, screen, fireEvent } from '@testing-library/react'
import { useNotificationCenter } from '../src/hooks/useNotificationCenter'
import type { Notification } from '../src/hooks/useNotificationCenter'
import AppNotificationCenter from '../src/AppNotificationCenter'
import React from 'react'

/* ------------------------------------------------------------------ */
/*  localStorage mock                                                 */
/* ------------------------------------------------------------------ */

let storageMap: Record<string, string> = {}

const mockLocalStorage = {
  getItem: vi.fn((key: string) => storageMap[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storageMap[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete storageMap[key]
  }),
  clear: vi.fn(() => {
    storageMap = {}
  }),
  get length() {
    return Object.keys(storageMap).length
  },
  key: vi.fn((i: number) => Object.keys(storageMap)[i] ?? null),
}

beforeEach(() => {
  storageMap = {}
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
    configurable: true,
  })
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

/* ------------------------------------------------------------------ */
/*  useNotificationCenter hook tests                                  */
/* ------------------------------------------------------------------ */

describe('useNotificationCenter', () => {
  it('starts with empty notifications', () => {
    const { result } = renderHook(() => useNotificationCenter())
    expect(result.current.notifications).toEqual([])
    expect(result.current.unreadCount).toBe(0)
  })

  it('adds a notification and returns its id', () => {
    const { result } = renderHook(() => useNotificationCenter())

    let id: string = ''
    act(() => {
      id = result.current.add({ title: 'Test', type: 'info' })
    })

    expect(id).toMatch(/^notif-/)
    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.notifications[0].title).toBe('Test')
    expect(result.current.notifications[0].type).toBe('info')
    expect(result.current.notifications[0].read).toBe(false)
    expect(result.current.unreadCount).toBe(1)
  })

  it('adds multiple notifications in newest-first order', () => {
    const { result } = renderHook(() => useNotificationCenter())

    act(() => {
      result.current.add({ title: 'First', type: 'info' })
    })
    act(() => {
      result.current.add({ title: 'Second', type: 'success' })
    })

    expect(result.current.notifications).toHaveLength(2)
    expect(result.current.notifications[0].title).toBe('Second')
    expect(result.current.notifications[1].title).toBe('First')
  })

  it('preserves optional fields (body, actionUrl, source)', () => {
    const { result } = renderHook(() => useNotificationCenter())

    act(() => {
      result.current.add({
        title: 'Full',
        type: 'warning',
        body: 'Some body',
        actionUrl: '/test',
        source: 'admin',
      })
    })

    const n = result.current.notifications[0]
    expect(n.body).toBe('Some body')
    expect(n.actionUrl).toBe('/test')
    expect(n.source).toBe('admin')
  })

  it('marks a single notification as read', () => {
    const { result } = renderHook(() => useNotificationCenter())

    let id: string = ''
    act(() => {
      id = result.current.add({ title: 'A', type: 'info' })
      result.current.add({ title: 'B', type: 'info' })
    })

    expect(result.current.unreadCount).toBe(2)

    act(() => {
      result.current.markAsRead(id)
    })

    expect(result.current.unreadCount).toBe(1)
    expect(result.current.notifications.find((n) => n.id === id)?.read).toBe(true)
  })

  it('markAsRead is idempotent', () => {
    const { result } = renderHook(() => useNotificationCenter())

    let id: string = ''
    act(() => {
      id = result.current.add({ title: 'A', type: 'info' })
    })

    act(() => {
      result.current.markAsRead(id)
    })
    act(() => {
      result.current.markAsRead(id)
    })

    expect(result.current.unreadCount).toBe(0)
    expect(result.current.notifications[0].read).toBe(true)
  })

  it('marks all notifications as read', () => {
    const { result } = renderHook(() => useNotificationCenter())

    act(() => {
      result.current.add({ title: 'A', type: 'info' })
      result.current.add({ title: 'B', type: 'warning' })
      result.current.add({ title: 'C', type: 'error' })
    })

    expect(result.current.unreadCount).toBe(3)

    act(() => {
      result.current.markAllAsRead()
    })

    expect(result.current.unreadCount).toBe(0)
    expect(result.current.notifications.every((n) => n.read)).toBe(true)
  })

  it('removes a notification by id', () => {
    const { result } = renderHook(() => useNotificationCenter())

    let id: string = ''
    act(() => {
      id = result.current.add({ title: 'Delete me', type: 'error' })
      result.current.add({ title: 'Keep me', type: 'info' })
    })

    expect(result.current.notifications).toHaveLength(2)

    act(() => {
      result.current.remove(id)
    })

    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.notifications[0].title).toBe('Keep me')
  })

  it('clears all notifications', () => {
    const { result } = renderHook(() => useNotificationCenter())

    act(() => {
      result.current.add({ title: 'A', type: 'info' })
      result.current.add({ title: 'B', type: 'info' })
    })

    act(() => {
      result.current.clearAll()
    })

    expect(result.current.notifications).toEqual([])
    expect(result.current.unreadCount).toBe(0)
  })

  it('enforces maxNotifications limit', () => {
    const { result } = renderHook(() =>
      useNotificationCenter({ maxNotifications: 3 }),
    )

    act(() => {
      result.current.add({ title: 'N1', type: 'info' })
    })
    act(() => {
      result.current.add({ title: 'N2', type: 'info' })
    })
    act(() => {
      result.current.add({ title: 'N3', type: 'info' })
    })
    act(() => {
      result.current.add({ title: 'N4', type: 'info' })
    })

    expect(result.current.notifications).toHaveLength(3)
    // Newest should be first, oldest (N1) should be trimmed
    expect(result.current.notifications[0].title).toBe('N4')
    expect(result.current.notifications[2].title).toBe('N2')
  })

  it('persists to localStorage on change', () => {
    const key = 'test-persist'
    const { result } = renderHook(() =>
      useNotificationCenter({ persistKey: key }),
    )

    act(() => {
      result.current.add({ title: 'Persisted', type: 'success' })
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      key,
      expect.stringContaining('Persisted'),
    )
  })

  it('loads persisted notifications on mount', () => {
    const key = 'test-load'
    const stored: Notification[] = [
      {
        id: 'prev-1',
        title: 'Old notification',
        type: 'info',
        timestamp: Date.now() - 60000,
        read: false,
      },
    ]
    storageMap[key] = JSON.stringify(stored)

    const { result } = renderHook(() =>
      useNotificationCenter({ persistKey: key }),
    )

    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.notifications[0].title).toBe('Old notification')
    expect(result.current.unreadCount).toBe(1)
  })

  it('handles corrupted localStorage gracefully', () => {
    const key = 'test-corrupt'
    storageMap[key] = 'not-json'

    const { result } = renderHook(() =>
      useNotificationCenter({ persistKey: key }),
    )

    expect(result.current.notifications).toEqual([])
  })

  it('handles non-array localStorage value gracefully', () => {
    const key = 'test-non-array'
    storageMap[key] = JSON.stringify({ not: 'an array' })

    const { result } = renderHook(() =>
      useNotificationCenter({ persistKey: key }),
    )

    expect(result.current.notifications).toEqual([])
  })

  it('uses default persistKey when none specified', () => {
    const { result } = renderHook(() => useNotificationCenter())

    act(() => {
      result.current.add({ title: 'Default key', type: 'info' })
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'hchat-notifications',
      expect.any(String),
    )
  })

  it('assigns a timestamp to each notification', () => {
    const before = Date.now()
    const { result } = renderHook(() => useNotificationCenter())

    act(() => {
      result.current.add({ title: 'Timed', type: 'info' })
    })

    const after = Date.now()
    const ts = result.current.notifications[0].timestamp
    expect(ts).toBeGreaterThanOrEqual(before)
    expect(ts).toBeLessThanOrEqual(after)
  })
})

/* ------------------------------------------------------------------ */
/*  AppNotificationCenter component tests                             */
/* ------------------------------------------------------------------ */

describe('AppNotificationCenter', () => {
  it('renders bell button', () => {
    render(<AppNotificationCenter />)
    const btn = screen.getByRole('button', { name: /알림/i })
    expect(btn).toBeDefined()
  })

  it('does not show dropdown initially', () => {
    render(<AppNotificationCenter />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens dropdown on bell click', () => {
    render(<AppNotificationCenter />)
    fireEvent.click(screen.getByRole('button', { name: /알림/i }))
    expect(screen.getByRole('dialog')).toBeDefined()
  })

  it('closes dropdown on second bell click', () => {
    render(<AppNotificationCenter />)
    const btn = screen.getByRole('button', { name: /알림/i })
    fireEvent.click(btn)
    expect(screen.getByRole('dialog')).toBeDefined()
    fireEvent.click(btn)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('shows empty state when no notifications', () => {
    render(<AppNotificationCenter />)
    fireEvent.click(screen.getByRole('button', { name: /알림/i }))
    expect(screen.getByText('알림이 없습니다')).toBeDefined()
  })

  it('closes dropdown on Escape key', () => {
    render(<AppNotificationCenter />)
    fireEvent.click(screen.getByRole('button', { name: /알림/i }))
    expect(screen.getByRole('dialog')).toBeDefined()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('closes dropdown on outside click', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <AppNotificationCenter />
      </div>,
    )
    fireEvent.click(screen.getByRole('button', { name: /알림/i }))
    expect(screen.getByRole('dialog')).toBeDefined()

    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('has correct aria attributes on region', () => {
    render(<AppNotificationCenter />)
    const region = screen.getByRole('region', { name: '알림 센터' })
    expect(region).toBeDefined()
  })

  it('bell has aria-expanded attribute', () => {
    render(<AppNotificationCenter />)
    const btn = screen.getByRole('button', { name: /알림/i })
    expect(btn.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(btn)
    expect(btn.getAttribute('aria-expanded')).toBe('true')
  })

  it('accepts className prop', () => {
    const { container } = render(<AppNotificationCenter className="custom-class" />)
    const region = container.querySelector('.custom-class')
    expect(region).toBeDefined()
    expect(region).not.toBeNull()
  })
})
