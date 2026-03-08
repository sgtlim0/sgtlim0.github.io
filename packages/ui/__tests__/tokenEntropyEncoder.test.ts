/**
 * Tests for Token Entropy Encoder
 */

import { describe, it, expect } from 'vitest'
import { detectLanguage, encode, getCompressionStats } from '../src/utils/text/tokenEntropyEncoder'
import { EN_STOPWORDS, KO_STOPWORDS } from '../src/utils/text/stopwords'
import { textEncoderInputSchema } from '../src/schemas/text'

describe('detectLanguage', () => {
  it('should detect English text', () => {
    const result = detectLanguage('The quick brown fox jumps over the lazy dog')
    expect(result).toBe('en')
  })

  it('should detect Korean text', () => {
    const result = detectLanguage('오늘 날씨가 매우 좋습니다 산책하기 좋은 날이네요')
    expect(result).toBe('ko')
  })

  it('should detect mixed text as Korean when Korean ratio > 30%', () => {
    // Mix with enough Korean characters to exceed threshold
    const result = detectLanguage('안녕하세요 hello world 감사합니다')
    expect(result).toBe('ko')
  })

  it('should detect mixed text as English when Korean ratio <= 30%', () => {
    const result = detectLanguage('hello world this is a test 안녕')
    expect(result).toBe('en')
  })

  it('should return en for empty text', () => {
    const result = detectLanguage('')
    expect(result).toBe('en')
  })

  it('should return en for whitespace-only text', () => {
    const result = detectLanguage('   \t\n  ')
    expect(result).toBe('en')
  })
})

describe('encode', () => {
  it('should return original text when token count is below minWords', () => {
    const result = encode('hello world', { minWords: 5 })

    expect(result.text).toBe('hello world')
    expect(result.stats.reductionPct).toBe(0)
  })

  it('should compress English text by removing stopwords', () => {
    const input = 'the quick brown fox jumps over the lazy dog and the cat is sleeping'
    const result = encode(input, { entropyThreshold: 0, minWords: 1 })

    // Stopwords like 'the', 'and', 'is', 'over' should be removed
    expect(result.text).not.toContain('the')
    expect(result.text).not.toContain('and')
    expect(result.text).not.toContain('is')
    expect(result.stats.compressedTokens).toBeLessThan(result.stats.originalTokens)
  })

  it('should compress Korean text by removing stopwords', () => {
    const input = '오늘 은 날씨 가 매우 좋습니다 그리고 산책 을 하기 좋은 날 이다'
    const result = encode(input, {
      entropyThreshold: 0,
      language: 'ko',
      minWords: 1,
    })

    // Korean stopwords like '가', '그리고', '이다' should be removed
    const words = result.text.split(' ')
    expect(words).not.toContain('가')
    expect(words).not.toContain('그리고')
    expect(words).not.toContain('이다')
    expect(result.stats.compressedTokens).toBeLessThan(result.stats.originalTokens)
  })

  it('should remove low-entropy (high-frequency) words', () => {
    // With very high threshold (0.9), only words with entropy >= 0.9 survive.
    // Rare words (p small) have entropy = -p*log2(p) which is small for small p.
    // Frequent words also get filtered. This effectively removes most tokens.
    const input = 'data data data data data data data data analysis machine'
    const result = encode(input, {
      entropyThreshold: 0.9,
      minWords: 1,
      compressionFloor: 0.0,
    })

    // With threshold 0.9, most words cannot survive since
    // max entropy for -p*log2(p) is ~0.53 (at p=0.37), so all are removed
    expect(result.stats.compressedTokens).toBe(0)
  })

  it('should return original text when compression falls below compressionFloor', () => {
    // With very high threshold, almost all words get removed
    const input = 'the fox the fox the fox the fox the fox'
    const result = encode(input, {
      entropyThreshold: 0.9,
      minWords: 1,
      compressionFloor: 0.8,
    })

    // Compression would be too aggressive, so original is returned
    expect(result.text).toBe(input)
    expect(result.stats.reductionPct).toBe(0)
  })

  it('should handle empty string', () => {
    const result = encode('')

    expect(result.text).toBe('')
    expect(result.stats.originalTokens).toBe(0)
    expect(result.stats.compressedTokens).toBe(0)
    expect(result.stats.reductionPct).toBe(0)
  })

  it('should handle whitespace-only string', () => {
    const result = encode('   \t  \n  ')

    expect(result.text).toBe('')
    expect(result.stats.originalTokens).toBe(0)
  })

  it('should respect custom entropyThreshold', () => {
    const input = 'unique alpha beta gamma delta epsilon zeta eta theta iota kappa'
    const lowThreshold = encode(input, {
      entropyThreshold: 0.01,
      minWords: 1,
      compressionFloor: 0,
    })
    const highThreshold = encode(input, {
      entropyThreshold: 0.5,
      minWords: 1,
      compressionFloor: 0,
    })

    // Higher threshold removes more words
    expect(highThreshold.stats.compressedTokens).toBeLessThanOrEqual(
      lowThreshold.stats.compressedTokens,
    )
  })

  it('should respect explicit language option', () => {
    // Force English processing on Korean text
    const input = '은 는 이 가 을 를 hello world test code'
    const resultKo = encode(input, {
      language: 'ko',
      entropyThreshold: 0,
      minWords: 1,
    })
    const resultEn = encode(input, {
      language: 'en',
      entropyThreshold: 0,
      minWords: 1,
    })

    // Different stopword sets should produce different results
    expect(resultKo.text).not.toBe(resultEn.text)
  })

  it('should auto-detect language when set to auto', () => {
    const english = 'the quick brown fox jumps over the lazy dog at the park'
    const result = encode(english, {
      entropyThreshold: 0,
      minWords: 1,
      language: 'auto',
    })

    // 'the', 'at' are English stopwords
    const words = result.text.split(' ')
    expect(words).not.toContain('the')
    expect(words).not.toContain('at')
  })

  it('should not mutate the input options object', () => {
    const options = { entropyThreshold: 0.2 }
    const frozen = { ...options }

    encode('some test text for encoding purposes here now', options)

    expect(options).toEqual(frozen)
  })

  it('should use default options when none provided', () => {
    const input = 'the quick brown fox jumps over the lazy dog and the cat sleeps'
    const result = encode(input)

    // Should work without errors using defaults
    expect(result).toHaveProperty('text')
    expect(result).toHaveProperty('stats')
    expect(result.stats).toHaveProperty('originalTokens')
    expect(result.stats).toHaveProperty('compressedTokens')
    expect(result.stats).toHaveProperty('reductionPct')
  })
})

