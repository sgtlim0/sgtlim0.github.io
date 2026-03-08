'use client'

import { useState, useEffect, useCallback, useRef, type CSSProperties } from 'react'

export type TransitionState = 'entering' | 'entered' | 'exiting' | 'exited'

export interface UseTransitionOptions {
  /** Transition duration in milliseconds (default: 300) */
  readonly duration?: number
  /** Callback fired when enter transition starts */
  readonly onEnter?: () => void
  /** Callback fired when exit transition completes */
  readonly onExit?: () => void
}

export interface UseTransitionReturn {
  /** Current transition state */
  readonly state: TransitionState
  /** Whether the element should be mounted in the DOM */
  readonly isMounted: boolean
  /** Inline style object with opacity and transform */
  readonly style: CSSProperties
}

/**
 * Returns the computed style for a given transition state and duration.
 * When prefers-reduced-motion is active, transitions are instant.
 */
function getStyle(state: TransitionState, duration: number, reducedMotion: boolean): CSSProperties {
  const transitionDuration = reducedMotion ? '0ms' : `${duration}ms`
  const base: CSSProperties = {
    transition: `opacity ${transitionDuration} ease, transform ${transitionDuration} ease`,
  }

  switch (state) {
    case 'entering':
    case 'entered':
      return { ...base, opacity: 1, transform: 'none' }
    case 'exiting':
    case 'exited':
      return { ...base, opacity: 0, transform: 'translateY(8px)' }
  }
}

/**
 * Manages enter/exit CSS transition states for a toggled element.
 *
 * The hook tracks four states: exited -> entering -> entered -> exiting -> exited.
 * It uses requestAnimationFrame to ensure the browser has painted the initial
 * state before transitioning, which is required for CSS transitions to work.
 *
 * SSR safe: initial state is always 'exited'.
 *
 * @example
 * ```tsx
 * const { state, isMounted, style } = useTransition(isOpen, { duration: 200 })
 * if (!isMounted) return null
 * return <div style={style}>Content</div>
 * ```
 */
export function useTransition(
  isVisible: boolean,
  options: UseTransitionOptions = {},
): UseTransitionReturn {
  const { duration = 300, onEnter, onExit } = options

  const [state, setState] = useState<TransitionState>('exited')
  const rafRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onEnterRef = useRef(onEnter)
  const onExitRef = useRef(onExit)

  // Keep callback refs up to date without re-triggering effects.
  onEnterRef.current = onEnter
  onExitRef.current = onExit

  const prefersReducedMotion = useReducedMotion()
  const effectiveDuration = prefersReducedMotion ? 0 : duration

  useEffect(() => {
    // Clean up any pending timers/rafs from previous cycle.
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (isVisible) {
      // Enter: exited -> entering -> (raf) -> entered
      setState('entering')
      onEnterRef.current?.()

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          setState('entered')
        })
      })
    } else {
      // Exit: entered -> exiting -> (timeout) -> exited
      setState((prev) => {
        // If already exited, stay exited.
        if (prev === 'exited') return 'exited'
        return 'exiting'
      })

      timerRef.current = setTimeout(() => {
        setState('exited')
        onExitRef.current?.()
      }, effectiveDuration)
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isVisible, effectiveDuration])

  const isMounted = state !== 'exited'
  const style = getStyle(state, effectiveDuration, prefersReducedMotion)

  return { state, isMounted, style }
}

/**
 * Detects the user's prefers-reduced-motion media query.
 * Returns false during SSR.
 */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mql.matches)

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return reduced
}
