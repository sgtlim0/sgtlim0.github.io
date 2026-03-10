'use client'

import { useEffect, useCallback, useRef } from 'react'
import { type EventBus } from '../utils/eventBus'

type Handler<T> = (data: T) => void
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type EventMap = {}

/**
 * React hook that subscribes to an event bus event and automatically
 * cleans up on unmount.
 *
 * The handler reference is always kept up-to-date (via a ref) so callers
 * do not need to memoize their callback.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const bus = useEventBusContext<AppEvents>()
 *   useEventListener(bus, 'theme:change', ({ theme }) => {
 *     console.log('Theme changed to', theme)
 *   })
 *   return null
 * }
 * ```
 */
export function useEventListener<T extends EventMap, K extends keyof T>(
  bus: EventBus<T>,
  event: K,
  handler: Handler<T[K]>,
): void {
  const handlerRef = useRef<Handler<T[K]>>(handler)
  handlerRef.current = handler

  useEffect(() => {
    const stableHandler: Handler<T[K]> = (data) => handlerRef.current(data)
    const unsub = bus.on(event, stableHandler)
    return unsub
  }, [bus, event])
}

/**
 * React hook that provides memoized `emit` and `on` helpers bound to
 * a specific event bus instance.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const bus = useEventBusContext<AppEvents>()
 *   const { emit } = useEventBus(bus)
 *   return <button onClick={() => emit('user:logout', undefined as void)}>Logout</button>
 * }
 * ```
 */
export function useEventBus<T extends EventMap>(bus: EventBus<T>) {
  const busRef = useRef(bus)
  busRef.current = bus

  const emit = useCallback(
    <K extends keyof T>(event: K, data: T[K]) => {
      busRef.current.emit(event, data)
    },
    [],
  )

  const on = useCallback(
    <K extends keyof T>(event: K, handler: Handler<T[K]>) => {
      return busRef.current.on(event, handler)
    },
    [],
  )

  const once = useCallback(
    <K extends keyof T>(event: K, handler: Handler<T[K]>) => {
      return busRef.current.once(event, handler)
    },
    [],
  )

  return { emit, on, once } as const
}
