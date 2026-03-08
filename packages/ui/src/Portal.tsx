'use client'

import { type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { usePortal } from './hooks/usePortal'

export interface PortalProps {
  /** Content to render inside the portal */
  children: ReactNode
  /** Custom container element ID (default: 'hchat-portal-root') */
  containerId?: string
}

/**
 * Renders children into a DOM node outside the parent component hierarchy.
 * Uses React.createPortal so event bubbling through the React tree is preserved.
 * SSR-safe: renders nothing on the server.
 */
export function Portal({ children, containerId }: PortalProps) {
  const { portalRef, isMounted } = usePortal(containerId)

  if (!isMounted || !portalRef) {
    return null
  }

  return createPortal(children, portalRef)
}

export default Portal
