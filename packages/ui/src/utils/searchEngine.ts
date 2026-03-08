/**
 * Fuzzy search engine — pure implementation, no external dependencies.
 * Supports Korean/English simultaneous search, token-based matching,
 * and title/body weighting. SSR-safe (no DOM APIs).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchableItem {
  id: string
  title: string
  body?: string
  category: string
  url?: string
  /** Additional searchable fields (key→value) */
  meta?: Record<string, string>
}

export interface SearchResult {
  id: string
  title: string
  excerpt: string
  score: number
  category: string
  url?: string
}

export interface SearchOptions {
  /** Maximum results to return (default 20) */
  limit?: number
  /** Minimum score threshold 0-1 (default 0) */
  threshold?: number
  /** Filter by category */
  categories?: string[]
}

export interface FuzzyMatchResult {
  matches: boolean
  score: number
  indices: number[]
}

// ---------------------------------------------------------------------------
// Internal: Inverted index for fast token lookup
// ---------------------------------------------------------------------------

interface IndexEntry {
  item: SearchableItem
  titleTokens: string[]
  bodyTokens: string[]
  allTokens: string[]
}

export interface SearchIndex {
  entries: IndexEntry[]
  tokenMap: Map<string, Set<number>>
}

// ---------------------------------------------------------------------------
// Tokenization
// ---------------------------------------------------------------------------

