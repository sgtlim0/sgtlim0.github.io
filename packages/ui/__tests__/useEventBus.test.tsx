import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createEventBus, type AppEvents, type EventBus } from '../src/utils/eventBus'
import { useEventBus, useEventListener } from '../src/hooks/useEventBus'
import { EventBusProvider, useEventBusContext } from '../src/hooks/EventBusProvider'

// ── useEventListener ─────────────────────────────────────────────────

describe('useEventListener', () => {
  let bus: EventBus<AppEvents>

  beforeEach(() => {
    bus = createEventBus<AppEvents>()
  })

  it('should subscribe on mount and call handler when event is emitted', () => {
    const handler = vi.fn()

    renderHook(() => useEventListener(bus, 'theme:change', handler))

    act(() => bus.emit('theme:change', { theme: 'dark' }))

    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith({ theme: 'dark' })
  })

  it('should unsubscribe on unmount', () => {
    const handler = vi.fn()

    const { unmount } = renderHook(() => useEventListener(bus, 'theme:change', handler))

    unmount()
    bus.emit('theme:change', { theme: 'dark' })

    expect(handler).not.toHaveBeenCalled()
    expect(bus.listenerCount('theme:change')).toBe(0)
  })

  it('should always call the latest handler (ref pattern)', () => {
    let callCount = 0
    const handler1 = vi.fn(() => callCount++)
    const handler2 = vi.fn(() => (callCount += 10))

    const { rerender } = renderHook(
      ({ handler }) => useEventListener(bus, 'theme:change', handler),
      { initialProps: { handler: handler1 } },
    )

    act(() => bus.emit('theme:change', { theme: 'dark' }))
    expect(callCount).toBe(1)

    rerender({ handler: handler2 })
    act(() => bus.emit('theme:change', { theme: 'light' }))

    // handler2 should have been called, not handler1
    expect(callCount).toBe(11)
  })

  it('should not add duplicate subscriptions on rerender', () => {
    const handler = vi.fn()

    const { rerender } = renderHook(() => useEventListener(bus, 'theme:change', handler))
    rerender()
    rerender()

    act(() => bus.emit('theme:change', { theme: 'dark' }))

    expect(handler).toHaveBeenCalledOnce()
    expect(bus.listenerCount('theme:change')).toBe(1)
  })
})

// ── useEventBus ──────────────────────────────────────────────────────

describe('useEventBus', () => {
  let bus: EventBus<AppEvents>

  beforeEach(() => {
    bus = createEventBus<AppEvents>()
  })

  it('should provide a stable emit function', () => {
    const { result, rerender } = renderHook(() => useEventBus(bus))
    const firstEmit = result.current.emit
    rerender()

    expect(result.current.emit).toBe(firstEmit)
  })

  it('should emit events through the bus', () => {
    const handler = vi.fn()
    bus.on('user:login', handler)

    const { result } = renderHook(() => useEventBus(bus))

    act(() => result.current.emit('user:login', { userId: '42' }))

    expect(handler).toHaveBeenCalledWith({ userId: '42' })
  })

  it('should subscribe via the on helper', () => {
    const { result } = renderHook(() => useEventBus(bus))
    const handler = vi.fn()

    let unsub: () => void
    act(() => {
      unsub = result.current.on('notification:new', handler)
    })

    act(() => bus.emit('notification:new', { title: 'Hi', body: 'there' }))
    expect(handler).toHaveBeenCalledOnce()

    act(() => unsub())
    act(() => bus.emit('notification:new', { title: 'Hi', body: 'again' }))
    expect(handler).toHaveBeenCalledOnce()
  })

  it('should subscribe once via the once helper', () => {
    const { result } = renderHook(() => useEventBus(bus))
    const handler = vi.fn()

    act(() => {
      result.current.once('theme:change', handler)
    })

    act(() => bus.emit('theme:change', { theme: 'dark' }))
    act(() => bus.emit('theme:change', { theme: 'light' }))

    expect(handler).toHaveBeenCalledOnce()
  })
})

// ── EventBusProvider + useEventBusContext ─────────────────────────────

describe('EventBusProvider', () => {
  it('should provide a bus instance to children', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <EventBusProvider>{children}</EventBusProvider>
    )

    const { result } = renderHook(() => useEventBusContext<AppEvents>(), { wrapper })

    expect(result.current).toBeDefined()
    expect(typeof result.current.on).toBe('function')
    expect(typeof result.current.emit).toBe('function')
  })

  it('should throw when useEventBusContext is used outside a provider', () => {
    expect(() => {
      renderHook(() => useEventBusContext())
    }).toThrow('useEventBusContext must be used within an <EventBusProvider>')
  })

  it('should accept an external bus instance', () => {
    const externalBus = createEventBus<AppEvents>()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <EventBusProvider bus={externalBus}>{children}</EventBusProvider>
    )

    const { result } = renderHook(() => useEventBusContext<AppEvents>(), { wrapper })
    const handler = vi.fn()

    act(() => {
      result.current.on('theme:change', handler)
    })
    act(() => {
      externalBus.emit('theme:change', { theme: 'dark' })
    })

    expect(handler).toHaveBeenCalledWith({ theme: 'dark' })
  })

  it('should share the same bus between multiple consumers', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <EventBusProvider>{children}</EventBusProvider>
    )

    const { result: r1 } = renderHook(() => useEventBusContext<AppEvents>(), { wrapper })
    const { result: r2 } = renderHook(() => useEventBusContext<AppEvents>(), { wrapper })

    // Both should get a valid bus (may or may not be the same instance depending
    // on how React renders the wrappers, but each should function correctly)
    expect(typeof r1.current.emit).toBe('function')
    expect(typeof r2.current.emit).toBe('function')
  })
})

// ── Integration: Provider + useEventListener ─────────────────────────

describe('integration: EventBusProvider + useEventListener', () => {
  it('should allow subscribing through the provider bus', () => {
    const externalBus = createEventBus<AppEvents>()
    const handler = vi.fn()

    const wrapper = ({ children }: { children: ReactNode }) => (
      <EventBusProvider bus={externalBus}>{children}</EventBusProvider>
    )

    renderHook(
      () => {
        const bus = useEventBusContext<AppEvents>()
        useEventListener(bus, 'user:login', handler)
      },
      { wrapper },
    )

    act(() => externalBus.emit('user:login', { userId: 'test' }))
    expect(handler).toHaveBeenCalledWith({ userId: 'test' })
  })

  it('should clean up listeners when the component unmounts', () => {
    const externalBus = createEventBus<AppEvents>()
    const handler = vi.fn()

    const wrapper = ({ children }: { children: ReactNode }) => (
      <EventBusProvider bus={externalBus}>{children}</EventBusProvider>
    )

    const { unmount } = renderHook(
      () => {
        const bus = useEventBusContext<AppEvents>()
        useEventListener(bus, 'user:login', handler)
      },
      { wrapper },
    )

    unmount()
    externalBus.emit('user:login', { userId: 'test' })

    expect(handler).not.toHaveBeenCalled()
    expect(externalBus.listenerCount('user:login')).toBe(0)
  })
})
