import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SkeletonImage } from '../src/Skeleton'

describe('SkeletonImage', () => {
  it('renders with default 16:9 aspect ratio', () => {
    const { container } = render(<SkeletonImage />)
    const el = container.querySelector('div') as HTMLElement
    expect(el.style.aspectRatio).toBe('16 / 9')
    expect(el.style.width).toBe('100%')
  })

  it('renders with custom width and height', () => {
    const { container } = render(<SkeletonImage width={200} height={150} />)
    const el = container.querySelector('div') as HTMLElement
    expect(el.style.width).toBe('200px')
    expect(el.style.height).toBe('150px')
  })

  it('applies rounded class by default', () => {
    const { container } = render(<SkeletonImage />)
    const el = container.querySelector('div') as HTMLElement
    expect(el.className).toContain('rounded-lg')
  })

  it('removes rounded class when rounded is false', () => {
    const { container } = render(<SkeletonImage rounded={false} />)
    const el = container.querySelector('div') as HTMLElement
    expect(el.className).not.toContain('rounded-lg')
  })

  it('uses custom aspect ratio', () => {
    const { container } = render(<SkeletonImage aspectRatio="4 / 3" />)
    const el = container.querySelector('div') as HTMLElement
    expect(el.style.aspectRatio).toBe('4 / 3')
  })

  it('ignores aspect ratio when height is explicitly set', () => {
    const { container } = render(<SkeletonImage height={200} />)
    const el = container.querySelector('div') as HTMLElement
    expect(el.style.height).toBe('200px')
    // aspectRatio should not be set when height is explicit
    expect(el.style.aspectRatio).toBe('')
  })
})
