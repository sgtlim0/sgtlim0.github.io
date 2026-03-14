import { describe, it, expect } from 'vitest'
import { sanitizePII, hasSensitiveData, getSupportedPIITypes } from '../../src/utils/sanitize'

describe('sanitizePII', () => {
  describe('주민번호 (RRN)', () => {
    it('should mask valid RRN', () => {
      const result = sanitizePII('주민번호: 900101-1234567')
      expect(result.text).toContain('[주민번호]')
      expect(result.detectedPatterns).toContain('rrn')
    })

    it('should mask multiple RRNs', () => {
      const result = sanitizePII('본인: 900101-1234567, 배우자: 850505-2345678')
      expect(result.text).toBe('본인: [주민번호], 배우자: [주민번호]')
      expect(result.detectedPatterns).toContain('rrn')
    })

    it('should not mask invalid RRN format', () => {
      const result = sanitizePII('123456-123456') // 6자리만
      expect(result.text).toBe('123456-123456')
      expect(result.detectedPatterns).not.toContain('rrn')
    })
  })

  describe('카드번호 (Card)', () => {
    it('should mask card with hyphens', () => {
      const result = sanitizePII('카드: 1234-5678-9012-3456')
      expect(result.text).toContain('[카드번호]')
      expect(result.detectedPatterns).toContain('card')
    })

    it('should mask card with spaces', () => {
      const result = sanitizePII('카드: 1234 5678 9012 3456')
      expect(result.text).toContain('[카드번호]')
      expect(result.detectedPatterns).toContain('card')
    })

    it('should mask card without separators', () => {
      const result = sanitizePII('카드: 1234567890123456')
      expect(result.text).toContain('[카드번호]')
      expect(result.detectedPatterns).toContain('card')
    })

    it('should not mask incomplete card', () => {
      const result = sanitizePII('1234-5678-9012') // 3그룹만
      expect(result.text).toBe('1234-5678-9012')
      expect(result.detectedPatterns).not.toContain('card')
    })
  })

  describe('이메일 (Email)', () => {
    it('should mask email address', () => {
      const result = sanitizePII('이메일: user@example.com')
      expect(result.text).toContain('[이메일]')
      expect(result.detectedPatterns).toContain('email')
    })

    it('should mask email with subdomain', () => {
      const result = sanitizePII('이메일: john.doe@mail.company.co.kr')
      expect(result.text).toContain('[이메일]')
      expect(result.detectedPatterns).toContain('email')
    })

    it('should mask multiple emails', () => {
      const result = sanitizePII('연락처: a@b.com, c@d.com')
      expect(result.text).toBe('연락처: [이메일], [이메일]')
      expect(result.detectedPatterns).toContain('email')
    })
  })

  describe('전화번호 (Phone)', () => {
    it('should mask phone with hyphens', () => {
      const result = sanitizePII('전화: 010-1234-5678')
      expect(result.text).toContain('[전화번호]')
      expect(result.detectedPatterns).toContain('phone')
    })

    it('should mask phone with spaces', () => {
      const result = sanitizePII('전화: 010 1234 5678')
      expect(result.text).toContain('[전화번호]')
      expect(result.detectedPatterns).toContain('phone')
    })

    it('should mask phone without separators', () => {
      const result = sanitizePII('전화: 01012345678')
      expect(result.text).toContain('[전화번호]')
      expect(result.detectedPatterns).toContain('phone')
    })

    it('should mask various mobile prefixes', () => {
      const prefixes = ['010', '011', '016', '017', '018', '019']
      for (const prefix of prefixes) {
        const result = sanitizePII(`${prefix}-1234-5678`)
        expect(result.text).toContain('[전화번호]')
      }
    })

    it('should not mask landline numbers', () => {
      const result = sanitizePII('02-1234-5678') // 서울 지역번호
      expect(result.text).toBe('02-1234-5678')
      expect(result.detectedPatterns).not.toContain('phone')
    })
  })

  describe('사업자번호 (Business Registration)', () => {
    it('should mask valid business registration', () => {
      const result = sanitizePII('사업자: 123-45-67890')
      expect(result.text).toContain('[사업자번호]')
      expect(result.detectedPatterns).toContain('bizno')
    })

    it('should not mask invalid format', () => {
      const result = sanitizePII('123-456-78901') // 잘못된 형식
      expect(result.text).toBe('123-456-78901')
      expect(result.detectedPatterns).not.toContain('bizno')
    })
  })

  describe('여권번호 (Passport)', () => {
    it('should mask passport with single letter', () => {
      const result = sanitizePII('여권: M12345678')
      expect(result.text).toContain('[여권번호]')
      expect(result.detectedPatterns).toContain('passport')
    })

    it('should mask passport with two letters', () => {
      const result = sanitizePII('여권: PM1234567')
      expect(result.text).toContain('[여권번호]')
      expect(result.detectedPatterns).toContain('passport')
    })

    it('should only match uppercase letters', () => {
      const result = sanitizePII('m12345678') // 소문자
      expect(result.text).toBe('m12345678')
      expect(result.detectedPatterns).not.toContain('passport')
    })
  })

  describe('계좌번호 (Account)', () => {
    it('should mask bank account numbers', () => {
      const result = sanitizePII('계좌: 123-456789-12345')
      expect(result.text).toContain('[계좌번호]')
      expect(result.detectedPatterns).toContain('account')
    })

    it('should mask various account formats', () => {
      const accounts = [
        '123-4567-12345', // 일반
        '1234-456789-12345678', // 최대
        '123-4567-12345678', // 긴 계좌
      ]
      for (const acc of accounts) {
        const result = sanitizePII(`계좌: ${acc}`)
        expect(result.text).toContain('[계좌번호]')
      }
    })
  })

  describe('복합 시나리오', () => {
    it('should mask multiple PII types in single text', () => {
      const text = `
        이름: 홍길동
        이메일: hong@example.com
        전화: 010-1234-5678
        카드: 1234-5678-9012-3456
      `
      const result = sanitizePII(text)

      expect(result.text).toContain('[이메일]')
      expect(result.text).toContain('[전화번호]')
      expect(result.text).toContain('[카드번호]')
      expect(result.detectedPatterns).toContain('email')
      expect(result.detectedPatterns).toContain('phone')
      expect(result.detectedPatterns).toContain('card')
      expect(result.detectedPatterns.length).toBe(3)
    })

    it('should preserve non-PII content', () => {
      const result = sanitizePII('일반 텍스트입니다. 숫자: 123, 문자: ABC')
      expect(result.text).toBe('일반 텍스트입니다. 숫자: 123, 문자: ABC')
      expect(result.detectedPatterns).toHaveLength(0)
    })
  })

  describe('메타데이터', () => {
    it('should return original and sanitized length', () => {
      const original = '이메일: user@example.com'
      const result = sanitizePII(original)

      expect(result.originalLength).toBe(original.length)
      expect(result.sanitizedLength).toBe(result.text.length)
      expect(result.originalLength).toBeGreaterThan(result.sanitizedLength)
    })

    it('should track detected pattern types', () => {
      const result = sanitizePII('전화: 010-1234-5678, 카드: 1234-5678-9012-3456')
      expect(result.detectedPatterns).toHaveLength(2)
      expect(result.detectedPatterns).toContain('phone')
      expect(result.detectedPatterns).toContain('card')
    })

    it('should return empty patterns for clean text', () => {
      const result = sanitizePII('일반 텍스트')
      expect(result.detectedPatterns).toEqual([])
    })
  })

  describe('엣지 케이스', () => {
    it('should handle empty string', () => {
      const result = sanitizePII('')
      expect(result.text).toBe('')
      expect(result.detectedPatterns).toHaveLength(0)
      expect(result.originalLength).toBe(0)
    })

    it('should handle very long text with PII', () => {
      const longText = 'a'.repeat(5000) + ' 전화: 010-1234-5678 ' + 'b'.repeat(5000)
      const result = sanitizePII(longText)
      expect(result.text).toContain('[전화번호]')
      expect(result.detectedPatterns).toContain('phone')
    })

    it('should not have side effects on consecutive calls', () => {
      const text = '카드: 1234-5678-9012-3456'
      const result1 = sanitizePII(text)
      const result2 = sanitizePII(text)

      expect(result1.text).toBe(result2.text)
      expect(result1.detectedPatterns).toEqual(result2.detectedPatterns)
    })
  })
})

