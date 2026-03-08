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

// Command Palette
export { CommandPalette, CommandPaletteProvider, useCommandPaletteContext, createDefaultCommands } from './CommandPalette'
export type { Command, CommandPaletteProps } from './CommandPalette'
export { useCommandPalette } from './hooks/useCommandPalette'

// Push Notification
export { default as NotificationBanner } from './NotificationBanner'
export { usePushNotification } from './hooks/usePushNotification'

// Data Export
export { default as ExportButton } from './ExportButton'
export type { ExportButtonProps } from './ExportButton'
export { useDataExport } from './hooks/useDataExport'

// Mobile components — import from '@hchat/ui/mobile' for tree-shaking
// export * from './mobile'  // Removed: use '@hchat/ui/mobile'

// Search
export { SearchOverlay } from './SearchOverlay'
export type { SearchOverlayProps } from './SearchOverlay'
export { useSearch } from './hooks/useSearch'
export type { UseSearchReturn } from './hooks/useSearch'

// Keyboard Shortcuts
export { useHotkeys, useHotkeyRegistry } from './hooks/useHotkeys'
export type { HotkeyConfig, HotkeyRegistryEntry } from './hooks/useHotkeys'
export { HotkeyProvider } from './hooks/HotkeyProvider'
export { createDefaultHotkeys } from './hooks/defaultHotkeys'
export type { DefaultHotkeyHandlers } from './hooks/defaultHotkeys'

// Undo/Redo
export { useUndoRedo } from './hooks/useUndoRedo'
export type { UndoRedoState } from './hooks/useUndoRedo'
export { UndoRedoProvider, useUndoRedoContext } from './hooks/UndoRedoProvider'

// Drag and Drop
export { useDragAndDrop } from './hooks/useDragAndDrop'
export type { DragItem, DragHandlerProps, UseDragAndDropReturn } from './hooks/useDragAndDrop'
export { default as DraggableList } from './DraggableList'
export type { DraggableListProps } from './DraggableList'
export { default as DragHandle } from './DragHandle'
export type { DragHandleProps } from './DragHandle'

// Form Builder
export { useFormBuilder } from './hooks/useFormBuilder'
export type { FieldConfig, UseFormBuilderReturn } from './hooks/useFormBuilder'
export { default as FormField } from './FormField'
export type { FormFieldProps } from './FormField'
export { default as DynamicForm } from './DynamicForm'
export type { DynamicFormProps } from './DynamicForm'

// Virtual List
export { useVirtualList } from './hooks/useVirtualList'
export type { UseVirtualListOptions, VirtualItem, UseVirtualListReturn } from './hooks/useVirtualList'
export { default as VirtualList } from './VirtualList'
export type { VirtualListProps } from './VirtualList'

// Theme Customizer
export { useThemeCustomizer } from './hooks/useThemeCustomizer'
export type { ThemeColors, ThemePreset } from './hooks/useThemeCustomizer'
export { default as ThemeCustomizer } from './ThemeCustomizer'
export type { ThemeCustomizerProps } from './ThemeCustomizer'

// Analytics / Telemetry
export { useAnalytics } from './hooks/useAnalytics'
export type { UseAnalyticsReturn } from './hooks/useAnalytics'
export { AnalyticsProvider, useAnalyticsContext } from './utils/AnalyticsProvider'
// Persisted State
export { usePersistedState } from './hooks/usePersistedState'
export type { UsePersistedStateOptions } from './hooks/usePersistedState'