const WHITESPACE_OR_PUNCT = /[\s,.;:!?'"()\[\]{}<>\/\\|@#$%^&*~`+=\-_]+/

/**
 * Normalize text to lowercase and split into tokens.
 * Handles Korean (Hangul) and Latin characters.
 */
function tokenize(text: string): string[] {
  if (!text) return []
  const lower = text.toLowerCase().trim()
  return lower
    .split(WHITESPACE_OR_PUNCT)
    .filter((t) => t.length > 0)
}

// ---------------------------------------------------------------------------
// Fuzzy matching
// ---------------------------------------------------------------------------

/**
 * Fuzzy match `query` against `text`.
 *
 * Scoring factors:
 * - Consecutive character matches get bonus
 * - Matches at word boundaries get bonus
 * - Earlier matches score higher
 * - Score normalized to 0-1 range
 */
export function fuzzyMatch(text: string, query: string): FuzzyMatchResult {
  if (!query || !text) {
    return { matches: false, score: 0, indices: [] }
  }

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()

  // Exact substring match — highest score
  const exactIdx = lowerText.indexOf(lowerQuery)
  if (exactIdx !== -1) {
    const indices = Array.from({ length: lowerQuery.length }, (_, i) => exactIdx + i)
    const positionBonus = 1 - exactIdx / Math.max(lowerText.length, 1)
    const lengthRatio = lowerQuery.length / Math.max(lowerText.length, 1)
    const score = 0.7 + 0.15 * positionBonus + 0.15 * lengthRatio
    return { matches: true, score: Math.min(score, 1), indices }
  }

  // Character-by-character fuzzy match
  const indices: number[] = []
  let qi = 0
  let consecutiveBonus = 0
  let totalBonus = 0
  let prevIdx = -2

  for (let ti = 0; ti < lowerText.length && qi < lowerQuery.length; ti++) {
    if (lowerText[ti] === lowerQuery[qi]) {
      indices.push(ti)

      // Consecutive bonus
      if (ti === prevIdx + 1) {
        consecutiveBonus += 0.15
      } else {
        consecutiveBonus = 0
      }

      // Word boundary bonus
      if (ti === 0 || WHITESPACE_OR_PUNCT.test(text[ti - 1])) {
        totalBonus += 0.1
      }

      totalBonus += consecutiveBonus
      prevIdx = ti
      qi++
    }
  }

  if (qi < lowerQuery.length) {
    return { matches: false, score: 0, indices: [] }
  }

  // Base score from match ratio
  const matchRatio = lowerQuery.length / Math.max(lowerText.length, 1)
  const spread = indices[indices.length - 1] - indices[0] + 1
  const compactness = lowerQuery.length / Math.max(spread, 1)

  const rawScore = matchRatio * 0.3 + compactness * 0.3 + Math.min(totalBonus, 0.4)
  const score = Math.min(Math.max(rawScore, 0.01), 0.69)

  return { matches: true, score, indices }
}

// ---------------------------------------------------------------------------
// Index creation
// ---------------------------------------------------------------------------

/**
 * Build a search index from an array of items.
 * The index includes tokenized fields and an inverted token map.
 */
export function createSearchIndex(items: SearchableItem[]): SearchIndex {
  const entries: IndexEntry[] = []
  const tokenMap = new Map<string, Set<number>>()

  items.forEach((item, idx) => {
    const titleTokens = tokenize(item.title)
    const bodyTokens = tokenize(item.body ?? '')
    const metaTokens = item.meta
      ? Object.values(item.meta).flatMap(tokenize)
      : []
    const allTokens = [...new Set([...titleTokens, ...bodyTokens, ...metaTokens])]

    entries.push({ item, titleTokens, bodyTokens, allTokens })

    for (const token of allTokens) {
      const existing = tokenMap.get(token)
      if (existing) {
        existing.add(idx)
      } else {
        tokenMap.set(token, new Set([idx]))
      }
    }
  })

  return { entries, tokenMap }
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

const TITLE_WEIGHT = 2.0
const BODY_WEIGHT = 1.0

/**
 * Search the index with the given query string.
 * Returns results sorted by relevance score (descending).
 */
export function search(
  index: SearchIndex,
  query: string,
  options: SearchOptions = {},
): SearchResult[] {
  const { limit = 20, threshold = 0, categories } = options

  if (!query || !query.trim()) return []

  const trimmedQuery = query.trim()
  const queryTokens = tokenize(trimmedQuery)

  // Candidate collection: use inverted index for token prefix matching
  const candidateIndices = new Set<number>()

  for (const qt of queryTokens) {
    for (const [token, idxSet] of index.tokenMap) {
      if (token.startsWith(qt) || qt.startsWith(token)) {
        for (const idx of idxSet) {
          candidateIndices.add(idx)
        }
      }
    }
  }

  // Also fuzzy-match full query against all entries if candidates are few
  if (candidateIndices.size < 5) {
    for (let i = 0; i < index.entries.length; i++) {
      candidateIndices.add(i)
    }
  }

  const scored: SearchResult[] = []

  for (const idx of candidateIndices) {
    const entry = index.entries[idx]
    const { item } = entry

    // Category filter
    if (categories && categories.length > 0 && !categories.includes(item.category)) {
      continue
    }

    // Score title
    const titleMatch = fuzzyMatch(item.title, trimmedQuery)
    const titleTokenScore = scoreTokenMatch(entry.titleTokens, queryTokens)
    const titleScore = Math.max(titleMatch.score, titleTokenScore) * TITLE_WEIGHT

    // Score body
    const bodyText = item.body ?? ''
    const bodyMatch = fuzzyMatch(bodyText, trimmedQuery)
    const bodyTokenScore = scoreTokenMatch(entry.bodyTokens, queryTokens)
    const bodyScore = Math.max(bodyMatch.score, bodyTokenScore) * BODY_WEIGHT

    const totalScore = (titleScore + bodyScore) / (TITLE_WEIGHT + BODY_WEIGHT)

    if (totalScore < threshold) continue
    if (!titleMatch.matches && !bodyMatch.matches && titleTokenScore === 0 && bodyTokenScore === 0) {
      continue
    }

    // Build excerpt with context around first match
    const excerpt = buildExcerpt(item, trimmedQuery)

    scored.push({
      id: item.id,
      title: item.title,
      excerpt,
      score: Math.round(totalScore * 1000) / 1000,
      category: item.category,
      url: item.url,
    })
  }

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, limit)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Score how well query tokens match against a list of item tokens.
 * Returns 0-1.
 */
function scoreTokenMatch(itemTokens: string[], queryTokens: string[]): number {
  if (queryTokens.length === 0 || itemTokens.length === 0) return 0

  let matched = 0

  for (const qt of queryTokens) {
    for (const it of itemTokens) {
      if (it === qt) {
        matched += 1
        break
      }
      if (it.startsWith(qt) || qt.startsWith(it)) {
        matched += 0.7
        break
      }
    }
  }

  return matched / queryTokens.length
}

/**
 * Build a short excerpt (up to ~120 chars) around the first occurrence
 * of the query in the item's body or title.
 */
function buildExcerpt(item: SearchableItem, query: string): string {
  const source = item.body || item.title
  const lowerSource = source.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const maxLen = 120

  const matchIdx = lowerSource.indexOf(lowerQuery)

  if (matchIdx === -1) {
    // No exact match — return start of source
    return source.length <= maxLen ? source : source.slice(0, maxLen) + '...'
  }

  const contextPad = Math.floor((maxLen - query.length) / 2)
  const start = Math.max(0, matchIdx - contextPad)
  const end = Math.min(source.length, matchIdx + query.length + contextPad)

  let excerpt = source.slice(start, end)
  if (start > 0) excerpt = '...' + excerpt
  if (end < source.length) excerpt = excerpt + '...'

  return excerpt
}
