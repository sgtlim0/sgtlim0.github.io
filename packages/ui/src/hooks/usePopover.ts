'use client'

import { useState, useRef, useCallback, useEffect, useId, type CSSProperties, type RefObject } from 'react'

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right'
export type PopoverTrigger = 'click' | 'hover'

export interface UsePopoverOptions {
  placement?: PopoverPlacement
  trigger?: PopoverTrigger
  offset?: number
  closeOnOutsideClick?: boolean
}

export interface UsePopoverReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  triggerRef: RefObject<HTMLElement | null>
  popoverRef: RefObject<HTMLDivElement | null>
  triggerProps: Record<string, unknown>
  popoverProps: { id: string; style: CSSProperties; ref: RefObject<HTMLDivElement | null> } & Record<string, unknown>
}

function getPopoverPosition(
  triggerRect: DOMRect,
  popoverRect: DOMRect,
  placement: PopoverPlacement,
  offset: number,
): { top: number; left: number; actualPlacement: PopoverPlacement } {
  let top = 0
  let left = 0
  let actualPlacement = placement

  switch (placement) {
    case 'top':
      top = triggerRect.top - popoverRect.height - offset
      left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2
      break
    case 'bottom':
      top = triggerRect.bottom + offset
      left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2
      break
    case 'left':
      top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2
      left = triggerRect.left - popoverRect.width - offset
      break
    case 'right':
      top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2
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
    } else if (top + popoverRect.height > viewportHeight && placement === 'bottom') {
      top = triggerRect.top - popoverRect.height - offset
      actualPlacement = 'top'
    }

    if (left < 0 && placement === 'left') {
      left = triggerRect.right + offset
      actualPlacement = 'right'
    } else if (left + popoverRect.width > viewportWidth && placement === 'right') {
      left = triggerRect.left - popoverRect.width - offset
      actualPlacement = 'left'
    }

    // Clamp to viewport edges
    left = Math.max(4, Math.min(left, viewportWidth - popoverRect.width - 4))
    top = Math.max(4, Math.min(top, viewportHeight - popoverRect.height - 4))
  }

  return { top, left, actualPlacement }
}

/**
 * Hook for popover positioning and visibility management.
 * Unlike useTooltip, supports interactive content with click/hover triggers
 * and outside-click dismissal.
 * SSR-safe: always returns isOpen=false on the server.
 */
export function usePopover(options: UsePopoverOptions = {}): UsePopoverReturn {
  const {
    placement = 'bottom',
    trigger = 'click',
    offset = 8,
    closeOnOutsideClick = true,
  } = options

  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  const triggerRef = useRef<HTMLElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const popoverId = useId()

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  // Update position when open
  useEffect(() => {
    if (!isOpen) return

    const triggerEl = triggerRef.current
    const popoverEl = popoverRef.current
    if (!triggerEl || !popoverEl) return

    const triggerRect = triggerEl.getBoundingClientRect()
    const popoverRect = popoverEl.getBoundingClientRect()

    const { top, left } = getPopoverPosition(triggerRect, popoverRect, placement, offset)
    setPosition({ top, left })
  }, [isOpen, placement, offset])

  // Outside click handler
  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        close()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, closeOnOutsideClick, close])

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, close])

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Build trigger props based on trigger type
  const triggerProps: Record<string, unknown> = {
    ref: triggerRef,
    'aria-expanded': isOpen,
    'aria-haspopup': true,
    'aria-controls': isOpen ? popoverId : undefined,
  }

  if (trigger === 'click') {
    triggerProps.onClick = toggle
  } else {
    // hover trigger
    triggerProps.onMouseEnter = () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = null
      }
      open()
    }
    triggerProps.onMouseLeave = () => {
      hoverTimeoutRef.current = setTimeout(() => {
        close()
      }, 150)
    }
  }

  // Build popover props
  const popoverProps: { style: CSSProperties; ref: RefObject<HTMLDivElement | null> } & Record<string, unknown> = {
    ref: popoverRef,
    style: {
      position: 'fixed' as const,
      top: `${position.top}px`,
      left: `${position.left}px`,
      zIndex: 9999,
    },
  }

  // For hover trigger, keep popover open while hovering over it
  if (trigger === 'hover') {
    popoverProps.onMouseEnter = () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = null
      }
    }
    popoverProps.onMouseLeave = () => {
      hoverTimeoutRef.current = setTimeout(() => {
        close()
      }, 150)
    }
  }

  return {
    isOpen,
    open,
    close,
    toggle,
    triggerRef,
    popoverRef,
    triggerProps,
    popoverProps: {
      ...popoverProps,
      id: popoverId,
    },
  }
}
