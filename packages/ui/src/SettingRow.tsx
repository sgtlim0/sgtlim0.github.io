'use client'

import React from 'react'
import type { SettingField } from './hooks/useSettings'

export interface SettingRowProps {
  readonly field: SettingField
  readonly value: unknown
  readonly isDirty: boolean
  readonly onChange: (value: unknown) => void
}

/**
 * Individual setting row: label + input + description + dirty indicator.
 * Renders the appropriate input element based on field.type.
 */
export function SettingRow({ field, value, isDirty, onChange }: SettingRowProps) {
  const inputId = `setting-${field.key}`

  const renderInput = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            id={inputId}
            type="text"
            value={String(value ?? '')}
            onChange={e => onChange(e.target.value)}
          />
        )

      case 'number':
        return (
          <input
            id={inputId}
            type="number"
            value={String(value ?? '')}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={e => onChange(Number(e.target.value))}
          />
        )

      case 'boolean':
        return (
          <input
            id={inputId}
            type="checkbox"
            checked={Boolean(value)}
            onChange={e => onChange(e.target.checked)}
          />
        )

      case 'select':
        return (
          <select
            id={inputId}
            value={String(value ?? '')}
            onChange={e => onChange(e.target.value)}
          >
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )

      case 'color':
        return (
          <input
            id={inputId}
            type="color"
            value={String(value ?? '#000000')}
            onChange={e => onChange(e.target.value)}
          />
        )

      case 'range':
        return (
          <input
            id={inputId}
            type="range"
            value={String(value ?? 0)}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={e => onChange(Number(e.target.value))}
          />
        )

      default:
        return null
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        marginBottom: '0.75rem',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label htmlFor={inputId} style={{ fontWeight: 500, minWidth: '120px' }}>
          {field.label}
        </label>
        {renderInput()}
        {isDirty && (
          <span
            data-testid={`dirty-${field.key}`}
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
            }}
            aria-label="Modified"
          />
        )}
      </div>
      {field.description && (
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
          {field.description}
        </span>
      )}
    </div>
  )
}
