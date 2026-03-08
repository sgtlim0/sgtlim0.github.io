'use client'

import { useState, useCallback, useMemo, useRef, type FormEvent } from 'react'
import { z } from 'zod'

/**
 * Configuration for a single form field.
 */
export interface FieldConfig {
  readonly name: string
  readonly type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea'
  readonly label: string
  readonly placeholder?: string
  readonly required?: boolean
  readonly options?: ReadonlyArray<{ readonly value: string; readonly label: string }>
  readonly validation?: z.ZodType
}

/**
 * Return type for useFormBuilder hook.
 */
export interface UseFormBuilderReturn {
  readonly values: Readonly<Record<string, unknown>>
  readonly errors: Readonly<Record<string, string>>
  readonly touched: Readonly<Record<string, boolean>>
  readonly handleChange: (name: string, value: unknown) => void
  readonly handleBlur: (name: string) => void
  readonly handleSubmit: (onSubmit: (values: Record<string, unknown>) => void) => (e: FormEvent) => void
  readonly isValid: boolean
  readonly reset: () => void
}

function buildInitialValues(fields: ReadonlyArray<FieldConfig>): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const field of fields) {
    values[field.name] = field.type === 'checkbox' ? false : ''
  }
  return values
}

function validateField(field: FieldConfig, value: unknown): string | null {
  // Zod validation takes priority
  if (field.validation) {
    const result = field.validation.safeParse(value)
    if (!result.success) {
      return result.error.issues[0]?.message ?? 'Invalid value'
    }
    return null
  }

  // Built-in required check
  if (field.required) {
    if (field.type === 'checkbox') {
      if (value !== true) return `${field.label} is required`
    } else {
      const strValue = String(value ?? '').trim()
      if (!strValue) return `${field.label} is required`
    }
  }

  return null
}

function validateAllFields(
  fields: ReadonlyArray<FieldConfig>,
  values: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of fields) {
    const error = validateField(field, values[field.name])
    if (error) {
      errors[field.name] = error
    }
  }
  return errors
}

/**
 * Hook for building dynamic forms with Zod-based validation.
 * Manages form values, errors, touched state, and submission.
 *
 * Coexists with existing useFormValidation — this hook provides a
 * higher-level, Zod-first approach with field config arrays.
 *
 * @param fields - Array of field configurations
 * @returns Form state and handlers
 *
 * @example
 * ```tsx
 * const form = useFormBuilder([
 *   { name: 'email', type: 'email', label: 'Email', validation: z.string().email() },
 *   { name: 'age', type: 'number', label: 'Age', validation: z.coerce.number().min(0) },
 * ])
 *
 * <form onSubmit={form.handleSubmit((values) => console.log(values))}>
 *   <input value={form.values.email} onChange={e => form.handleChange('email', e.target.value)} />
 * </form>
 * ```
 */
export function useFormBuilder(fields: ReadonlyArray<FieldConfig>): UseFormBuilderReturn {
  const [values, setValues] = useState<Record<string, unknown>>(() => buildInitialValues(fields))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Ref to always have latest values for handleBlur (avoids stale closure)
  const valuesRef = useRef(values)
  valuesRef.current = values

  const fieldMap = useMemo(() => {
    const map = new Map<string, FieldConfig>()
    for (const field of fields) {
      map.set(field.name, field)
    }
    return map
  }, [fields])

  const handleChange = useCallback((name: string, value: unknown) => {
    setValues(prev => {
      const next = { ...prev, [name]: value }
      valuesRef.current = next
      return next
    })

    // Clear error on change if field was touched
    const field = fieldMap.get(name)
    if (field) {
      const error = validateField(field, value)
      setErrors(prev => {
        if (error) {
          return { ...prev, [name]: error }
        }
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }, [fieldMap])

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))

    const field = fieldMap.get(name)
    if (field) {
      const error = validateField(field, valuesRef.current[name])
      setErrors(prev => {
        if (error) {
          return { ...prev, [name]: error }
        }
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }, [fieldMap])

  const handleSubmit = useCallback(
    (onSubmit: (values: Record<string, unknown>) => void) => (e: FormEvent) => {
      e.preventDefault()

      // Mark all fields as touched
      const allTouched: Record<string, boolean> = {}
      for (const field of fields) {
        allTouched[field.name] = true
      }
      setTouched(allTouched)

      // Validate all
      const validationErrors = validateAllFields(fields, values)
      setErrors(validationErrors)

      if (Object.keys(validationErrors).length === 0) {
        onSubmit({ ...values })
      }
    },
    [fields, values]
  )

  const isValid = useMemo(() => {
    return Object.keys(validateAllFields(fields, values)).length === 0
  }, [fields, values])

  const reset = useCallback(() => {
    setValues(buildInitialValues(fields))
    setErrors({})
    setTouched({})
  }, [fields])

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isValid,
    reset,
  }
}
