'use client'

import { useEffect, useRef, useCallback, type ReactNode, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useTransition, type TransitionState } from './hooks/useTransition'
import { trapFocus } from './utils/a11y'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom'
export type DrawerSize = 'sm' | 'md' | 'lg' | 'full'

export interface DrawerProps {
  /** Whether the drawer is visible */
  readonly isOpen: boolean
  /** Called when the drawer requests to close */
  readonly onClose: () => void
  /** Drawer content */
  readonly children: ReactNode
  /** Slide-in direction (default: 'right') */
  readonly placement?: DrawerPlacement
  /** Size variant (default: 'md') */
  readonly size?: DrawerSize
  /** Whether clicking the backdrop closes the drawer (default: true) */
  readonly closeOnBackdropClick?: boolean
  /** Whether pressing Escape closes the drawer (default: true) */
  readonly closeOnEscape?: boolean
  /** Accessible label for the drawer */
  readonly ariaLabel?: string
  /** Maps to aria-labelledby */
  readonly ariaLabelledBy?: string
  /** Maps to aria-describedby */
  readonly ariaDescribedBy?: string
  /** Transition duration in ms (default: 300) */
  readonly duration?: number
}

// ---------------------------------------------------------------------------
// Sub-component props
// ---------------------------------------------------------------------------

export interface DrawerHeaderProps {
  /** Header content (typically a title) */
  readonly children: ReactNode
  /** Show close button (default: true) */
  readonly showClose?: boolean
  /** Called when close button is clicked */
  readonly onClose?: () => void
}

export interface DrawerBodyProps {
  readonly children: ReactNode
}

export interface DrawerFooterProps {
  readonly children: ReactNode
}

// ---------------------------------------------------------------------------
// Size mapping — fixed pixel widths / heights depending on placement axis
// ---------------------------------------------------------------------------

const HORIZONTAL_SIZES: Record<DrawerSize, string> = {
  sm: '256px',
  md: '384px',
  lg: '512px',
  full: '100%',
}

const VERTICAL_SIZES: Record<DrawerSize, string> = {
  sm: '256px',
  md: '384px',
  lg: '512px',
  full: '100%',
}

// ---------------------------------------------------------------------------
// Slide transform helpers
// ---------------------------------------------------------------------------

function getSlideTransform(placement: DrawerPlacement, state: TransitionState): string {
  const isVisible = state === 'entering' || state === 'entered'

  switch (placement) {
    case 'left':
      return isVisible ? 'translateX(0)' : 'translateX(-100%)'
    case 'right':
      return isVisible ? 'translateX(0)' : 'translateX(100%)'
    case 'top':
      return isVisible ? 'translateY(0)' : 'translateY(-100%)'
    case 'bottom':
      return isVisible ? 'translateY(0)' : 'translateY(100%)'
  }
}

function getPanelStyle(
  placement: DrawerPlacement,
  size: DrawerSize,
  state: TransitionState,
  duration: number,
): CSSProperties {
  const isHorizontal = placement === 'left' || placement === 'right'
  const sizeMap = isHorizontal ? HORIZONTAL_SIZES : VERTICAL_SIZES
  const sizeValue = sizeMap[size]

  const base: CSSProperties = {
    position: 'fixed',
    zIndex: 51,
    transform: getSlideTransform(placement, state),
    transition: `transform ${duration}ms ease`,
    display: 'flex',
    flexDirection: 'column',
  }

  if (isHorizontal) {
    return {
      ...base,
      top: 0,
      bottom: 0,
      width: sizeValue,
      maxWidth: '100%',
      [placement]: 0,
    }
  }

  return {
    ...base,
    left: 0,
    right: 0,
    height: sizeValue,
    maxHeight: '100%',
    [placement]: 0,
  }
}

function getBackdropStyle(state: TransitionState, duration: number): CSSProperties {
  const isVisible = state === 'entering' || state === 'entered'
  return {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    opacity: isVisible ? 1 : 0,
    transition: `opacity ${duration}ms ease`,
  }
}

// ---------------------------------------------------------------------------
// Drawer
// ---------------------------------------------------------------------------

/**
 * Accessible side-panel (Drawer / Sheet) rendered via portal.
 *
 * Features:
 * - Portal rendering (document.body)
 * - Slide animation from left / right / top / bottom
 * - Size variants: sm (256px), md (384px), lg (512px), full
 * - Backdrop with optional click-to-close
 * - Focus trap (Tab/Shift+Tab cycle)
 * - Body scroll lock when open
 * - Escape to close
 *
 * @example
 * ```tsx
 * <Drawer isOpen={isOpen} onClose={close} placement="right" size="md">
 *   <DrawerHeader onClose={close}>Settings</DrawerHeader>
 *   <DrawerBody>...</DrawerBody>
 *   <DrawerFooter><button onClick={close}>Done</button></DrawerFooter>
 * </Drawer>
 * ```
 */
export function Drawer({
  isOpen,
  onClose,
  children,
  placement = 'right',
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  duration = 300,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const { state, isMounted } = useTransition(isOpen, { duration })

  // Escape key handler
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeOnEscape, onClose])

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  // Focus trap + restore previous focus
  useEffect(() => {
    if (!isOpen) return

    previousFocusRef.current = document.activeElement as HTMLElement

    let cleanup: (() => void) | undefined
    const rafId = requestAnimationFrame(() => {
      if (panelRef.current) {
        cleanup = trapFocus(panelRef.current)
      }
    })

    return () => {
      cancelAnimationFrame(rafId)
      cleanup?.()
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdropClick) {
      onClose()
    }
  }, [closeOnBackdropClick, onClose])

  if (!isMounted) return null
  if (typeof document === 'undefined') return null

  const panelStyle = getPanelStyle(placement, size, state, duration)
  const backdropStyle = getBackdropStyle(state, duration)

  return createPortal(
    <>
      {/* Backdrop overlay */}
      <div
        style={backdropStyle}
        onClick={handleBackdropClick}
        aria-hidden="true"
        data-testid="drawer-backdrop"
      />

      {/* Drawer panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        style={panelStyle}
        className="bg-white dark:bg-gray-800 shadow-xl"
        data-testid="drawer-panel"
        data-placement={placement}
      >
        {children}
      </div>
    </>,
    document.body,
  )
}

// ---------------------------------------------------------------------------
// DrawerHeader
// ---------------------------------------------------------------------------

/**
 * Drawer header with optional close button.
 */
export function DrawerHeader({ children, showClose = true, onClose }: DrawerHeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0"
      data-testid="drawer-header"
    >
      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{children}</div>
      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close drawer"
          data-testid="drawer-close-button"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 5L5 15" />
            <path d="M5 5L15 15" />
          </svg>
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DrawerBody
// ---------------------------------------------------------------------------

/**
 * Scrollable body area for drawer content.
 */
export function DrawerBody({ children }: DrawerBodyProps) {
  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-3"
      data-testid="drawer-body"
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DrawerFooter
// ---------------------------------------------------------------------------

/**
 * Footer area for action buttons.
 */
export function DrawerFooter({ children }: DrawerFooterProps) {
  return (
    <div
      className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0"
      data-testid="drawer-footer"
    >
      {children}
    </div>
  )
}

export default Drawer
