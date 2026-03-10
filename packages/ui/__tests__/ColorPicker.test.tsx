import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  isValidHex,
  getContrastColor,
} from '../src/utils/colorUtils'
import { useColorPicker } from '../src/hooks/useColorPicker'
import ColorPicker from '../src/ColorPicker'

// ===========================================================================
// 1. Color conversion utilities
// ===========================================================================

describe('colorUtils', () => {
  // -------------------------------------------------------------------------
  // isValidHex
  // -------------------------------------------------------------------------
  describe('isValidHex', () => {
    it('accepts valid 6-digit hex', () => {
      expect(isValidHex('#ff0000')).toBe(true)
      expect(isValidHex('#AABBCC')).toBe(true)
      expect(isValidHex('#000000')).toBe(true)
      expect(isValidHex('#ffffff')).toBe(true)
    })

    it('rejects invalid hex values', () => {
      expect(isValidHex('')).toBe(false)
      expect(isValidHex('#fff')).toBe(false)          // 3-digit
      expect(isValidHex('#gggggg')).toBe(false)        // invalid chars
      expect(isValidHex('ff0000')).toBe(false)         // missing #
      expect(isValidHex('#ff00001')).toBe(false)       // too long
      expect(isValidHex('#ff000')).toBe(false)         // too short
    })
  })

  // -------------------------------------------------------------------------
  // hexToRgb
  // -------------------------------------------------------------------------
  describe('hexToRgb', () => {
    it('converts pure red', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('converts pure green', () => {
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 })
    })

    it('converts pure blue', () => {
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 })
    })

    it('converts white', () => {
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
    })

    it('converts black', () => {
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
    })

    it('converts arbitrary colour', () => {
      expect(hexToRgb('#2563eb')).toEqual({ r: 37, g: 99, b: 235 })
    })

    it('handles uppercase', () => {
      expect(hexToRgb('#FF8800')).toEqual({ r: 255, g: 136, b: 0 })
    })

    it('returns null for invalid hex', () => {
      expect(hexToRgb('#xyz')).toBeNull()
      expect(hexToRgb('')).toBeNull()
      expect(hexToRgb('ff0000')).toBeNull()
    })
  })

  // -------------------------------------------------------------------------
  // rgbToHex
  // -------------------------------------------------------------------------
  describe('rgbToHex', () => {
    it('converts pure red', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
    })

    it('converts black', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000')
    })

    it('converts white', () => {
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
    })

    it('pads single-digit hex values', () => {
      expect(rgbToHex(1, 2, 3)).toBe('#010203')
    })

    it('clamps out-of-range values', () => {
      expect(rgbToHex(300, -10, 128)).toBe('#ff0080')
    })

    it('rounds fractional values', () => {
      expect(rgbToHex(127.6, 0, 0)).toBe('#800000')
    })
  })

  // -------------------------------------------------------------------------
  // rgbToHsl
  // -------------------------------------------------------------------------
  describe('rgbToHsl', () => {
    it('converts pure red', () => {
      expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 })
    })

    it('converts pure green', () => {
      expect(rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 })
    })

    it('converts pure blue', () => {
      expect(rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 })
    })

    it('converts black', () => {
      expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 })
    })

    it('converts white', () => {
      expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 })
    })

    it('converts grey (achromatic)', () => {
      const result = rgbToHsl(128, 128, 128)
      expect(result.s).toBe(0)
    })

    it('converts cyan', () => {
      expect(rgbToHsl(0, 255, 255)).toEqual({ h: 180, s: 100, l: 50 })
    })

    it('converts magenta', () => {
      expect(rgbToHsl(255, 0, 255)).toEqual({ h: 300, s: 100, l: 50 })
    })

    it('converts yellow', () => {
      expect(rgbToHsl(255, 255, 0)).toEqual({ h: 60, s: 100, l: 50 })
    })
  })

  // -------------------------------------------------------------------------
  // hslToRgb
  // -------------------------------------------------------------------------
  describe('hslToRgb', () => {
    it('converts pure red', () => {
      expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('converts pure green', () => {
      expect(hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 })
    })

    it('converts pure blue', () => {
      expect(hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 })
    })

    it('converts black', () => {
      expect(hslToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 })
    })

    it('converts white', () => {
      expect(hslToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 })
    })

    it('converts cyan (h=180)', () => {
      expect(hslToRgb(180, 100, 50)).toEqual({ r: 0, g: 255, b: 255 })
    })

    it('converts magenta (h=300)', () => {
      expect(hslToRgb(300, 100, 50)).toEqual({ r: 255, g: 0, b: 255 })
    })

    it('converts yellow (h=60)', () => {
      expect(hslToRgb(60, 100, 50)).toEqual({ r: 255, g: 255, b: 0 })
    })

    it('converts orange (h=30)', () => {
      const result = hslToRgb(30, 100, 50)
      expect(result.r).toBe(255)
      expect(result.g).toBe(128)
      expect(result.b).toBe(0)
    })
  })

  // -------------------------------------------------------------------------
  // Round-trip: hex -> rgb -> hex
  // -------------------------------------------------------------------------
  describe('round-trip conversions', () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#2563eb', '#f97316', '#000000', '#ffffff']

    it.each(colors)('hex -> rgb -> hex preserves %s', (hex) => {
      const rgb = hexToRgb(hex)!
      expect(rgbToHex(rgb.r, rgb.g, rgb.b)).toBe(hex)
    })

    it('rgb -> hsl -> rgb preserves pure colours', () => {
      const testCases = [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 255, b: 0 },
        { r: 0, g: 0, b: 255 },
        { r: 0, g: 0, b: 0 },
        { r: 255, g: 255, b: 255 },
      ]
      for (const { r, g, b } of testCases) {
        const { h, s, l } = rgbToHsl(r, g, b)
        const back = hslToRgb(h, s, l)
        expect(back.r).toBe(r)
        expect(back.g).toBe(g)
        expect(back.b).toBe(b)
      }
    })
  })

  // -------------------------------------------------------------------------
  // getContrastColor
  // -------------------------------------------------------------------------
  describe('getContrastColor', () => {
    it('returns white for dark backgrounds', () => {
      expect(getContrastColor('#000000')).toBe('#ffffff')
      expect(getContrastColor('#1a1a1a')).toBe('#ffffff')
      expect(getContrastColor('#0000ff')).toBe('#ffffff')
    })

    it('returns black for light backgrounds', () => {
      expect(getContrastColor('#ffffff')).toBe('#000000')
      expect(getContrastColor('#ffff00')).toBe('#000000')
      expect(getContrastColor('#00ff00')).toBe('#000000')
    })

    it('returns black for invalid input', () => {
      expect(getContrastColor('invalid')).toBe('#000000')
    })
  })
})

