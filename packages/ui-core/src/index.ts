// @hchat/ui-core — Shared UI components extracted from @hchat/ui
// Re-exports from the monolithic package for backward compatibility during migration

export { default as Badge } from '../../ui/src/Badge'
export type { BadgeProps } from '../../ui/src/Badge'

export { default as ThemeProvider, useTheme } from '../../ui/src/ThemeProvider'
export { default as ThemeToggle } from '../../ui/src/ThemeToggle'

export { default as FeatureCard } from '../../ui/src/FeatureCard'
export type { FeatureCardProps } from '../../ui/src/FeatureCard'

export {
  SkeletonPulse,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonChart,
} from '../../ui/src/Skeleton'
export { ToastProvider, useToast } from '../../ui/src/Toast'
export { default as ErrorBoundary, ErrorFallback } from '../../ui/src/ErrorBoundary'
export { default as EmptyState } from '../../ui/src/EmptyState'
export type { EmptyStateProps } from '../../ui/src/EmptyState'

export { validate, useFormValidation, patterns } from '../../ui/src/validation'
export type { ValidationRule, ValidationErrors } from '../../ui/src/validation'