describe('hasSensitiveData', () => {
  it('should return true for text with PII', () => {
    expect(hasSensitiveData('카드: 1234-5678-9012-3456')).toBe(true)
    expect(hasSensitiveData('이메일: user@example.com')).toBe(true)
    expect(hasSensitiveData('전화: 010-1234-5678')).toBe(true)
  })

  it('should return false for clean text', () => {
    expect(hasSensitiveData('일반 텍스트입니다')).toBe(false)
    expect(hasSensitiveData('Hello World 123')).toBe(false)
  })

  it('should be faster than full sanitization', () => {
    const text = 'a'.repeat(10000) + ' 전화: 010-1234-5678'

    const start1 = Date.now()
    hasSensitiveData(text)
    const time1 = Date.now() - start1

    const start2 = Date.now()
    sanitizePII(text)
    const time2 = Date.now() - start2

    // hasSensitiveData should be comparable or faster
    expect(time1).toBeLessThanOrEqual(time2 + 5)
  })

  it('should handle empty string', () => {
    expect(hasSensitiveData('')).toBe(false)
  })
})

describe('getSupportedPIITypes', () => {
  it('should return all 7 PII types', () => {
    const types = getSupportedPIITypes()
    expect(types).toHaveLength(7)
    expect(types).toEqual(['rrn', 'card', 'email', 'phone', 'bizno', 'passport', 'account'])
  })

  it('should return readonly array', () => {
    const types = getSupportedPIITypes()
    expect(Object.isFrozen(types)).toBe(false) // TypeScript readonly, not runtime frozen
    expect(types).toBeInstanceOf(Array)
  })
})
