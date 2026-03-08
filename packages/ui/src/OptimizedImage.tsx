'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  generateBlurDataURL,
  getShimmerStyle,
  SHIMMER_KEYFRAMES,
} from './utils/imagePlaceholder'

export interface OptimizedImageProps {
  /** Image source URL */
  src: string
  /** Accessible alt text (required) */
  alt: string
  /** Intrinsic width for aspect-ratio calculation */
  width: number
  /** Intrinsic height for aspect-ratio calculation */
  height: number
  /** Mark as high-priority (above-the-fold). Disables lazy loading. */
  priority?: boolean
  /** Placeholder strategy while loading */
  placeholder?: 'blur' | 'shimmer' | 'empty'
  /** Custom blur data URL (tiny base64 image) */
  blurDataURL?: string
  /** Additional CSS class */
  className?: string
  /** Responsive sizes hint (e.g. "(max-width: 768px) 100vw, 50vw") */
  sizes?: string
  /** Responsive srcSet for multiple resolutions */
  srcSet?: string
  /** Object-fit behavior */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none'
  /** Callback when image loads successfully */
  onLoad?: () => void
  /** Callback when image fails to load */
  onError?: () => void
}

/**
 * OptimizedImage — A performance-focused image component.
 *
 * Features:
 * - Lazy loading by default (priority=false)
 * - Blur or shimmer placeholder during load
 * - Responsive sizes/srcSet support
 * - Aspect-ratio preservation to prevent layout shift
 * - fetchpriority="high" for above-the-fold images
 *
 * This uses a native <img> tag with modern attributes rather than
 * next/image, since all apps use Static Export (output: 'export')
 * where next/image optimization is disabled (unoptimized: true).
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  className = '',
  sizes,
  srcSet,
  objectFit = 'cover',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const resolvedBlurDataURL =
    blurDataURL ?? generateBlurDataURL(width, height)

  const handleLoad = useCallback(() => {
    setLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setError(true)
    onError?.()
  }, [onError])

  // Handle already-cached images (load event may not fire)
  useEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true)
    }
  }, [])

  const showPlaceholder = !loaded && !error
  const aspectRatio = `${width} / ${height}`

  return (
    <div
      className={`optimized-image-wrapper ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        aspectRatio,
        width: '100%',
        maxWidth: `${width}px`,
      }}
    >
      {/* Shimmer keyframes injection (only once per page via CSS dedup) */}
      {placeholder === 'shimmer' && showPlaceholder && (
        <style
          dangerouslySetInnerHTML={{ __html: SHIMMER_KEYFRAMES }}
        />
      )}

      {/* Placeholder layer */}
      {showPlaceholder && placeholder === 'blur' && (
        <div
          data-testid="blur-placeholder"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${resolvedBlurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
          aria-hidden="true"
        />
      )}

      {showPlaceholder && placeholder === 'shimmer' && (
        <div
          data-testid="shimmer-placeholder"
          style={{
            position: 'absolute',
            inset: 0,
            ...getShimmerStyle(),
          }}
          aria-hidden="true"
        />
      )}

      {/* Error fallback */}
      {error && (
        <div
          data-testid="image-error"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-card, #f9fafb)',
            color: 'var(--text-secondary, #6b7280)',
            fontSize: '14px',
          }}
          role="img"
          aria-label={alt}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}

      {/* Actual image */}
      {!error && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          sizes={sizes}
          srcSet={srcSet}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}
    </div>
  )
}

export default OptimizedImage
