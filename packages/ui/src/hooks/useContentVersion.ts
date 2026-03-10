'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createPersistStorage } from '../utils/persistStorage'
import type { PersistStorage } from '../utils/persistStorage'
import { computeDiff } from '../utils/contentDiff'
import type { DiffResult } from '../utils/contentDiff'

const DEFAULT_MAX_VERSIONS = 20

export interface ContentVersion {
  readonly id: string
  readonly content: string
  readonly timestamp: number
  readonly author?: string
  readonly message?: string
}

export interface UseContentVersionOptions {
  /** Maximum number of versions to retain (default: 20). */
  maxVersions?: number
  /** Storage backend — 'localStorage' or 'indexedDB' (default). */
  storage?: 'localStorage' | 'indexedDB'
}

export interface UseContentVersionReturn {
  /** All stored versions, newest first. */
  readonly versions: readonly ContentVersion[]
  /** The most recent version, or null if none saved. */
  readonly current: ContentVersion | null
  /** Whether versions have been loaded from storage. */
  readonly isLoaded: boolean
  /** Save a new version. Returns the generated version id. */
  save: (content: string, message?: string, author?: string) => string
  /** Restore a version by id. Returns the content, or null if not found. */
  restore: (versionId: string) => string | null
  /** Compute diff between two versions by id. Returns null if either id is invalid. */
  diff: (v1Id: string, v2Id: string) => DiffResult | null
  /** Delete a single version by id. */
  deleteVersion: (id: string) => void
  /** Clear all version history. */
  clearHistory: () => void
}

function generateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 8)
  return `${timestamp}-${random}`
}

/**
 * Hook for managing content version history with persistence.
 *
 * Stores versions in IndexedDB (default) or localStorage.
 * Supports save, restore, diff comparison, and history management.
 *
 * @param key - Unique storage key for this content's versions
 * @param options - Configuration options
 */
export function useContentVersion(
  key: string,
  options: UseContentVersionOptions = {},
): UseContentVersionReturn {
  const {
    maxVersions = DEFAULT_MAX_VERSIONS,
    storage: storageType = 'indexedDB',
  } = options

  const [versions, setVersions] = useState<readonly ContentVersion[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const versionsRef = useRef<readonly ContentVersion[]>(versions)
  const storageRef = useRef<PersistStorage | null>(null)

  // Keep ref in sync
  versionsRef.current = versions

  // Storage key for persistence
  const storageKey = `content-versions:${key}`

  // Create storage once
  if (storageRef.current === null && typeof window !== 'undefined') {
    storageRef.current = createPersistStorage(storageType === 'indexedDB')
  }

  // Persist versions to storage
  const persistVersions = useCallback(
    (newVersions: readonly ContentVersion[]) => {
      const stor = storageRef.current
      if (stor) {
        stor.set(storageKey, newVersions)
      }
    },
    [storageKey],
  )

  // Load from storage on mount
  useEffect(() => {
    let cancelled = false
    const stor = storageRef.current

    if (!stor) {
      setIsLoaded(true)
      return
    }

    stor
      .get<readonly ContentVersion[]>(storageKey)
      .then((stored) => {
        if (cancelled) return
        if (stored && Array.isArray(stored)) {
          setVersions(stored)
          versionsRef.current = stored
        }
        setIsLoaded(true)
      })
      .catch(() => {
        if (!cancelled) {
          setIsLoaded(true)
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  const current = versions.length > 0 ? versions[0] : null

  const save = useCallback(
    (content: string, message?: string, author?: string): string => {
      const id = generateId()
      const version: ContentVersion = {
        id,
        content,
        timestamp: Date.now(),
        ...(author !== undefined ? { author } : {}),
        ...(message !== undefined ? { message } : {}),
      }

      const prev = versionsRef.current
      const updated = [version, ...prev].slice(0, maxVersions)
      setVersions(updated)
      versionsRef.current = updated
      persistVersions(updated)
      return id
    },
    [maxVersions, persistVersions],
  )

  const restore = useCallback(
    (versionId: string): string | null => {
      const found = versionsRef.current.find((v) => v.id === versionId)
      if (!found) return null

      // Restoring creates a new version with the restored content
      const id = generateId()
      const version: ContentVersion = {
        id,
        content: found.content,
        timestamp: Date.now(),
        message: `Restored from ${found.id}`,
      }

      const updated = [version, ...versionsRef.current].slice(0, maxVersions)
      setVersions(updated)
      versionsRef.current = updated
      persistVersions(updated)

      return found.content
    },
    [maxVersions, persistVersions],
  )

  const diff = useCallback(
    (v1Id: string, v2Id: string): DiffResult | null => {
      const v1 = versionsRef.current.find((v) => v.id === v1Id)
      const v2 = versionsRef.current.find((v) => v.id === v2Id)
      if (!v1 || !v2) return null
      return computeDiff(v1.content, v2.content)
    },
    [],
  )

  const deleteVersion = useCallback(
    (id: string) => {
      const updated = versionsRef.current.filter((v) => v.id !== id)
      setVersions(updated)
      versionsRef.current = updated
      persistVersions(updated)
    },
    [persistVersions],
  )

  const clearHistory = useCallback(() => {
    setVersions([])
    versionsRef.current = []
    const stor = storageRef.current
    if (stor) {
      stor.delete(storageKey)
    }
  }, [storageKey])

  return {
    versions,
    current,
    isLoaded,
    save,
    restore,
    diff,
    deleteVersion,
    clearHistory,
  }
}
