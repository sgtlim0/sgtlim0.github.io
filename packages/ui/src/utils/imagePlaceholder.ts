/**
 * Image placeholder utilities for loading states.
 *
 * Provides CSS shimmer placeholders and base64 blur data URLs
 * to improve perceived performance while images load.
 */

/**
 * Generates a tiny transparent SVG encoded as a base64 data URL.
 * Used as the default blurDataURL for OptimizedImage.
 */
export function generateBlurDataURL(
  width: number,
  height: number,
  color = '#e5e7eb'
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${color}"/></svg>`
  return `data:image/svg+xml;base64,${typeof btoa === 'function' ? btoa(svg) : Buffer.from(svg).toString('base64')}`
}

/**
 * CSS keyframe animation string for a shimmer loading effect.
 * Can be injected as an inline style or in a <style> tag.
 */
export const SHIMMER_KEYFRAMES = `
@keyframes image-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
` as const

/**
 * Returns inline style properties for a shimmer placeholder overlay.
 */
export function getShimmerStyle(
  bgBase = 'var(--bg-card, #f9fafb)',
  bgHighlight = 'var(--bg-hover, #f3f4f6)'
): React.CSSProperties {
  return {
    background: `linear-gradient(90deg, ${bgBase} 25%, ${bgHighlight} 50%, ${bgBase} 75%)`,
    backgroundSize: '200% 100%',
    animation: 'image-shimmer 1.5s ease-in-out infinite',
  }
}

/**
 * Predefined blur data URLs for common aspect ratios.
 * These are lightweight SVG placeholders that render instantly.
 */
export const BLUR_PLACEHOLDERS = {
  /** 16:9 landscape */
  landscape: generateBlurDataURL(16, 9),
  /** 1:1 square */
  square: generateBlurDataURL(1, 1),
  /** 9:16 portrait */
  portrait: generateBlurDataURL(9, 16),
  /** 4:3 standard */
  standard: generateBlurDataURL(4, 3),
  /** 3:2 photo */
  photo: generateBlurDataURL(3, 2),
} as const

// Re-export type for external use
import type React from 'react'
