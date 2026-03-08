'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { TransitionState } from './useTransition'

export interface AnimatedItem<T> {
  /** The original data item */
  readonly item: T
  /** Unique key for this item */
  readonly key: string
  /** Current transition state */
  readonly state: TransitionState
}

export interface UseAnimatedListOptions {
  /** Transition duration per item in ms (default: 300) */
  readonly duration?: number
  /** Stagger delay between sequential item animations in ms (default: 50) */
  readonly staggerDelay?: number
}

export interface UseAnimatedListReturn<T> {
  /** Items with their animation states */
  readonly items: ReadonlyArray<AnimatedItem<T>>
  /** Add an item to the list */
  readonly add: (key: string, item: T) => void
  /** Remove an item from the list by key */
  readonly remove: (key: string) => void
  /** Replace the entire list (animates new items in with stagger) */
  readonly set: (entries: ReadonlyArray<{ key: string; item: T }>) => void
}

/**
 * Manages a list of items with enter/exit animations and stagger delay.
 *
 * Each item tracks its own TransitionState. When items are added they
 * animate in sequentially (stagger). When removed they transition to
 * 'exiting' then are removed from the list after the duration elapses.
 *
 * @example
 * ```tsx
 * const { items, add, remove } = useAnimatedList<string>({ staggerDelay: 80 })
 *
 * items.map(({ key, item, state }) => (
 *   <div key={key} style={getTransitionPreset('fade')[state === 'entered' ? 'entered' : 'exited']}>
 *     {item}
 *   </div>
 * ))
 * ```
 */
export function useAnimatedList<T>(
  options: UseAnimatedListOptions = {},
): UseAnimatedListReturn<T> {
  const { duration = 300, staggerDelay = 50 } = options

  const [animatedItems, setAnimatedItems] = useState<ReadonlyArray<AnimatedItem<T>>>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Cleanup all timers on unmount.
  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) {
        clearTimeout(timer)
      }
      timersRef.current.clear()
    }
  }, [])

  const transitionToEntered = useCallback(
    (key: string, delay: number) => {
      const timer = setTimeout(() => {
        setAnimatedItems((prev) =>
          prev.map((ai) => (ai.key === key ? { ...ai, state: 'entered' as const } : ai)),
        )
        timersRef.current.delete(key)
      }, delay)
      timersRef.current.set(`enter-${key}`, timer)
    },
    [],
  )

  const add = useCallback(
    (key: string, item: T) => {
      setAnimatedItems((prev) => {
        // Prevent duplicate keys.
        if (prev.some((ai) => ai.key === key)) return prev
        return [...prev, { key, item, state: 'entering' as const }]
      })
      transitionToEntered(key, 32) // ~2 frames for CSS to apply
    },
    [transitionToEntered],
  )

  const remove = useCallback(
    (key: string) => {
      // Transition to exiting.
      setAnimatedItems((prev) =>
        prev.map((ai) => (ai.key === key ? { ...ai, state: 'exiting' as const } : ai)),
      )

      // Remove after duration.
      const timer = setTimeout(() => {
        setAnimatedItems((prev) => prev.filter((ai) => ai.key !== key))
        timersRef.current.delete(`exit-${key}`)
      }, duration)
      timersRef.current.set(`exit-${key}`, timer)
    },
    [duration],
  )

  const set = useCallback(
    (entries: ReadonlyArray<{ key: string; item: T }>) => {
      // Clear existing timers.
      for (const timer of timersRef.current.values()) {
        clearTimeout(timer)
      }
      timersRef.current.clear()

      const newItems: ReadonlyArray<AnimatedItem<T>> = entries.map(({ key, item }) => ({
        key,
        item,
        state: 'entering' as const,
      }))
      setAnimatedItems(newItems)

      // Stagger enter transitions.
      entries.forEach(({ key }, index) => {
        transitionToEntered(key, staggerDelay * index + 32)
      })
    },
    [staggerDelay, transitionToEntered],
  )

  return { items: animatedItems, add, remove, set }
}
