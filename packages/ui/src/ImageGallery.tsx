'use client'

import React, { type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useGallery } from './hooks/useGallery'
import type { GalleryImage, UseGalleryReturn } from './hooks/useGallery'
import { usePortal } from './hooks/usePortal'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ImageGalleryProps {
  /** Array of images to display */
  readonly images: readonly GalleryImage[]
  /** Number of columns: 2, 3, or 4 (default: 3) */
  readonly columns?: 2 | 3 | 4
  /** Additional class name for the outer container */
  readonly className?: string
  /** Accessible label for the gallery */
  readonly ariaLabel?: string
  /** Gap between thumbnails in Tailwind spacing (default: 'gap-4') */
  readonly gap?: string
}

// ---------------------------------------------------------------------------
// Column grid class mapping
// ---------------------------------------------------------------------------

const COLUMN_CLASSES: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ThumbnailItem({
  image,
  index,
  onClick,
}: {
  readonly image: GalleryImage
  readonly index: number
  readonly onClick: (index: number) => void
}) {
  return (
    <li role="listitem">
      <button
        type="button"
        onClick={() => onClick(index)}
        className={[
          'group relative w-full overflow-hidden rounded-lg',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          'cursor-pointer',
        ].join(' ')}
        aria-label={`View ${image.alt}`}
      >
        <img
          src={image.thumbnail ?? image.src}
          alt={image.alt}
          loading="lazy"
          className={[
            'w-full h-48 object-cover rounded-lg',
            'transition-transform duration-200',
            'group-hover:scale-105',
          ].join(' ')}
        />
        {image.caption && (
          <span
            className={[
              'absolute bottom-0 left-0 right-0',
              'bg-black/60 text-white text-sm px-3 py-1.5',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              'truncate',
            ].join(' ')}
          >
            {image.caption}
          </span>
        )}
      </button>
    </li>
  )
}

function LightboxNavButton({
  direction,
  onClick,
  disabled,
}: {
  readonly direction: 'prev' | 'next'
  readonly onClick: () => void
  readonly disabled: boolean
}) {
  const isPrev = direction === 'prev'

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      disabled={disabled}
      aria-label={isPrev ? 'Previous image' : 'Next image'}
      className={[
        'absolute top-1/2 -translate-y-1/2 z-10',
        'flex items-center justify-center w-12 h-12 rounded-full',
        'bg-white/20 hover:bg-white/40 transition-colors',
        'text-white',
        'disabled:opacity-20 disabled:cursor-not-allowed',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white',
        isPrev ? 'left-4' : 'right-4',
      ].join(' ')}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={isPrev ? 'rotate-180' : ''}
      >
        <path
          d="M9 5L16 12L9 19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

function Lightbox({
  images,
  gallery,
}: {
  readonly images: readonly GalleryImage[]
  readonly gallery: UseGalleryReturn
}) {
  const { portalRef, isMounted } = usePortal('hchat-gallery-lightbox')
  const { currentIndex, closeLightbox, next, prev, isFirst, isLast } = gallery

  if (!isMounted || !portalRef || currentIndex === null) {
    return null
  }

  const currentImage = images[currentIndex]
  if (!currentImage) {
    return null
  }

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Image: ${currentImage.alt}`}
      className={[
        'fixed inset-0 z-[9999]',
        'flex items-center justify-center',
        'bg-black/90',
      ].join(' ')}
      onClick={closeLightbox}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          closeLightbox()
        }}
        aria-label="Close lightbox"
        className={[
          'absolute top-4 right-4 z-20',
          'flex items-center justify-center w-10 h-10 rounded-full',
          'bg-white/20 hover:bg-white/40 transition-colors',
          'text-white',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-white',
        ].join(' ')}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M5 5L15 15M15 5L5 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <LightboxNavButton direction="prev" onClick={prev} disabled={isFirst} />
          <LightboxNavButton direction="next" onClick={next} disabled={isLast} />
        </>
      )}

      {/* Image + caption */}
      <div
        className="flex flex-col items-center max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
        {currentImage.caption && (
          <p className="mt-3 text-white text-sm text-center max-w-lg">
            {currentImage.caption}
          </p>
        )}
        <p className="mt-1 text-white/60 text-xs">
          {currentIndex + 1} / {images.length}
        </p>
      </div>
    </div>
  )

  return createPortal(content, portalRef)
}

// ---------------------------------------------------------------------------
// Main ImageGallery
// ---------------------------------------------------------------------------

/**
 * Responsive image gallery with lightbox support.
 *
 * Features:
 * - Responsive grid layout (2/3/4 columns)
 * - Thumbnail click opens fullscreen lightbox
 * - Keyboard navigation: ArrowLeft/Right, Escape
 * - Image lazy loading
 * - Portal-rendered lightbox
 * - Accessible: role="list", aria-label, alt text
 *
 * @example
 * ```tsx
 * const images = [
 *   { id: '1', src: '/photo1.jpg', alt: 'Photo 1', caption: 'A scenic view' },
 *   { id: '2', src: '/photo2.jpg', alt: 'Photo 2', thumbnail: '/photo2-thumb.jpg' },
 * ]
 * <ImageGallery images={images} columns={3} ariaLabel="Photo gallery" />
 * ```
 */
export default function ImageGallery({
  images,
  columns = 3,
  className = '',
  ariaLabel = 'Image gallery',
  gap = 'gap-4',
}: ImageGalleryProps) {
  const gallery = useGallery(images)

  if (images.length === 0) {
    return null
  }

  return (
    <>
      <ul
        role="list"
        aria-label={ariaLabel}
        className={`grid ${COLUMN_CLASSES[columns]} ${gap} ${className}`}
      >
        {images.map((image, index) => (
          <ThumbnailItem
            key={image.id}
            image={image}
            index={index}
            onClick={gallery.openLightbox}
          />
        ))}
      </ul>

      <Lightbox images={images} gallery={gallery} />
    </>
  )
}
