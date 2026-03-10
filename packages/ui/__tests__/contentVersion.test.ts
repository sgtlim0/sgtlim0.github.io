import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

// fake-indexeddb polyfill — must be imported before modules that use idb
import 'fake-indexeddb/auto'

import { useContentVersion } from '../src/hooks/useContentVersion'
import type { ContentVersion } from '../src/hooks/useContentVersion'
import { computeDiff, formatUnifiedDiff } from '../src/utils/contentDiff'
import type { DiffResult } from '../src/utils/contentDiff'
import { createPersistStorage, _resetDB } from '../src/utils/persistStorage'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read raw stored versions from IndexedDB. */
async function readStoredVersions(key: string): Promise<ContentVersion[] | undefined> {
  const stor = createPersistStorage(true)
  return stor.get<ContentVersion[]>(`content-versions:${key}`)
}

/** Seed versions into IndexedDB before hook mounts. */
async function seedVersions(key: string, versions: ContentVersion[]): Promise<void> {
  const stor = createPersistStorage(true)
  await stor.set(`content-versions:${key}`, versions)
}

/** Flush microtasks so fake-indexeddb promises resolve. */
async function flushMicrotasks(): Promise<void> {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0))
  })
}

function makeVersion(overrides: Partial<ContentVersion> = {}): ContentVersion {
  return {
    id: `test-${Math.random().toString(36).slice(2, 8)}`,
    content: 'test content',
    timestamp: Date.now(),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// contentDiff — pure utility tests
// ---------------------------------------------------------------------------

describe('computeDiff', () => {
  it('should return empty changes for identical texts', () => {
    const result = computeDiff('hello\nworld', 'hello\nworld')
    expect(result.additions).toBe(0)
    expect(result.deletions).toBe(0)
    expect(result.changes.every((c) => c.type === 'unchanged')).toBe(true)
  })

  it('should detect added lines', () => {
    const result = computeDiff('line1', 'line1\nline2')
    expect(result.additions).toBe(1)
    expect(result.deletions).toBe(0)

    const added = result.changes.filter((c) => c.type === 'added')
    expect(added).toHaveLength(1)
    expect(added[0].content).toBe('line2')
  })

  it('should detect removed lines', () => {
    const result = computeDiff('line1\nline2', 'line1')
    expect(result.additions).toBe(0)
    expect(result.deletions).toBe(1)

    const removed = result.changes.filter((c) => c.type === 'removed')
    expect(removed).toHaveLength(1)
    expect(removed[0].content).toBe('line2')
  })

  it('should detect changed lines', () => {
    const result = computeDiff('hello\nworld', 'hello\nearth')
    expect(result.additions).toBe(1)
    expect(result.deletions).toBe(1)
  })

  it('should handle empty old text', () => {
    const result = computeDiff('', 'new line')
    expect(result.additions).toBe(1)
    expect(result.deletions).toBe(0)
  })

  it('should handle empty new text', () => {
    const result = computeDiff('old line', '')
    expect(result.additions).toBe(0)
    expect(result.deletions).toBe(1)
  })

  it('should handle both texts empty', () => {
    const result = computeDiff('', '')
    expect(result.additions).toBe(0)
    expect(result.deletions).toBe(0)
    expect(result.changes).toHaveLength(0)
  })

  it('should assign correct line numbers', () => {
    const result = computeDiff('a\nb\nc', 'a\nx\nc')
    // b is removed, x is added, a and c are unchanged
    const unchanged = result.changes.filter((c) => c.type === 'unchanged')
    expect(unchanged.length).toBe(2)

    // First unchanged line (a) should have old=1, new=1
    const aLine = unchanged.find((c) => c.content === 'a')
    expect(aLine?.oldLineNumber).toBe(1)
    expect(aLine?.newLineNumber).toBe(1)
  })

  it('should handle multiline additions and deletions', () => {
    const old = 'line1\nline2\nline3'
    const newText = 'line1\nnewA\nnewB\nline3'
    const result = computeDiff(old, newText)
    expect(result.deletions).toBe(1) // line2 removed
    expect(result.additions).toBe(2) // newA, newB added
  })

  it('should handle trailing newlines consistently', () => {
    const result = computeDiff('a\nb\n', 'a\nb\n')
    expect(result.additions).toBe(0)
    expect(result.deletions).toBe(0)
  })
})

describe('formatUnifiedDiff', () => {
  it('should format diff with correct prefixes', () => {
    const diff = computeDiff('hello\nworld', 'hello\nearth')
    const output = formatUnifiedDiff(diff)

    expect(output).toContain('  hello')
    expect(output).toContain('- world')
    expect(output).toContain('+ earth')
  })

  it('should handle empty diff', () => {
    const diff: DiffResult = { additions: 0, deletions: 0, changes: [] }
    expect(formatUnifiedDiff(diff)).toBe('')
  })
})

// ---------------------------------------------------------------------------
// useContentVersion hook tests
// ---------------------------------------------------------------------------

describe('useContentVersion', () => {
  beforeEach(() => {
    localStorage.clear()
    _resetDB()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ---- Basic state ----

  it('should return empty versions initially', async () => {
    const { result } = renderHook(() => useContentVersion('test-doc'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    expect(result.current.versions).toHaveLength(0)
    expect(result.current.current).toBeNull()
  })

  it('should set isLoaded to true after hydration', async () => {
    const { result } = renderHook(() => useContentVersion('test-doc'))

    expect(result.current.isLoaded).toBe(false)
    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })
  })

  // ---- Save ----

  it('should save a version and return its id', async () => {
    const { result } = renderHook(() => useContentVersion('save-test'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    let id: string = ''
    act(() => {
      id = result.current.save('first content', 'Initial save')
    })

    expect(id).toBeTruthy()
    expect(result.current.versions).toHaveLength(1)
    expect(result.current.versions[0].content).toBe('first content')
    expect(result.current.versions[0].message).toBe('Initial save')
    expect(result.current.current?.content).toBe('first content')
  })

  it('should save with author metadata', async () => {
    const { result } = renderHook(() => useContentVersion('author-test'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.save('content', 'msg', 'Alice')
    })

    expect(result.current.versions[0].author).toBe('Alice')
  })

  it('should maintain newest-first order', async () => {
    const { result } = renderHook(() => useContentVersion('order-test'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.save('first')
      result.current.save('second')
      result.current.save('third')
    })

    expect(result.current.versions).toHaveLength(3)
    expect(result.current.versions[0].content).toBe('third')
    expect(result.current.versions[1].content).toBe('second')
    expect(result.current.versions[2].content).toBe('first')
  })

  it('should persist versions to storage', async () => {
    const { result } = renderHook(() => useContentVersion('persist-test'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.save('persisted content')
    })

    // Wait for async storage write
    await flushMicrotasks()

    const stored = await readStoredVersions('persist-test')
    expect(stored).toBeDefined()
    expect(stored).toHaveLength(1)
    expect(stored![0].content).toBe('persisted content')
  })

  // ---- Version limit ----

  it('should enforce maxVersions limit', async () => {
    const { result } = renderHook(() =>
      useContentVersion('limit-test', { maxVersions: 3 }),
    )

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.save('v1')
      result.current.save('v2')
      result.current.save('v3')
      result.current.save('v4')
      result.current.save('v5')
    })

    expect(result.current.versions).toHaveLength(3)
    // Oldest versions should be dropped
    expect(result.current.versions[0].content).toBe('v5')
    expect(result.current.versions[2].content).toBe('v3')
  })

  // ---- Restore ----

  it('should restore a version by id', async () => {
    const { result } = renderHook(() => useContentVersion('restore-test'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    let id1: string = ''
    act(() => {
      id1 = result.current.save('original content')
      result.current.save('modified content')
    })

    let restored: string | null = null
    act(() => {
      restored = result.current.restore(id1)
    })

    expect(restored).toBe('original content')
    // Restore creates a new version
    expect(result.current.versions).toHaveLength(3)
    expect(result.current.current?.content).toBe('original content')
    expect(result.current.current?.message).toContain('Restored from')
  })

  it('should return null when restoring non-existent version', async () => {
    const { result } = renderHook(() => useContentVersion('restore-null'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    let restored: string | null = 'not-null'
    act(() => {
      restored = result.current.restore('non-existent-id')
    })

    expect(restored).toBeNull()
    expect(result.current.versions).toHaveLength(0)
  })

  // ---- Diff ----

  it('should compute diff between two versions', async () => {
    const { result } = renderHook(() => useContentVersion('diff-test'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    let id1: string = ''
    let id2: string = ''
    act(() => {
      id1 = result.current.save('line1\nline2')
      id2 = result.current.save('line1\nline3')
    })

    let diffResult: DiffResult | null = null
    act(() => {
      diffResult = result.current.diff(id1, id2)
    })

    expect(diffResult).not.toBeNull()
    expect(diffResult!.additions).toBe(1)
    expect(diffResult!.deletions).toBe(1)
  })

  it('should return null for diff with invalid version ids', async () => {
    const { result } = renderHook(() => useContentVersion('diff-invalid'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.save('some content')
    })

    let diffResult: DiffResult | null = { additions: 0, deletions: 0, changes: [] }
    act(() => {
      diffResult = result.current.diff('bad-id-1', 'bad-id-2')
    })

    expect(diffResult).toBeNull()
  })

  // ---- Delete ----

  it('should delete a specific version', async () => {
    const { result } = renderHook(() => useContentVersion('delete-test'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    let id1: string = ''
    let id2: string = ''
    act(() => {
      id1 = result.current.save('v1')
      id2 = result.current.save('v2')
    })

    act(() => {
      result.current.deleteVersion(id1)
    })

    expect(result.current.versions).toHaveLength(1)
    expect(result.current.versions[0].id).toBe(id2)
  })

  it('should be a no-op when deleting non-existent version', async () => {
    const { result } = renderHook(() => useContentVersion('delete-noop'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.save('v1')
    })

    act(() => {
      result.current.deleteVersion('non-existent')
    })

    expect(result.current.versions).toHaveLength(1)
  })

  // ---- Clear ----

  it('should clear all history', async () => {
    const { result } = renderHook(() => useContentVersion('clear-test'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.save('v1')
      result.current.save('v2')
      result.current.save('v3')
    })

    expect(result.current.versions).toHaveLength(3)

    act(() => {
      result.current.clearHistory()
    })

    expect(result.current.versions).toHaveLength(0)
    expect(result.current.current).toBeNull()

    // Storage should be cleared too
    await flushMicrotasks()
    const stored = await readStoredVersions('clear-test')
    expect(stored).toBeUndefined()
  })

  // ---- Load from storage ----

  it('should load existing versions from storage on mount', async () => {
    const seedData: ContentVersion[] = [
      makeVersion({ content: 'from-storage', message: 'Seeded' }),
    ]
    await seedVersions('load-test', seedData)

    const { result } = renderHook(() => useContentVersion('load-test'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    expect(result.current.versions).toHaveLength(1)
    expect(result.current.versions[0].content).toBe('from-storage')
    expect(result.current.current?.content).toBe('from-storage')
  })

  // ---- localStorage option ----

  it('should use localStorage when configured', async () => {
    const { result } = renderHook(() =>
      useContentVersion('ls-test', { storage: 'localStorage' }),
    )

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.save('ls content')
    })

    // Wait for storage write
    await flushMicrotasks()

    const raw = localStorage.getItem('content-versions:ls-test')
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].content).toBe('ls content')
  })

  // ---- Immutability ----

  it('should not mutate the versions array on save', async () => {
    const { result } = renderHook(() => useContentVersion('immut-test'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.save('v1')
    })

    const prevVersions = result.current.versions

    act(() => {
      result.current.save('v2')
    })

    // Previous reference should remain unchanged
    expect(prevVersions).toHaveLength(1)
    expect(result.current.versions).toHaveLength(2)
  })

  it('should not mutate the versions array on delete', async () => {
    const { result } = renderHook(() => useContentVersion('immut-del'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    let id1: string = ''
    act(() => {
      id1 = result.current.save('v1')
      result.current.save('v2')
    })

    const prevVersions = result.current.versions

    act(() => {
      result.current.deleteVersion(id1)
    })

    expect(prevVersions).toHaveLength(2)
    expect(result.current.versions).toHaveLength(1)
  })

  // ---- Edge: handle corrupt/invalid storage data ----

  it('should handle non-array data in storage gracefully', async () => {
    const stor = createPersistStorage(true)
    await stor.set('content-versions:corrupt-test', 'not-an-array')

    const { result } = renderHook(() => useContentVersion('corrupt-test'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    // Should fall back to empty
    expect(result.current.versions).toHaveLength(0)
  })

  // ---- unique IDs ----

  it('should generate unique version ids', async () => {
    const { result } = renderHook(() => useContentVersion('unique-ids'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    const ids: string[] = []
    act(() => {
      for (let i = 0; i < 10; i++) {
        ids.push(result.current.save(`content-${i}`))
      }
    })

    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(10)
  })
})
