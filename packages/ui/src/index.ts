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
export { ToastContainer } from './ToastContainer'
export { ToastQueueProvider, useToastQueue2 } from './ToastQueueProvider'
export { useToastQueue } from './hooks/useToastQueue'
export type { ToastMessage, AddToastInput } from './hooks/useToastQueue'
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
// Tooltip
export { Tooltip } from './Tooltip'
export type { TooltipProps } from './Tooltip'
export { useTooltip } from './hooks/useTooltip'
export type { TooltipPlacement, UseTooltipOptions, UseTooltipReturn } from './hooks/useTooltip'

// Persisted State
export { usePersistedState } from './hooks/usePersistedState'
export type { UsePersistedStateOptions } from './hooks/usePersistedState'

// Tabs
export { useTabs } from './hooks/useTabs'
export type { TabConfig, UseTabsOptions, UseTabsReturn } from './hooks/useTabs'
export { Tabs, TabPanel } from './Tabs'
export type { TabsProps, TabPanelProps, TabVariant } from './Tabs'
// Clipboard
export { useClipboard } from './hooks/useClipboard'
export type { UseClipboardOptions, UseClipboardReturn } from './hooks/useClipboard'
export { default as CopyButton } from './CopyButton'
export type { CopyButtonProps } from './CopyButton'

// Portal
export { usePortal, DEFAULT_PORTAL_ID } from './hooks/usePortal'
export { Portal } from './Portal'
export type { PortalProps } from './Portal'
export { PortalProvider, usePortalContext, DEFAULT_CONTAINERS } from './hooks/PortalProvider'
export type { PortalProviderProps } from './hooks/PortalProvider'

// Infinite Scroll
export { useInfiniteScroll } from './hooks/useInfiniteScroll'
export type { UseInfiniteScrollOptions, UseInfiniteScrollReturn } from './hooks/useInfiniteScroll'
export { default as InfiniteList } from './InfiniteList'
export type { InfiniteListProps } from './InfiniteList'
// Breadcrumb Navigation
export { default as Breadcrumb, BreadcrumbProvider, useBreadcrumbContext } from './Breadcrumb'
export type { BreadcrumbItem, BreadcrumbProps } from './Breadcrumb'
export { useBreadcrumb } from './hooks/useBreadcrumb'
export type { UseBreadcrumbConfig, UseBreadcrumbReturn } from './hooks/useBreadcrumb'
// Responsive Hooks
export { useMediaQuery } from './hooks/useMediaQuery'
export { useWindowSize } from './hooks/useWindowSize'
export { useBreakpoint, BREAKPOINTS } from './hooks/useBreakpoint'
export type { Breakpoint, UseBreakpointReturn } from './hooks/useBreakpoint'
export { ResponsiveContainer } from './hooks/ResponsiveContainer'
export type { ResponsiveContainerProps } from './hooks/ResponsiveContainer'
// Animation Utilities
export { useTransition } from './hooks/useTransition'
export type { TransitionState, UseTransitionOptions, UseTransitionReturn } from './hooks/useTransition'
export { useAnimatedList } from './hooks/useAnimatedList'
export type { AnimatedItem, UseAnimatedListOptions, UseAnimatedListReturn } from './hooks/useAnimatedList'
export { default as Transition, getTransitionPreset } from './Transition'
export type { TransitionProps, TransitionPresetType } from './Transition'
export { default as AnimatedList } from './AnimatedList'
export type { AnimatedListProps, AnimatedListControls } from './AnimatedList'

// Pagination
export { usePagination } from './hooks/usePagination'
export type { UsePaginationOptions, UsePaginationReturn } from './hooks/usePagination'
export { default as Pagination } from './Pagination'
export type { PaginationProps } from './Pagination'

// Accordion
export { useAccordion } from './hooks/useAccordion'
export type { UseAccordionOptions, UseAccordionReturn } from './hooks/useAccordion'
export { Accordion, AccordionItem } from './Accordion'
export type { AccordionProps, AccordionItemProps, AccordionItemConfig } from './Accordion'
// Modal
export { useModal } from './hooks/useModal'
export type { UseModalReturn } from './hooks/useModal'
export { useModalManager } from './hooks/useModalManager'
export type { UseModalManagerReturn } from './hooks/useModalManager'
export { ModalProvider, useModalContext } from './hooks/ModalProvider'
export type { ModalProviderProps } from './hooks/ModalProvider'
export { Modal } from './Modal'
export type { ModalProps, ModalSize } from './Modal'
// Select / Combobox
export { useSelect } from './hooks/useSelect'
export type { SelectOption, UseSelectConfig, UseSelectReturn } from './hooks/useSelect'
export { Select } from './Select'
export type { SelectProps } from './Select'
// Stepper
export { useStepper } from './hooks/useStepper'
export type { StepConfig, UseStepperOptions, UseStepperReturn } from './hooks/useStepper'
export { Stepper, StepperContent } from './Stepper'
export type { StepperProps, StepperContentProps, StepperOrientation } from './Stepper'
// Avatar
export { default as Avatar } from './Avatar'
export type { AvatarProps, AvatarSize, AvatarStatus, AvatarShape } from './Avatar'
export { default as AvatarGroup } from './AvatarGroup'
export type { AvatarGroupProps } from './AvatarGroup'
export { getInitials, getAvatarColor } from './utils/avatarUtils'

