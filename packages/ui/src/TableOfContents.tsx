'use client'

import React, { useMemo } from 'react'
import { useTableOfContents } from './hooks/useTableOfContents'
import type {
  TocItem,
  UseTableOfContentsOptions,
} from './hooks/useTableOfContents'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TableOfContentsProps {
  /** Override auto-detected items (useful for SSR or custom headings) */
  readonly items?: readonly TocItem[]
  /** Hook options (selector, containerRef, activeOffset) */
  readonly options?: UseTableOfContentsOptions
  /** Display variant */
  readonly variant?: 'sidebar' | 'inline'
  /** Additional CSS class names */
  readonly className?: string
  /** Title displayed above the list (default: "Table of Contents") */
  readonly title?: string
  /** Whether to show the title (default: true) */
  readonly showTitle?: boolean
}

// ---------------------------------------------------------------------------
// Indent styles by heading level
// ---------------------------------------------------------------------------

const LEVEL_PADDING: Record<number, string> = {
  1: 'pl-0',
  2: 'pl-0',
  3: 'pl-4',
  4: 'pl-8',
  5: 'pl-12',
  6: 'pl-16',
}

function getPadding(level: number): string {
  return LEVEL_PADDING[level] ?? 'pl-0'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Accessible table-of-contents navigation component.
 *
 * Extracts headings from the DOM (or accepts pre-built items),
 * highlights the active heading based on scroll position, and
 * provides smooth-scroll on click.
 *
 * Supports `sidebar` (sticky) and `inline` variants.
 *
 * @example
 * ```tsx
 * <TableOfContents
 *   options={{ selector: 'h2, h3', activeOffset: 80 }}
 *   variant="sidebar"
 * />
 * ```
 */
export default function TableOfContents({
  items: externalItems,
  options,
  variant = 'inline',
  className = '',
  title = 'Table of Contents',
  showTitle = true,
}: TableOfContentsProps) {
  const {
    items: hookItems,
    activeId,
    scrollTo,
  } = useTableOfContents(options)

  const displayItems = externalItems ?? hookItems

  const wrapperClass = useMemo(() => {
    const base = 'text-sm'
    const variantClass =
      variant === 'sidebar' ? 'sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto' : ''
    return `${base} ${variantClass} ${className}`.trim()
  }, [variant, className])

  if (displayItems.length === 0) {
    return null
  }

  return (
    <nav
      role="navigation"
      aria-label="Table of Contents"
      className={wrapperClass}
      data-testid="table-of-contents"
    >
      {showTitle && (
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {title}
        </h2>
      )}
      <ul className="space-y-1 border-l border-gray-200 dark:border-gray-700">
        {displayItems.map((item) => {
          const isActive = item.id === activeId
          return (
            <li key={item.id} className={getPadding(item.level)}>
              <button
                type="button"
                onClick={() => scrollTo(item.id)}
                aria-current={isActive ? 'location' : undefined}
                className={`
                  block w-full border-l-2 py-1 pl-3 text-left transition-colors
                  ${
                    isActive
                      ? 'border-blue-500 font-medium text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                  }
                `}
              >
                {item.text}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
