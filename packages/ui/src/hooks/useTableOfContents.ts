'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { RefObject } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TocItem {
  /** Heading element id attribute */
  readonly id: string
  /** Text content of the heading */
  readonly text: string
  /** Heading level (1–6) */
  readonly level: number
}

export interface UseTableOfContentsOptions {
  /** CSS selector for headings (default: 'h1, h2, h3, h4') */
  readonly selector?: string
  /** Container element ref to scope heading search (default: document) */
  readonly containerRef?: RefObject<HTMLElement | null>
  /** Scroll offset in pixels for active detection (default: 100) */
  readonly activeOffset?: number
}

export interface UseTableOfContentsReturn {
  /** Extracted heading items */
  readonly items: readonly TocItem[]
  /** Currently active heading id (null if none) */
  readonly activeId: string | null
  /** Smooth-scroll to a heading by id */
  scrollTo: (id: string) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractHeadings(
  selector: string,
  container: HTMLElement | Document,
): TocItem[] {
  const elements = container.querySelectorAll<HTMLHeadingElement>(selector)
  const items: TocItem[] = []

  elements.forEach((el) => {
    const id = el.id
    if (!id) return

    const text = el.textContent?.trim() ?? ''
    if (!text) return

    const tagLevel = parseInt(el.tagName.charAt(1), 10)
    items.push({ id, text, level: tagLevel })
  })

  return items
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook that extracts a table-of-contents structure from headings in the DOM,
 * tracks the currently visible heading via IntersectionObserver, and provides
 * a smooth-scroll helper.
 *
 * SSR-safe: returns empty items and null activeId on the server.
 *
 * @example
 * ```tsx
 * const { items, activeId, scrollTo } = useTableOfContents({
 *   selector: 'h2, h3',
 *   activeOffset: 80,
 * })
 * ```
 */
export function useTableOfContents(
  options: UseTableOfContentsOptions = {},
): UseTableOfContentsReturn {
  const {
    selector = 'h1, h2, h3, h4',
    containerRef,
    activeOffset = 100,
  } = options

  const [items, setItems] = useState<readonly TocItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const headingElementsRef = useRef<Map<string, IntersectionObserverEntry>>(
    new Map(),
  )

  // Scan headings from the DOM
  useEffect(() => {
    if (typeof document === 'undefined') return

    const container = containerRef?.current ?? document
    const extracted = extractHeadings(selector, container)
    setItems(extracted)
  }, [selector, containerRef])

  // Track active heading via IntersectionObserver
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    if (items.length === 0) return

    const headingElements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)

    if (headingElements.length === 0) return

    headingElementsRef.current = new Map()

    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        headingElementsRef.current.set(entry.target.id, entry)
      })

      // Find the topmost visible heading
      const visibleEntries = Array.from(headingElementsRef.current.values())
        .filter((entry) => entry.isIntersecting)
        .sort(
          (a, b) =>
            a.target.getBoundingClientRect().top -
            b.target.getBoundingClientRect().top,
        )

      if (visibleEntries.length > 0) {
        setActiveId(visibleEntries[0].target.id)
      }
    }

    const observer = new IntersectionObserver(callback, {
      rootMargin: `-${activeOffset}px 0px -66% 0px`,
    })

    headingElements.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
    }
  }, [items, activeOffset])

  // Smooth-scroll to a heading by id
  const scrollTo = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (!element) return

    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return { items, activeId, scrollTo }
}
