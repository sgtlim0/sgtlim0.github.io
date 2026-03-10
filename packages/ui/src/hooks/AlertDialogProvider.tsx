'use client'

import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useAlertDialog, type AlertDialogOptions } from './useAlertDialog'
import { AlertDialog } from '../AlertDialog'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AlertDialogContextValue {
  /** Show an alert dialog and return a Promise that resolves to true (confirm) or false (cancel) */
  readonly confirm: (options: AlertDialogOptions) => Promise<boolean>
}

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface AlertDialogProviderProps {
  readonly children: ReactNode
}

/**
 * Provides a global `useConfirm()` hook for showing alert dialogs from anywhere.
 *
 * @example
 * ```tsx
 * <AlertDialogProvider>
 *   <App />
 * </AlertDialogProvider>
 * ```
 */
export function AlertDialogProvider({ children }: AlertDialogProviderProps) {
  const { isOpen, confirm, options, handleConfirm, handleCancel } = useAlertDialog()

  const contextValue: AlertDialogContextValue = { confirm }

  return (
    <AlertDialogContext.Provider value={contextValue}>
      {children}
      {isOpen && options && (
        <AlertDialog
          isOpen={isOpen}
          title={options.title}
          message={options.message}
          variant={options.variant}
          confirmLabel={options.confirmLabel}
          cancelLabel={options.cancelLabel}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </AlertDialogContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

/**
 * Access the global confirm dialog from any component inside an AlertDialogProvider.
 *
 * @example
 * ```tsx
 * const confirm = useConfirm()
 *
 * const handleDelete = async () => {
 *   const ok = await confirm({
 *     title: '삭제',
 *     message: '정말 삭제하시겠습니까?',
 *     variant: 'danger',
 *   })
 *   if (ok) performDelete()
 * }
 * ```
 */
export function useConfirm(): (options: AlertDialogOptions) => Promise<boolean> {
  const ctx = useContext(AlertDialogContext)
  if (!ctx) {
    throw new Error('useConfirm must be used within an <AlertDialogProvider>')
  }
  return ctx.confirm
}
