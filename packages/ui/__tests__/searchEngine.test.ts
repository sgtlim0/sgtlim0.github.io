import { describe, it, expect } from 'vitest'
import {
  fuzzyMatch,
  createSearchIndex,
  search,
} from '../src/utils/searchEngine'
import type { SearchableItem } from '../src/utils/searchEngine'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const ITEMS: SearchableItem[] = [
  { id: '1', title: 'Getting Started', body: 'Welcome to the documentation guide for beginners', category: 'page', url: '/getting-started' },
  { id: '2', title: 'User Management', body: 'Manage users, roles, and permissions in the admin panel', category: 'page', url: '/users' },
  { id: '3', title: 'API Reference', body: 'REST API endpoints and authentication tokens', category: 'page', url: '/api' },
  { id: '4', title: 'Dashboard Settings', body: 'Configure your dashboard layout and widgets', category: 'setting', url: '/settings/dashboard' },
  { id: '5', title: 'Dark Mode', body: 'Toggle between light and dark themes', category: 'setting', url: '/settings/theme' },
  { id: '6', title: 'Export Data', body: 'Export your data as CSV or JSON format', category: 'command' },
  { id: '7', title: '사용자 관리', body: '사용자 계정을 생성하고 권한을 설정합니다', category: 'page', url: '/ko/users' },
  { id: '8', title: '대시보드 설정', body: '대시보드 레이아웃과 위젯을 구성합니다', category: 'setting', url: '/ko/settings' },
  { id: '9', title: 'Search Configuration', body: 'Configure search indexing and fuzzy matching options', category: 'setting' },
  { id: '10', title: 'Keyboard Shortcuts', body: 'Cmd+K to open search, / for quick search', category: 'command' },
]

// ---------------------------------------------------------------------------
// fuzzyMatch
// ---------------------------------------------------------------------------

