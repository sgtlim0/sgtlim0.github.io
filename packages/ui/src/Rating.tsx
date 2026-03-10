'use client'

import { useCallback, useId, type ReactNode, type KeyboardEvent } from 'react'
import { useRating, type UseRatingOptions } from './hooks/useRating'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RatingSize = 'sm' | 'md' | 'lg'

export interface RatingProps {
  /** Initial rating value. Defaults to 0. */
  initialValue?: number
  /** Maximum number of stars. Defaults to 5. */
  max?: number
  /** Rating precision — full star (1) or half star (0.5). Defaults to 1. */
  precision?: 0.5 | 1
  /** When true, the rating cannot be changed. */
  readOnly?: boolean
  /** Size of each star icon. Defaults to 'md'. */
  size?: RatingSize
  /** Callback fired when the rating changes. */
  onChange?: (value: number) => void
  /** Accessible label for the rating group. */
  'aria-label'?: string
  /** Custom icon renderer. Receives fill state: 'full', 'half', or 'empty'. */
  renderIcon?: (fill: 'full' | 'half' | 'empty') => ReactNode
  /** Additional CSS class for the root element. */
  className?: string
}

// ---------------------------------------------------------------------------
// Size → pixel mapping
// ---------------------------------------------------------------------------

const SIZE_MAP: Record<RatingSize, number> = {
  sm: 16,
  md: 24,
  lg: 32,
}

// ---------------------------------------------------------------------------
// Default star SVG icons
// ---------------------------------------------------------------------------

function StarFull({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    >
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  )
}

function StarHalf({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="half-clip">
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
      </defs>
      {/* Empty outline */}
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
      />
      {/* Filled left half */}
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={1}
        clipPath="url(#half-clip)"
      />
    </svg>
  )
}

function StarEmpty({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    >
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFillState(
  starIndex: number,
  displayValue: number,
): 'full' | 'half' | 'empty' {
  if (displayValue >= starIndex) return 'full'
  if (displayValue >= starIndex - 0.5) return 'half'
  return 'empty'
}

function renderDefaultIcon(fill: 'full' | 'half' | 'empty', size: number) {
  switch (fill) {
    case 'full':
      return <StarFull size={size} />
    case 'half':
      return <StarHalf size={size} />
    case 'empty':
      return <StarEmpty size={size} />
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Rating({
  initialValue = 0,
  max = 5,
  precision = 1,
  readOnly = false,
  size = 'md',
  onChange,
  'aria-label': ariaLabel = 'Rating',
  renderIcon,
  className = '',
}: RatingProps) {
  const groupId = useId()
  const hookOptions: UseRatingOptions = {
    initialValue,
    max,
    precision,
    readOnly,
    onChange,
  }
  const {
    value,
    hoverValue,
    setValue,
    onMouseEnter,
    onMouseLeave,
  } = useRating(hookOptions)

  const displayValue = hoverValue ?? value
  const pixelSize = SIZE_MAP[size]

  // -----------------------------------------------------------------------
  // Keyboard navigation
  // -----------------------------------------------------------------------
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (readOnly) return

      const step = precision === 0.5 ? 0.5 : 1
      let newValue = value

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault()
          newValue = Math.min(value + step, max)
          break
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault()
          newValue = Math.max(value - step, 0)
          break
        case 'Home':
          e.preventDefault()
          newValue = 0
          break
        case 'End':
          e.preventDefault()
          newValue = max
          break
        default:
          return
      }

      setValue(newValue)
    },
    [readOnly, precision, value, max, setValue],
  )

  // -----------------------------------------------------------------------
  // Build star list
  // -----------------------------------------------------------------------
  const stars = Array.from({ length: max }, (_, i) => {
    const starIndex = i + 1
    const fill = getFillState(starIndex, displayValue)
    const isSelected = value === starIndex || (precision === 0.5 && value === starIndex - 0.5)

    const handleClick = () => {
      if (readOnly) return
      if (precision === 0.5) {
        // Clicking left half = starIndex - 0.5, right half = starIndex
        // Simple approach: toggle between half and full on same star
        if (value === starIndex) {
          setValue(starIndex - 0.5)
        } else {
          setValue(starIndex)
        }
      } else {
        setValue(starIndex)
      }
    }

    const handleMouseEnterStar = () => {
      onMouseEnter(starIndex)
    }

    return (
      <span
        key={starIndex}
        role="radio"
        aria-checked={isSelected}
        aria-label={`${starIndex} star${starIndex > 1 ? 's' : ''}`}
        tabIndex={-1}
        onClick={handleClick}
        onMouseEnter={handleMouseEnterStar}
        style={{
          cursor: readOnly ? 'default' : 'pointer',
          display: 'inline-flex',
          color: fill === 'empty' ? '#d1d5db' : '#facc15',
        }}
        data-testid={`rating-star-${starIndex}`}
      >
        {renderIcon
          ? renderIcon(fill)
          : renderDefaultIcon(fill, pixelSize)}
      </span>
    )
  })

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      tabIndex={readOnly ? -1 : 0}
      onKeyDown={handleKeyDown}
      onMouseLeave={onMouseLeave}
      className={className}
      style={{ display: 'inline-flex', gap: 2 }}
      data-testid="rating"
    >
      {stars}
    </div>
  )
}
