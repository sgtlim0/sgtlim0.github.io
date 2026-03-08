'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { SearchableItem, SearchOptions, SearchResult } from './utils/searchEngine'
import { useSearch } from './hooks/useSearch'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchOverlayProps {
  /** Items to search through */
  items: SearchableItem[]
  /** Callback when a result is selected */
  onSelect?: (result: SearchResult) => void
  /** Search options */
  options?: SearchOptions
  /** Placeholder text */
  placeholder?: string
  /** Whether the overlay is open (controlled mode) */
  isOpen?: boolean
  /** Callback when overlay should close */
  onClose?: () => void
}

// ---------------------------------------------------------------------------
// Highlight helper
// ---------------------------------------------------------------------------

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const idx = lowerText.indexOf(lowerQuery)

  if (idx === -1) return text

  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ backgroundColor: 'var(--search-highlight, #fef08a)', borderRadius: '2px', padding: '0 1px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

// ---------------------------------------------------------------------------
// Grouped results helper
// ---------------------------------------------------------------------------

function groupByCategory(results: SearchResult[]): Map<string, SearchResult[]> {
  const groups = new Map<string, SearchResult[]>()
  for (const r of results) {
    const existing = groups.get(r.category)
    if (existing) {
      existing.push(r)
    } else {
      groups.set(r.category, [r])
    }
  }
  return groups
}

// ---------------------------------------------------------------------------
// Category label
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<string, string> = {
  page: 'Pages',
  user: 'Users',
  setting: 'Settings',
  command: 'Commands',
}

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category.charAt(0).toUpperCase() + category.slice(1)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SearchOverlay({
  items,
  onSelect,
  options,
  placeholder = 'Search... (Cmd+K)',
  isOpen: controlledOpen,
  onClose,
}: SearchOverlayProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen ?? internalOpen
  const [selectedIndex, setSelectedIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { query, setQuery, results, isSearching, recentSearches, clearRecentSearches } = useSearch(
    items,
    { options },
  )

  // Flatten results for keyboard navigation
  const flatResults = results

  const close = useCallback(() => {
    if (onClose) {
      onClose()
    } else {
      setInternalOpen(false)
    }
    setQuery('')
    setSelectedIndex(0)
  }, [onClose, setQuery])

  const open = useCallback(() => {
    if (controlledOpen === undefined) {
      setInternalOpen(true)
    }
  }, [controlledOpen])

  // Global keyboard shortcut: Cmd+K or /
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) {
          close()
        } else {
          open()
        }
        return
      }

      if (e.key === '/' && !isOpen) {
        const target = e.target as HTMLElement
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
        if (!isInput) {
          e.preventDefault()
          open()
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, close, open])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      // Use timeout to ensure DOM is ready
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  // Keyboard navigation within overlay
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (flatResults[selectedIndex]) {
            onSelect?.(flatResults[selectedIndex])
            close()
          }
          break
        case 'Escape':
          e.preventDefault()
          close()
          break
      }
    },
    [flatResults, selectedIndex, onSelect, close],
  )

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const selected = listRef.current.querySelector('[data-selected="true"]')
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  if (!isOpen) return null

  const grouped = groupByCategory(flatResults)
  let globalIdx = 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--search-bg, #fff)',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          maxHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--search-border, #e5e7eb)' }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label="Search input"
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              backgroundColor: 'transparent',
              color: 'var(--search-text, #111)',
            }}
          />
        </div>

        {/* Results */}
        <div ref={listRef} role="listbox" style={{ overflowY: 'auto', padding: '8px 0' }}>
          {isSearching && (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--search-muted, #6b7280)' }}>
              Searching...
            </div>
          )}

          {!isSearching && query.trim() && flatResults.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--search-muted, #6b7280)' }}>
              No results found for &quot;{query}&quot;
            </div>
          )}

          {!isSearching &&
            Array.from(grouped.entries()).map(([category, items]) => (
              <div key={category}>
                <div
                  style={{
                    padding: '4px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--search-muted, #6b7280)',
                  }}
                >
                  {getCategoryLabel(category)}
                </div>
                {items.map((result) => {
                  const idx = globalIdx++
                  const isSelected = idx === selectedIndex
                  return (
                    <div
                      key={result.id}
                      role="option"
                      aria-selected={isSelected}
                      data-selected={isSelected}
                      onClick={() => {
                        onSelect?.(result)
                        close()
                      }}
                      style={{
                        padding: '8px 16px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'var(--search-selected, #f3f4f6)' : 'transparent',
                      }}
                    >
                      <div style={{ fontWeight: 500, color: 'var(--search-text, #111)' }}>
                        {highlightText(result.title, query)}
                      </div>
                      {result.excerpt && (
                        <div
                          style={{
                            fontSize: '13px',
                            color: 'var(--search-muted, #6b7280)',
                            marginTop: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {highlightText(result.excerpt, query)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}

          {/* Recent searches (shown when no query) */}
          {!query.trim() && recentSearches.length > 0 && (
            <div>
              <div
                style={{
                  padding: '4px 16px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--search-muted, #6b7280)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Recent</span>
                <button
                  onClick={clearRecentSearches}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: 'var(--search-muted, #6b7280)',
                    textTransform: 'none',
                    letterSpacing: 'normal',
                  }}
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((term) => (
                <div
                  key={term}
                  onClick={() => setQuery(term)}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    color: 'var(--search-text, #111)',
                    fontSize: '14px',
                  }}
                >
                  {term}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid var(--search-border, #e5e7eb)',
            fontSize: '12px',
            color: 'var(--search-muted, #6b7280)',
            display: 'flex',
            gap: '12px',
          }}
        >
          <span>
            <kbd style={{ fontFamily: 'monospace', padding: '1px 4px', border: '1px solid currentColor', borderRadius: '3px' }}>
              ↑↓
            </kbd>{' '}
            Navigate
          </span>
          <span>
            <kbd style={{ fontFamily: 'monospace', padding: '1px 4px', border: '1px solid currentColor', borderRadius: '3px' }}>
              ↵
            </kbd>{' '}
            Select
          </span>
          <span>
            <kbd style={{ fontFamily: 'monospace', padding: '1px 4px', border: '1px solid currentColor', borderRadius: '3px' }}>
              esc
            </kbd>{' '}
            Close
          </span>
        </div>
      </div>
    </div>
  )
}
