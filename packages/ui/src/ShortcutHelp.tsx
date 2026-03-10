'use client'

import { useEffect, useRef, useCallback, type ReactNode } from 'react'
import { ShortcutKey } from './ShortcutKey'
import type { ShortcutGroup } from './hooks/useShortcutHelp'

export interface ShortcutHelpProps {
  /** Whether the dialog is visible */
  readonly isOpen: boolean
  /** Called when the dialog requests to close */
  readonly onClose: () => void
  /** Grouped shortcuts to display */
  readonly groups: readonly ShortcutGroup[]
  /** Current search query */
  readonly query: string
  /** Search query change handler */
  readonly onQueryChange: (query: string) => void
}

/**
 * Keyboard shortcuts help dialog.
 *
 * - Modal dialog with backdrop
 * - Search filter for shortcuts
 * - Category grouping (Navigation, Actions, Settings)
 * - Accessible: role="dialog", aria-modal, focus trap, Escape to close
 */
export function ShortcutHelp({
  isOpen,
  onClose,
  groups,
  query,
  onQueryChange,
}: ShortcutHelpProps): ReactNode {
  const dialogRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      // Delay to ensure DOM is ready
      const id = requestAnimationFrame(() => {
        searchRef.current?.focus()
      })
      return () => cancelAnimationFrame(id)
    }
  }, [isOpen])

  // Escape key to close
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    },
    [onClose],
  )

  // Backdrop click to close
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose],
  )

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  if (!isOpen) return null

  const totalCount = groups.reduce((sum, g) => sum + g.shortcuts.length, 0)

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/50 backdrop-blur-sm',
      ].join(' ')}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        className={[
          'relative w-full max-w-lg mx-4',
          'bg-[var(--color-bg-primary,#ffffff)] dark:bg-[var(--color-bg-primary,#1f2937)]',
          'rounded-xl shadow-2xl',
          'border border-[var(--color-border,#e5e7eb)] dark:border-[var(--color-border,#374151)]',
          'max-h-[80vh] flex flex-col',
          'animate-[fadeIn_150ms_ease-out]',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2
            className="text-lg font-semibold text-[var(--color-text-primary,#111827)] dark:text-[var(--color-text-primary,#f9fafb)]"
            id="shortcut-help-title"
          >
            Keyboard Shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={[
              'p-1.5 rounded-lg transition-colors',
              'text-[var(--color-text-muted,#6b7280)] hover:text-[var(--color-text-primary,#111827)]',
              'hover:bg-[var(--color-bg-secondary,#f3f4f6)] dark:hover:bg-[var(--color-bg-secondary,#374151)]',
            ].join(' ')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search shortcuts..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Search shortcuts"
            className={[
              'w-full px-3 py-2 rounded-lg text-sm',
              'bg-[var(--color-bg-secondary,#f3f4f6)] dark:bg-[var(--color-bg-secondary,#374151)]',
              'border border-[var(--color-border,#d1d5db)] dark:border-[var(--color-border,#4b5563)]',
              'text-[var(--color-text-primary,#111827)] dark:text-[var(--color-text-primary,#f9fafb)]',
              'placeholder:text-[var(--color-text-muted,#9ca3af)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#3b82f6)]',
            ].join(' ')}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {totalCount === 0 ? (
            <p className="text-sm text-[var(--color-text-muted,#9ca3af)] text-center py-8">
              {query ? 'No shortcuts found.' : 'No shortcuts registered.'}
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.category} className="mb-4 last:mb-0">
                <h3
                  className={[
                    'text-xs font-semibold uppercase tracking-wider mb-2',
                    'text-[var(--color-text-muted,#6b7280)] dark:text-[var(--color-text-muted,#9ca3af)]',
                  ].join(' ')}
                >
                  {group.category}
                </h3>
                <ul className="space-y-1" role="list">
                  {group.shortcuts.map((shortcut) => (
                    <li
                      key={`${shortcut.category}-${shortcut.key}`}
                      className={[
                        'flex items-center justify-between py-2 px-3 rounded-lg',
                        'hover:bg-[var(--color-bg-secondary,#f3f4f6)] dark:hover:bg-[var(--color-bg-secondary,#374151)]',
                        shortcut.enabled
                          ? ''
                          : 'opacity-50',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span className="text-sm text-[var(--color-text-primary,#111827)] dark:text-[var(--color-text-primary,#f9fafb)]">
                        {shortcut.description}
                      </span>
                      <ShortcutKey keys={shortcut.key} />
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div
          className={[
            'px-5 py-3 border-t',
            'border-[var(--color-border,#e5e7eb)] dark:border-[var(--color-border,#374151)]',
            'text-xs text-center',
            'text-[var(--color-text-muted,#9ca3af)]',
          ].join(' ')}
        >
          Press <ShortcutKey keys="escape" /> to close
        </div>
      </div>
    </div>
  )
}

export default ShortcutHelp
