'use client'

import { useState, useCallback, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PropType = 'string' | 'number' | 'boolean' | 'select' | 'color' | 'range'

export interface PropDef {
  readonly name: string
  readonly type: PropType
  readonly defaultValue: unknown
  readonly options?: readonly string[]
  readonly min?: number
  readonly max?: number
  readonly step?: number
  readonly description?: string
}

export interface UsePlaygroundReturn {
  /** Current prop values keyed by name */
  readonly values: Record<string, unknown>
  /** Update a single prop value (immutable) */
  readonly setValue: (name: string, value: unknown) => void
  /** Reset all props to their defaults */
  readonly reset: () => void
  /** Generate a JSX code snippet reflecting current values */
  readonly getCode: (componentName?: string) => string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildDefaults(defs: readonly PropDef[]): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const def of defs) {
    result[def.name] = def.defaultValue
  }
  return result
}

function formatValue(type: PropType, value: unknown): string {
  if (type === 'string' || type === 'color' || type === 'select') {
    return `"${String(value)}"`
  }
  if (type === 'boolean') {
    return value ? 'true' : 'false'
  }
  return String(value)
}

function formatProp(type: PropType, name: string, value: unknown): string {
  if (type === 'boolean' && value === true) {
    return name
  }
  if (type === 'boolean' && value === false) {
    return `${name}={false}`
  }
  if (type === 'string' || type === 'color' || type === 'select') {
    return `${name}=${formatValue(type, value)}`
  }
  return `${name}={${formatValue(type, value)}}`
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePlayground(propDefs: readonly PropDef[]): UsePlaygroundReturn {
  const defaults = useMemo(() => buildDefaults(propDefs), [propDefs])
  const [values, setValues] = useState<Record<string, unknown>>(defaults)

  const setValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const reset = useCallback(() => {
    setValues(buildDefaults(propDefs))
  }, [propDefs])

  const getCode = useCallback(
    (componentName = 'Component') => {
      const props = propDefs
        .filter((def) => values[def.name] !== def.defaultValue)
        .map((def) => formatProp(def.type, def.name, values[def.name]))

      if (props.length === 0) {
        return `<${componentName} />`
      }

      if (props.length <= 2) {
        return `<${componentName} ${props.join(' ')} />`
      }

      const indented = props.map((p) => `  ${p}`).join('\n')
      return `<${componentName}\n${indented}\n/>`
    },
    [propDefs, values],
  )

  return { values, setValue, reset, getCode }
}
