'use client'

import { createContext, useContext, useRef, type ReactNode } from 'react'
import { createEventBus, type EventBus, type AppEvents } from '../utils/eventBus'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type EventMap = {}

/**
 * Generic context for any EventBus instance.
 * Defaults to `AppEvents` for the global bus.
 */
const EventBusContext = createContext<EventBus<AppEvents> | null>(null)

export interface EventBusProviderProps<T extends EventMap = AppEvents> {
  readonly children: ReactNode
  /** Optional external bus instance (useful for testing). */
  readonly bus?: EventBus<T>
}

/**
 * Provides a shared EventBus to all descendants via React context.
 *
 * By default, an `AppEvents` bus is created automatically.
 * Pass your own `bus` prop for custom event maps or testing.
 *
 * @example
 * ```tsx
 * <EventBusProvider>
 *   <App />
 * </EventBusProvider>
 * ```
 */
export function EventBusProvider<T extends EventMap = AppEvents>({
  children,
  bus,
}: EventBusProviderProps<T>) {
  const busRef = useRef<EventBus<T>>(bus ?? (createEventBus<T>() as EventBus<T>))

  return (
    <EventBusContext.Provider value={busRef.current as unknown as EventBus<AppEvents>}>
      {children}
    </EventBusContext.Provider>
  )
}

/**
 * Returns the nearest EventBus from context.
 * Throws if called outside an `<EventBusProvider>`.
 *
 * @example
 * ```tsx
 * const bus = useEventBusContext<AppEvents>()
 * bus.emit('theme:change', { theme: 'dark' })
 * ```
 */
export function useEventBusContext<T extends EventMap = AppEvents>(): EventBus<T> {
  const bus = useContext(EventBusContext)
  if (!bus) {
    throw new Error('useEventBusContext must be used within an <EventBusProvider>')
  }
  return bus as unknown as EventBus<T>
}
