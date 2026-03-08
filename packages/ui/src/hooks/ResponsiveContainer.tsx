'use client'

import { type ReactNode } from 'react'
import { useBreakpoint, type Breakpoint, BREAKPOINTS } from './useBreakpoint'

export interface ResponsiveContainerProps {
  children: ReactNode
  /** Render only when viewport width >= this breakpoint */
  above?: Breakpoint
  /** Render only when viewport width < this breakpoint */
  below?: Breakpoint
}

/**
 * Conditionally renders children based on the current viewport breakpoint.
 *
 * ```tsx
 * <ResponsiveContainer above="md">Desktop only</ResponsiveContainer>
 * <ResponsiveContainer below="sm">Mobile only</ResponsiveContainer>
 * ```
 */
export function ResponsiveContainer({
  children,
  above,
  below,
}: ResponsiveContainerProps): ReactNode {
  const { width } = useBreakpoint()

  if (above !== undefined && width < BREAKPOINTS[above]) {
    return null
  }

  if (below !== undefined && width >= BREAKPOINTS[below]) {
    return null
  }

  return children
}
