'use client'

import { useEffect, useRef, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTransition } from './hooks/useTransition'
import { trapFocus } from './utils/a11y'

export type ModalSize = 'sm' | 'md' | 'lg' | 'full'

export interface ModalProps {
  /** Whether the modal is visible */
  readonly isOpen: boolean
  /** Called when the modal requests to close */
  readonly onClose: () => void
  /** Modal content */
  readonly children: ReactNode
  /** Size variant (default: 'md') */
  readonly size?: ModalSize
  /** Whether clicking the backdrop closes the modal (default: true) */
  readonly closeOnBackdropClick?: boolean
  /** Whether pressing Escape closes the modal (default: true) */
  readonly closeOnEscape?: boolean
  /** Accessible label — maps to aria-labelledby */
  readonly ariaLabelledBy?: string
  /** Accessible description — maps to aria-describedby */
  readonly ariaDescribedBy?: string
  /** Transition duration in ms (default: 200) */
  readonly duration?: number
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  full: 'max-w-full mx-0 min-h-screen rounded-none',
}

/**
 * Accessible modal dialog rendered via portal.
 *
 * Features:
 * - Portal rendering (document.body)
 * - Backdrop with optional click-to-close
 * - Focus trap (Tab/Shift+Tab cycle within modal)
 * - Enter/exit transition animation
 * - Body scroll lock when open
 * - Size variants: sm, md, lg, full
 *
 * @example
 * ```tsx
 * <Modal isOpen={isOpen} onClose={close} ariaLabelledBy="title">
 *   <h2 id="title">Hello</h2>
 * </Modal>
 * ```
 */
export function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  ariaLabelledBy,
  ariaDescribedBy,
  duration = 200,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const { isMounted, style } = useTransition(isOpen, { duration })

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
      if (dialogRef.current) {
        cleanup = trapFocus(dialogRef.current)
      }
    })

    return () => {
      cancelAnimationFrame(rafId)
      cleanup?.()
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        onClose()
      }
    },
    [closeOnBackdropClick, onClose],
  )

  if (!isMounted) return null

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={style}
      onClick={handleBackdropClick}
      data-testid="modal-backdrop"
    >
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        className={`relative z-10 w-full ${SIZE_CLASSES[size]} bg-white dark:bg-gray-800 rounded-lg shadow-xl m-4 max-h-[90vh] overflow-y-auto`}
        data-testid="modal-dialog"
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

export default Modal
