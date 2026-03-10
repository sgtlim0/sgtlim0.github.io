'use client'

import React, { useCallback, useRef, useState, useId, useMemo } from 'react'
import Tag from './Tag'
import type { TagVariant, TagSize } from './Tag'
import { useTagInput } from './hooks/useTagInput'
import type { UseTagInputOptions } from './hooks/useTagInput'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TagInputProps extends UseTagInputOptions {
  /** Placeholder text for the input field */
  placeholder?: string
  /** Tag color variant */
  variant?: TagVariant
  /** Tag size */
  size?: TagSize
  /** Auto-complete suggestion list */
  suggestions?: string[]
  /** Accessible label for the input */
  'aria-label'?: string
  /** Additional CSS class */
  className?: string
  /** Disabled state */
  disabled?: boolean
  /** Called when the tags array changes */
  onChange?: (tags: string[]) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TagInput({
  initialTags,
  maxTags,
  allowDuplicates,
  validate,
  separator = ',',
  placeholder = 'Add a tag...',
  variant = 'default',
  size = 'md',
  suggestions = [],
  'aria-label': ariaLabel = 'Tag input',
  className = '',
  disabled = false,
  onChange,
}: TagInputProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1)

  const {
    tags,
    inputValue,
    setInputValue,
    addTag,
    removeTag,
    removeLastTag,
    clearAll,
    isMaxReached,
  } = useTagInput({ initialTags, maxTags, allowDuplicates, validate, separator })

  // Track previous tags for onChange notifications
  const prevTagsRef = useRef(tags)

  const notifyChange = useCallback(
    (nextTags: string[]) => {
      if (onChange) {
        onChange(nextTags)
      }
    },
    [onChange],
  )

  // Filtered suggestions based on current input
  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim() || suggestions.length === 0) return []
    const q = inputValue.trim().toLowerCase()
    return suggestions.filter(
      (s) =>
        s.toLowerCase().includes(q) &&
        (allowDuplicates || !tags.includes(s)),
    )
  }, [inputValue, suggestions, tags, allowDuplicates])

  const handleAddTag = useCallback(
    (raw: string) => {
      const success = addTag(raw)
      if (success) {
        setInputValue('')
        setShowSuggestions(false)
        setHighlightedSuggestion(-1)
        // We need to compute next tags since addTag is async via setState
        const trimmed = raw.trim()
        notifyChange([...tags, trimmed])
      }
    },
    [addTag, setInputValue, tags, notifyChange],
  )

  const handleRemoveTag = useCallback(
    (index: number) => {
      removeTag(index)
      const nextTags = [...tags.slice(0, index), ...tags.slice(index + 1)]
      notifyChange(nextTags)
      inputRef.current?.focus()
    },
    [removeTag, tags, notifyChange],
  )

  const handleRemoveLastTag = useCallback(() => {
    if (tags.length === 0) return
    removeLastTag()
    const nextTags = tags.slice(0, -1)
    notifyChange(nextTags)
  }, [removeLastTag, tags, notifyChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return

      // Suggestion navigation
      if (showSuggestions && filteredSuggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setHighlightedSuggestion((prev) =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0,
          )
          return
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setHighlightedSuggestion((prev) =>
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1,
          )
          return
        }
        if (e.key === 'Enter' && highlightedSuggestion >= 0) {
          e.preventDefault()
          handleAddTag(filteredSuggestions[highlightedSuggestion])
          return
        }
        if (e.key === 'Escape') {
          setShowSuggestions(false)
          setHighlightedSuggestion(-1)
          return
        }
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        if (inputValue.trim()) {
          handleAddTag(inputValue)
        }
        return
      }

      if (e.key === 'Backspace' && inputValue === '') {
        handleRemoveLastTag()
        return
      }
    },
    [
      disabled,
      inputValue,
      showSuggestions,
      filteredSuggestions,
      highlightedSuggestion,
      handleAddTag,
      handleRemoveLastTag,
    ],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return
      const value = e.target.value

      // Check for separator character
      if (value.includes(separator)) {
        const parts = value.split(separator)
        // Add all parts except the last (which stays in input)
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i].trim()
          if (part) {
            handleAddTag(part)
          }
        }
        setInputValue(parts[parts.length - 1])
      } else {
        setInputValue(value)
        setShowSuggestions(value.trim().length > 0 && suggestions.length > 0)
        setHighlightedSuggestion(-1)
      }
    },
    [disabled, separator, handleAddTag, setInputValue, suggestions.length],
  )

  const handleContainerClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.focus()
    }
  }, [disabled])

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      handleAddTag(suggestion)
      inputRef.current?.focus()
    },
    [handleAddTag],
  )

  const handleBlur = useCallback(() => {
    // Delay to allow suggestion click to fire
    setTimeout(() => {
      setShowSuggestions(false)
      setHighlightedSuggestion(-1)
    }, 150)
  }, [])

  const suggestionsId = `${id}-suggestions`

  return (
    <div className={`relative ${className}`}>
      {/* Main container */}
      <div
        onClick={handleContainerClick}
        className={`flex flex-wrap items-center gap-1.5 rounded-lg border px-3 py-2 transition-colors
          ${disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800'
            : 'border-gray-300 bg-white cursor-text hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900'
          }`}
        role="list"
        aria-label={ariaLabel}
      >
        {tags.map((tag, index) => (
          <Tag
            key={`${tag}-${index}`}
            label={tag}
            variant={variant}
            size={size}
            onRemove={disabled ? undefined : () => handleRemoveTag(index)}
          />
        ))}

        {!isMaxReached && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={() => {
              if (inputValue.trim() && suggestions.length > 0) {
                setShowSuggestions(true)
              }
            }}
            placeholder={tags.length === 0 ? placeholder : ''}
            disabled={disabled}
            className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 dark:text-gray-100 dark:placeholder-gray-500 disabled:cursor-not-allowed"
            aria-label={ariaLabel}
            aria-autocomplete={suggestions.length > 0 ? 'list' : undefined}
            aria-controls={showSuggestions ? suggestionsId : undefined}
            aria-activedescendant={
              highlightedSuggestion >= 0
                ? `${id}-suggestion-${highlightedSuggestion}`
                : undefined
            }
            role="combobox"
            aria-expanded={showSuggestions && filteredSuggestions.length > 0}
          />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul
          id={suggestionsId}
          role="listbox"
          className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              id={`${id}-suggestion-${index}`}
              role="option"
              aria-selected={highlightedSuggestion === index}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-3 py-2 text-sm cursor-pointer
                ${highlightedSuggestion === index
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
