'use client'

import { useEffect, useRef, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { AlertDialogVariant } from './hooks/useAlertDialog'

export interface AlertDialogProps {
  /** Whether the dialog is visible */
  readonly isOpen: boolean
  /** Dialog title */
  readonly title: string
  /** Dialog message */
  readonly message: string
  /** Variant (default: 'confirm') */
  readonly variant?: AlertDialogVariant
  /** Confirm button label (default: '확인') */
  readonly confirmLabel?: string
  /** Cancel button label (default: '취소') */
  readonly cancelLabel?: string
  /** Called when user confirms */
  readonly onConfirm: () => void
  /** Called when user cancels */
  readonly onCancel: () => void
  /** Optional children rendered between message and buttons */
  readonly children?: ReactNode
}

// ---------------------------------------------------------------------------
// Icons (inline SVG to avoid external deps)
// ---------------------------------------------------------------------------

function InfoIcon() {
  return (
    <svg
      className="h-6 w-6 text-blue-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg
      className="h-6 w-6 text-amber-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function DangerIcon() {
  return (
    <svg
      className="h-6 w-6 text-red-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

function ConfirmIcon() {
  return (
    <svg
      className="h-6 w-6 text-green-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

const VARIANT_ICON: Record<AlertDialogVariant, () => ReactNode> = {
  info: InfoIcon,
  warning: WarningIcon,
  danger: DangerIcon,
  confirm: ConfirmIcon,
}

const CONFIRM_BUTTON_CLASSES: Record<AlertDialogVariant, string> = {
  info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
  warning: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white',
  danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
  confirm: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
}

/**
 * Accessible alert dialog for confirmations.
 *
 * Uses `role="alertdialog"` with `aria-modal="true"`.
 * Confirm button receives autoFocus. Escape key cancels.
 * Focus is trapped within the dialog.
 *
 * @example
 * ```tsx
 * <AlertDialog
 *   isOpen={isOpen}
 *   title="Delete item?"
 *   message="This action cannot be undone."
 *   variant="danger"
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export function AlertDialog({
  isOpen,
  title,
  message,
  variant = 'confirm',
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
  children,
}: AlertDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const confirmBtnRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Save and restore focus
  useEffect(() => {
    if (!isOpen) return

    previousFocusRef.current = document.activeElement as HTMLElement

    // Auto-focus confirm button
    const rafId = requestAnimationFrame(() => {
      confirmBtnRef.current?.focus()
    })

    return () => {
      cancelAnimationFrame(rafId)
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  // Focus trap (Tab / Shift+Tab)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [],
  )

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  if (!isOpen) return null
  if (typeof document === 'undefined') return null

  const IconComponent = VARIANT_ICON[variant]

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      data-testid="alertdialog-backdrop"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alertdialog-title"
        aria-describedby="alertdialog-message"
        className="relative z-10 w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl m-4 p-6"
        onKeyDown={handleKeyDown}
        data-testid="alertdialog-panel"
      >
        {/* Header with icon */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5" data-testid="alertdialog-icon">
            <IconComponent />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              id="alertdialog-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
              data-testid="alertdialog-title"
            >
              {title}
            </h2>
            <p
              id="alertdialog-message"
              className="mt-2 text-sm text-gray-600 dark:text-gray-400"
              data-testid="alertdialog-message"
            >
              {message}
            </p>
          </div>
        </div>

        {/* Optional children */}
        {children && <div className="mt-4">{children}</div>}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
            data-testid="alertdialog-cancel"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 ${CONFIRM_BUTTON_CLASSES[variant]}`}
            data-testid="alertdialog-confirm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default AlertDialog
