'use client'

import React, { useMemo } from 'react'
import { useSettings } from './hooks/useSettings'
import type { SettingField } from './hooks/useSettings'
import { SettingRow } from './SettingRow'

export interface SettingsPanelProps {
  readonly fields: ReadonlyArray<SettingField>
  readonly onSave: (values: Record<string, unknown>) => void
  readonly className?: string
}

/**
 * Key-value settings editor with category grouping, dirty tracking, and
 * automatic field-type rendering.
 *
 * Coexists with existing AdminSettings — this is a generic, reusable
 * settings panel for any domain.
 */
export function SettingsPanel({ fields, onSave, className }: SettingsPanelProps) {
  const { values, setValue, reset, isDirty, dirtyKeys, save } = useSettings(fields)

  const grouped = useMemo(() => {
    const map = new Map<string, SettingField[]>()
    for (const field of fields) {
      const cat = field.category ?? 'Other'
      const list = map.get(cat) ?? []
      map.set(cat, [...list, field])
    }
    return map
  }, [fields])

  const dirtySet = useMemo(() => new Set(dirtyKeys), [dirtyKeys])

  const handleSave = () => {
    const snapshot = save()
    onSave(snapshot)
  }

  return (
    <div className={className}>
      {Array.from(grouped.entries()).map(([category, categoryFields]) => (
        <fieldset key={category} style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend
            style={{
              fontWeight: 600,
              fontSize: '1.1rem',
              marginBottom: '0.5rem',
              display: 'block',
            }}
          >
            {category}
          </legend>
          {categoryFields.map(field => (
            <SettingRow
              key={field.key}
              field={field}
              value={values[field.key]}
              isDirty={dirtySet.has(field.key)}
              onChange={val => setValue(field.key, val)}
            />
          ))}
        </fieldset>
      ))}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty}
          aria-label="Save"
        >
          Save
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={!isDirty}
          aria-label="Reset"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
