'use client'

import { useState, useCallback, useEffect } from 'react'

export interface GalleryImage {
  /** Unique identifier for the image */
  readonly id: string
  /** Full-size image source URL */
  readonly src: string
  /** Alt text for accessibility */
  readonly alt: string
  /** Optional thumbnail URL (falls back to src) */
  readonly thumbnail?: string
  /** Optional caption displayed in lightbox */
  readonly caption?: string
}

export interface UseGalleryReturn {
  /** Index of the currently displayed image in lightbox, or null */
  readonly currentIndex: number | null
  /** Whether the lightbox is open */
  readonly isLightboxOpen: boolean
  /** Open lightbox at a specific image index */
  readonly openLightbox: (index: number) => void
  /** Close the lightbox */
  readonly closeLightbox: () => void
  /** Navigate to the next image */
  readonly next: () => void
  /** Navigate to the previous image */
  readonly prev: () => void
  /** Whether the current image is the first */
  readonly isFirst: boolean
  /** Whether the current image is the last */
  readonly isLast: boolean
}

/**
 * Hook for managing an image gallery with lightbox navigation.
 *
 * Handles keyboard navigation (ArrowLeft, ArrowRight, Escape)
 * and provides state for opening/closing a lightbox overlay.
 *
 * @example
 * ```tsx
 * const gallery = useGallery(images)
 * // gallery.openLightbox(0) — open first image
 * // gallery.next() / gallery.prev() — navigate
 * // gallery.closeLightbox() — close overlay
 * ```
 */
export function useGallery(images: readonly GalleryImage[]): UseGalleryReturn {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const isLightboxOpen = currentIndex !== null

  const openLightbox = useCallback(
    (index: number) => {
      if (images.length === 0) return
      const clamped = Math.min(Math.max(0, index), images.length - 1)
      setCurrentIndex(clamped)
    },
    [images.length],
  )

  const closeLightbox = useCallback(() => {
    setCurrentIndex(null)
  }, [])

  const next = useCallback(() => {
    if (currentIndex === null || images.length === 0) return
    setCurrentIndex((prev) => {
      if (prev === null || prev >= images.length - 1) return prev
      return prev + 1
    })
  }, [currentIndex, images.length])

  const prev = useCallback(() => {
    if (currentIndex === null || images.length === 0) return
    setCurrentIndex((prev) => {
      if (prev === null || prev <= 0) return prev
      return prev - 1
    })
  }, [currentIndex, images.length])

  const isFirst = currentIndex === null || currentIndex === 0
  const isLast = currentIndex === null || currentIndex === images.length - 1

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          setCurrentIndex(null)
          break
        case 'ArrowLeft':
          e.preventDefault()
          setCurrentIndex((prev) => {
            if (prev === null || prev <= 0) return prev
            return prev - 1
          })
          break
        case 'ArrowRight':
          e.preventDefault()
          setCurrentIndex((prev) => {
            if (prev === null || prev >= images.length - 1) return prev
            return prev + 1
          })
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, images.length])

  // Clamp currentIndex if images array shrinks
  useEffect(() => {
    if (currentIndex !== null && images.length > 0 && currentIndex >= images.length) {
      setCurrentIndex(images.length - 1)
    }
    if (currentIndex !== null && images.length === 0) {
      setCurrentIndex(null)
    }
  }, [currentIndex, images.length])

  return {
    currentIndex,
    isLightboxOpen,
    openLightbox,
    closeLightbox,
    next,
    prev,
    isFirst,
    isLast,
  }
}
