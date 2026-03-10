'use client'

import { useState, useCallback } from 'react'

export interface UseDrawerOptions {
  /** Initial open state (default: false) */
  readonly initialOpen?: boolean
  /** Callback fired when the drawer opens */
  readonly onOpen?: () => void
  /** Callback fired when the drawer closes */
  readonly onClose?: () => void
}

export interface UseDrawerReturn {
  /** Whether the drawer is currently open */
  readonly isOpen: boolean
  /** Open the drawer */
  readonly open: () => void
  /** Close the drawer */
  readonly close: () => void
  /** Toggle drawer open/close */
  readonly toggle: () => void
}

/**
 * Simple boolean toggle hook for a Drawer / Sheet component.
 *
 * Similar to `useModal` but supports optional onOpen/onClose callbacks
 * that fire when the state changes.
 *
 * @example
 * ```tsx
 * const { isOpen, open, close } = useDrawer({ onOpen: () => track('drawer_open') })
 * return (
 *   <>
 *     <button onClick={open}>Menu</button>
 *     <Drawer isOpen={isOpen} onClose={close} placement="left">Content</Drawer>
 *   </>
 * )
 * ```
 */
export function useDrawer(options: UseDrawerOptions = {}): UseDrawerReturn {
  const { initialOpen = false, onOpen, onClose } = options
  const [isOpen, setIsOpen] = useState(initialOpen)

  const open = useCallback(() => {
    setIsOpen(true)
    onOpen?.()
  }, [onOpen])

  const close = useCallback(() => {
    setIsOpen(false)
    onClose?.()
  }, [onClose])

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev
      if (next) {
        onOpen?.()
      } else {
        onClose?.()
      }
      return next
    })
  }, [onOpen, onClose])

  return { isOpen, open, close, toggle }
}
