'use client';

import { useState, useCallback } from 'react';

/**
 * Validation rule configuration for form fields.
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

/**
 * Validation errors object with field names as keys.
 */
export interface ValidationErrors {
  [field: string]: string | null;
}

/**
 * Validates form values against provided rules.
 * Returns an object with field names as keys and error messages (or null) as values.
 *
 * @param values - Object containing field values to validate
 * @param rules - Object containing validation rules for each field
 * @returns Object with validation errors for each field
 *
 * @example
 * const errors = validate(
 *   { email: 'test@example.com', name: 'John' },
 *   {
 *     email: { required: true, pattern: patterns.email },
 *     name: { required: true, minLength: 2, maxLength: 50 }
 *   }
 * );
 */
export function validate(
  values: Record<string, string>,
  rules: Record<string, ValidationRule>
): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = values[field] ?? '';

    if (rule.required && !value.trim()) {
      errors[field] = '필수 항목입니다';
      continue;
    }

    if (!value) {
      errors[field] = null;
      continue;
    }

    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `최소 ${rule.minLength}자 이상 입력해주세요`;
      continue;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `최대 ${rule.maxLength}자까지 입력 가능합니다`;
      continue;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = '올바른 형식이 아닙니다';
      continue;
    }

    if (rule.custom) {
      errors[field] = rule.custom(value);
      continue;
    }

    errors[field] = null;
  }

  return errors;
}

/**
 * Hook for managing form validation state and operations.
 * Provides methods to validate individual fields or all fields at once.
 *
 * @param rules - Validation rules for form fields
 * @returns Object with errors state and validation methods
 *
 * @example
 * const { errors, validateField, validateAll, clearErrors } = useFormValidation({
 *   email: { required: true, pattern: patterns.email },
 *   password: { required: true, minLength: 8 }
 * });
 *
 * // Validate single field on blur
 * <input onBlur={(e) => validateField('email', e.target.value)} />
 *
 * // Validate all fields on submit
 * const handleSubmit = (values) => {
 *   if (validateAll(values)) {
 *     // Submit form
 *   }
 * };
 */
export function useFormValidation(rules: Record<string, ValidationRule>) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((name: string, value: string) => {
    const rule = rules[name];
    if (!rule) return;

    const fieldErrors = validate({ [name]: value }, { [name]: rule });
    setErrors(prev => ({
      ...prev,
      [name]: fieldErrors[name]
    }));
  }, [rules]);

  const validateAll = useCallback((values: Record<string, string>): boolean => {
    const validationErrors = validate(values, rules);
    setErrors(validationErrors);

    return Object.values(validationErrors).every(error => error === null);
  }, [rules]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: null
    }));
  }, []);

  return {
    errors,
    validateField,
    validateAll,
    clearErrors,
    clearError
  };
}

/**
 * Common validation patterns for frequent use cases.
 */
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  apiKey: /^sk-[a-zA-Z0-9]{10,}$/,
  phone: /^01[016789]-?\d{3,4}-?\d{4}$/,
  number: /^\d+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
};
