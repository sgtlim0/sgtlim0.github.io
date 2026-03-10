'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface UseCarouselOptions {
  /** Enable auto-play (default: false) */
  readonly autoPlay?: boolean
  /** Auto-play interval in milliseconds (default: 3000) */
  readonly interval?: number
  /** Loop back to start/end (default: true) */
  readonly loop?: boolean
  /** Starting slide index (default: 0) */
  readonly startIndex?: number
}

export interface UseCarouselReturn {
  /** Current active slide index */
  readonly currentIndex: number
  /** Go to next slide */
  readonly next: () => void
  /** Go to previous slide */
  readonly prev: () => void
  /** Go to a specific slide by index */
  readonly goTo: (index: number) => void
  /** Whether the current slide is the first */
  readonly isFirst: boolean
  /** Whether the current slide is the last */
  readonly isLast: boolean
  /** Pause auto-play */
  readonly pause: () => void
  /** Resume auto-play */
  readonly resume: () => void
  /** Whether auto-play is currently active */
  readonly isPlaying: boolean
}

/**
 * Hook for managing carousel/slider state with optional auto-play.
 *
 * @example
 * ```tsx
 * const { currentIndex, next, prev, goTo, isPlaying, pause, resume } =
 *   useCarousel(slides.length, { autoPlay: true, interval: 5000 })
 * ```
 */
export function useCarousel(
  itemCount: number,
  options: UseCarouselOptions = {},
): UseCarouselReturn {
  const {
    autoPlay = false,
    interval = 3000,
    loop = true,
    startIndex = 0,
  } = options

  const safeStart = itemCount > 0 ? Math.min(Math.max(0, startIndex), itemCount - 1) : 0
  const [currentIndex, setCurrentIndex] = useState(safeStart)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isFirst = currentIndex === 0
  const isLast = itemCount > 0 ? currentIndex === itemCount - 1 : true

  const next = useCallback(() => {
    if (itemCount <= 0) return
    setCurrentIndex((prev) => {
      if (prev >= itemCount - 1) {
        return loop ? 0 : prev
      }
      return prev + 1
    })
  }, [itemCount, loop])

  const prev = useCallback(() => {
    if (itemCount <= 0) return
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        return loop ? itemCount - 1 : prev
      }
      return prev - 1
    })
  }, [itemCount, loop])

  const goTo = useCallback(
    (index: number) => {
      if (itemCount <= 0) return
      const clamped = Math.min(Math.max(0, index), itemCount - 1)
      setCurrentIndex(clamped)
    },
    [itemCount],
  )

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const pause = useCallback(() => {
    setIsPlaying(false)
    clearTimer()
  }, [clearTimer])

  const resume = useCallback(() => {
    if (autoPlay) {
      setIsPlaying(true)
    }
  }, [autoPlay])

  // Auto-play effect
  useEffect(() => {
    clearTimer()

    if (isPlaying && itemCount > 1) {
      timerRef.current = setInterval(() => {
        next()
      }, interval)
    }

    return clearTimer
  }, [isPlaying, interval, itemCount, next, clearTimer])

  // Clamp currentIndex when itemCount changes
  useEffect(() => {
    if (itemCount <= 0) {
      setCurrentIndex(0)
      return
    }
    setCurrentIndex((prev) => (prev >= itemCount ? itemCount - 1 : prev))
  }, [itemCount])

  return {
    currentIndex,
    next,
    prev,
    goTo,
    isFirst,
    isLast,
    pause,
    resume,
    isPlaying,
  }
}
