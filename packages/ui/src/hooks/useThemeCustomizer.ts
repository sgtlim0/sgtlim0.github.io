'use client'

import { useState, useCallback, useEffect } from 'react'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
}

export interface ThemePreset {
  name: string
  colors: ThemeColors
}

interface UseThemeCustomizerReturn {
  colors: ThemeColors
  setColor: (key: keyof ThemeColors, value: string) => void
  applyPreset: (preset: ThemePreset) => void
  reset: () => void
  presets: ThemePreset[]
  currentPreset: string | null
}

const STORAGE_KEY = 'hchat-theme-colors'
const PRESET_KEY = 'hchat-theme-preset'

const DEFAULT_COLORS: ThemeColors = {
  primary: '#2563eb',
  secondary: '#64748b',
  accent: '#8b5cf6',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#0f172a',
}

const CSS_VAR_MAP: Record<keyof ThemeColors, string> = {
  primary: '--primary',
  secondary: '--text-secondary',
  accent: '--accent-purple',
  background: '--bg-page',
  surface: '--bg-card',
  text: '--text-primary',
}

const PRESETS: ThemePreset[] = [
  {
    name: 'Default',
    colors: { ...DEFAULT_COLORS },
  },
  {
    name: 'Ocean',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#06b6d4',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#0c4a6e',
    },
  },
  {
    name: 'Forest',
    colors: {
      primary: '#22c55e',
      secondary: '#15803d',
      accent: '#a3e635',
      background: '#f0fdf4',
      surface: '#dcfce7',
      text: '#14532d',
    },
  },
  {
    name: 'Sunset',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#f43f5e',
      background: '#fff7ed',
      surface: '#ffedd5',
      text: '#7c2d12',
    },
  },
  {
    name: 'Monochrome',
    colors: {
      primary: '#6b7280',
      secondary: '#4b5563',
      accent: '#9ca3af',
      background: '#f9fafb',
      surface: '#f3f4f6',
      text: '#111827',
    },
  },
]

function loadColorsFromStorage(): ThemeColors {
  if (typeof window === 'undefined') return { ...DEFAULT_COLORS }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return { ...DEFAULT_COLORS }

    const parsed = JSON.parse(stored)
    return {
      ...DEFAULT_COLORS,
      ...parsed,
    }
  } catch {
    return { ...DEFAULT_COLORS }
  }
}

function loadPresetFromStorage(): string | null {
  if (typeof window === 'undefined') return null

  try {
    return localStorage.getItem(PRESET_KEY)
  } catch {
    return null
  }
}

function applyCssVariables(colors: ThemeColors): void {
  if (typeof document === 'undefined') return

  const keys = Object.keys(CSS_VAR_MAP) as Array<keyof ThemeColors>
  for (const key of keys) {
    document.documentElement.style.setProperty(CSS_VAR_MAP[key], colors[key])
  }
}

function removeCssVariables(): void {
  if (typeof document === 'undefined') return

  const keys = Object.keys(CSS_VAR_MAP) as Array<keyof ThemeColors>
  for (const key of keys) {
    document.documentElement.style.removeProperty(CSS_VAR_MAP[key])
  }
}

function persistColors(colors: ThemeColors): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors))
  } catch {
    // localStorage may be full or disabled
  }
}

function persistPreset(name: string | null): void {
  if (typeof window === 'undefined') return

  try {
    if (name === null) {
      localStorage.removeItem(PRESET_KEY)
    } else {
      localStorage.setItem(PRESET_KEY, name)
    }
  } catch {
    // localStorage may be full or disabled
  }
}

export function useThemeCustomizer(): UseThemeCustomizerReturn {
  const [colors, setColors] = useState<ThemeColors>(loadColorsFromStorage)
  const [currentPreset, setCurrentPreset] = useState<string | null>(loadPresetFromStorage)

  useEffect(() => {
    const stored = loadColorsFromStorage()
    const isDefault = Object.keys(DEFAULT_COLORS).every(
      (key) => stored[key as keyof ThemeColors] === DEFAULT_COLORS[key as keyof ThemeColors]
    )
    if (!isDefault) {
      applyCssVariables(stored)
    }
  }, [])

  const setColor = useCallback((key: keyof ThemeColors, value: string) => {
    setColors((prev) => {
      const next = { ...prev, [key]: value }
      document.documentElement.style.setProperty(CSS_VAR_MAP[key], value)
      persistColors(next)
      return next
    })
    setCurrentPreset((prev) => {
      if (prev !== null) {
        persistPreset(null)
      }
      return null
    })
  }, [])

  const applyPreset = useCallback((preset: ThemePreset) => {
    const next = { ...preset.colors }
    setColors(next)
    setCurrentPreset(preset.name)
    applyCssVariables(next)
    persistColors(next)
    persistPreset(preset.name)
  }, [])

  const reset = useCallback(() => {
    setColors({ ...DEFAULT_COLORS })
    setCurrentPreset(null)
    removeCssVariables()
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(PRESET_KEY)
    } catch {
      // ignore
    }
  }, [])

  return {
    colors,
    setColor,
    applyPreset,
    reset,
    presets: PRESETS,
    currentPreset,
  }
}