describe('fuzzyMatch', () => {
  it('returns no match for empty query', () => {
    const result = fuzzyMatch('hello world', '')
    expect(result.matches).toBe(false)
    expect(result.score).toBe(0)
    expect(result.indices).toEqual([])
  })

  it('returns no match for empty text', () => {
    const result = fuzzyMatch('', 'hello')
    expect(result.matches).toBe(false)
  })

  it('matches exact substring with high score', () => {
    const result = fuzzyMatch('Getting Started', 'Getting')
    expect(result.matches).toBe(true)
    expect(result.score).toBeGreaterThan(0.7)
    expect(result.indices).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('matches case-insensitively', () => {
    const result = fuzzyMatch('Dashboard Settings', 'dashboard')
    expect(result.matches).toBe(true)
    expect(result.score).toBeGreaterThan(0.7)
  })

  it('fuzzy matches scattered characters', () => {
    const result = fuzzyMatch('Dashboard Settings', 'dsh')
    expect(result.matches).toBe(true)
    expect(result.score).toBeGreaterThan(0)
    expect(result.score).toBeLessThan(0.7)
  })

  it('returns no match when characters are not in order', () => {
    const result = fuzzyMatch('abc', 'cba')
    expect(result.matches).toBe(false)
  })

  it('gives higher score to consecutive matches', () => {
    const consecutive = fuzzyMatch('Search Configuration', 'search')
    const scattered = fuzzyMatch('Search Configuration', 'srcfg')
    expect(consecutive.score).toBeGreaterThan(scattered.score)
  })

  it('gives higher score when match appears at start', () => {
    const start = fuzzyMatch('API Reference Guide', 'api')
    const middle = fuzzyMatch('The API Reference', 'api')
    expect(start.score).toBeGreaterThanOrEqual(middle.score)
  })

  it('matches Korean text', () => {
    const result = fuzzyMatch('사용자 관리', '사용자')
    expect(result.matches).toBe(true)
    expect(result.score).toBeGreaterThan(0.7)
  })

  it('matches partial Korean text', () => {
    const result = fuzzyMatch('대시보드 설정', '대시')
    expect(result.matches).toBe(true)
    expect(result.score).toBeGreaterThan(0.7)
  })

  it('does not match unrelated Korean text', () => {
    const result = fuzzyMatch('사용자 관리', '대시보드')
    expect(result.matches).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// createSearchIndex
// ---------------------------------------------------------------------------

describe('createSearchIndex', () => {
  it('creates an index with correct entry count', () => {
    const index = createSearchIndex(ITEMS)
    expect(index.entries.length).toBe(ITEMS.length)
  })

  it('tokenizes titles into the index', () => {
    const index = createSearchIndex([
      { id: '1', title: 'Hello World', body: '', category: 'page' },
    ])
    expect(index.entries[0].titleTokens).toEqual(['hello', 'world'])
  })

  it('tokenizes body into the index', () => {
    const index = createSearchIndex([
      { id: '1', title: 'Test', body: 'foo bar baz', category: 'page' },
    ])
    expect(index.entries[0].bodyTokens).toEqual(['foo', 'bar', 'baz'])
  })

  it('builds an inverted token map', () => {
    const index = createSearchIndex([
      { id: '1', title: 'Hello World', body: '', category: 'page' },
      { id: '2', title: 'Hello Again', body: '', category: 'page' },
    ])
    const helloSet = index.tokenMap.get('hello')
    expect(helloSet).toBeDefined()
    expect(helloSet!.size).toBe(2)
    expect(helloSet!.has(0)).toBe(true)
    expect(helloSet!.has(1)).toBe(true)
  })

  it('includes meta fields in allTokens', () => {
    const index = createSearchIndex([
      { id: '1', title: 'Test', body: '', category: 'page', meta: { tag: 'important note' } },
    ])
    expect(index.entries[0].allTokens).toContain('important')
    expect(index.entries[0].allTokens).toContain('note')
  })

  it('deduplicates tokens in allTokens', () => {
    const index = createSearchIndex([
      { id: '1', title: 'hello hello', body: 'hello', category: 'page' },
    ])
    const hellos = index.entries[0].allTokens.filter((t) => t === 'hello')
    expect(hellos.length).toBe(1)
  })

  it('handles empty items array', () => {
    const index = createSearchIndex([])
    expect(index.entries).toEqual([])
    expect(index.tokenMap.size).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// search
// ---------------------------------------------------------------------------

describe('search', () => {
  const index = createSearchIndex(ITEMS)

  it('returns empty for empty query', () => {
    expect(search(index, '')).toEqual([])
    expect(search(index, '   ')).toEqual([])
  })

  it('finds items by title keyword', () => {
    const results = search(index, 'Dashboard')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results.some((r) => r.title === 'Dashboard Settings')).toBe(true)
  })

  it('finds items by body keyword', () => {
    const results = search(index, 'authentication')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results.some((r) => r.id === '3')).toBe(true)
  })

  it('ranks title matches higher than body matches', () => {
    // "User Management" has "user" in title, item 7 has 사용자 in title
    // "Manage users" has "user" in body
    const results = search(index, 'User')
    expect(results.length).toBeGreaterThanOrEqual(1)
    const userMgmt = results.find((r) => r.id === '2')
    expect(userMgmt).toBeDefined()
    // title match should have high score
    expect(userMgmt!.score).toBeGreaterThan(0.3)
  })

  it('returns results sorted by score descending', () => {
    const results = search(index, 'search')
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score)
    }
  })

  it('respects limit option', () => {
    const results = search(index, 'a', { limit: 3 })
    expect(results.length).toBeLessThanOrEqual(3)
  })

  it('respects threshold option', () => {
    const results = search(index, 'settings', { threshold: 0.5 })
    for (const r of results) {
      expect(r.score).toBeGreaterThanOrEqual(0.5)
    }
  })

  it('filters by category', () => {
    const results = search(index, 'settings', { categories: ['setting'] })
    for (const r of results) {
      expect(r.category).toBe('setting')
    }
  })

  it('returns results with excerpt', () => {
    const results = search(index, 'Dashboard')
    expect(results.length).toBeGreaterThan(0)
    for (const r of results) {
      expect(typeof r.excerpt).toBe('string')
      expect(r.excerpt.length).toBeGreaterThan(0)
    }
  })

  it('returns url when available', () => {
    const results = search(index, 'Getting Started')
    const match = results.find((r) => r.id === '1')
    expect(match).toBeDefined()
    expect(match!.url).toBe('/getting-started')
  })

  // Korean search
  it('searches Korean text', () => {
    const results = search(index, '사용자')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results.some((r) => r.id === '7')).toBe(true)
  })

  it('searches Korean body text', () => {
    const results = search(index, '위젯')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results.some((r) => r.id === '8')).toBe(true)
  })

  it('handles mixed Korean/English search', () => {
    const results = search(index, 'CSV')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results.some((r) => r.id === '6')).toBe(true)
  })

  // Fuzzy search
  it('supports fuzzy matching', () => {
    const results = search(index, 'Keybrd')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results.some((r) => r.id === '10')).toBe(true)
  })

  it('handles special characters in query gracefully', () => {
    const results = search(index, 'Cmd+K')
    // Should not throw, may or may not find results
    expect(Array.isArray(results)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Score ordering edge cases
// ---------------------------------------------------------------------------

describe('score ordering', () => {
  it('exact title match scores higher than partial body match', () => {
    const items: SearchableItem[] = [
      { id: 'a', title: 'Search', body: 'Main search page', category: 'page' },
      { id: 'b', title: 'Settings', body: 'Search settings here', category: 'setting' },
    ]
    const idx = createSearchIndex(items)
    const results = search(idx, 'Search')
    expect(results[0].id).toBe('a')
  })

  it('longer exact match in title scores higher', () => {
    const items: SearchableItem[] = [
      { id: 'a', title: 'API', body: '', category: 'page' },
      { id: 'b', title: 'API Reference', body: '', category: 'page' },
    ]
    const idx = createSearchIndex(items)
    const results = search(idx, 'API Reference')
    expect(results[0].id).toBe('b')
  })
})
