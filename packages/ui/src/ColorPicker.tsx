'use client'

import { useState, useCallback } from 'react'
import { useColorPicker } from './hooks/useColorPicker'
import { isValidHex, getContrastColor, rgbToHex } from './utils/colorUtils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ColorPickerProps {
  /** Initial colour (HEX #rrggbb). Defaults to #000000. */
  initialColor?: string
  /** Called whenever the colour changes. */
  onChange?: (hex: string) => void
  /** Additional CSS class for the root element. */
  className?: string
}

// ---------------------------------------------------------------------------
// Preset palette (12 colours)
// ---------------------------------------------------------------------------

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#6366f1', '#a855f7',
  '#ec4899', '#000000', '#6b7280', '#ffffff',
] as const

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SliderRowProps {
  label: string
  value: number
  max: number
  onChange: (v: number) => void
  ariaLabel: string
}

function SliderRow({ label, value, max, onChange, ariaLabel }: SliderRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 text-xs font-medium text-[var(--text-secondary)]">{label}</span>
      <input
        type="range"
        role="slider"
        aria-label={ariaLabel}
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-2 rounded-lg appearance-none bg-[var(--bg-hover)] cursor-pointer"
      />
      <span className="w-8 text-xs text-right tabular-nums text-[var(--text-secondary)]">
        {value}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ColorPicker
// ---------------------------------------------------------------------------

export default function ColorPicker({ initialColor, onChange, className = '' }: ColorPickerProps) {
  const { color, rgb, setColor, setRgb } = useColorPicker(initialColor)
  const [hexInput, setHexInput] = useState(color)
  const [copied, setCopied] = useState(false)

  // Sync hex input when colour changes programmatically
  const updateColor = useCallback(
    (hex: string) => {
      setColor(hex)
      setHexInput(hex)
      onChange?.(hex)
    },
    [setColor, onChange],
  )

  // RGB slider change
  const handleRgbChange = useCallback(
    (channel: 'r' | 'g' | 'b', value: number) => {
      const next = { ...rgb, [channel]: value }
      setRgb(next.r, next.g, next.b)
      const hex = rgbToHex(next.r, next.g, next.b)
      setHexInput(hex)
      onChange?.(hex)
    },
    [rgb, setRgb, onChange],
  )

  // HEX text input
  const handleHexInput = useCallback(
    (raw: string) => {
      const v = raw.startsWith('#') ? raw : `#${raw}`
      setHexInput(v)
      if (isValidHex(v)) {
        setColor(v)
        onChange?.(v.toLowerCase())
      }
    },
    [setColor, onChange],
  )

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(color)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Fallback: do nothing
    }
  }, [color])

  const contrastText = getContrastColor(color)

  return (
    <div
      className={`inline-flex flex-col gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] ${className}`}
      role="group"
      aria-label="Color picker"
    >
      {/* Preview */}
      <div
        className="w-full h-20 rounded-lg border border-[var(--border)] flex items-center justify-center text-sm font-mono"
        style={{ backgroundColor: color, color: contrastText }}
        data-testid="color-preview"
      >
        {color}
      </div>

      {/* HEX input + copy */}
      <div className="flex gap-2">
        <input
          type="text"
          aria-label="HEX color input"
          value={hexInput}
          onChange={(e) => handleHexInput(e.target.value)}
          maxLength={7}
          className="flex-1 px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-primary)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
        <button
          type="button"
          aria-label="Copy HEX color"
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-secondary)] text-xs hover:bg-[var(--bg-hover)] transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* RGB sliders */}
      <div className="flex flex-col gap-1.5">
        <SliderRow label="R" value={rgb.r} max={255} onChange={(v) => handleRgbChange('r', v)} ariaLabel="Red channel" />
        <SliderRow label="G" value={rgb.g} max={255} onChange={(v) => handleRgbChange('g', v)} ariaLabel="Green channel" />
        <SliderRow label="B" value={rgb.b} max={255} onChange={(v) => handleRgbChange('b', v)} ariaLabel="Blue channel" />
      </div>

      {/* Preset palette */}
      <div className="grid grid-cols-6 gap-1.5" role="group" aria-label="Preset colors">
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset}
            type="button"
            aria-label={`Select color ${preset}`}
            onClick={() => updateColor(preset)}
            className={`w-8 h-8 rounded-md border-2 transition-transform hover:scale-110 ${
              color === preset ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]' : 'border-[var(--border)]'
            }`}
            style={{ backgroundColor: preset }}
          />
        ))}
      </div>
    </div>
  )
}
