'use client'

import { useFormBuilder, type FieldConfig } from './hooks/useFormBuilder'
import FormField from './FormField'

export interface DynamicFormProps {
  readonly fields: ReadonlyArray<FieldConfig>
  readonly onSubmit: (values: Record<string, unknown>) => void
  readonly submitLabel?: string
  readonly className?: string
}

/**
 * Generates a complete form from a FieldConfig array.
 * Uses useFormBuilder for state management and Zod validation.
 * Renders FormField components for each field with a submit button.
 *
 * @example
 * ```tsx
 * import { z } from 'zod'
 *
 * <DynamicForm
 *   fields={[
 *     { name: 'name', type: 'text', label: 'Name', required: true },
 *     { name: 'email', type: 'email', label: 'Email', validation: z.string().email() },
 *     { name: 'role', type: 'select', label: 'Role', options: [
 *       { value: 'admin', label: 'Admin' },
 *       { value: 'user', label: 'User' },
 *     ]},
 *   ]}
 *   onSubmit={(values) => console.log(values)}
 *   submitLabel="Create"
 * />
 * ```
 */
export default function DynamicForm({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  className,
}: DynamicFormProps) {
  const form = useFormBuilder(fields)

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={className}
      noValidate
    >
      {fields.map(field => (
        <FormField
          key={field.name}
          field={field}
          value={form.values[field.name]}
          error={form.errors[field.name]}
          touched={form.touched[field.name]}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
        />
      ))}
      <button
        type="submit"
        disabled={!form.isValid}
        className={[
          'w-full px-4 py-2 rounded-md text-sm font-medium text-white transition-colors',
          form.isValid
            ? 'bg-primary hover:bg-primary/90 cursor-pointer'
            : 'bg-gray-300 cursor-not-allowed',
        ].join(' ')}
      >
        {submitLabel}
      </button>
    </form>
  )
}
