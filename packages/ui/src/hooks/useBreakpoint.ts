'use client'

import { useMemo } from 'react'
import { useWindowSize } from './useWindowSize'

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/** Synced with Tailwind CSS 4 default breakpoints */
export const BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

const ORDERED: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']

function resolveBreakpoint(width: number): Breakpoint {
  for (let i = ORDERED.length - 1; i >= 0; i--) {
    if (width >= BREAKPOINTS[ORDERED[i]]) {
      return ORDERED[i]
    }
  }
  return 'xs'
}

export interface UseBreakpointReturn {
  breakpoint: Breakpoint
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isAbove: (bp: Breakpoint) => boolean
  isBelow: (bp: Breakpoint) => boolean
  width: number
}

/**
 * Returns the current Tailwind breakpoint and convenience helpers.
 * SSR-safe: defaults to lg / isDesktop: true.
 */
export function useBreakpoint(): UseBreakpointReturn {
  const { width } = useWindowSize()

  return useMemo(() => {
    const breakpoint = resolveBreakpoint(width)

    const isAbove = (bp: Breakpoint): boolean => width >= BREAKPOINTS[bp]
    const isBelow = (bp: Breakpoint): boolean => width < BREAKPOINTS[bp]

    return {
      breakpoint,
      isMobile: breakpoint === 'xs' || breakpoint === 'sm',
      isTablet: breakpoint === 'md',
      isDesktop: isAbove('lg'),
      isAbove,
      isBelow,
      width,
    }
  }, [width])
}
