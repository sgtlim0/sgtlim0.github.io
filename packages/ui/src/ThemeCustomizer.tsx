'use client'

import { useThemeCustomizer } from './hooks/useThemeCustomizer'
import type { ThemeColors, ThemePreset } from './hooks/useThemeCustomizer'

export interface ThemeCustomizerProps {
  className?: string
}

const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  background: 'Background',
  surface: 'Surface',
  text: 'Text',
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <label className="text-sm font-medium" style={{ color: 'var(--text-primary, #0f172a)' }}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border border-gray-300"
          aria-label={`${label} color`}
        />
        <span
          className="w-16 text-xs font-mono"
          style={{ color: 'var(--text-secondary, #64748b)' }}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

function PresetButton({
  preset,
  isActive,
  onClick,
}: {
  preset: ThemePreset
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'ring-2 ring-offset-1'
          : 'hover:opacity-80'
      }`}
      style={{
        backgroundColor: preset.colors.surface,
        color: preset.colors.text,
        borderColor: preset.colors.primary,
        border: `1px solid ${preset.colors.primary}`,
        ...(isActive ? { ringColor: preset.colors.primary } : {}),
      }}
      aria-pressed={isActive}
      aria-label={`Apply ${preset.name} theme`}
    >
      <span
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: preset.colors.primary }}
      />
      {preset.name}
    </button>
  )
}

function PreviewCard({ colors }: { colors: ThemeColors }) {
  return (
    <div
      className="rounded-lg p-4 border"
      style={{
        backgroundColor: colors.background,
        borderColor: colors.surface,
      }}
    >
      <div className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
        Preview
      </div>
      <div
        className="rounded-md p-3 mb-2"
        style={{ backgroundColor: colors.surface }}
      >
        <span className="text-xs" style={{ color: colors.secondary }}>
          Surface area with secondary text
        </span>
      </div>
      <div className="flex gap-2">
        <span
          className="inline-block rounded px-2 py-0.5 text-xs text-white font-medium"
          style={{ backgroundColor: colors.primary }}
        >
          Primary
        </span>
        <span
          className="inline-block rounded px-2 py-0.5 text-xs text-white font-medium"
          style={{ backgroundColor: colors.accent }}
        >
          Accent
        </span>
      </div>
    </div>
  )
}

export default function ThemeCustomizer({ className = '' }: ThemeCustomizerProps) {
  const { colors, setColor, applyPreset, reset, presets, currentPreset } = useThemeCustomizer()

  const colorKeys = Object.keys(COLOR_LABELS) as Array<keyof ThemeColors>

  return (
    <div
      className={`rounded-xl border p-5 ${className}`}
      style={{
        backgroundColor: 'var(--bg-card, #f8fafc)',
        borderColor: 'var(--border, #e2e8f0)',
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3
          className="text-base font-semibold"
          style={{ color: 'var(--text-primary, #0f172a)' }}
        >
          Theme Customizer
        </h3>
        <button
          type="button"
          onClick={reset}
          className="rounded-md px-3 py-1 text-xs font-medium transition-colors hover:opacity-80"
          style={{
            backgroundColor: 'var(--bg-hover, #f1f5f9)',
            color: 'var(--text-secondary, #64748b)',
          }}
        >
          Reset
        </button>
      </div>

      {/* Presets */}
      <div className="mb-4">
        <div
          className="mb-2 text-xs font-medium uppercase tracking-wide"
          style={{ color: 'var(--text-tertiary, #94a3b8)' }}
        >
          Presets
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <PresetButton
              key={preset.name}
              preset={preset}
              isActive={currentPreset === preset.name}
              onClick={() => applyPreset(preset)}
            />
          ))}
        </div>
      </div>

      {/* Color Pickers */}
      <div className="mb-4">
        <div
          className="mb-2 text-xs font-medium uppercase tracking-wide"
          style={{ color: 'var(--text-tertiary, #94a3b8)' }}
        >
          Colors
        </div>
        <div className="space-y-0.5">
          {colorKeys.map((key) => (
            <ColorPicker
              key={key}
              label={COLOR_LABELS[key]}
              value={colors[key]}
              onChange={(value) => setColor(key, value)}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div>
        <div
          className="mb-2 text-xs font-medium uppercase tracking-wide"
          style={{ color: 'var(--text-tertiary, #94a3b8)' }}
        >
          Preview
        </div>
        <PreviewCard colors={colors} />
      </div>
    </div>
  )
}
