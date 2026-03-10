'use client'

import { useState, useCallback, useRef, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseNumberInputOptions {
  /** Initial numeric value. Defaults to 0. */
  initialValue?: number
  /** Minimum allowed value. Defaults to -Infinity. */
  min?: number
  /** Maximum allowed value. Defaults to Infinity. */
  max?: number
  /** Step amount for increment/decrement. Defaults to 1. */
  step?: number
  /** Number of decimal places for display formatting. Defaults to auto. */
  precision?: number
  /** Whether to clamp values to min/max range. Defaults to true. */
  clamp?: boolean
  /** Callback fired when the value changes. */
  onChange?: (value: number) => void
}

export interface UseNumberInputReturn {
  /** Current numeric value. */
  value: number
  /** Formatted string for display in the input. */
  displayValue: string
  /** Set the value directly. */
  setValue: (v: number) => void
  /** Increment by one step. */
  increment: () => void
  /** Decrement by one step. */
  decrement: () => void
  /** Whether the current value is at or below min. */
  isMin: boolean
  /** Whether the current value is at or above max. */
  isMax: boolean
  /** Props to spread onto an input element. */
  inputProps: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max))
}

function roundToPrecision(value: number, precision: number | undefined): number {
  if (precision === undefined) return value
  const factor = Math.pow(10, precision)
  return Math.round(value * factor) / factor
}

function formatValue(value: number, precision: number | undefined): string {
  if (precision !== undefined) {
    return value.toFixed(precision)
  }
  return String(value)
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNumberInput(options: UseNumberInputOptions = {}): UseNumberInputReturn {
  const {
    initialValue = 0,
    min = -Infinity,
    max = Infinity,
    step = 1,
    precision,
    clamp = true,
    onChange,
  } = options

  const resolvedInitial = clamp
    ? clampValue(roundToPrecision(initialValue, precision), min, max)
    : roundToPrecision(initialValue, precision)

  const [value, setValueState] = useState<number>(resolvedInitial)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const displayValue = isEditing ? editText : formatValue(value, precision)

  const isMin = value <= min
  const isMax = value >= max

  const applyValue = useCallback(
    (raw: number) => {
      const rounded = roundToPrecision(raw, precision)
      const next = clamp ? clampValue(rounded, min, max) : rounded
      setValueState(next)
      onChange?.(next)
      return next
    },
    [min, max, precision, clamp, onChange],
  )

  const setValue = useCallback(
    (v: number) => {
      applyValue(v)
    },
    [applyValue],
  )

  const increment = useCallback(() => {
    setValueState((prev) => {
      const raw = prev + step
      const rounded = roundToPrecision(raw, precision)
      const next = clamp ? clampValue(rounded, min, max) : rounded
      onChange?.(next)
      return next
    })
  }, [step, min, max, precision, clamp, onChange])

  const decrement = useCallback(() => {
    setValueState((prev) => {
      const raw = prev - step
      const rounded = roundToPrecision(raw, precision)
      const next = clamp ? clampValue(rounded, min, max) : rounded
      onChange?.(next)
      return next
    })
  }, [step, min, max, precision, clamp, onChange])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value)
  }, [])

  const handleFocus = useCallback(() => {
    setIsEditing(true)
    setEditText(formatValue(value, precision))
  }, [value, precision])

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    const parsed = parseFloat(editText)
    if (!isNaN(parsed)) {
      applyValue(parsed)
    }
    // If NaN, keep previous value
  }, [editText, applyValue])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowUp': {
          e.preventDefault()
          const bigStep = e.shiftKey ? step * 10 : step
          setValueState((prev) => {
            const raw = prev + bigStep
            const rounded = roundToPrecision(raw, precision)
            const next = clamp ? clampValue(rounded, min, max) : rounded
            onChange?.(next)
            return next
          })
          break
        }
        case 'ArrowDown': {
          e.preventDefault()
          const bigStep = e.shiftKey ? step * 10 : step
          setValueState((prev) => {
            const raw = prev - bigStep
            const rounded = roundToPrecision(raw, precision)
            const next = clamp ? clampValue(rounded, min, max) : rounded
            onChange?.(next)
            return next
          })
          break
        }
        case 'Home': {
          e.preventDefault()
          if (min !== -Infinity) {
            applyValue(min)
            setEditText(formatValue(min, precision))
          }
          break
        }
        case 'End': {
          e.preventDefault()
          if (max !== Infinity) {
            applyValue(max)
            setEditText(formatValue(max, precision))
          }
          break
        }
        case 'Enter': {
          e.preventDefault()
          const parsed = parseFloat(editText)
          if (!isNaN(parsed)) {
            const next = applyValue(parsed)
            setEditText(formatValue(next, precision))
          }
          inputRef.current?.blur()
          break
        }
      }
    },
    [step, min, max, precision, clamp, onChange, applyValue, editText],
  )

  const inputProps = useMemo(
    () => ({
      ref: inputRef,
      type: 'text',
      inputMode: 'decimal' as const,
      role: 'spinbutton',
      'aria-valuemin': min === -Infinity ? undefined : min,
      'aria-valuemax': max === Infinity ? undefined : max,
      'aria-valuenow': value,
      value: displayValue,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
    }),
    [min, max, value, displayValue, handleChange, handleFocus, handleBlur, handleKeyDown],
  )

  return {
    value,
    displayValue,
    setValue,
    increment,
    decrement,
    isMin,
    isMax,
    inputProps,
  }
}
