'use client'

import { useState, useEffect, useRef } from 'react'

const DEFAULT_PORTAL_ID = 'hchat-portal-root'

/**
 * Creates and manages a portal container element in the DOM.
 * SSR-safe: returns null portalRef and isMounted false on the server.
 *
 * @param containerId - Optional custom container element ID (default: 'hchat-portal-root')
 * @returns portalRef (the DOM element) and isMounted flag
 */
export function usePortal(containerId?: string): {
  portalRef: HTMLElement | null
  isMounted: boolean
} {
  const id = containerId ?? DEFAULT_PORTAL_ID
  const [isMounted, setIsMounted] = useState(false)
  const elRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof document === 'undefined') return

    let container = document.getElementById(id)
    let created = false

    if (!container) {
      container = document.createElement('div')
      container.id = id
      container.style.cssText = 'position:relative;z-index:var(--portal-z, 9999)'
      document.body.appendChild(container)
      created = true
    }

    elRef.current = container
    setIsMounted(true)

    return () => {
      if (created && container && container.parentNode && container.childNodes.length === 0) {
        container.parentNode.removeChild(container)
      }
      elRef.current = null
      setIsMounted(false)
    }
  }, [id])

  return { portalRef: elRef.current, isMounted }
}

export { DEFAULT_PORTAL_ID }
