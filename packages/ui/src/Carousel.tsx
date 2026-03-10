'use client'

import React, {
  Children,
  useCallback,
  useRef,
  type KeyboardEvent,
  type TouchEvent,
  type ReactNode,
} from 'react'
import { useCarousel } from './hooks/useCarousel'
import type { UseCarouselOptions } from './hooks/useCarousel'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CarouselProps extends UseCarouselOptions {
  /** Slide content — each direct child is one slide */
  readonly children: ReactNode
  /** Additional class name for the outer container */
  readonly className?: string
  /** Accessible label for the carousel region */
  readonly ariaLabel?: string
  /** CSS transition duration in milliseconds (default: 300) */
  readonly transitionDuration?: number
  /** Show navigation arrows (default: true) */
  readonly showArrows?: boolean
  /** Show indicator dots (default: true) */
  readonly showDots?: boolean
  /** Minimum swipe distance in px to trigger slide change (default: 50) */
  readonly swipeThreshold?: number
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ArrowButton({
  direction,
  onClick,
  disabled,
}: {
  readonly direction: 'prev' | 'next'
  readonly onClick: () => void
  readonly disabled: boolean
}) {
  const isPrev = direction === 'prev'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrev ? 'Previous slide' : 'Next slide'}
      className={[
        'absolute top-1/2 -translate-y-1/2 z-10',
        'flex items-center justify-center w-10 h-10 rounded-full',
        'bg-white/80 dark:bg-gray-800/80 shadow-md',
        'hover:bg-white dark:hover:bg-gray-700 transition-colors',
        'disabled:opacity-30 disabled:cursor-not-allowed',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isPrev ? 'left-2' : 'right-2',
      ].join(' ')}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        className={isPrev ? 'rotate-180' : ''}
      >
        <path
          d="M7.5 4L13.5 10L7.5 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

function DotIndicators({
  count,
  activeIndex,
  onSelect,
}: {
  readonly count: number
  readonly activeIndex: number
  readonly onSelect: (index: number) => void
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-3" role="tablist" aria-label="Slide indicators">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === activeIndex}
          aria-label={`Go to slide ${i + 1}`}
          onClick={() => onSelect(i)}
          className={[
            'w-2.5 h-2.5 rounded-full transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            i === activeIndex
              ? 'bg-primary scale-110'
              : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Carousel
// ---------------------------------------------------------------------------

/**
 * Carousel / Slider component with touch support, keyboard navigation,
 * auto-play, and full accessibility.
 *
 * Each direct child element is treated as one slide.
 *
 * @example
 * ```tsx
 * <Carousel autoPlay interval={5000} ariaLabel="Product images">
 *   <img src="/slide1.jpg" alt="Slide 1" />
 *   <img src="/slide2.jpg" alt="Slide 2" />
 *   <img src="/slide3.jpg" alt="Slide 3" />
 * </Carousel>
 * ```
 */
export default function Carousel({
  children,
  className = '',
  ariaLabel = 'Carousel',
  transitionDuration = 300,
  showArrows = true,
  showDots = true,
  swipeThreshold = 50,
  autoPlay,
  interval,
  loop,
  startIndex,
}: CarouselProps) {
  const slides = Children.toArray(children)
  const slideCount = slides.length

  const {
    currentIndex,
    next,
    prev,
    goTo,
    isFirst,
    isLast,
    pause,
    resume,
    isPlaying,
  } = useCarousel(slideCount, { autoPlay, interval, loop, startIndex })

  // Touch handling
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    if (isPlaying) pause()
  }, [isPlaying, pause])

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return

      const deltaX = e.changedTouches[0].clientX - touchStartX.current
      const deltaY = e.changedTouches[0].clientY - touchStartY.current

      // Only trigger if horizontal swipe is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) >= swipeThreshold) {
        if (deltaX < 0) {
          next()
        } else {
          prev()
        }
      }

      touchStartX.current = null
      touchStartY.current = null

      if (autoPlay) resume()
    },
    [swipeThreshold, next, prev, autoPlay, resume],
  )

  // Keyboard handling
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          prev()
          break
        case 'ArrowRight':
          e.preventDefault()
          next()
          break
      }
    },
    [prev, next],
  )

  // Hover pause/resume
  const handleMouseEnter = useCallback(() => {
    if (isPlaying) pause()
  }, [isPlaying, pause])

  const handleMouseLeave = useCallback(() => {
    if (autoPlay) resume()
  }, [autoPlay, resume])

  if (slideCount === 0) {
    return null
  }

  const disablePrev = !loop && isFirst
  const disableNext = !loop && isLast

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Slide track */}
      <div className="overflow-hidden rounded-lg">
        <div
          className="flex"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: `transform ${transitionDuration}ms ease-in-out`,
          }}
          aria-live="polite"
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${slideCount}`}
              aria-hidden={index !== currentIndex}
              className="w-full flex-shrink-0"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {showArrows && slideCount > 1 && (
        <>
          <ArrowButton direction="prev" onClick={prev} disabled={disablePrev} />
          <ArrowButton direction="next" onClick={next} disabled={disableNext} />
        </>
      )}

      {/* Dot indicators */}
      {showDots && slideCount > 1 && (
        <DotIndicators count={slideCount} activeIndex={currentIndex} onSelect={goTo} />
      )}
    </div>
  )
}
