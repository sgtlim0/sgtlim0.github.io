'use client'


// @hchat/ui — Shared UI components
// Wiki components
export { default as Badge } from './Badge'
export type { BadgeProps } from './Badge'

export { default as ThemeProvider, useTheme } from './ThemeProvider'
export { default as ThemeToggle } from './ThemeToggle'

export { default as BaseLayout } from './BaseLayout'
export type { BaseLayoutProps } from './BaseLayout'

export { default as FeatureCard } from './FeatureCard'
export type { FeatureCardProps } from './FeatureCard'

// i18n
export * from './i18n'

// ROI components
export * from './roi'

// LLM Router components
export * from './llm-router'

// UX components
export { SkeletonPulse, SkeletonText, SkeletonCard, SkeletonTable, SkeletonChart } from './Skeleton'
export { ToastProvider, useToast } from './Toast'
export { default as ErrorBoundary, ErrorFallback } from './ErrorBoundary'
export { default as EmptyState } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'

// Validation utilities
export { validate, useFormValidation, patterns } from './validation'
export type { ValidationRule, ValidationErrors } from './validation'

// Mobile components
export * from './mobile'
