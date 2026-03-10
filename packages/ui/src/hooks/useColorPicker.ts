'use client'

import { useState, useCallback, useMemo } from 'react'
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, isValidHex } from '../utils/colorUtils'
import type { RGB, HSL } from '../utils/colorUtils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseColorPickerReturn {
  /** Current colour as HEX (#rrggbb) */
  color: string
  /** Current colour as RGB */
  rgb: RGB
  /** Current colour as HSL */
  hsl: HSL
  /** Set colour from a HEX string. Invalid values are ignored. */
  setColor: (hex: string) => void
  /** Set colour from RGB values (0-255). */
  setRgb: (r: number, g: number, b: number) => void
  /** Set colour from HSL values (h: 0-360, s: 0-100, l: 0-100). */
  setHsl: (h: number, s: number, l: number) => void
  /** Whether the current colour is a valid HEX value */
  isValid: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_COLOR = '#000000'

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useColorPicker(initialColor?: string): UseColorPickerReturn {
  const startColor =
    initialColor && isValidHex(initialColor) ? initialColor.toLowerCase() : DEFAULT_COLOR

  const [color, setColorState] = useState(startColor)

  const rgb = useMemo<RGB>(() => hexToRgb(color) ?? { r: 0, g: 0, b: 0 }, [color])
  const hsl = useMemo<HSL>(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb])
  const valid = useMemo(() => isValidHex(color), [color])

  const setColor = useCallback((hex: string) => {
    if (isValidHex(hex)) {
      setColorState(hex.toLowerCase())
    }
  }, [])

  const setRgb = useCallback((r: number, g: number, b: number) => {
    setColorState(rgbToHex(r, g, b))
  }, [])

  const setHsl = useCallback((h: number, s: number, l: number) => {
    const { r, g, b } = hslToRgb(h, s, l)
    setColorState(rgbToHex(r, g, b))
  }, [])

  return { color, rgb, hsl, setColor, setRgb, setHsl, isValid: valid }
}
