import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { OptimizedImage } from '../src/OptimizedImage'

describe('OptimizedImage', () => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test image',
    width: 800,
    height: 600,
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('renders an img element with correct attributes', () => {
      render(<OptimizedImage {...defaultProps} />)
      const img = screen.getByAltText('Test image')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', '/test-image.jpg')
      expect(img).toHaveAttribute('width', '800')
      expect(img).toHaveAttribute('height', '600')
    })

    it('applies custom className to wrapper', () => {
      const { container } = render(
        <OptimizedImage {...defaultProps} className="my-custom-class" />
      )
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('my-custom-class')
    })

    it('maintains aspect ratio via wrapper style', () => {
      const { container } = render(<OptimizedImage {...defaultProps} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.style.aspectRatio).toBe('800 / 600')
    })
  })

  describe('lazy loading', () => {
    it('defaults to lazy loading', () => {
      render(<OptimizedImage {...defaultProps} />)
      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('loading', 'lazy')
      expect(img).toHaveAttribute('decoding', 'async')
    })

    it('uses eager loading when priority is true', () => {
      render(<OptimizedImage {...defaultProps} priority />)
      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('loading', 'eager')
      expect(img).toHaveAttribute('decoding', 'sync')
      expect(img).toHaveAttribute('fetchpriority', 'high')
    })

    it('sets fetchPriority to auto for non-priority images', () => {
      render(<OptimizedImage {...defaultProps} />)
      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('fetchpriority', 'auto')
    })
  })

  describe('placeholder - blur', () => {
    it('shows blur placeholder before image loads', () => {
      render(<OptimizedImage {...defaultProps} placeholder="blur" />)
      const placeholder = screen.getByTestId('blur-placeholder')
      expect(placeholder).toBeInTheDocument()
      expect(placeholder.style.filter).toContain('blur')
    })

    it('hides blur placeholder after image loads', () => {
      render(<OptimizedImage {...defaultProps} placeholder="blur" />)
      const img = screen.getByAltText('Test image')

      act(() => {
        fireEvent.load(img)
      })

      expect(screen.queryByTestId('blur-placeholder')).not.toBeInTheDocument()
    })

    it('uses custom blurDataURL when provided', () => {
      const customBlur = 'data:image/png;base64,customdata'
      render(
        <OptimizedImage {...defaultProps} placeholder="blur" blurDataURL={customBlur} />
      )
      const placeholder = screen.getByTestId('blur-placeholder')
      expect(placeholder.style.backgroundImage).toContain(customBlur)
    })
  })

  describe('placeholder - shimmer', () => {
    it('shows shimmer placeholder before image loads', () => {
      render(<OptimizedImage {...defaultProps} placeholder="shimmer" />)
      const placeholder = screen.getByTestId('shimmer-placeholder')
      expect(placeholder).toBeInTheDocument()
    })

    it('hides shimmer placeholder after image loads', () => {
      render(<OptimizedImage {...defaultProps} placeholder="shimmer" />)
      const img = screen.getByAltText('Test image')

      act(() => {
        fireEvent.load(img)
      })

      expect(screen.queryByTestId('shimmer-placeholder')).not.toBeInTheDocument()
    })
  })

  describe('placeholder - empty', () => {
    it('does not show any placeholder when set to empty', () => {
      render(<OptimizedImage {...defaultProps} placeholder="empty" />)
      expect(screen.queryByTestId('blur-placeholder')).not.toBeInTheDocument()
      expect(screen.queryByTestId('shimmer-placeholder')).not.toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('shows error fallback when image fails to load', () => {
      render(<OptimizedImage {...defaultProps} />)
      const img = screen.getByAltText('Test image')

      act(() => {
        fireEvent.error(img)
      })

      const errorFallback = screen.getByTestId('image-error')
      expect(errorFallback).toBeInTheDocument()
      expect(errorFallback).toHaveAttribute('aria-label', 'Test image')
    })

    it('calls onError callback when image fails', () => {
      const onError = vi.fn()
      render(<OptimizedImage {...defaultProps} onError={onError} />)
      const img = screen.getByAltText('Test image')

      act(() => {
        fireEvent.error(img)
      })

      expect(onError).toHaveBeenCalledOnce()
    })

    it('removes the img element on error', () => {
      render(<OptimizedImage {...defaultProps} />)
      const img = screen.getByAltText('Test image')

      act(() => {
        fireEvent.error(img)
      })

      expect(screen.queryByAltText('Test image')).not.toBeInTheDocument()
    })
  })

  describe('callbacks', () => {
    it('calls onLoad when image loads successfully', () => {
      const onLoad = vi.fn()
      render(<OptimizedImage {...defaultProps} onLoad={onLoad} />)
      const img = screen.getByAltText('Test image')

      act(() => {
        fireEvent.load(img)
      })

      expect(onLoad).toHaveBeenCalledOnce()
    })
  })

  describe('responsive', () => {
    it('passes sizes attribute to img', () => {
      render(
        <OptimizedImage {...defaultProps} sizes="(max-width: 768px) 100vw, 50vw" />
      )
      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw')
    })

    it('passes srcSet attribute to img', () => {
      const srcSet = '/img-400.jpg 400w, /img-800.jpg 800w'
      render(<OptimizedImage {...defaultProps} srcSet={srcSet} />)
      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('srcset', srcSet)
    })
  })

  describe('object-fit', () => {
    it('defaults to cover', () => {
      render(<OptimizedImage {...defaultProps} />)
      const img = screen.getByAltText('Test image')
      expect(img.style.objectFit).toBe('cover')
    })

    it('accepts contain', () => {
      render(<OptimizedImage {...defaultProps} objectFit="contain" />)
      const img = screen.getByAltText('Test image')
      expect(img.style.objectFit).toBe('contain')
    })
  })

  describe('opacity transition', () => {
    it('starts with opacity 0 and transitions to 1 on load', () => {
      render(<OptimizedImage {...defaultProps} />)
      const img = screen.getByAltText('Test image')
      expect(img.style.opacity).toBe('0')

      act(() => {
        fireEvent.load(img)
      })

      expect(img.style.opacity).toBe('1')
    })
  })
})
