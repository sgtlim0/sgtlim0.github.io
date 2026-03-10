'use client'

import { useState, useCallback, useRef } from 'react'

export type AlertDialogVariant = 'info' | 'warning' | 'danger' | 'confirm'

export interface AlertDialogOptions {
  /** Dialog title */
  readonly title: string
  /** Dialog message body */
  readonly message: string
  /** Variant determines icon and confirm button style (default: 'confirm') */
  readonly variant?: AlertDialogVariant
  /** Confirm button label (default: '확인') */
  readonly confirmLabel?: string
  /** Cancel button label (default: '취소') */
  readonly cancelLabel?: string
}

export interface UseAlertDialogReturn {
  /** Whether the dialog is currently open */
  readonly isOpen: boolean
  /** Open the dialog and await user response */
  readonly confirm: (options: AlertDialogOptions) => Promise<boolean>
  /** Programmatically close the dialog (resolves as cancel) */
  readonly close: () => void
  /** Current dialog options (null when closed) */
  readonly options: AlertDialogOptions | null
  /** Resolve with true (confirm) — used internally by AlertDialog */
  readonly handleConfirm: () => void
  /** Resolve with false (cancel) — used internally by AlertDialog */
  readonly handleCancel: () => void
}

/**
 * Hook for managing a Promise-based alert dialog.
 *
 * @example
 * ```tsx
 * const { isOpen, confirm, close, options, handleConfirm, handleCancel } = useAlertDialog()
 *
 * const handleDelete = async () => {
 *   const ok = await confirm({
 *     title: '삭제 확인',
 *     message: '정말 삭제하시겠습니까?',
 *     variant: 'danger',
 *   })
 *   if (ok) deleteItem()
 * }
 * ```
 */
export function useAlertDialog(): UseAlertDialogReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<AlertDialogOptions | null>(null)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: AlertDialogOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
      setOptions(opts)
      setIsOpen(true)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    resolverRef.current?.(true)
    resolverRef.current = null
    setIsOpen(false)
    setOptions(null)
  }, [])

  const handleCancel = useCallback(() => {
    resolverRef.current?.(false)
    resolverRef.current = null
    setIsOpen(false)
    setOptions(null)
  }, [])

  const close = useCallback(() => {
    handleCancel()
  }, [handleCancel])

  return { isOpen, confirm, close, options, handleConfirm, handleCancel }
}
