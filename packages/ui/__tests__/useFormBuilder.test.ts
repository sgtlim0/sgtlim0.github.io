import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { z } from 'zod'
import { useFormBuilder, type FieldConfig } from '../src/hooks/useFormBuilder'

const textField: FieldConfig = {
  name: 'username',
  type: 'text',
  label: 'Username',
  required: true,
}

const emailField: FieldConfig = {
  name: 'email',
  type: 'email',
  label: 'Email',
  validation: z.string().email('Invalid email format'),
}

const passwordField: FieldConfig = {
  name: 'password',
  type: 'password',
  label: 'Password',
  required: true,
  validation: z.string().min(8, 'Must be at least 8 characters'),
}

const numberField: FieldConfig = {
  name: 'age',
  type: 'number',
  label: 'Age',
  validation: z.coerce.number().min(0, 'Must be non-negative').max(150, 'Must be 150 or less'),
}

const selectField: FieldConfig = {
  name: 'role',
  type: 'select',
  label: 'Role',
  required: true,
  options: [
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' },
  ],
}

const checkboxField: FieldConfig = {
  name: 'agree',
  type: 'checkbox',
  label: 'I agree',
  required: true,
}

const textareaField: FieldConfig = {
  name: 'bio',
  type: 'textarea',
  label: 'Bio',
  placeholder: 'Tell us about yourself',
}

