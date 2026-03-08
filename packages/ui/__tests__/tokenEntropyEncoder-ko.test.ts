/**
 * Korean-specific tests for Token Entropy Encoder
 */

import { describe, it, expect } from 'vitest'
import { tokenizeKorean, encode } from '../src/utils/text/tokenEntropyEncoder'
import { KO_STOPWORDS } from '../src/utils/text/stopwords'

describe('Korean tokenization', () => {
  it('should split particle from stem: "현대자동차는" -> ["현대자동차", "는"]', () => {
    const result = tokenizeKorean('현대자동차는')
    expect(result).toEqual(['현대자동차', '는'])
  })

  it('should not split short words: "나는" -> ["나는"] (1-char stem)', () => {
    const result = tokenizeKorean('나는')
    // Stem "나" is only 1 character, so no split
    expect(result).toEqual(['나는'])
  })

  it('should split compound particle: "회의에서" -> ["회의", "에서"]', () => {
    const result = tokenizeKorean('회의에서')
    expect(result).toEqual(['회의', '에서'])
  })

  it('should split multiple words with particles', () => {
    const result = tokenizeKorean('현대자동차는 회의에서 결과를 발표했다')
    expect(result).toContain('현대자동차')
    expect(result).toContain('는')
    expect(result).toContain('회의')
    expect(result).toContain('에서')
    expect(result).toContain('결과')
    expect(result).toContain('를')
  })

  it('should handle text without particles', () => {
    const result = tokenizeKorean('알고리즘 데이터 분석')
    expect(result).toEqual(['알고리즘', '데이터', '분석'])
  })

  it('should filter empty strings from result', () => {
    const result = tokenizeKorean('  공백  많은  텍스트  ')
    result.forEach((token) => {
      expect(token.length).toBeGreaterThan(0)
    })
  })
})

describe('Korean encode', () => {
  it('should compress Korean text', () => {
    const input =
      '현대자동차는 오늘 회의에서 새로운 전략을 발표했다 그리고 매우 좋은 결과를 보여주었다'
    const result = encode(input, {
      entropyThreshold: 0,
      language: 'ko',
      minWords: 1,
      compressionFloor: 0,
    })

    expect(result.stats.compressedTokens).toBeLessThan(result.stats.originalTokens)
  })

  it('should remove Korean stopwords during compression', () => {
    const input =
      '현대자동차는 오늘 회의에서 결과를 발표했다 그리고 좋은 성과를 보여주었다 매우 잘 했다'
    const result = encode(input, {
      entropyThreshold: 0,
      language: 'ko',
      minWords: 1,
      compressionFloor: 0,
    })

    const words = result.text.split(' ')
    // Stopwords like '는', '에서', '를', '그리고', '매우' should be removed
    expect(words).not.toContain('그리고')
    expect(words).not.toContain('매우')
    expect(words).not.toContain('잘')
  })

  it('should handle mixed Korean + English text', () => {
    const input = '현대자동차는 AI 기술을 활용하여 새로운 시스템을 구축했다 매우 혁신적인 접근이다'
    const result = encode(input, {
      entropyThreshold: 0,
      language: 'ko',
      minWords: 1,
      compressionFloor: 0,
    })

    // Should process without error and produce compression
    expect(result.text.length).toBeGreaterThan(0)
    expect(result.stats.compressedTokens).toBeLessThanOrEqual(result.stats.originalTokens)
  })

  it('should auto-detect Korean and apply Korean tokenization', () => {
    const input =
      '현대자동차는 오늘 회의에서 결과를 발표했다 그리고 좋은 성과를 보여주었다 매우 잘 했다'
    const result = encode(input, {
      entropyThreshold: 0,
      language: 'auto',
      minWords: 1,
      compressionFloor: 0,
    })

    const words = result.text.split(' ')
    // Auto-detected as Korean, so Korean stopwords should be removed
    expect(words).not.toContain('그리고')
    expect(words).not.toContain('매우')
  })
})

describe('Korean stopwords', () => {
  it('should contain expanded stopword set', () => {
    const expected = [
      '은',
      '는',
      '이',
      '가',
      '을',
      '를',
      '의',
      '에',
      '에서',
      '로',
      '으로',
      '와',
      '과',
      '도',
      '만',
      '까지',
      '부터',
      '에게',
      '한테',
      '께',
      '보다',
      '처럼',
      '같이',
      '마다',
      '라고',
      '이라고',
      '라는',
      '라며',
      '이며',
    ]
    expected.forEach((word) => {
      expect(KO_STOPWORDS.has(word)).toBe(true)
    })
  })

  it('should contain 어미/보조 words', () => {
    const expected = [
      '이다',
      '있다',
      '없다',
      '하다',
      '되다',
      '않다',
      '것',
      '수',
      '때',
      '중',
      '등',
      '더',
      '안',
      '못',
    ]
    expected.forEach((word) => {
      expect(KO_STOPWORDS.has(word)).toBe(true)
    })
  })

  it('should contain 접속사 (conjunctions)', () => {
    const expected = [
      '및',
      '또는',
      '그리고',
      '하지만',
      '그러나',
      '그래서',
      '때문',
      '위해',
      '대해',
      '통해',
      '따라',
      '관련',
    ]
    expected.forEach((word) => {
      expect(KO_STOPWORDS.has(word)).toBe(true)
    })
  })

  it('should contain 지시사 (demonstratives)', () => {
    const expected = ['그', '저', '그것', '이것', '저것', '여기', '거기', '저기']
    expected.forEach((word) => {
      expect(KO_STOPWORDS.has(word)).toBe(true)
    })
  })

  it('should contain 부사 (adverbs)', () => {
    const expected = [
      '매우',
      '아주',
      '정말',
      '너무',
      '좀',
      '잘',
      '많이',
      '다시',
      '또',
      '이미',
      '아직',
      '바로',
      '계속',
    ]
    expected.forEach((word) => {
      expect(KO_STOPWORDS.has(word)).toBe(true)
    })
  })

  it('should not contain content words', () => {
    expect(KO_STOPWORDS.has('현대자동차')).toBe(false)
    expect(KO_STOPWORDS.has('알고리즘')).toBe(false)
    expect(KO_STOPWORDS.has('인공지능')).toBe(false)
    expect(KO_STOPWORDS.has('데이터')).toBe(false)
  })
})
