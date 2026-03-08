/**
 * Token Entropy Encoder
 *
 * Compresses text by removing low-entropy (high-frequency, low-information)
 * tokens and stopwords, preserving semantically important content.
 */

import { EN_STOPWORDS, KO_STOPWORDS } from './stopwords'

export interface EncoderOptions {
  entropyThreshold?: number
  language?: 'ko' | 'en' | 'auto'
  minWords?: number
  compressionFloor?: number
}

export interface CompressionStats {
  originalTokens: number
  compressedTokens: number
  reductionPct: number
}

export interface CompressionResult {
  text: string
  stats: CompressionStats
}

const DEFAULT_OPTIONS: Required<EncoderOptions> = {
  entropyThreshold: 0.3,
  language: 'auto',
  minWords: 5,
  compressionFloor: 0.4,
}

const KOREAN_CHAR_REGEX = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/
const KOREAN_THRESHOLD = 0.3

/**
 * Detect whether text is primarily Korean or English.
 * Returns 'ko' if Korean character ratio exceeds 30%.
 */
export function detectLanguage(text: string): 'ko' | 'en' {
  const chars = [...text].filter((ch) => ch.trim().length > 0)
  if (chars.length === 0) return 'en'

  const koreanCount = chars.filter((ch) => KOREAN_CHAR_REGEX.test(ch)).length
  const ratio = koreanCount / chars.length

  return ratio > KOREAN_THRESHOLD ? 'ko' : 'en'
}

/**
 * Split text into word tokens based on language.
 */
function tokenize(text: string): ReadonlyArray<string> {
  return text
    .split(/\s+/)
    .map((w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''))
    .filter((w) => w.length > 0)
}

/**
 * Build an immutable frequency map from tokens.
 */
function buildFrequencyMap(tokens: ReadonlyArray<string>): ReadonlyMap<string, number> {
  const entries = tokens.reduce<ReadonlyArray<[string, number]>>((acc, token) => {
    const existing = acc.find(([key]) => key === token)
    return existing
      ? acc.map(([k, v]) => [k, k === token ? v + 1 : v] as [string, number])
      : [...acc, [token, 1] as [string, number]]
  }, [])
  return new Map(entries)
}

/**
 * Calculate Shannon entropy for a single token.
 * H = -p * log2(p + epsilon)
 */
function calcTokenEntropy(count: number, total: number): number {
  const p = count / total
  return -p * Math.log2(p + 1e-10)
}

/**
 * Compute entropy for every unique token.
 */
function computeEntropyMap(
  freqMap: ReadonlyMap<string, number>,
  total: number,
): ReadonlyMap<string, number> {
  const entries = [...freqMap.entries()].map(
    ([token, count]) => [token, calcTokenEntropy(count, total)] as const,
  )
  return new Map(entries)
}

/**
 * Get the appropriate stopword set for a language.
 */
function getStopwords(lang: 'ko' | 'en'): ReadonlySet<string> {
  return lang === 'ko' ? KO_STOPWORDS : EN_STOPWORDS
}

/**
 * Filter tokens: remove stopwords and tokens below entropy threshold.
 */
function filterTokens(
  tokens: ReadonlyArray<string>,
  entropyMap: ReadonlyMap<string, number>,
  stopwords: ReadonlySet<string>,
  threshold: number,
): ReadonlyArray<string> {
  return tokens.filter((token) => {
    if (stopwords.has(token)) return false
    const entropy = entropyMap.get(token) ?? 0
    return entropy >= threshold
  })
}

/**
 * Calculate compression statistics between original and compressed text.
 */
export function getCompressionStats(original: string, compressed: string): CompressionStats {
  const originalTokens = tokenize(original).length
  const compressedTokens = tokenize(compressed).length

  const reductionPct =
    originalTokens === 0
      ? 0
      : Math.round(((originalTokens - compressedTokens) / originalTokens) * 10000) / 100

  return { originalTokens, compressedTokens, reductionPct }
}

/**
 * Encode (compress) text by removing low-entropy tokens and stopwords.
 *
 * Returns the original text unchanged when:
 * - Token count is below minWords
 * - Compression ratio would fall below compressionFloor
 */
export function encode(text: string, options?: EncoderOptions): CompressionResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  if (text.trim().length === 0) {
    return { text: '', stats: { originalTokens: 0, compressedTokens: 0, reductionPct: 0 } }
  }

  const tokens = tokenize(text)

  if (tokens.length < opts.minWords) {
    return { text, stats: getCompressionStats(text, text) }
  }

  const lang = opts.language === 'auto' ? detectLanguage(text) : opts.language
  const freqMap = buildFrequencyMap(tokens)
  const entropyMap = computeEntropyMap(freqMap, tokens.length)
  const stopwords = getStopwords(lang)

  const filtered = filterTokens(tokens, entropyMap, stopwords, opts.entropyThreshold)

  const compressionRatio = filtered.length / tokens.length

  if (compressionRatio < opts.compressionFloor) {
    return { text, stats: getCompressionStats(text, text) }
  }

  const compressed = filtered.join(' ')
  return { text: compressed, stats: getCompressionStats(text, compressed) }
}
