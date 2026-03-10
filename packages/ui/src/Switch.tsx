'use client'

import { useCallback, type KeyboardEvent } from 'react'
import { useSwitch } from './hooks/useSwitch'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SwitchSize = 'sm' | 'md' | 'lg'
export type SwitchColor = 'primary' | 'success' | 'danger'
export type SwitchLabelPosition = 'left' | 'right'

export interface SwitchProps {
  /** Initial checked state. Defaults to false. */
  initialChecked?: boolean
  /** Callback fired when the switch state changes. */
  onChange?: (checked: boolean) => void
  /** When true, the switch cannot be toggled. */
  disabled?: boolean
  /** Size of the switch. Defaults to 'md'. */
  size?: SwitchSize
  /** Color variant when checked. Defaults to 'primary'. */
  color?: SwitchColor
  /** Optional label text. */
  label?: string
  /** Position of the label relative to the switch. Defaults to 'right'. */
  labelPosition?: SwitchLabelPosition
  /** Accessible label for the switch. */
  'aria-label'?: string
  /** Additional CSS class for the wrapper element. */
  className?: string
}

// ---------------------------------------------------------------------------
// Size mappings (track width x height, thumb size)
// ---------------------------------------------------------------------------

const TRACK_STYLES: Record<SwitchSize, { width: number; height: number; thumb: number; translate: number }> = {
  sm: { width: 32, height: 18, thumb: 14, translate: 14 },
  md: { width: 44, height: 24, thumb: 20, translate: 20 },
  lg: { width: 56, height: 30, thumb: 26, translate: 26 },
}

// ---------------------------------------------------------------------------
// Color mappings
// ---------------------------------------------------------------------------

const COLOR_MAP: Record<SwitchColor, string> = {
  primary: '#3b82f6',
  success: '#22c55e',
  danger: '#ef4444',
}

const UNCHECKED_BG = '#d1d5db'
const DISABLED_BG = '#e5e7eb'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Switch({
  initialChecked = false,
  onChange,
  disabled = false,
  size = 'md',
  color = 'primary',
  label,
  labelPosition = 'right',
  'aria-label': ariaLabel,
  className = '',
}: SwitchProps) {
  const { checked, toggle, switchProps } = useSwitch({
    initialChecked,
    onChange,
    disabled,
  })

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        toggle()
      }
    },
    [disabled, toggle],
  )

  const track = TRACK_STYLES[size]
  const thumbOffset = 2
  const bgColor = disabled
    ? DISABLED_BG
    : checked
      ? COLOR_MAP[color]
      : UNCHECKED_BG

  const trackStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: track.width,
    height: track.height,
    borderRadius: track.height / 2,
    backgroundColor: bgColor,
    border: 'none',
    padding: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s ease',
    outline: 'none',
    opacity: disabled ? 0.5 : 1,
  }

  const thumbStyle: React.CSSProperties = {
    position: 'absolute',
    top: thumbOffset,
    left: checked ? track.translate + thumbOffset : thumbOffset,
    width: track.thumb,
    height: track.thumb,
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    transition: 'left 0.2s ease',
    pointerEvents: 'none',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: size === 'sm' ? 12 : size === 'lg' ? 16 : 14,
    color: disabled ? '#9ca3af' : '#374151',
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
  }

  const wrapperStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  }

  const labelElement = label ? (
    <span style={labelStyle} onClick={disabled ? undefined : toggle}>
      {label}
    </span>
  ) : null

  return (
    <div
      style={wrapperStyle}
      className={className}
      data-testid="switch-wrapper"
    >
      {labelPosition === 'left' && labelElement}
      <button
        type="button"
        {...switchProps}
        aria-label={ariaLabel}
        data-testid="switch-track"
        data-size={size}
        data-color={color}
        data-checked={String(checked)}
        data-disabled={disabled ? 'true' : undefined}
        style={trackStyle}
        onClick={toggle}
        onKeyDown={handleKeyDown}
      >
        <span
          data-testid="switch-thumb"
          style={thumbStyle}
        />
      </button>
      {labelPosition === 'right' && labelElement}
    </div>
  )
}