describe('getCompressionStats', () => {
  it('should calculate correct statistics', () => {
    const original = 'the quick brown fox jumps'
    const compressed = 'quick brown fox'

    const stats = getCompressionStats(original, compressed)

    expect(stats.originalTokens).toBe(5)
    expect(stats.compressedTokens).toBe(3)
    expect(stats.reductionPct).toBe(40)
  })

  it('should return 0% reduction for identical texts', () => {
    const text = 'hello world test'
    const stats = getCompressionStats(text, text)

    expect(stats.originalTokens).toBe(3)
    expect(stats.compressedTokens).toBe(3)
    expect(stats.reductionPct).toBe(0)
  })

  it('should handle empty original text', () => {
    const stats = getCompressionStats('', '')

    expect(stats.originalTokens).toBe(0)
    expect(stats.compressedTokens).toBe(0)
    expect(stats.reductionPct).toBe(0)
  })

  it('should handle full reduction', () => {
    const stats = getCompressionStats('hello world', '')

    expect(stats.originalTokens).toBe(2)
    expect(stats.compressedTokens).toBe(0)
    expect(stats.reductionPct).toBe(100)
  })

  it('should round reductionPct to two decimal places', () => {
    // 3 tokens -> 1 token = 66.67% reduction
    const stats = getCompressionStats('one two three', 'one')

    expect(stats.reductionPct).toBe(66.67)
  })
})

describe('stopwords', () => {
  it('should contain common English stopwords', () => {
    const expected = ['the', 'is', 'are', 'and', 'or', 'but', 'in', 'on']
    expected.forEach((word) => {
      expect(EN_STOPWORDS.has(word)).toBe(true)
    })
  })

  it('should contain common Korean stopwords', () => {
    const expected = ['은', '는', '이', '가', '을', '를', '의', '에']
    expected.forEach((word) => {
      expect(KO_STOPWORDS.has(word)).toBe(true)
    })
  })

  it('should not contain content words', () => {
    expect(EN_STOPWORDS.has('algorithm')).toBe(false)
    expect(EN_STOPWORDS.has('machine')).toBe(false)
    expect(KO_STOPWORDS.has('알고리즘')).toBe(false)
  })
})

describe('textEncoderInputSchema', () => {
  it('should accept valid input', () => {
    const input = { text: 'Hello world' }
    const result = textEncoderInputSchema.safeParse(input)

    expect(result.success).toBe(true)
  })

  it('should accept valid input with options', () => {
    const input = {
      text: 'Hello world',
      options: {
        entropyThreshold: 0.5,
        language: 'en' as const,
        minWords: 3,
        compressionFloor: 0.3,
      },
    }
    const result = textEncoderInputSchema.safeParse(input)

    expect(result.success).toBe(true)
  })

  it('should reject empty text', () => {
    const input = { text: '' }
    const result = textEncoderInputSchema.safeParse(input)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('텍스트를 입력해주세요')
    }
  })

  it('should reject text exceeding 100,000 characters', () => {
    const input = { text: 'a'.repeat(100_001) }
    const result = textEncoderInputSchema.safeParse(input)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('텍스트가 너무 깁니다')
    }
  })

  it('should apply default option values', () => {
    const input = { text: 'Hello world', options: {} }
    const result = textEncoderInputSchema.safeParse(input)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.options?.entropyThreshold).toBe(0.3)
      expect(result.data.options?.language).toBe('auto')
      expect(result.data.options?.minWords).toBe(5)
      expect(result.data.options?.compressionFloor).toBe(0.4)
    }
  })

  it('should reject invalid language option', () => {
    const input = { text: 'Hello world', options: { language: 'fr' } }
    const result = textEncoderInputSchema.safeParse(input)

    expect(result.success).toBe(false)
  })

  it('should reject entropyThreshold outside 0-1 range', () => {
    const over = { text: 'Hello world', options: { entropyThreshold: 1.5 } }
    const under = { text: 'Hello world', options: { entropyThreshold: -0.1 } }

    expect(textEncoderInputSchema.safeParse(over).success).toBe(false)
    expect(textEncoderInputSchema.safeParse(under).success).toBe(false)
  })
})
