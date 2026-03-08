import { describe, it, expect } from 'vitest'
import {
  generateBlurDataURL,
  getShimmerStyle,
  SHIMMER_KEYFRAMES,
  BLUR_PLACEHOLDERS,
} from '../src/utils/imagePlaceholder'

describe('imagePlaceholder', () => {
  describe('generateBlurDataURL', () => {
    it('returns a base64 data URL', () => {
      const result = generateBlurDataURL(100, 50)
      expect(result).toMatch(/^data:image\/svg\+xml;base64,/)
    })

    it('encodes width and height into SVG', () => {
      const result = generateBlurDataURL(200, 100, '#ff0000')
      const decoded = atob(result.split(',')[1])
      expect(decoded).toContain('width="200"')
      expect(decoded).toContain('height="100"')
      expect(decoded).toContain('fill="#ff0000"')
    })

    it('uses default color when none provided', () => {
      const result = generateBlurDataURL(10, 10)
      const decoded = atob(result.split(',')[1])
      expect(decoded).toContain('fill="#e5e7eb"')
    })
  })

  describe('SHIMMER_KEYFRAMES', () => {
    it('contains keyframe animation definition', () => {
      expect(SHIMMER_KEYFRAMES).toContain('@keyframes image-shimmer')
      expect(SHIMMER_KEYFRAMES).toContain('background-position')
    })
  })

  describe('getShimmerStyle', () => {
    it('returns style object with background and animation', () => {
      const style = getShimmerStyle()
      expect(style).toHaveProperty('background')
      expect(style).toHaveProperty('backgroundSize', '200% 100%')
      expect(style).toHaveProperty('animation')
      expect(style.animation).toContain('image-shimmer')
    })

    it('accepts custom colors', () => {
      const style = getShimmerStyle('#000', '#fff')
      expect(style.background).toContain('#000')
      expect(style.background).toContain('#fff')
    })
  })

  describe('BLUR_PLACEHOLDERS', () => {
    it('provides predefined placeholders for common aspect ratios', () => {
      expect(BLUR_PLACEHOLDERS.landscape).toMatch(/^data:image\/svg\+xml;base64,/)
      expect(BLUR_PLACEHOLDERS.square).toMatch(/^data:image\/svg\+xml;base64,/)
      expect(BLUR_PLACEHOLDERS.portrait).toMatch(/^data:image\/svg\+xml;base64,/)
      expect(BLUR_PLACEHOLDERS.standard).toMatch(/^data:image\/svg\+xml;base64,/)
      expect(BLUR_PLACEHOLDERS.photo).toMatch(/^data:image\/svg\+xml;base64,/)
    })

    it('landscape has 16:9 aspect ratio encoded', () => {
      const decoded = atob(BLUR_PLACEHOLDERS.landscape.split(',')[1])
      expect(decoded).toContain('width="16"')
      expect(decoded).toContain('height="9"')
    })
  })
})
