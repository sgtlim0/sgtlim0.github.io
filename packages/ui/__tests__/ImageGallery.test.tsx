import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { useGallery } from '../src/hooks/useGallery'
import type { GalleryImage } from '../src/hooks/useGallery'
import ImageGallery from '../src/ImageGallery'

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const SAMPLE_IMAGES: GalleryImage[] = [
  { id: '1', src: '/img1.jpg', alt: 'Image 1', caption: 'First image' },
  { id: '2', src: '/img2.jpg', alt: 'Image 2', thumbnail: '/img2-thumb.jpg' },
  { id: '3', src: '/img3.jpg', alt: 'Image 3', caption: 'Third image' },
  { id: '4', src: '/img4.jpg', alt: 'Image 4' },
]

const SINGLE_IMAGE: GalleryImage[] = [
  { id: '1', src: '/single.jpg', alt: 'Single' },
]

// ---------------------------------------------------------------------------
// useGallery hook tests
// ---------------------------------------------------------------------------

describe('useGallery', () => {
  it('starts with lightbox closed', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))
    expect(result.current.currentIndex).toBeNull()
    expect(result.current.isLightboxOpen).toBe(false)
  })

  it('returns isFirst and isLast as true when lightbox is closed', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))
    expect(result.current.isFirst).toBe(true)
    expect(result.current.isLast).toBe(true)
  })

  // --- openLightbox ---

  it('opens lightbox at a specific index', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))

    act(() => {
      result.current.openLightbox(2)
    })

    expect(result.current.currentIndex).toBe(2)
    expect(result.current.isLightboxOpen).toBe(true)
  })

  it('clamps index when opening beyond bounds', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))

    act(() => {
      result.current.openLightbox(100)
    })
    expect(result.current.currentIndex).toBe(3) // last index

    act(() => {
      result.current.closeLightbox()
      result.current.openLightbox(-5)
    })
    expect(result.current.currentIndex).toBe(0)
  })

  it('does not open lightbox when images array is empty', () => {
    const { result } = renderHook(() => useGallery([]))

    act(() => {
      result.current.openLightbox(0)
    })

    expect(result.current.currentIndex).toBeNull()
    expect(result.current.isLightboxOpen).toBe(false)
  })

  // --- closeLightbox ---

  it('closes lightbox', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))

    act(() => {
      result.current.openLightbox(1)
    })
    expect(result.current.isLightboxOpen).toBe(true)

    act(() => {
      result.current.closeLightbox()
    })
    expect(result.current.currentIndex).toBeNull()
    expect(result.current.isLightboxOpen).toBe(false)
  })

  // --- next ---

  it('navigates to next image', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))

    act(() => {
      result.current.openLightbox(0)
    })
    act(() => {
      result.current.next()
    })

    expect(result.current.currentIndex).toBe(1)
  })

  it('does not go past the last image', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))

    act(() => {
      result.current.openLightbox(3) // last
    })
    act(() => {
      result.current.next()
    })

    expect(result.current.currentIndex).toBe(3)
    expect(result.current.isLast).toBe(true)
  })

  it('does nothing when next is called with lightbox closed', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))

    act(() => {
      result.current.next()
    })

    expect(result.current.currentIndex).toBeNull()
  })

  // --- prev ---

  it('navigates to previous image', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))

    act(() => {
      result.current.openLightbox(2)
    })
    act(() => {
      result.current.prev()
    })

    expect(result.current.currentIndex).toBe(1)
  })

  it('does not go before the first image', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))

    act(() => {
      result.current.openLightbox(0)
    })
    act(() => {
      result.current.prev()
    })

    expect(result.current.currentIndex).toBe(0)
    expect(result.current.isFirst).toBe(true)
  })

  it('does nothing when prev is called with lightbox closed', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))

    act(() => {
      result.current.prev()
    })

    expect(result.current.currentIndex).toBeNull()
  })

  // --- isFirst / isLast ---

  it('reports isFirst correctly', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))

    act(() => {
      result.current.openLightbox(0)
    })
    expect(result.current.isFirst).toBe(true)
    expect(result.current.isLast).toBe(false)

    act(() => {
      result.current.next()
    })
    expect(result.current.isFirst).toBe(false)
  })

  it('reports isLast correctly', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))

    act(() => {
      result.current.openLightbox(3)
    })
    expect(result.current.isLast).toBe(true)
    expect(result.current.isFirst).toBe(false)
  })

  // --- keyboard navigation ---

  it('navigates with ArrowRight key', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))

    act(() => {
      result.current.openLightbox(0)
    })

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      document.dispatchEvent(event)
    })

    expect(result.current.currentIndex).toBe(1)
  })

  it('navigates with ArrowLeft key', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))

    act(() => {
      result.current.openLightbox(2)
    })

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      document.dispatchEvent(event)
    })

    expect(result.current.currentIndex).toBe(1)
  })

  it('closes lightbox with Escape key', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))

    act(() => {
      result.current.openLightbox(1)
    })

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)
    })

    expect(result.current.currentIndex).toBeNull()
    expect(result.current.isLightboxOpen).toBe(false)
  })

  it('does not respond to keyboard when lightbox is closed', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      document.dispatchEvent(event)
    })

    expect(result.current.currentIndex).toBeNull()
  })

  it('ArrowRight does not exceed last index', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))

    act(() => {
      result.current.openLightbox(3)
    })

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      document.dispatchEvent(event)
    })

    expect(result.current.currentIndex).toBe(3)
  })

  it('ArrowLeft does not go below 0', () => {
    const { result } = renderHook(() => useGallery(SAMPLE_IMAGES))

    act(() => {
      result.current.openLightbox(0)
    })

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      document.dispatchEvent(event)
    })

    expect(result.current.currentIndex).toBe(0)
  })

  // --- edge: images array change ---

  it('clamps index when images array shrinks', () => {
    const { result, rerender } = renderHook(
      ({ imgs }) => useGallery(imgs),
      { initialProps: { imgs: SAMPLE_IMAGES } },
    )

    act(() => {
      result.current.openLightbox(3) // index 3
    })
    expect(result.current.currentIndex).toBe(3)

    // Shrink to 2 images
    rerender({ imgs: SAMPLE_IMAGES.slice(0, 2) })

    expect(result.current.currentIndex).toBe(1)
  })

  it('closes lightbox when images become empty', () => {
    const { result, rerender } = renderHook(
      ({ imgs }) => useGallery(imgs),
      { initialProps: { imgs: SAMPLE_IMAGES as GalleryImage[] } },
    )

    act(() => {
      result.current.openLightbox(1)
    })

    rerender({ imgs: [] })

    expect(result.current.currentIndex).toBeNull()
    expect(result.current.isLightboxOpen).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// ImageGallery component tests
// ---------------------------------------------------------------------------

describe('ImageGallery', () => {
  beforeEach(() => {
    // Clean up any portal containers
    const portal = document.getElementById('hchat-gallery-lightbox')
    if (portal) portal.remove()
  })

  // --- rendering ---

  it('renders nothing when images is empty', () => {
    const { container } = render(<ImageGallery images={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders a grid of thumbnails', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} ariaLabel="Test gallery" />)

    const list = screen.getByRole('list', { name: 'Test gallery' })
    expect(list).toBeInTheDocument()

    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(4)
  })

  it('renders thumbnail images with lazy loading', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)

    const imgs = screen.getAllByRole('img')
    imgs.forEach((img) => {
      expect(img).toHaveAttribute('loading', 'lazy')
    })
  })

  it('uses thumbnail URL when available, falls back to src', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)

    const imgs = screen.getAllByRole('img')
    // Image 1: no thumbnail, uses src
    expect(imgs[0]).toHaveAttribute('src', '/img1.jpg')
    // Image 2: has thumbnail
    expect(imgs[1]).toHaveAttribute('src', '/img2-thumb.jpg')
  })

  it('renders alt text on images', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)

    expect(screen.getByAltText('Image 1')).toBeInTheDocument()
    expect(screen.getByAltText('Image 2')).toBeInTheDocument()
  })

  // --- columns ---

  it('applies correct column classes for 2 columns', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} columns={2} />)
    const list = screen.getByRole('list')
    expect(list.className).toContain('sm:grid-cols-2')
    expect(list.className).not.toContain('md:grid-cols-3')
  })

  it('applies correct column classes for 3 columns (default)', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)
    const list = screen.getByRole('list')
    expect(list.className).toContain('md:grid-cols-3')
  })

  it('applies correct column classes for 4 columns', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} columns={4} />)
    const list = screen.getByRole('list')
    expect(list.className).toContain('lg:grid-cols-4')
  })

  // --- lightbox open/close ---

  it('opens lightbox when clicking a thumbnail', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)

    const viewButtons = screen.getAllByRole('button', { name: /^View / })
    fireEvent.click(viewButtons[1])

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
  })

  it('displays full-size image in lightbox', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)

    const viewButtons = screen.getAllByRole('button', { name: /^View / })
    fireEvent.click(viewButtons[1])

    const dialog = screen.getByRole('dialog')
    const fullImg = within(dialog).getByRole('img')
    // Should show full src, not thumbnail
    expect(fullImg).toHaveAttribute('src', '/img2.jpg')
  })

  it('displays caption in lightbox when available', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)

    const viewButtons = screen.getAllByRole('button', { name: /^View / })
    fireEvent.click(viewButtons[0]) // Image 1 has caption

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('First image')).toBeInTheDocument()
  })

  it('displays image counter in lightbox', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)

    const viewButtons = screen.getAllByRole('button', { name: /^View / })
    fireEvent.click(viewButtons[0])

    expect(screen.getByText('1 / 4')).toBeInTheDocument()
  })

  it('closes lightbox via close button', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)

    const viewButtons = screen.getAllByRole('button', { name: /^View / })
    fireEvent.click(viewButtons[0])

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    const closeBtn = screen.getByRole('button', { name: 'Close lightbox' })
    fireEvent.click(closeBtn)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes lightbox when clicking backdrop', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)

    const viewButtons = screen.getAllByRole('button', { name: /^View / })
    fireEvent.click(viewButtons[0])

    const dialog = screen.getByRole('dialog')
    fireEvent.click(dialog)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  // --- lightbox navigation ---

  it('navigates to next image via button', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)

    const viewButtons = screen.getAllByRole('button', { name: /^View / })
    fireEvent.click(viewButtons[0])

    expect(screen.getByText('1 / 4')).toBeInTheDocument()

    const nextBtn = screen.getByRole('button', { name: 'Next image' })
    fireEvent.click(nextBtn)

    expect(screen.getByText('2 / 4')).toBeInTheDocument()
  })

  it('navigates to previous image via button', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)

    const viewButtons = screen.getAllByRole('button', { name: /^View / })
    fireEvent.click(viewButtons[2])

    expect(screen.getByText('3 / 4')).toBeInTheDocument()

    const prevBtn = screen.getByRole('button', { name: 'Previous image' })
    fireEvent.click(prevBtn)

    expect(screen.getByText('2 / 4')).toBeInTheDocument()
  })

  it('disables prev button on first image', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)

    const viewButtons = screen.getAllByRole('button', { name: /^View / })
    fireEvent.click(viewButtons[0])

    const prevBtn = screen.getByRole('button', { name: 'Previous image' })
    expect(prevBtn).toBeDisabled()
  })

  it('disables next button on last image', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)

    const viewButtons = screen.getAllByRole('button', { name: /^View / })
    fireEvent.click(viewButtons[3])

    const nextBtn = screen.getByRole('button', { name: 'Next image' })
    expect(nextBtn).toBeDisabled()
  })

  it('does not show navigation buttons for single image', () => {
    render(<ImageGallery images={SINGLE_IMAGE} />)

    const viewButtons = screen.getAllByRole('button', { name: /^View / })
    fireEvent.click(viewButtons[0])

    expect(screen.queryByRole('button', { name: 'Previous image' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next image' })).not.toBeInTheDocument()
  })

  // --- keyboard in component ---

  it('closes lightbox with Escape key', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)

    const viewButtons = screen.getAllByRole('button', { name: /^View / })
    fireEvent.click(viewButtons[0])

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('navigates with arrow keys in lightbox', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)

    const viewButtons = screen.getAllByRole('button', { name: /^View / })
    fireEvent.click(viewButtons[0])

    expect(screen.getByText('1 / 4')).toBeInTheDocument()

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    })

    expect(screen.getByText('2 / 4')).toBeInTheDocument()

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    })

    expect(screen.getByText('1 / 4')).toBeInTheDocument()
  })

  // --- accessibility ---

  it('has accessible gallery list with aria-label', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} ariaLabel="Photo gallery" />)

    const list = screen.getByRole('list', { name: 'Photo gallery' })
    expect(list).toBeInTheDocument()
  })

  it('has aria-label on thumbnail buttons', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)

    expect(screen.getByRole('button', { name: 'View Image 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View Image 2' })).toBeInTheDocument()
  })

  it('lightbox dialog has aria-modal and aria-label', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} />)

    const viewButtons = screen.getAllByRole('button', { name: /^View / })
    fireEvent.click(viewButtons[0])

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', 'Image: Image 1')
  })

  // --- custom className and gap ---

  it('applies custom className', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} className="my-custom-class" />)
    const list = screen.getByRole('list')
    expect(list.className).toContain('my-custom-class')
  })

  it('applies custom gap', () => {
    render(<ImageGallery images={SAMPLE_IMAGES} gap="gap-8" />)
    const list = screen.getByRole('list')
    expect(list.className).toContain('gap-8')
  })
})
