'use client'

import React, { useId } from 'react'
import { useNumberInput } from './hooks/useNumberInput'
import type { UseNumberInputOptions } from './hooks/useNumberInput'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NumberInputSize = 'sm' | 'md' | 'lg'

export interface NumberInputProps extends UseNumberInputOptions {
  /** Size variant. Defaults to 'md'. */
  size?: NumberInputSize
  /** Accessible label for the spinbutton. */
  'aria-label'?: string
  /** Whether the input is disabled. */
  disabled?: boolean
  /** Additional CSS class for the root element. */
  className?: string
  /** Optional id for the input element. */
  id?: string
}

// ---------------------------------------------------------------------------
// Size styles
// ---------------------------------------------------------------------------

const SIZE_STYLES: Record<
  NumberInputSize,
  { input: React.CSSProperties; button: React.CSSProperties; fontSize: string }
> = {
  sm: {
    input: { height: '2rem', padding: '0.25rem 2rem 0.25rem 0.5rem', fontSize: '0.75rem' },
    button: { width: '1.5rem', height: '1rem', fontSize: '0.625rem' },
    fontSize: '0.625rem',
  },
  md: {
    input: { height: '2.5rem', padding: '0.375rem 2.25rem 0.375rem 0.75rem', fontSize: '0.875rem' },
    button: { width: '1.75rem', height: '1.25rem', fontSize: '0.75rem' },
    fontSize: '0.75rem',
  },
  lg: {
    input: { height: '3rem', padding: '0.5rem 2.5rem 0.5rem 1rem', fontSize: '1rem' },
    button: { width: '2rem', height: '1.5rem', fontSize: '0.875rem' },
    fontSize: '0.875rem',
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NumberInput({
  initialValue,
  min,
  max,
  step,
  precision,
  clamp,
  onChange,
  size = 'md',
  'aria-label': ariaLabel = 'Number input',
  disabled = false,
  className = '',
  id: externalId,
}: NumberInputProps): React.ReactElement {
  const autoId = useId()
  const inputId = externalId ?? autoId

  const {
    increment,
    decrement,
    isMin,
    isMax,
    inputProps,
  } = useNumberInput({ initialValue, min, max, step, precision, clamp, onChange })

  const sizeStyle = SIZE_STYLES[size]

  const handleIncrement = () => {
    if (disabled) return
    increment()
  }

  const handleDecrement = () => {
    if (disabled) return
    decrement()
  }

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', position: 'relative' }}
      data-testid="number-input"
    >
      <input
        {...inputProps}
        id={inputId}
        aria-label={ariaLabel}
        disabled={disabled}
        style={{
          ...sizeStyle.input,
          boxSizing: 'border-box',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          outline: 'none',
          width: '100%',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
        }}
        data-testid="number-input-field"
      />
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Increment"
          disabled={disabled || isMax}
          onClick={handleIncrement}
          style={{
            ...sizeStyle.button,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #d1d5db',
            borderTopRightRadius: '0.375rem',
            background: 'transparent',
            cursor: disabled || isMax ? 'not-allowed' : 'pointer',
            opacity: disabled || isMax ? 0.5 : 1,
            fontSize: sizeStyle.fontSize,
            lineHeight: 1,
            padding: 0,
          }}
          data-testid="number-input-increment"
        >
          &#9650;
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Decrement"
          disabled={disabled || isMin}
          onClick={handleDecrement}
          style={{
            ...sizeStyle.button,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #d1d5db',
            borderBottomRightRadius: '0.375rem',
            background: 'transparent',
            cursor: disabled || isMin ? 'not-allowed' : 'pointer',
            opacity: disabled || isMin ? 0.5 : 1,
            fontSize: sizeStyle.fontSize,
            lineHeight: 1,
            padding: 0,
          }}
          data-testid="number-input-decrement"
        >
          &#9660;
        </button>
      </div>
    </div>
  )
}
