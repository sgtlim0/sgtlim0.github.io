'use client'

import type { PropDef } from './hooks/usePlayground'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PropEditorProps {
  readonly propDef: PropDef
  readonly value: unknown
  readonly onChange: (name: string, value: unknown) => void
}

// ---------------------------------------------------------------------------
// Sub-editors
// ---------------------------------------------------------------------------

function StringEditor({ propDef, value, onChange }: PropEditorProps) {
  return (
    <input
      id={`prop-${propDef.name}`}
      type="text"
      value={String(value ?? '')}
      onChange={(e) => onChange(propDef.name, e.target.value)}
      className="w-full px-2 py-1 text-sm border rounded-md border-[var(--border-primary,#d1d5db)] bg-[var(--bg-primary,#fff)] text-[var(--text-primary,#111)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#3b82f6)]/40"
    />
  )
}

function NumberEditor({ propDef, value, onChange }: PropEditorProps) {
  return (
    <input
      id={`prop-${propDef.name}`}
      type="number"
      value={Number(value ?? 0)}
      min={propDef.min}
      max={propDef.max}
      step={propDef.step ?? 1}
      onChange={(e) => onChange(propDef.name, Number(e.target.value))}
      className="w-full px-2 py-1 text-sm border rounded-md border-[var(--border-primary,#d1d5db)] bg-[var(--bg-primary,#fff)] text-[var(--text-primary,#111)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#3b82f6)]/40"
    />
  )
}

function BooleanEditor({ propDef, value, onChange }: PropEditorProps) {
  return (
    <input
      id={`prop-${propDef.name}`}
      type="checkbox"
      checked={!!value}
      onChange={(e) => onChange(propDef.name, e.target.checked)}
      className="h-4 w-4 rounded border-[var(--border-primary,#d1d5db)] text-[var(--color-primary,#3b82f6)] focus:ring-[var(--color-primary,#3b82f6)]/40"
    />
  )
}

function SelectEditor({ propDef, value, onChange }: PropEditorProps) {
  return (
    <select
      id={`prop-${propDef.name}`}
      value={String(value ?? '')}
      onChange={(e) => onChange(propDef.name, e.target.value)}
      className="w-full px-2 py-1 text-sm border rounded-md border-[var(--border-primary,#d1d5db)] bg-[var(--bg-primary,#fff)] text-[var(--text-primary,#111)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#3b82f6)]/40"
    >
      {propDef.options?.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}

function ColorEditor({ propDef, value, onChange }: PropEditorProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={`prop-${propDef.name}`}
        type="color"
        value={String(value ?? '#000000')}
        onChange={(e) => onChange(propDef.name, e.target.value)}
        className="h-8 w-8 cursor-pointer border rounded border-[var(--border-primary,#d1d5db)]"
      />
      <span className="text-xs font-mono text-[var(--text-secondary,#6b7280)]">
        {String(value ?? '#000000')}
      </span>
    </div>
  )
}

function RangeEditor({ propDef, value, onChange }: PropEditorProps) {
  const min = propDef.min ?? 0
  const max = propDef.max ?? 100
  const step = propDef.step ?? 1

  return (
    <div className="flex items-center gap-2">
      <input
        id={`prop-${propDef.name}`}
        type="range"
        role="slider"
        aria-label={propDef.name}
        min={min}
        max={max}
        step={step}
        value={Number(value ?? min)}
        onChange={(e) => onChange(propDef.name, Number(e.target.value))}
        className="flex-1 h-2 rounded-lg appearance-none bg-[var(--bg-hover,#e5e7eb)] cursor-pointer"
      />
      <span className="w-10 text-xs text-right tabular-nums text-[var(--text-secondary,#6b7280)]">
        {Number(value ?? min)}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Editor map
// ---------------------------------------------------------------------------

const EDITORS: Record<string, React.ComponentType<PropEditorProps>> = {
  string: StringEditor,
  number: NumberEditor,
  boolean: BooleanEditor,
  select: SelectEditor,
  color: ColorEditor,
  range: RangeEditor,
}

// ---------------------------------------------------------------------------
// Main PropEditor
// ---------------------------------------------------------------------------

/**
 * Renders an appropriate input control for a single prop definition.
 * Each editor type maps to a specific HTML input:
 * - string -> text input
 * - number -> number input
 * - boolean -> checkbox
 * - select -> dropdown
 * - color -> color input
 * - range -> range slider
 */
export default function PropEditor({ propDef, value, onChange }: PropEditorProps) {
  const Editor = EDITORS[propDef.type] ?? StringEditor

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label
          htmlFor={`prop-${propDef.name}`}
          className="text-sm font-medium text-[var(--text-primary,#111)]"
        >
          {propDef.name}
          <span className="ml-1.5 text-xs font-normal text-[var(--text-tertiary,#9ca3af)]">
            {propDef.type}
          </span>
        </label>
      </div>
      {propDef.description && (
        <p className="text-xs text-[var(--text-secondary,#6b7280)]">{propDef.description}</p>
      )}
      <Editor propDef={propDef} value={value} onChange={onChange} />
    </div>
  )
}
