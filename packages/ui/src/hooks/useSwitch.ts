'use client'

import { useState, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseSwitchOptions {
  /** Initial checked state. Defaults to false. */
  initialChecked?: boolean
  /** Callback fired when the switch state changes. */
  onChange?: (checked: boolean) => void
  /** When true, the switch cannot be toggled. */
  disabled?: boolean
}

export interface UseSwitchReturn {
  /** Current checked state. */
  checked: boolean
  /** Toggle the checked state. */
  toggle: () => void
  /** Set checked to a specific value. */
  setChecked: (v: boolean) => void
  /** Props to spread onto the switch element for accessibility. */
  switchProps: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSwitch(options: UseSwitchOptions = {}): UseSwitchReturn {
  const {
    initialChecked = false,
    onChange,
    disabled = false,
  } = options

  const [checked, setCheckedState] = useState<boolean>(initialChecked)

  const toggle = useCallback(() => {
    if (disabled) return
    const next = !checked
    setCheckedState(next)
    onChange?.(next)
  }, [disabled, checked, onChange])

  const setChecked = useCallback(
    (v: boolean) => {
      if (disabled) return
      setCheckedState(v)
      onChange?.(v)
    },
    [disabled, onChange],
  )

  const switchProps: Record<string, unknown> = {
    role: 'switch',
    'aria-checked': checked,
    'aria-disabled': disabled || undefined,
    tabIndex: disabled ? -1 : 0,
  }

  return {
    checked,
    toggle,
    setChecked,
    switchProps,
  }
}
