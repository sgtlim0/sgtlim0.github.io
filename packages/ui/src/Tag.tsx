'use client'

import React from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger'
export type TagSize = 'sm' | 'md'

export interface TagProps {
  label: string
  variant?: TagVariant
  size?: TagSize
  onRemove?: () => void
  className?: string
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const variantStyles: Record<TagVariant, string> = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const sizeStyles: Record<TagSize, string> = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Tag({
  label,
  variant = 'default',
  size = 'md',
  onRemove,
  className = '',
}: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      role="listitem"
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-current"
          aria-label={`Remove ${label}`}
          style={{ width: size === 'sm' ? '14px' : '16px', height: size === 'sm' ? '14px' : '16px' }}
        >
          <svg
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'}
          >
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      )}
    </span>
  )
}