// Offline Queue
export { useOfflineQueue } from './hooks/useOfflineQueue'
export type { UseOfflineQueueOptions, UseOfflineQueueReturn } from './hooks/useOfflineQueue'
export { OfflineIndicator } from './OfflineIndicator'
export type { OfflineIndicatorProps } from './OfflineIndicator'

// Webhook
export { useWebhook } from './hooks/useWebhook'
export type { UseWebhookReturn } from './hooks/useWebhook'

// Content Version History
export { useContentVersion } from './hooks/useContentVersion'
export type { ContentVersion, UseContentVersionOptions, UseContentVersionReturn } from './hooks/useContentVersion'
export { computeDiff, formatUnifiedDiff } from './utils/contentDiff'
export type { DiffLine, DiffLineType, DiffResult } from './utils/contentDiff'
export { DiffViewer } from './DiffViewer'
export type { DiffViewerProps, DiffViewMode } from './DiffViewer'
export { VersionHistory } from './VersionHistory'
export type { VersionHistoryProps } from './VersionHistory'
// Query (SWR-like stale-while-revalidate)
export { QueryProvider, useQueryCache } from './hooks/QueryProvider'
export type { QueryProviderProps } from './hooks/QueryProvider'
export { useQuery } from './hooks/useQuery'
export type { UseQueryOptions, UseQueryReturn } from './hooks/useQuery'
export { useMutation } from './hooks/useMutation'
export type { UseMutationOptions, UseMutationReturn } from './hooks/useMutation'

// Health Monitor
export { useHealthMonitor } from './hooks/useHealthMonitor'
export type { UseHealthMonitorOptions, UseHealthMonitorReturn, HealthEvent, HealthHistoryEntry, OverallHealth } from './hooks/useHealthMonitor'

// Circuit Breaker
export { useCircuitBreaker } from './hooks/useCircuitBreaker'
export type { UseCircuitBreakerReturn } from './hooks/useCircuitBreaker'
// Batch Select / Batch Operations
export { useBatchSelect } from './hooks/useBatchSelect'
export type { UseBatchSelectReturn } from './hooks/useBatchSelect'
export { BatchActionBar } from './BatchActionBar'
export type { BatchAction, BatchActionBarProps } from './BatchActionBar'
export { SelectableList } from './SelectableList'
export type { SelectableListProps } from './SelectableList'
// Performance Profiler
export { useRenderProfiler } from './hooks/useRenderProfiler'
export type { RenderMetrics, UseRenderProfilerReturn } from './hooks/useRenderProfiler'
export { ProfilerOverlay } from './ProfilerOverlay'
export type { ProfilerOverlayProps } from './ProfilerOverlay'
export { withProfiler } from './withProfiler'
// Color Picker
export { useColorPicker } from './hooks/useColorPicker'
export type { UseColorPickerReturn } from './hooks/useColorPicker'
export { default as ColorPicker } from './ColorPicker'
export type { ColorPickerProps } from './ColorPicker'
export { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, isValidHex, getContrastColor } from './utils/colorUtils'
export type { RGB, HSL } from './utils/colorUtils'

// Markdown Editor
export { useMarkdownEditor, MARKDOWN_SYNTAXES } from './hooks/useMarkdownEditor'
export type { MarkdownSyntax, UseMarkdownEditorReturn } from './hooks/useMarkdownEditor'
export { default as MarkdownEditor, MarkdownPreview, TOOLBAR_BUTTONS } from './MarkdownEditor'
export type { MarkdownEditorProps, EditorViewMode } from './MarkdownEditor'

// Date Picker
export { useDatePicker } from './hooks/useDatePicker'
export type { DayInfo, UseDatePickerOptions, DateRange, UseDatePickerReturn } from './hooks/useDatePicker'
export { DatePicker } from './DatePicker'
export type { DatePickerProps } from './DatePicker'
// DataGrid (advanced table with sort/filter/resize/pagination)
export { useDataGrid } from './hooks/useDataGrid'
export type { ColumnDef, DataGridOptions, UseDataGridReturn } from './hooks/useDataGrid'
export { DataGrid } from './DataGrid'
export type { DataGridProps } from './DataGrid'
// Timeline
export { useTimeline } from './hooks/useTimeline'
export type { TimelineItemData, TimelineGroup, TimelineStatus, TimelineSortOrder, UseTimelineOptions, UseTimelineReturn } from './hooks/useTimeline'
export { Timeline, TimelineMarker, formatTimestamp } from './Timeline'
export type { TimelineItem, TimelineOrientation, TimelineProps, TimelineItemProps } from './Timeline'
// Rating
export { useRating } from './hooks/useRating'
export type { UseRatingOptions, UseRatingReturn } from './hooks/useRating'
export { default as Rating } from './Rating'
export type { RatingProps, RatingSize } from './Rating'

// Settings Panel
export { useSettings } from './hooks/useSettings'
export type { SettingField, UseSettingsReturn } from './hooks/useSettings'
export { SettingsPanel } from './SettingsPanel'
export type { SettingsPanelProps } from './SettingsPanel'
export { SettingRow } from './SettingRow'
export type { SettingRowProps } from './SettingRow'
