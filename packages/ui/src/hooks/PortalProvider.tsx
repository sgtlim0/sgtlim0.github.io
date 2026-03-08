'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const DEFAULT_CONTAINERS = ['hchat-portal-root', 'modal-root', 'tooltip-root']

interface PortalContextValue {
  /** Returns the container element for the given ID, or null if not yet mounted */
  getContainer: (id: string) => HTMLElement | null
  /** Whether the provider has mounted (SSR guard) */
  isMounted: boolean
}

const PortalContext = createContext<PortalContextValue>({
  getContainer: () => null,
  isMounted: false,
})

export function usePortalContext(): PortalContextValue {
  return useContext(PortalContext)
}

export interface PortalProviderProps {
  /** Child components */
  children: ReactNode
  /** Container IDs to pre-create (default: hchat-portal-root, modal-root, tooltip-root) */
  containerIds?: string[]
}

/**
 * Global portal container manager.
 * Pre-creates shared portal containers so multiple Portal components
 * can target the same container without creating duplicates.
 * SSR-safe: containers are only created after mount.
 */
export function PortalProvider({ children, containerIds }: PortalProviderProps) {
  const ids = containerIds ?? DEFAULT_CONTAINERS
  const [isMounted, setIsMounted] = useState(false)
  const [containers, setContainers] = useState<Map<string, HTMLElement>>(new Map())

  useEffect(() => {
    if (typeof document === 'undefined') return

    const created: HTMLElement[] = []
    const map = new Map<string, HTMLElement>()

    for (const id of ids) {
      let el = document.getElementById(id)
      if (!el) {
        el = document.createElement('div')
        el.id = id
        el.style.cssText = 'position:relative;z-index:var(--portal-z, 9999)'
        document.body.appendChild(el)
        created.push(el)
      }
      map.set(id, el)
    }

    setContainers(map)
    setIsMounted(true)

    return () => {
      for (const el of created) {
        if (el.parentNode && el.childNodes.length === 0) {
          el.parentNode.removeChild(el)
        }
      }
      setContainers(new Map())
      setIsMounted(false)
    }
  }, [ids.join(',')])

  const getContainer = (id: string): HTMLElement | null => {
    return containers.get(id) ?? null
  }

  return (
    <PortalContext.Provider value={{ getContainer, isMounted }}>
      {children}
    </PortalContext.Provider>
  )
}

export { DEFAULT_CONTAINERS }
