import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useThemeCustomizer } from '../src/hooks/useThemeCustomizer'
import type { ThemeColors, ThemePreset } from '../src/hooks/useThemeCustomizer'

const STORAGE_KEY = 'hchat-theme-colors'
const PRESET_KEY = 'hchat-theme-preset'

describe('useThemeCustomizer', () => {
  let setPropertySpy: ReturnType<typeof vi.fn>
  let removePropertySpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    localStorage.clear()
    setPropertySpy = vi.fn()
    removePropertySpy = vi.fn()
    Object.defineProperty(document.documentElement, 'style', {
      value: {
        setProperty: setPropertySpy,
        removeProperty: removePropertySpy,
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('returns default colors', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      expect(result.current.colors).toEqual({
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#8b5cf6',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a',
      })
    })

    it('returns null currentPreset initially', () => {
      const { result } = renderHook(() => useThemeCustomizer())
      expect(result.current.currentPreset).toBeNull()
    })

    it('returns 5 presets', () => {
      const { result } = renderHook(() => useThemeCustomizer())
      expect(result.current.presets).toHaveLength(5)
    })

    it('has named presets: Default, Ocean, Forest, Sunset, Monochrome', () => {
      const { result } = renderHook(() => useThemeCustomizer())
      const names = result.current.presets.map((p) => p.name)
      expect(names).toEqual(['Default', 'Ocean', 'Forest', 'Sunset', 'Monochrome'])
    })
  })

  describe('setColor', () => {
    it('updates a single color', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.setColor('primary', '#ff0000')
      })

      expect(result.current.colors.primary).toBe('#ff0000')
    })

    it('does not mutate other colors', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.setColor('primary', '#ff0000')
      })

      expect(result.current.colors.secondary).toBe('#64748b')
      expect(result.current.colors.accent).toBe('#8b5cf6')
    })

    it('applies CSS variable via setProperty', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.setColor('primary', '#ff0000')
      })

      expect(setPropertySpy).toHaveBeenCalledWith('--primary', '#ff0000')
    })

    it('persists to localStorage', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.setColor('primary', '#ff0000')
      })

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(stored.primary).toBe('#ff0000')
    })

    it('clears currentPreset when color is manually changed', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.applyPreset(result.current.presets[1])
      })
      expect(result.current.currentPreset).toBe('Ocean')

      act(() => {
        result.current.setColor('primary', '#123456')
      })
      expect(result.current.currentPreset).toBeNull()
    })
  })

  describe('applyPreset', () => {
    it('applies Ocean preset colors', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.applyPreset(result.current.presets[1])
      })

      expect(result.current.colors.primary).toBe('#0ea5e9')
      expect(result.current.currentPreset).toBe('Ocean')
    })

    it('applies Forest preset colors', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.applyPreset(result.current.presets[2])
      })

      expect(result.current.colors.primary).toBe('#22c55e')
      expect(result.current.currentPreset).toBe('Forest')
    })

    it('applies Sunset preset colors', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.applyPreset(result.current.presets[3])
      })

      expect(result.current.colors.primary).toBe('#f97316')
      expect(result.current.currentPreset).toBe('Sunset')
    })

    it('applies Monochrome preset colors', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.applyPreset(result.current.presets[4])
      })

      expect(result.current.colors.primary).toBe('#6b7280')
      expect(result.current.currentPreset).toBe('Monochrome')
    })

    it('sets all CSS variables for preset', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.applyPreset(result.current.presets[1])
      })

      expect(setPropertySpy).toHaveBeenCalledWith('--primary', '#0ea5e9')
      expect(setPropertySpy).toHaveBeenCalledWith('--text-secondary', expect.any(String))
      expect(setPropertySpy).toHaveBeenCalledWith('--accent-purple', expect.any(String))
      expect(setPropertySpy).toHaveBeenCalledWith('--bg-page', expect.any(String))
      expect(setPropertySpy).toHaveBeenCalledWith('--bg-card', expect.any(String))
      expect(setPropertySpy).toHaveBeenCalledWith('--text-primary', expect.any(String))
    })

    it('persists preset name to localStorage', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.applyPreset(result.current.presets[1])
      })

      expect(localStorage.getItem(PRESET_KEY)).toBe('Ocean')
    })

    it('persists preset colors to localStorage', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.applyPreset(result.current.presets[1])
      })

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(stored.primary).toBe('#0ea5e9')
    })
  })

  describe('reset', () => {
    it('restores default colors', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.setColor('primary', '#ff0000')
        result.current.setColor('secondary', '#00ff00')
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.colors.primary).toBe('#2563eb')
      expect(result.current.colors.secondary).toBe('#64748b')
    })

    it('clears currentPreset', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.applyPreset(result.current.presets[1])
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.currentPreset).toBeNull()
    })

    it('removes CSS variable overrides', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.setColor('primary', '#ff0000')
      })

      act(() => {
        result.current.reset()
      })

      expect(removePropertySpy).toHaveBeenCalledWith('--primary')
      expect(removePropertySpy).toHaveBeenCalledWith('--text-secondary')
      expect(removePropertySpy).toHaveBeenCalledWith('--accent-purple')
      expect(removePropertySpy).toHaveBeenCalledWith('--bg-page')
      expect(removePropertySpy).toHaveBeenCalledWith('--bg-card')
      expect(removePropertySpy).toHaveBeenCalledWith('--text-primary')
    })

    it('clears localStorage', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.setColor('primary', '#ff0000')
      })

      act(() => {
        result.current.reset()
      })

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
      expect(localStorage.getItem(PRESET_KEY)).toBeNull()
    })
  })

  describe('localStorage persistence', () => {
    it('restores saved colors on mount', () => {
      const saved: ThemeColors = {
        primary: '#ff0000',
        secondary: '#00ff00',
        accent: '#0000ff',
        background: '#111111',
        surface: '#222222',
        text: '#333333',
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))

      const { result } = renderHook(() => useThemeCustomizer())
      expect(result.current.colors).toEqual(saved)
    })

    it('restores saved preset name on mount', () => {
      const oceanPreset: ThemeColors = {
        primary: '#0ea5e9',
        secondary: '#0284c7',
        accent: '#06b6d4',
        background: '#f0f9ff',
        surface: '#e0f2fe',
        text: '#0c4a6e',
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(oceanPreset))
      localStorage.setItem(PRESET_KEY, 'Ocean')

      const { result } = renderHook(() => useThemeCustomizer())
      expect(result.current.currentPreset).toBe('Ocean')
    })

    it('handles corrupted localStorage gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'not-valid-json')

      const { result } = renderHook(() => useThemeCustomizer())
      expect(result.current.colors.primary).toBe('#2563eb')
    })

    it('handles partial localStorage data', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ primary: '#ff0000' }))

      const { result } = renderHook(() => useThemeCustomizer())
      expect(result.current.colors.primary).toBe('#ff0000')
      expect(result.current.colors.secondary).toBe('#64748b')
    })
  })

  describe('SSR safety', () => {
    it('returns default colors when window is undefined', () => {
      const { result } = renderHook(() => useThemeCustomizer())
      expect(result.current.colors).toBeDefined()
      expect(result.current.colors.primary).toBe('#2563eb')
    })
  })

  describe('CSS variable mapping', () => {
    it('maps primary to --primary', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.setColor('primary', '#aabbcc')
      })

      expect(setPropertySpy).toHaveBeenCalledWith('--primary', '#aabbcc')
    })

    it('maps secondary to --text-secondary', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.setColor('secondary', '#aabbcc')
      })

      expect(setPropertySpy).toHaveBeenCalledWith('--text-secondary', '#aabbcc')
    })

    it('maps accent to --accent-purple', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.setColor('accent', '#aabbcc')
      })

      expect(setPropertySpy).toHaveBeenCalledWith('--accent-purple', '#aabbcc')
    })

    it('maps background to --bg-page', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.setColor('background', '#aabbcc')
      })

      expect(setPropertySpy).toHaveBeenCalledWith('--bg-page', '#aabbcc')
    })

    it('maps surface to --bg-card', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.setColor('surface', '#aabbcc')
      })

      expect(setPropertySpy).toHaveBeenCalledWith('--bg-card', '#aabbcc')
    })

    it('maps text to --text-primary', () => {
      const { result } = renderHook(() => useThemeCustomizer())

      act(() => {
        result.current.setColor('text', '#aabbcc')
      })

      expect(setPropertySpy).toHaveBeenCalledWith('--text-primary', '#aabbcc')
    })
  })
})
