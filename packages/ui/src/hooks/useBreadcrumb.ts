'use client'

import { useMemo } from 'react'
import type { BreadcrumbItem } from '../Breadcrumb'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseBreadcrumbConfig {
  /** Map pathname segments to custom labels: { '/admin': 'Admin Panel' } */
  labelMap?: Record<string, string>
  /** Include home as the first breadcrumb item (default true) */
  includeHome?: boolean
  /** Label for the home item (default 'Home') */
  homeLabel?: string
  /** Href for the home item (default '/') */
  homeHref?: string
}

export interface UseBreadcrumbReturn {
  items: BreadcrumbItem[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(segment: string): string {
  if (segment.length === 0) return segment
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

function segmentToLabel(segment: string): string {
  // Convert kebab-case or snake_case to Title Case
  return segment
    .split(/[-_]/)
    .map(capitalize)
    .join(' ')
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useBreadcrumb(
  pathname: string,
  config: UseBreadcrumbConfig = {},
): UseBreadcrumbReturn {
  const {
    labelMap = {},
    includeHome = true,
    homeLabel = 'Home',
    homeHref = '/',
  } = config

  const items = useMemo(() => {
    const breadcrumbs: BreadcrumbItem[] = []

    if (includeHome) {
      breadcrumbs.push({ label: homeLabel, href: homeHref })
    }

    // Normalize: remove trailing slash, split by '/'
    const normalized = pathname.replace(/\/+$/, '')
    if (!normalized || normalized === '/') {
      // On the home page, return home as current (no href)
      if (includeHome) {
        return [{ label: homeLabel }]
      }
      return []
    }

    const segments = normalized.split('/').filter(Boolean)

    segments.forEach((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      const isLast = index === segments.length - 1

      // Check labelMap with full path first, then segment
      const label = labelMap[href] ?? labelMap[segment] ?? segmentToLabel(segment)

      breadcrumbs.push({
        label,
        href: isLast ? undefined : href,
      })
    })

    return breadcrumbs
  }, [pathname, labelMap, includeHome, homeLabel, homeHref])

  return { items }
}
