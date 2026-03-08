'use client'

import { useState, useRef, useCallback, useEffect, useId } from 'react'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface UseTooltipOptions {
  placement?: TooltipPlacement
  delay?: number
  offset?: number
}

export interface UseTooltipReturn {
  isVisible: boolean
  triggerProps: {
    onMouseEnter: () => void
    onMouseLeave: () => void
    onFocus: () => void
    onBlur: () => void
    ref: React.RefObject<HTMLElement | null>
    'aria-describedby': string | undefined
  }
  tooltipProps: {
    id: string
    role: 'tooltip'
    style: React.CSSProperties
    ref: React.RefObject<HTMLDivElement | null>
  }
}

function getTooltipPosition(
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  placement: TooltipPlacement,
  offset: number,
): { top: number; left: number; actualPlacement: TooltipPlacement } {
  let top = 0
  let left = 0
  let actualPlacement = placement

  switch (placement) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - offset
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'bottom':
      top = triggerRect.bottom + offset
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'left':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.left - tooltipRect.width - offset
      break
    case 'right':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.right + offset
      break
  }

  // Viewport boundary check — flip if out of bounds
  if (typeof window !== 'undefined') {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    if (top < 0 && placement === 'top') {
      top = triggerRect.bottom + offset
      actualPlacement = 'bottom'
    } else if (top + tooltipRect.height > viewportHeight && placement === 'bottom') {
      top = triggerRect.top - tooltipRect.height - offset
      actualPlacement = 'top'
    }

    if (left < 0 && placement === 'left') {
      left = triggerRect.right + offset
      actualPlacement = 'right'
    } else if (left + tooltipRect.width > viewportWidth && placement === 'right') {
      left = triggerRect.left - tooltipRect.width - offset
      actualPlacement = 'left'
    }

    // Clamp to viewport edges
    left = Math.max(4, Math.min(left, viewportWidth - tooltipRect.width - 4))
    top = Math.max(4, Math.min(top, viewportHeight - tooltipRect.height - 4))
  }

  return { top, left, actualPlacement }
}

/**
 * Hook for tooltip positioning and visibility management.
 * SSR-safe: always returns isVisible=false on the server.
 */
export function useTooltip(options: UseTooltipOptions = {}): UseTooltipReturn {
  const { placement = 'top', delay = 200, offset = 8 } = options

  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  const triggerRef = useRef<HTMLElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tooltipId = useId()

  const show = useCallback(() => {
    delayTimerRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }, [delay])

  const hide = useCallback(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current)
      delayTimerRef.current = null
    }
    setIsVisible(false)
  }, [])

  // Update position when visible
  useEffect(() => {
    if (!isVisible) return

    const trigger = triggerRef.current
    const tooltip = tooltipRef.current
    if (!trigger || !tooltip) return

    const triggerRect = trigger.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()

    const { top, left } = getTooltipPosition(triggerRect, tooltipRect, placement, offset)
    setPosition({ top, left })
  }, [isVisible, placement, offset])

  // Escape key handler
  useEffect(() => {
    if (!isVisible) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hide()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVisible, hide])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current)
      }
    }
  }, [])

  return {
    isVisible,
    triggerProps: {
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: show,
      onBlur: hide,
      ref: triggerRef,
      'aria-describedby': isVisible ? tooltipId : undefined,
    },
    tooltipProps: {
      id: tooltipId,
      role: 'tooltip' as const,
      style: {
        position: 'fixed' as const,
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
        pointerEvents: 'none' as const,
      },
      ref: tooltipRef,
    },
  }
}
