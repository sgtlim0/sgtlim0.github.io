'use client'

import React, { useRef, useEffect, useMemo } from 'react'
import { useSelect } from './hooks/useSelect'
import type { SelectOption, UseSelectConfig } from './hooks/useSelect'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SelectProps {
  options: SelectOption[]
  placeholder?: string
  searchable?: boolean
  multiple?: boolean
  onChange?: (value: string | string[]) => void
  className?: string
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const triggerStyles =
  'relative flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'

const dropdownStyles =
  'absolute z-50 w-full mt-1 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto'

const optionStyles =
  'px-3 py-2 text-sm cursor-pointer transition-colors'

const optionActiveStyles =
  'bg-gray-100 dark:bg-gray-700'

const optionHighlightedStyles =
  'bg-blue-50 dark:bg-blue-900/30'

const optionDisabledStyles =
  'opacity-40 cursor-not-allowed'

const optionSelectedStyles =
  'text-primary font-medium'

const searchInputStyles =
  'w-full px-3 py-2 text-sm border-b border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none'

// ---------------------------------------------------------------------------
// Chevron SVG
// ---------------------------------------------------------------------------

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={`transition-transform ${open ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Clear button
// ---------------------------------------------------------------------------

function ClearButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      aria-label="Clear selection"
      onClick={onClick}
      className="ml-1 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 4L10 10M10 4L4 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Checkbox indicator for multi-select
// ---------------------------------------------------------------------------

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-4 h-4 mr-2 border rounded transition-colors ${
        checked
          ? 'bg-primary border-primary text-white'
          : 'border-gray-300 dark:border-gray-600'
      }`}
      aria-hidden="true"
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 5L4 7L8 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Select component
// ---------------------------------------------------------------------------

export function Select({
  options,
  placeholder = 'Select...',
  searchable = false,
  multiple = false,
  onChange,
  className = '',
}: SelectProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const config: UseSelectConfig = useMemo(
    () => ({ searchable, multiple, placeholder, onChange }),
    [searchable, multiple, placeholder, onChange],
  )

  const {
    isOpen,
    selectedValue,
    searchQuery,
    filteredOptions,
    highlightedIndex,
    open,
    close,
    setSearchQuery,
    clear,
    inputProps,
    listProps,
    getOptionProps,
  } = useSelect(options, config)

  // --- Click outside ---
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close()
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [close])

  // --- Focus search input on open ---
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  // --- Display text ---
  const displayText = useMemo(() => {
    if (multiple) {
      const selected = selectedValue as string[]
      if (selected.length === 0) return placeholder
      return `${selected.length} selected`
    }
    const val = selectedValue as string
    if (!val) return placeholder
    const opt = options.find((o) => o.value === val)
    return opt?.label ?? placeholder
  }, [multiple, selectedValue, options, placeholder])

  const hasValue = multiple
    ? (selectedValue as string[]).length > 0
    : (selectedValue as string) !== ''

  // --- Trigger click ---
  const handleTriggerClick = () => {
    if (isOpen) {
      close()
    } else {
      open()
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    clear()
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <div
        {...inputProps}
        onClick={handleTriggerClick}
        tabIndex={0}
        className={triggerStyles}
      >
        <span
          className={
            hasValue ? '' : 'text-gray-400 dark:text-gray-500'
          }
        >
          {displayText}
        </span>
        <span className="flex items-center gap-1 ml-2">
          {hasValue && <ClearButton onClick={handleClear} />}
          <ChevronDown open={isOpen} />
        </span>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className={dropdownStyles}>
          {/* Search input */}
          {searchable && (
            <input
              ref={searchInputRef}
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={searchInputStyles}
              aria-label="Search options"
            />
          )}

          {/* Option list */}
          <div {...listProps}>
            {filteredOptions.map((opt, index) => {
              const optProps = getOptionProps(index)
              const isHighlighted = highlightedIndex === index
              const isSelected = multiple
                ? (selectedValue as string[]).includes(opt.value)
                : selectedValue === opt.value
              const isDisabled = opt.disabled ?? false

              return (
                <div
                  key={opt.value}
                  {...optProps}
                  className={[
                    optionStyles,
                    isHighlighted ? optionHighlightedStyles : '',
                    isSelected && !isHighlighted ? optionActiveStyles : '',
                    isDisabled ? optionDisabledStyles : '',
                    isSelected && !isDisabled ? optionSelectedStyles : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {multiple && <Checkbox checked={isSelected} />}
                  {opt.label}
                </div>
              )
            })}

            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Select