// ===========================================================================
// 2. useColorPicker hook
// ===========================================================================

describe('useColorPicker', () => {
  it('defaults to #000000 when no initial colour is given', () => {
    const { result } = renderHook(() => useColorPicker())
    expect(result.current.color).toBe('#000000')
    expect(result.current.rgb).toEqual({ r: 0, g: 0, b: 0 })
    expect(result.current.isValid).toBe(true)
  })

  it('uses the provided initial colour', () => {
    const { result } = renderHook(() => useColorPicker('#ff0000'))
    expect(result.current.color).toBe('#ff0000')
    expect(result.current.rgb).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('falls back to #000000 for invalid initial colour', () => {
    const { result } = renderHook(() => useColorPicker('invalid'))
    expect(result.current.color).toBe('#000000')
  })

  it('normalises uppercase initial colour', () => {
    const { result } = renderHook(() => useColorPicker('#FF0000'))
    expect(result.current.color).toBe('#ff0000')
  })

  it('setColor updates all derived values', () => {
    const { result } = renderHook(() => useColorPicker())

    act(() => {
      result.current.setColor('#2563eb')
    })

    expect(result.current.color).toBe('#2563eb')
    expect(result.current.rgb).toEqual({ r: 37, g: 99, b: 235 })
    expect(result.current.isValid).toBe(true)
  })

  it('setColor ignores invalid hex', () => {
    const { result } = renderHook(() => useColorPicker('#ff0000'))

    act(() => {
      result.current.setColor('nope')
    })

    expect(result.current.color).toBe('#ff0000')
  })

  it('setRgb updates colour from RGB', () => {
    const { result } = renderHook(() => useColorPicker())

    act(() => {
      result.current.setRgb(255, 128, 0)
    })

    expect(result.current.color).toBe('#ff8000')
    expect(result.current.rgb).toEqual({ r: 255, g: 128, b: 0 })
  })

  it('setHsl updates colour from HSL', () => {
    const { result } = renderHook(() => useColorPicker())

    act(() => {
      result.current.setHsl(0, 100, 50)
    })

    expect(result.current.color).toBe('#ff0000')
    expect(result.current.rgb).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('hsl is derived correctly', () => {
    const { result } = renderHook(() => useColorPicker('#ff0000'))
    expect(result.current.hsl).toEqual({ h: 0, s: 100, l: 50 })
  })
})

// ===========================================================================
// 3. ColorPicker component
// ===========================================================================

describe('ColorPicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders with default colour', () => {
    render(<ColorPicker />)
    const preview = screen.getByTestId('color-preview')
    expect(preview).toHaveTextContent('#000000')
  })

  it('renders with custom initial colour', () => {
    render(<ColorPicker initialColor="#3b82f6" />)
    const preview = screen.getByTestId('color-preview')
    expect(preview).toHaveTextContent('#3b82f6')
  })

  it('has proper accessibility attributes', () => {
    render(<ColorPicker />)
    expect(screen.getByRole('group', { name: 'Color picker' })).toBeInTheDocument()
    expect(screen.getByLabelText('HEX color input')).toBeInTheDocument()
    expect(screen.getByLabelText('Copy HEX color')).toBeInTheDocument()
    expect(screen.getByLabelText('Red channel')).toBeInTheDocument()
    expect(screen.getByLabelText('Green channel')).toBeInTheDocument()
    expect(screen.getByLabelText('Blue channel')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Preset colors' })).toBeInTheDocument()
  })

  it('displays RGB sliders with role="slider"', () => {
    render(<ColorPicker />)
    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(3)
  })

  // -------------------------------------------------------------------------
  // HEX input
  // -------------------------------------------------------------------------
  it('updates colour when valid hex is typed', () => {
    const onChange = vi.fn()
    render(<ColorPicker onChange={onChange} />)

    const input = screen.getByLabelText('HEX color input')
    fireEvent.change(input, { target: { value: '#ff0000' } })

    expect(onChange).toHaveBeenCalledWith('#ff0000')
    expect(screen.getByTestId('color-preview')).toHaveTextContent('#ff0000')
  })

  it('does not call onChange for invalid hex input', () => {
    const onChange = vi.fn()
    render(<ColorPicker onChange={onChange} />)

    const input = screen.getByLabelText('HEX color input')
    fireEvent.change(input, { target: { value: '#gg' } })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('auto-prepends # when missing', () => {
    const onChange = vi.fn()
    render(<ColorPicker onChange={onChange} />)

    const input = screen.getByLabelText('HEX color input')
    fireEvent.change(input, { target: { value: 'ff0000' } })

    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  // -------------------------------------------------------------------------
  // RGB sliders
  // -------------------------------------------------------------------------
  it('updates colour when red slider changes', () => {
    const onChange = vi.fn()
    render(<ColorPicker onChange={onChange} />)

    const redSlider = screen.getByLabelText('Red channel')
    fireEvent.change(redSlider, { target: { value: '128' } })

    expect(onChange).toHaveBeenCalled()
  })

  it('updates colour when green slider changes', () => {
    const onChange = vi.fn()
    render(<ColorPicker onChange={onChange} />)

    const greenSlider = screen.getByLabelText('Green channel')
    fireEvent.change(greenSlider, { target: { value: '200' } })

    expect(onChange).toHaveBeenCalled()
  })

  it('updates colour when blue slider changes', () => {
    const onChange = vi.fn()
    render(<ColorPicker onChange={onChange} />)

    const blueSlider = screen.getByLabelText('Blue channel')
    fireEvent.change(blueSlider, { target: { value: '100' } })

    expect(onChange).toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Preset palette
  // -------------------------------------------------------------------------
  it('renders 12 preset colour buttons', () => {
    render(<ColorPicker />)
    const presetGroup = screen.getByRole('group', { name: 'Preset colors' })
    const buttons = presetGroup.querySelectorAll('button')
    expect(buttons).toHaveLength(12)
  })

  it('selects a preset colour on click', () => {
    const onChange = vi.fn()
    render(<ColorPicker onChange={onChange} />)

    const bluePreset = screen.getByLabelText('Select color #3b82f6')
    fireEvent.click(bluePreset)

    expect(onChange).toHaveBeenCalledWith('#3b82f6')
    expect(screen.getByTestId('color-preview')).toHaveTextContent('#3b82f6')
  })

  // -------------------------------------------------------------------------
  // Copy button
  // -------------------------------------------------------------------------
  it('copies colour to clipboard when copy button is clicked', async () => {
    render(<ColorPicker initialColor="#ff0000" />)

    const copyButton = screen.getByLabelText('Copy HEX color')
    expect(copyButton).toHaveTextContent('Copy')

    await act(async () => {
      fireEvent.click(copyButton)
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('#ff0000')
    expect(copyButton).toHaveTextContent('Copied!')

    // Resets after timeout
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(copyButton).toHaveTextContent('Copy')
  })

  it('handles clipboard failure gracefully', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Denied')),
      },
    })

    render(<ColorPicker initialColor="#ff0000" />)

    const copyButton = screen.getByLabelText('Copy HEX color')
    await act(async () => {
      fireEvent.click(copyButton)
    })

    // Should not crash — button stays as "Copy"
    expect(copyButton).toHaveTextContent('Copy')
  })

  // -------------------------------------------------------------------------
  // Preview contrast
  // -------------------------------------------------------------------------
  it('displays white text on dark preview', () => {
    render(<ColorPicker initialColor="#000000" />)
    const preview = screen.getByTestId('color-preview')
    // jsdom normalises hex to rgb()
    expect(preview.style.color).toBe('rgb(255, 255, 255)')
  })

  it('displays black text on light preview', () => {
    render(<ColorPicker initialColor="#ffffff" />)
    const preview = screen.getByTestId('color-preview')
    expect(preview.style.color).toBe('rgb(0, 0, 0)')
  })

  // -------------------------------------------------------------------------
  // className prop
  // -------------------------------------------------------------------------
  it('applies custom className', () => {
    render(<ColorPicker className="my-custom-class" />)
    const root = screen.getByRole('group', { name: 'Color picker' })
    expect(root.className).toContain('my-custom-class')
  })
})
