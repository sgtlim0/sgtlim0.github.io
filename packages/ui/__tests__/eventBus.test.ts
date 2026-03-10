import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createEventBus, type AppEvents, type EventBus } from '../src/utils/eventBus'

describe('createEventBus', () => {
  let bus: EventBus<AppEvents>

  beforeEach(() => {
    bus = createEventBus<AppEvents>()
  })

  // ── on / emit ──────────────────────────────────────────────────────

  describe('on / emit', () => {
    it('should call the handler when the matching event is emitted', () => {
      const handler = vi.fn()
      bus.on('theme:change', handler)
      bus.emit('theme:change', { theme: 'dark' })

      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith({ theme: 'dark' })
    })

    it('should support multiple handlers for the same event', () => {
      const h1 = vi.fn()
      const h2 = vi.fn()
      bus.on('theme:change', h1)
      bus.on('theme:change', h2)
      bus.emit('theme:change', { theme: 'light' })

      expect(h1).toHaveBeenCalledOnce()
      expect(h2).toHaveBeenCalledOnce()
    })

    it('should not call handlers for different events', () => {
      const handler = vi.fn()
      bus.on('user:login', handler)
      bus.emit('theme:change', { theme: 'dark' })

      expect(handler).not.toHaveBeenCalled()
    })

    it('should pass the correct payload to the handler', () => {
      const handler = vi.fn()
      bus.on('notification:new', handler)
      bus.emit('notification:new', { title: 'Hello', body: 'World' })

      expect(handler).toHaveBeenCalledWith({ title: 'Hello', body: 'World' })
    })

    it('should not throw when emitting an event with no listeners', () => {
      expect(() => bus.emit('theme:change', { theme: 'dark' })).not.toThrow()
    })
  })

  // ── off ────────────────────────────────────────────────────────────

  describe('off', () => {
    it('should remove a specific handler', () => {
      const handler = vi.fn()
      bus.on('theme:change', handler)
      bus.off('theme:change', handler)
      bus.emit('theme:change', { theme: 'dark' })

      expect(handler).not.toHaveBeenCalled()
    })

    it('should not affect other handlers when removing one', () => {
      const h1 = vi.fn()
      const h2 = vi.fn()
      bus.on('theme:change', h1)
      bus.on('theme:change', h2)
      bus.off('theme:change', h1)
      bus.emit('theme:change', { theme: 'dark' })

      expect(h1).not.toHaveBeenCalled()
      expect(h2).toHaveBeenCalledOnce()
    })

    it('should not throw when removing a handler that was never added', () => {
      const handler = vi.fn()
      expect(() => bus.off('theme:change', handler)).not.toThrow()
    })

    it('should clean up the internal set when the last handler is removed', () => {
      const handler = vi.fn()
      bus.on('theme:change', handler)
      bus.off('theme:change', handler)

      expect(bus.listenerCount('theme:change')).toBe(0)
    })
  })

  // ── on() returns unsubscribe ───────────────────────────────────────

  describe('unsubscribe (return value of on)', () => {
    it('should unsubscribe the handler when the returned function is called', () => {
      const handler = vi.fn()
      const unsub = bus.on('theme:change', handler)
      unsub()
      bus.emit('theme:change', { theme: 'dark' })

      expect(handler).not.toHaveBeenCalled()
    })

    it('should be safe to call the unsubscribe function multiple times', () => {
      const handler = vi.fn()
      const unsub = bus.on('theme:change', handler)
      unsub()
      unsub()

      expect(bus.listenerCount('theme:change')).toBe(0)
    })
  })

  // ── once ───────────────────────────────────────────────────────────

  describe('once', () => {
    it('should call the handler only once', () => {
      const handler = vi.fn()
      bus.once('theme:change', handler)
      bus.emit('theme:change', { theme: 'dark' })
      bus.emit('theme:change', { theme: 'light' })

      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith({ theme: 'dark' })
    })

    it('should return an unsubscribe function that prevents the handler from firing', () => {
      const handler = vi.fn()
      const unsub = bus.once('theme:change', handler)
      unsub()
      bus.emit('theme:change', { theme: 'dark' })

      expect(handler).not.toHaveBeenCalled()
    })

    it('should remove itself from listener count after firing', () => {
      const handler = vi.fn()
      bus.once('theme:change', handler)

      expect(bus.listenerCount('theme:change')).toBe(1)
      bus.emit('theme:change', { theme: 'dark' })
      expect(bus.listenerCount('theme:change')).toBe(0)
    })
  })

  // ── clear ──────────────────────────────────────────────────────────

  describe('clear', () => {
    it('should remove all handlers for a specific event', () => {
      const h1 = vi.fn()
      const h2 = vi.fn()
      bus.on('theme:change', h1)
      bus.on('theme:change', h2)
      bus.clear('theme:change')
      bus.emit('theme:change', { theme: 'dark' })

      expect(h1).not.toHaveBeenCalled()
      expect(h2).not.toHaveBeenCalled()
      expect(bus.listenerCount('theme:change')).toBe(0)
    })

    it('should not affect handlers for other events', () => {
      const themeHandler = vi.fn()
      const loginHandler = vi.fn()
      bus.on('theme:change', themeHandler)
      bus.on('user:login', loginHandler)
      bus.clear('theme:change')

      bus.emit('user:login', { userId: '1' })
      expect(loginHandler).toHaveBeenCalledOnce()
    })

    it('should remove all handlers for all events when called without arguments', () => {
      const h1 = vi.fn()
      const h2 = vi.fn()
      bus.on('theme:change', h1)
      bus.on('user:login', h2)
      bus.clear()

      bus.emit('theme:change', { theme: 'dark' })
      bus.emit('user:login', { userId: '1' })

      expect(h1).not.toHaveBeenCalled()
      expect(h2).not.toHaveBeenCalled()
    })

    it('should not throw when clearing an event with no handlers', () => {
      expect(() => bus.clear('theme:change')).not.toThrow()
    })
  })

  // ── listenerCount ──────────────────────────────────────────────────

  describe('listenerCount', () => {
    it('should return 0 for events with no handlers', () => {
      expect(bus.listenerCount('theme:change')).toBe(0)
    })

    it('should return the correct count after adding handlers', () => {
      bus.on('theme:change', vi.fn())
      bus.on('theme:change', vi.fn())

      expect(bus.listenerCount('theme:change')).toBe(2)
    })

    it('should decrement after removing a handler', () => {
      const h = vi.fn()
      bus.on('theme:change', h)
      bus.on('theme:change', vi.fn())
      bus.off('theme:change', h)

      expect(bus.listenerCount('theme:change')).toBe(1)
    })
  })

  // ── error handling ─────────────────────────────────────────────────

  describe('error handling', () => {
    it('should catch errors in handlers and continue calling other handlers', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const badHandler = vi.fn(() => {
        throw new Error('boom')
      })
      const goodHandler = vi.fn()

      bus.on('theme:change', badHandler)
      bus.on('theme:change', goodHandler)
      bus.emit('theme:change', { theme: 'dark' })

      expect(badHandler).toHaveBeenCalledOnce()
      expect(goodHandler).toHaveBeenCalledOnce()
      expect(consoleSpy).toHaveBeenCalledOnce()
      expect(consoleSpy.mock.calls[0]?.[0]).toContain('[EventBus]')

      consoleSpy.mockRestore()
    })
  })

  // ── handler unsubscribing during emit ──────────────────────────────

  describe('handler unsubscribing during emit', () => {
    it('should safely handle a handler that unsubscribes itself during emit', () => {
      let unsub: () => void
      const selfRemovingHandler = vi.fn(() => unsub())
      const otherHandler = vi.fn()

      unsub = bus.on('theme:change', selfRemovingHandler)
      bus.on('theme:change', otherHandler)
      bus.emit('theme:change', { theme: 'dark' })

      expect(selfRemovingHandler).toHaveBeenCalledOnce()
      expect(otherHandler).toHaveBeenCalledOnce()
      expect(bus.listenerCount('theme:change')).toBe(1)
    })
  })

  // ── isolation ──────────────────────────────────────────────────────

  describe('isolation', () => {
    it('should create independent bus instances', () => {
      const bus2 = createEventBus<AppEvents>()
      const h1 = vi.fn()
      const h2 = vi.fn()

      bus.on('theme:change', h1)
      bus2.on('theme:change', h2)

      bus.emit('theme:change', { theme: 'dark' })

      expect(h1).toHaveBeenCalledOnce()
      expect(h2).not.toHaveBeenCalled()
    })
  })

  // ── type-safety (compile-time, runtime validation) ─────────────────

  describe('type safety', () => {
    it('should accept the correct payload shape for each event', () => {
      const handler = vi.fn()
      bus.on('user:login', handler)
      bus.emit('user:login', { userId: 'abc' })

      expect(handler).toHaveBeenCalledWith({ userId: 'abc' })
    })

    it('should handle void payload events', () => {
      const handler = vi.fn()
      bus.on('user:logout', handler)
      bus.emit('user:logout', undefined as unknown as void)

      expect(handler).toHaveBeenCalledOnce()
    })

    it('should handle error payload events', () => {
      const handler = vi.fn()
      bus.on('error:global', handler)
      const error = new Error('test')
      bus.emit('error:global', { error, context: 'unit-test' })

      expect(handler).toHaveBeenCalledWith({ error, context: 'unit-test' })
    })
  })
})

// ── Custom event map ─────────────────────────────────────────────────

describe('createEventBus with custom EventMap', () => {
  interface CustomEvents {
    'count:increment': { amount: number }
    'count:reset': void
  }

  it('should work with a custom event map', () => {
    const bus = createEventBus<CustomEvents>()
    const handler = vi.fn()

    bus.on('count:increment', handler)
    bus.emit('count:increment', { amount: 5 })

    expect(handler).toHaveBeenCalledWith({ amount: 5 })
  })
})
