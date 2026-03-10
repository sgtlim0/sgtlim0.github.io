'use client'

import { useState, useCallback, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseTagInputOptions {
  initialTags?: string[]
  maxTags?: number
  allowDuplicates?: boolean
  validate?: (tag: string) => boolean
  separator?: string
}

export interface UseTagInputReturn {
  tags: string[]
  inputValue: string
  setInputValue: (v: string) => void
  addTag: (tag: string) => boolean
  removeTag: (index: number) => void
  removeLastTag: () => void
  clearAll: () => void
  isMaxReached: boolean
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTagInput(options: UseTagInputOptions = {}): UseTagInputReturn {
  const {
    initialTags = [],
    maxTags = Infinity,
    allowDuplicates = false,
    validate,
    separator = ',',
  } = options

  const [tags, setTags] = useState<string[]>(initialTags)
  const [inputValue, setInputValue] = useState('')

  const isMaxReached = useMemo(() => tags.length >= maxTags, [tags.length, maxTags])

  const addTag = useCallback(
    (raw: string): boolean => {
      const tag = raw.trim()
      if (tag === '') return false
      if (!allowDuplicates && tags.includes(tag)) return false
      if (tags.length >= maxTags) return false
      if (validate && !validate(tag)) return false

      setTags((prev) => [...prev, tag])
      return true
    },
    [tags, maxTags, allowDuplicates, validate],
  )

  const removeTag = useCallback((index: number) => {
    setTags((prev) => {
      if (index < 0 || index >= prev.length) return prev
      return [...prev.slice(0, index), ...prev.slice(index + 1)]
    })
  }, [])

  const removeLastTag = useCallback(() => {
    setTags((prev) => {
      if (prev.length === 0) return prev
      return prev.slice(0, -1)
    })
  }, [])

  const clearAll = useCallback(() => {
    setTags([])
  }, [])

  return {
    tags,
    inputValue,
    setInputValue,
    addTag,
    removeTag,
    removeLastTag,
    clearAll,
    isMaxReached,
  }
}
