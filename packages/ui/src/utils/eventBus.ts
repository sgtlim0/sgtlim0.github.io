/**
 * Type-safe Event Bus (Pub/Sub)
 *
 * Provides a strongly-typed publish/subscribe messaging system.
 * Every event name is mapped to a specific payload type at compile time,
 * preventing incorrect usage.
 *
 * @example
 * ```ts
 * interface MyEvents {
 *   'user:login': { userId: string }
 *   'user:logout': void
 * }
 *
 * const bus = createEventBus<MyEvents>()
 * const unsub = bus.on('user:login', (data) => console.log(data.userId))
 * bus.emit('user:login', { userId: '123' })
 * unsub() // cleanup
 * ```
 */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type EventMap = {}

type Handler<T> = (data: T) => void

export interface EventBus<T extends EventMap> {
  /** Subscribe to an event. Returns an unsubscribe function. */
  on: <K extends keyof T>(event: K, handler: Handler<T[K]>) => () => void
  /** Unsubscribe a specific handler from an event. */
  off: <K extends keyof T>(event: K, handler: Handler<T[K]>) => void
  /** Emit an event with its associated payload. */
  emit: <K extends keyof T>(event: K, data: T[K]) => void
  /** Subscribe to an event for a single emission only. Returns an unsubscribe function. */
  once: <K extends keyof T>(event: K, handler: Handler<T[K]>) => () => void
  /** Clear all handlers for a specific event, or all handlers if no event is given. */
  clear: (event?: keyof T) => void
  /** Return the number of active listeners for a given event. */
  listenerCount: (event: keyof T) => number
}

/**
 * Create a new type-safe event bus instance.
 *
 * The bus is SSR-safe (no DOM/window dependency) and does not retain
 * references to handlers after they are removed.
 */
export function createEventBus<T extends EventMap>(): EventBus<T> {
  const listeners = new Map<keyof T, Set<Handler<unknown>>>()

  function getSet<K extends keyof T>(event: K): Set<Handler<unknown>> {
    let set = listeners.get(event)
    if (!set) {
      set = new Set()
      listeners.set(event, set)
    }
    return set
  }

  function on<K extends keyof T>(event: K, handler: Handler<T[K]>): () => void {
    const set = getSet(event)
    set.add(handler as Handler<unknown>)
    return () => off(event, handler)
  }

  function off<K extends keyof T>(event: K, handler: Handler<T[K]>): void {
    const set = listeners.get(event)
    if (set) {
      set.delete(handler as Handler<unknown>)
      if (set.size === 0) {
        listeners.delete(event)
      }
    }
  }

  function emit<K extends keyof T>(event: K, data: T[K]): void {
    const set = listeners.get(event)
    if (!set) return
    // Iterate over a snapshot to allow handlers to unsubscribe during emit
    const snapshot = Array.from(set)
    for (const handler of snapshot) {
      try {
        handler(data)
      } catch (error) {
        console.error(`[EventBus] Error in handler for "${String(event)}":`, error)
      }
    }
  }

  function once<K extends keyof T>(event: K, handler: Handler<T[K]>): () => void {
    const wrapper: Handler<T[K]> = (data) => {
      off(event, wrapper)
      handler(data)
    }
    return on(event, wrapper)
  }

  function clear(event?: keyof T): void {
    if (event !== undefined) {
      listeners.delete(event)
    } else {
      listeners.clear()
    }
  }

  function listenerCount(event: keyof T): number {
    return listeners.get(event)?.size ?? 0
  }

  return { on, off, emit, once, clear, listenerCount }
}

/**
 * Default application-wide event types.
 *
 * Extend or replace this interface when creating a global bus.
 */
export interface AppEvents {
  'theme:change': { theme: 'light' | 'dark' }
  'notification:new': { title: string; body: string }
  'user:login': { userId: string }
  'user:logout': void
  'error:global': { error: Error; context?: string }
}
