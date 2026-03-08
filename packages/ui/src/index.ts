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

// ROI components — import from '@hchat/ui/roi' for tree-shaking
// export * from './roi'  // Removed: use '@hchat/ui/roi' or '@hchat/ui/roi/ROIOverview' etc.

// LLM Router components — import from '@hchat/ui/llm-router' for tree-shaking
// export * from './llm-router'  // Removed: use '@hchat/ui/llm-router'

// UX components
export { SkeletonPulse, SkeletonText, SkeletonCard, SkeletonTable, SkeletonImage, SkeletonChart } from './Skeleton'
export { ToastProvider, useToast } from './Toast'
export { default as ErrorBoundary, ErrorFallback } from './ErrorBoundary'
export { ErrorPage, NotFoundPage } from './ErrorPage'
export { default as EmptyState } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'

// Optimized Image
export { OptimizedImage } from './OptimizedImage'
export type { OptimizedImageProps } from './OptimizedImage'

// Validation utilities
export { validate, useFormValidation, patterns } from './validation'
export type { ValidationRule, ValidationErrors } from './validation'

// Mobile components — import from '@hchat/ui/mobile' for tree-shaking
// export * from './mobile'  // Removed: use '@hchat/ui/mobile'