describe('useFormBuilder', () => {
  describe('initial state', () => {
    it('initializes text fields with empty string', () => {
      const { result } = renderHook(() => useFormBuilder([textField, emailField]))
      expect(result.current.values.username).toBe('')
      expect(result.current.values.email).toBe('')
    })

    it('initializes checkbox fields with false', () => {
      const { result } = renderHook(() => useFormBuilder([checkboxField]))
      expect(result.current.values.agree).toBe(false)
    })

    it('initializes number fields with empty string', () => {
      const { result } = renderHook(() => useFormBuilder([numberField]))
      expect(result.current.values.age).toBe('')
    })

    it('starts with no errors', () => {
      const { result } = renderHook(() => useFormBuilder([textField, emailField]))
      expect(result.current.errors).toEqual({})
    })

    it('starts with no touched fields', () => {
      const { result } = renderHook(() => useFormBuilder([textField, emailField]))
      expect(result.current.touched).toEqual({})
    })

    it('initializes textarea and select with empty string', () => {
      const { result } = renderHook(() => useFormBuilder([textareaField, selectField]))
      expect(result.current.values.bio).toBe('')
      expect(result.current.values.role).toBe('')
    })
  })

  describe('handleChange', () => {
    it('updates the field value', () => {
      const { result } = renderHook(() => useFormBuilder([textField]))

      act(() => {
        result.current.handleChange('username', 'John')
      })

      expect(result.current.values.username).toBe('John')
    })

    it('does not mutate previous values object', () => {
      const { result } = renderHook(() => useFormBuilder([textField, emailField]))
      const prevValues = result.current.values

      act(() => {
        result.current.handleChange('username', 'John')
      })

      expect(prevValues).not.toBe(result.current.values)
      expect(prevValues.username).toBe('')
    })

    it('clears error when value becomes valid', () => {
      const { result } = renderHook(() => useFormBuilder([emailField]))

      // Set invalid then blur to trigger error
      act(() => {
        result.current.handleChange('email', 'invalid')
        result.current.handleBlur('email')
      })
      expect(result.current.errors.email).toBeTruthy()

      // Fix the value
      act(() => {
        result.current.handleChange('email', 'valid@test.com')
      })
      expect(result.current.errors.email).toBeUndefined()
    })

    it('sets error when value becomes invalid on change', () => {
      const { result } = renderHook(() => useFormBuilder([emailField]))

      act(() => {
        result.current.handleChange('email', 'not-email')
      })

      expect(result.current.errors.email).toBe('Invalid email format')
    })

    it('handles checkbox value (boolean)', () => {
      const { result } = renderHook(() => useFormBuilder([checkboxField]))

      act(() => {
        result.current.handleChange('agree', true)
      })

      expect(result.current.values.agree).toBe(true)
    })
  })

  describe('handleBlur', () => {
    it('marks the field as touched', () => {
      const { result } = renderHook(() => useFormBuilder([textField]))

      act(() => {
        result.current.handleBlur('username')
      })

      expect(result.current.touched.username).toBe(true)
    })

    it('validates field on blur', () => {
      const { result } = renderHook(() => useFormBuilder([textField]))

      act(() => {
        result.current.handleBlur('username')
      })

      expect(result.current.errors.username).toBe('Username is required')
    })

    it('does not set error for valid field', () => {
      const { result } = renderHook(() => useFormBuilder([textField]))

      act(() => {
        result.current.handleChange('username', 'John')
      })

      act(() => {
        result.current.handleBlur('username')
      })

      expect(result.current.errors.username).toBeUndefined()
    })

    it('does not mutate previous touched object', () => {
      const { result } = renderHook(() => useFormBuilder([textField, emailField]))
      const prevTouched = result.current.touched

      act(() => {
        result.current.handleBlur('username')
      })

      expect(prevTouched).not.toBe(result.current.touched)
    })
  })

  describe('Zod validation', () => {
    it('validates email format with Zod', () => {
      const { result } = renderHook(() => useFormBuilder([emailField]))

      act(() => {
        result.current.handleChange('email', 'not-an-email')
        result.current.handleBlur('email')
      })

      expect(result.current.errors.email).toBe('Invalid email format')
    })

    it('passes Zod validation for valid email', () => {
      const { result } = renderHook(() => useFormBuilder([emailField]))

      act(() => {
        result.current.handleChange('email', 'test@example.com')
        result.current.handleBlur('email')
      })

      expect(result.current.errors.email).toBeUndefined()
    })

    it('validates password minimum length with Zod', () => {
      const { result } = renderHook(() => useFormBuilder([passwordField]))

      act(() => {
        result.current.handleChange('password', 'short')
        result.current.handleBlur('password')
      })

      expect(result.current.errors.password).toBe('Must be at least 8 characters')
    })

    it('validates number range with Zod', () => {
      const { result } = renderHook(() => useFormBuilder([numberField]))

      act(() => {
        result.current.handleChange('age', '-5')
        result.current.handleBlur('age')
      })

      expect(result.current.errors.age).toBe('Must be non-negative')
    })

    it('Zod validation takes priority over built-in required', () => {
      const { result } = renderHook(() => useFormBuilder([passwordField]))

      // Empty string should fail Zod min(8) before built-in required
      act(() => {
        result.current.handleBlur('password')
      })

      expect(result.current.errors.password).toBe('Must be at least 8 characters')
    })
  })

  describe('built-in required validation', () => {
    it('validates required text field', () => {
      const { result } = renderHook(() => useFormBuilder([textField]))

      act(() => {
        result.current.handleBlur('username')
      })

      expect(result.current.errors.username).toBe('Username is required')
    })

    it('validates required select field', () => {
      const { result } = renderHook(() => useFormBuilder([selectField]))

      act(() => {
        result.current.handleBlur('role')
      })

      expect(result.current.errors.role).toBe('Role is required')
    })

    it('validates required checkbox', () => {
      const { result } = renderHook(() => useFormBuilder([checkboxField]))

      act(() => {
        result.current.handleBlur('agree')
      })

      expect(result.current.errors.agree).toBe('I agree is required')
    })

    it('passes required check for checkbox when true', () => {
      const { result } = renderHook(() => useFormBuilder([checkboxField]))

      act(() => {
        result.current.handleChange('agree', true)
        result.current.handleBlur('agree')
      })

      expect(result.current.errors.agree).toBeUndefined()
    })

    it('treats whitespace-only as empty for required', () => {
      const { result } = renderHook(() => useFormBuilder([textField]))

      act(() => {
        result.current.handleChange('username', '   ')
        result.current.handleBlur('username')
      })

      expect(result.current.errors.username).toBe('Username is required')
    })

    it('does not error on optional empty field', () => {
      const { result } = renderHook(() => useFormBuilder([textareaField]))

      act(() => {
        result.current.handleBlur('bio')
      })

      expect(result.current.errors.bio).toBeUndefined()
    })
  })

  describe('isValid', () => {
    it('returns false when required fields are empty', () => {
      const { result } = renderHook(() => useFormBuilder([textField]))
      expect(result.current.isValid).toBe(false)
    })

    it('returns true when all fields are valid', () => {
      const { result } = renderHook(() => useFormBuilder([textField, emailField]))

      act(() => {
        result.current.handleChange('username', 'John')
        result.current.handleChange('email', 'john@test.com')
      })

      expect(result.current.isValid).toBe(true)
    })

    it('returns false when Zod validation fails', () => {
      const { result } = renderHook(() => useFormBuilder([emailField]))

      act(() => {
        result.current.handleChange('email', 'not-email')
      })

      expect(result.current.isValid).toBe(false)
    })

    it('returns true for empty optional fields', () => {
      const { result } = renderHook(() => useFormBuilder([textareaField]))
      expect(result.current.isValid).toBe(true)
    })
  })

  describe('handleSubmit', () => {
    it('prevents default form event', () => {
      const { result } = renderHook(() => useFormBuilder([textareaField]))
      const onSubmit = vi.fn()
      const preventDefault = vi.fn()

      act(() => {
        result.current.handleSubmit(onSubmit)({ preventDefault } as unknown as React.FormEvent)
      })

      expect(preventDefault).toHaveBeenCalled()
    })

    it('calls onSubmit with values when form is valid', () => {
      const { result } = renderHook(() => useFormBuilder([textField]))
      const onSubmit = vi.fn()

      act(() => {
        result.current.handleChange('username', 'John')
      })

      act(() => {
        result.current.handleSubmit(onSubmit)({ preventDefault: vi.fn() } as unknown as React.FormEvent)
      })

      expect(onSubmit).toHaveBeenCalledWith({ username: 'John' })
    })

    it('does not call onSubmit when form is invalid', () => {
      const { result } = renderHook(() => useFormBuilder([textField]))
      const onSubmit = vi.fn()

      act(() => {
        result.current.handleSubmit(onSubmit)({ preventDefault: vi.fn() } as unknown as React.FormEvent)
      })

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('marks all fields as touched on submit', () => {
      const { result } = renderHook(() => useFormBuilder([textField, emailField]))

      act(() => {
        result.current.handleSubmit(vi.fn())({ preventDefault: vi.fn() } as unknown as React.FormEvent)
      })

      expect(result.current.touched.username).toBe(true)
      expect(result.current.touched.email).toBe(true)
    })

    it('sets errors on submit for invalid fields', () => {
      const { result } = renderHook(() => useFormBuilder([textField, emailField]))

      act(() => {
        result.current.handleChange('email', 'bad')
      })

      act(() => {
        result.current.handleSubmit(vi.fn())({ preventDefault: vi.fn() } as unknown as React.FormEvent)
      })

      expect(result.current.errors.username).toBeTruthy()
      expect(result.current.errors.email).toBeTruthy()
    })

    it('passes a copy of values, not the original object', () => {
      const { result } = renderHook(() => useFormBuilder([textField]))
      const onSubmit = vi.fn()

      act(() => {
        result.current.handleChange('username', 'John')
      })

      act(() => {
        result.current.handleSubmit(onSubmit)({ preventDefault: vi.fn() } as unknown as React.FormEvent)
      })

      expect(onSubmit.mock.calls[0][0]).not.toBe(result.current.values)
      expect(onSubmit.mock.calls[0][0]).toEqual(result.current.values)
    })
  })

  describe('reset', () => {
    it('resets values to initial state', () => {
      const { result } = renderHook(() => useFormBuilder([textField, checkboxField]))

      act(() => {
        result.current.handleChange('username', 'John')
        result.current.handleChange('agree', true)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.values.username).toBe('')
      expect(result.current.values.agree).toBe(false)
    })

    it('clears all errors', () => {
      const { result } = renderHook(() => useFormBuilder([textField]))

      act(() => {
        result.current.handleBlur('username')
      })
      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0)

      act(() => {
        result.current.reset()
      })

      expect(result.current.errors).toEqual({})
    })

    it('clears all touched state', () => {
      const { result } = renderHook(() => useFormBuilder([textField]))

      act(() => {
        result.current.handleBlur('username')
      })
      expect(result.current.touched.username).toBe(true)

      act(() => {
        result.current.reset()
      })

      expect(result.current.touched).toEqual({})
    })
  })

  describe('multiple fields form', () => {
    const fields: FieldConfig[] = [
      textField,
      emailField,
      passwordField,
      selectField,
      checkboxField,
      textareaField,
      numberField,
    ]

    it('handles a complex form with all field types', () => {
      const { result } = renderHook(() => useFormBuilder(fields))
      const onSubmit = vi.fn()

      act(() => {
        result.current.handleChange('username', 'John')
        result.current.handleChange('email', 'john@test.com')
        result.current.handleChange('password', 'securepass123')
        result.current.handleChange('role', 'admin')
        result.current.handleChange('agree', true)
        result.current.handleChange('bio', 'Hello world')
        result.current.handleChange('age', '25')
      })

      expect(result.current.isValid).toBe(true)

      act(() => {
        result.current.handleSubmit(onSubmit)({ preventDefault: vi.fn() } as unknown as React.FormEvent)
      })

      expect(onSubmit).toHaveBeenCalledWith({
        username: 'John',
        email: 'john@test.com',
        password: 'securepass123',
        role: 'admin',
        agree: true,
        bio: 'Hello world',
        age: '25',
      })
    })

    it('reports only invalid fields, not all fields', () => {
      const { result } = renderHook(() => useFormBuilder(fields))

      act(() => {
        result.current.handleChange('username', 'John')
        result.current.handleChange('email', 'john@test.com')
        result.current.handleChange('password', 'securepass123')
        result.current.handleChange('agree', true)
        result.current.handleChange('age', '25')
        // role is required but not set
        // bio is optional
      })

      act(() => {
        result.current.handleSubmit(vi.fn())({ preventDefault: vi.fn() } as unknown as React.FormEvent)
      })

      expect(result.current.errors.role).toBeTruthy()
      expect(result.current.errors.username).toBeUndefined()
      expect(result.current.errors.bio).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('handles unknown field name in handleChange gracefully', () => {
      const { result } = renderHook(() => useFormBuilder([textField]))

      act(() => {
        result.current.handleChange('nonexistent', 'value')
      })

      expect(result.current.values.nonexistent).toBe('value')
    })

    it('handles unknown field name in handleBlur gracefully', () => {
      const { result } = renderHook(() => useFormBuilder([textField]))

      act(() => {
        result.current.handleBlur('nonexistent')
      })

      expect(result.current.touched.nonexistent).toBe(true)
    })

    it('handles empty fields array', () => {
      const { result } = renderHook(() => useFormBuilder([]))
      expect(result.current.values).toEqual({})
      expect(result.current.isValid).toBe(true)
    })

    it('Zod fallback error message when issue message is missing', () => {
      const customSchema = z.string().refine(() => false, { message: 'Custom error' })
      const field: FieldConfig = { name: 'test', type: 'text', label: 'Test', validation: customSchema }

      const { result } = renderHook(() => useFormBuilder([field]))

      act(() => {
        result.current.handleChange('test', 'anything')
        result.current.handleBlur('test')
      })

      expect(result.current.errors.test).toBe('Custom error')
    })
  })
})
