'use client'

import { useState, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseRatingOptions {
  /** Initial rating value. Defaults to 0. */
  initialValue?: number
  /** Maximum number of stars. Defaults to 5. */
  max?: number
  /** Rating precision — full star (1) or half star (0.5). Defaults to 1. */
  precision?: 0.5 | 1
  /** When true, the rating cannot be changed. */
  readOnly?: boolean
  /** Callback fired when the rating changes. */
  onChange?: (value: number) => void
}

export interface UseRatingReturn {
  /** Current selected rating value. */
  value: number
  /** Rating value under the pointer (null when not hovering). */
  hoverValue: number | null
  /** Set the rating to a specific value. */
  setValue: (v: number) => void
  /** Handler for mouse entering a star region. */
  onMouseEnter: (index: number) => void
  /** Handler for mouse leaving the rating area. */
  onMouseLeave: () => void
  /** Reset the rating to 0. */
  reset: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clampValue(value: number, max: number, precision: 0.5 | 1): number {
  const stepped =
    precision === 0.5
      ? Math.round(value * 2) / 2
      : Math.round(value)
  return Math.max(0, Math.min(stepped, max))
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRating(options: UseRatingOptions = {}): UseRatingReturn {
  const {
    initialValue = 0,
    max = 5,
    precision = 1,
    readOnly = false,
    onChange,
  } = options

  const [value, setValueState] = useState<number>(
    clampValue(initialValue, max, precision),
  )
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const setValue = useCallback(
    (v: number) => {
      if (readOnly) return
      const clamped = clampValue(v, max, precision)
      setValueState(clamped)
      onChange?.(clamped)
    },
    [readOnly, max, precision, onChange],
  )

  const onMouseEnter = useCallback(
    (index: number) => {
      if (readOnly) return
      setHoverValue(clampValue(index, max, precision))
    },
    [readOnly, max, precision],
  )

  const onMouseLeave = useCallback(() => {
    setHoverValue(null)
  }, [])

  const reset = useCallback(() => {
    if (readOnly) return
    setValueState(0)
    onChange?.(0)
  }, [readOnly, onChange])

  return {
    value,
    hoverValue,
    setValue,
    onMouseEnter,
    onMouseLeave,
    reset,
  }
}
