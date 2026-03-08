'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: '/' | '>' | string
  className?: string
  jsonLd?: boolean
}

// ---------------------------------------------------------------------------
// BreadcrumbProvider Context
// ---------------------------------------------------------------------------

interface BreadcrumbContextValue {
  items: BreadcrumbItem[]
  setItems: (items: BreadcrumbItem[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null)

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [items, setItemsState] = useState<BreadcrumbItem[]>([])

  const setItems = useCallback((newItems: BreadcrumbItem[]) => {
    setItemsState(newItems)
  }, [])

  const value = useMemo(() => ({ items, setItems }), [items, setItems])

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumbContext(): BreadcrumbContextValue {
  const ctx = useContext(BreadcrumbContext)
  if (!ctx) {
    throw new Error('useBreadcrumbContext must be used within a BreadcrumbProvider')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// JSON-LD Structured Data
// ---------------------------------------------------------------------------

function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: item.href } : {}),
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// ---------------------------------------------------------------------------
// Breadcrumb Component
// ---------------------------------------------------------------------------

export default function Breadcrumb({
  items,
  separator = '/',
  className = '',
  jsonLd = false,
}: BreadcrumbProps) {
  if (items.length === 0) {
    return null
  }

  const isCollapsible = items.length > 2

  return (
    <>
      {jsonLd && <BreadcrumbJsonLd items={items} />}
      <nav aria-label="breadcrumb" className={`text-sm ${className}`.trim()}>
        <ol className="flex items-center flex-wrap gap-1">
          {items.map((item, index) => {
            const isFirst = index === 0
            const isLast = index === items.length - 1
            const isMiddle = !isFirst && !isLast

            // Middle items hidden on mobile when collapsible (>2 items)
            const hiddenOnMobile = isCollapsible && isMiddle
              ? 'hidden sm:flex'
              : 'flex'

            return (
              <li
                key={`${item.label}-${index}`}
                className={`${hiddenOnMobile} items-center gap-1`}
              >
                {/* Separator (before all items except the first) */}
                {index > 0 && (
                  <span
                    className="mx-1"
                    style={{ color: 'var(--text-tertiary, #9ca3af)' }}
                    aria-hidden="true"
                  >
                    {separator}
                  </span>
                )}

                {/* Item */}
                {isLast ? (
                  <span
                    aria-current="page"
                    className="font-medium"
                    style={{ color: 'var(--text-primary, #111827)' }}
                  >
                    {item.icon && <span className="inline-flex mr-1 align-middle">{item.icon}</span>}
                    {item.label}
                  </span>
                ) : item.href ? (
                  <a
                    href={item.href}
                    className="transition-colors duration-150 hover:underline"
                    style={{ color: 'var(--text-secondary, #6b7280)' }}
                  >
                    {item.icon && <span className="inline-flex mr-1 align-middle">{item.icon}</span>}
                    {item.label}
                  </a>
                ) : (
                  <span
                    style={{ color: 'var(--text-secondary, #6b7280)' }}
                  >
                    {item.icon && <span className="inline-flex mr-1 align-middle">{item.icon}</span>}
                    {item.label}
                  </span>
                )}
              </li>
            )
          })}

          {/* Ellipsis for mobile (visible only on small screens when collapsed) */}
          {isCollapsible && (
            <li
              className="flex sm:hidden items-center gap-1"
              aria-hidden="true"
              style={{ order: 1 }}
            >
              <span
                className="mx-1"
                style={{ color: 'var(--text-tertiary, #9ca3af)' }}
              >
                {separator}
              </span>
              <span style={{ color: 'var(--text-tertiary, #9ca3af)' }}>...</span>
            </li>
          )}
        </ol>
      </nav>
    </>
  )
}
