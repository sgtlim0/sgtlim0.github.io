'use client'

import { useState, useCallback, useMemo } from 'react'

/**
 * Configuration for a single setting field.
 */
export interface SettingField {
  readonly key: string
  readonly label: string
  readonly type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'range'
  readonly value: unknown
  readonly description?: string
  readonly options?: ReadonlyArray<{ readonly value: string; readonly label: string }>
  readonly min?: number
  readonly max?: number
  readonly step?: number
  readonly category?: string
}

/**
 * Return type for useSettings hook.
 */
export interface UseSettingsReturn {
  readonly values: Readonly<Record<string, unknown>>
  readonly setValue: (key: string, value: unknown) => void
  readonly reset: () => void
  readonly isDirty: boolean
  readonly dirtyKeys: readonly string[]
  readonly getField: (key: string) => SettingField | undefined
  readonly save: () => Record<string, unknown>
}

function buildInitialValues(fields: ReadonlyArray<SettingField>): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const field of fields) {
    values[field.key] = field.value
  }
  return values
}

/**
 * Hook for managing key-value settings with dirty tracking.
 *
 * Coexists with existing AdminSettings — this hook provides a generic,
 * type-aware settings editor with category grouping and dirty state.
 *
 * @param fields - Array of setting field configurations
 * @returns Settings state and handlers
 *
 * @example
 * ```tsx
 * const settings = useSettings([
 *   { key: 'siteName', label: 'Site Name', type: 'text', value: 'My Site' },
 *   { key: 'darkMode', label: 'Dark Mode', type: 'boolean', value: false },
 * ])
 *
 * settings.setValue('siteName', 'New Site')
 * if (settings.isDirty) {
 *   const snapshot = settings.save()
 * }
 * ```
 */
export function useSettings(fields: ReadonlyArray<SettingField>): UseSettingsReturn {
  const fieldInitialValues = useMemo(() => buildInitialValues(fields), [fields])
  const [baseline, setBaseline] = useState<Record<string, unknown>>(() => ({ ...fieldInitialValues }))
  const [values, setValues] = useState<Record<string, unknown>>(() => ({ ...fieldInitialValues }))

  const fieldMap = useMemo(() => {
    const map = new Map<string, SettingField>()
    for (const field of fields) {
      map.set(field.key, field)
    }
    return map
  }, [fields])

  const validKeys = useMemo(() => new Set(fields.map(f => f.key)), [fields])

  const dirtyKeys = useMemo(() => {
    const keys: string[] = []
    for (const key of validKeys) {
      if (values[key] !== baseline[key]) {
        keys.push(key)
      }
    }
    return keys
  }, [values, baseline, validKeys])

  const isDirty = dirtyKeys.length > 0

  const setValue = useCallback((key: string, value: unknown) => {
    if (!validKeys.has(key)) return
    setValues(prev => ({ ...prev, [key]: value }))
  }, [validKeys])

  const reset = useCallback(() => {
    setValues({ ...fieldInitialValues })
    setBaseline({ ...fieldInitialValues })
  }, [fieldInitialValues])

  const getField = useCallback((key: string): SettingField | undefined => {
    return fieldMap.get(key)
  }, [fieldMap])

  const save = useCallback((): Record<string, unknown> => {
    const snapshot = { ...values }
    setBaseline({ ...values })
    return snapshot
  }, [values])

  return {
    values,
    setValue,
    reset,
    isDirty,
    dirtyKeys,
    getField,
    save,
  }
}
