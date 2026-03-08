'use client'

import type { FieldConfig } from './hooks/useFormBuilder'

export interface FormFieldProps {
  readonly field: FieldConfig
  readonly value: unknown
  readonly error?: string
  readonly touched?: boolean
  readonly onChange: (name: string, value: unknown) => void
  readonly onBlur: (name: string) => void
}

/**
 * Renders a single form field based on FieldConfig.
 * Supports text, email, password, number, select, checkbox, and textarea types.
 * Includes accessibility attributes (aria-invalid, aria-describedby) and error display.
 *
 * @example
 * ```tsx
 * <FormField
 *   field={{ name: 'email', type: 'email', label: 'Email', required: true }}
 *   value={form.values.email}
 *   error={form.errors.email}
 *   touched={form.touched.email}
 *   onChange={form.handleChange}
 *   onBlur={form.handleBlur}
 * />
 * ```
 */
export default function FormField({ field, value, error, touched, onChange, onBlur }: FormFieldProps) {
  const errorId = `${field.name}-error`
  const hasError = touched && !!error
  const baseInputClass = [
    'w-full px-3 py-2 border rounded-md text-sm transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-primary/40',
    hasError ? 'border-red-500' : 'border-gray-300',
  ].join(' ')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = field.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : field.type === 'number'
        ? e.target.value
        : e.target.value
    onChange(field.name, newValue)
  }

  const handleInputBlur = () => {
    onBlur(field.name)
  }

  const renderInput = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={String(value ?? '')}
            placeholder={field.placeholder}
            required={field.required}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            className={`${baseInputClass} min-h-[80px] resize-y`}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
          />
        )

      case 'select':
        return (
          <select
            id={field.name}
            name={field.name}
            value={String(value ?? '')}
            required={field.required}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            className={baseInputClass}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
          >
            <option value="">{field.placeholder ?? 'Select...'}</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input
              id={field.name}
              name={field.name}
              type="checkbox"
              checked={!!value}
              required={field.required}
              aria-invalid={hasError}
              aria-describedby={hasError ? errorId : undefined}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/40"
              onChange={handleInputChange}
              onBlur={handleInputBlur}
            />
            <label htmlFor={field.name} className="text-sm text-gray-700">
              {field.label}
            </label>
          </div>
        )

      default:
        return (
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            value={String(value ?? '')}
            placeholder={field.placeholder}
            required={field.required}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            className={baseInputClass}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
          />
        )
    }
  }

  return (
    <div className="mb-4">
      {field.type !== 'checkbox' && (
        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
          {field.label}
          {field.required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      {renderInput()}
      {hasError && (
        <p id={errorId} className="mt-1 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
