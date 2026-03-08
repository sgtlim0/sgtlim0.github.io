import { describe, expect, it } from 'vitest'

import { containsPII, sanitizePII } from '../src/utils/sanitize'

describe('sanitizePII', () => {
  it('masks Korean phone number with dashes (010-1234-5678)', () => {
    const result = sanitizePII('전화번호는 010-1234-5678 입니다.')
    expect(result.sanitized).toBe('전화번호는 [전화번호] 입니다.')
    expect(result.maskedCount).toBe(1)
  })

  it('masks Korean phone number without dashes (01012345678)', () => {
    const result = sanitizePII('연락처: 01012345678')
    expect(result.sanitized).toBe('연락처: [전화번호]')
    expect(result.maskedCount).toBe(1)
  })

  it('masks old-format phone numbers (016-123-4567)', () => {
    const result = sanitizePII('옛날 번호: 016-123-4567')
    expect(result.sanitized).toBe('옛날 번호: [전화번호]')
    expect(result.maskedCount).toBe(1)
  })

  it('masks Korean resident registration number (주민등록번호)', () => {
    const result = sanitizePII('주민번호: 900101-1234567')
    expect(result.sanitized).toBe('주민번호: [주민등록번호]')
    expect(result.maskedCount).toBe(1)
  })

  it('masks email addresses', () => {
    const result = sanitizePII('이메일: test@example.com 으로 보내주세요.')
    expect(result.sanitized).toBe('이메일: [이메일] 으로 보내주세요.')
    expect(result.maskedCount).toBe(1)
  })

  it('masks credit card numbers with dashes', () => {
    const result = sanitizePII('카드: 1234-5678-9012-3456')
    expect(result.sanitized).toBe('카드: [카드번호]')
    expect(result.maskedCount).toBe(1)
  })

  it('masks credit card numbers with spaces', () => {
    const result = sanitizePII('결제: 1234 5678 9012 3456')
    expect(result.sanitized).toBe('결제: [카드번호]')
    expect(result.maskedCount).toBe(1)
  })

  it('masks Korean business registration numbers', () => {
    const result = sanitizePII('사업자등록번호: 123-45-67890')
    expect(result.sanitized).toBe('사업자등록번호: [사업자번호]')
    expect(result.maskedCount).toBe(1)
  })

  it('masks IP addresses', () => {
    const result = sanitizePII('서버 IP: 192.168.1.1')
    expect(result.sanitized).toBe('서버 IP: [IP주소]')
    expect(result.maskedCount).toBe(1)
  })

  it('masks multiple PII types in a single text', () => {
    const text =
      '홍길동 (900101-1234567), 연락처: 010-9876-5432, 이메일: hong@company.co.kr'
    const result = sanitizePII(text)
    expect(result.sanitized).toBe(
      '홍길동 ([주민등록번호]), 연락처: [전화번호], 이메일: [이메일]',
    )
    expect(result.maskedCount).toBe(3)
  })

  it('returns text unchanged when no PII is present', () => {
    const text = '오늘 날씨가 좋습니다. AI 기술이 발전하고 있습니다.'
    const result = sanitizePII(text)
    expect(result.sanitized).toBe(text)
    expect(result.maskedCount).toBe(0)
  })

  it('counts multiple matches of same type correctly', () => {
    const text = '010-1111-2222 그리고 010-3333-4444'
    const result = sanitizePII(text)
    expect(result.sanitized).toBe('[전화번호] 그리고 [전화번호]')
    expect(result.maskedCount).toBe(2)
  })

  it('handles empty string', () => {
    const result = sanitizePII('')
    expect(result.sanitized).toBe('')
    expect(result.maskedCount).toBe(0)
  })
})

describe('containsPII', () => {
  it('returns true when PII is present', () => {
    expect(containsPII('이메일: test@domain.com')).toBe(true)
    expect(containsPII('전화: 010-1234-5678')).toBe(true)
    expect(containsPII('주민번호: 850315-2345678')).toBe(true)
  })

  it('returns false when no PII is present', () => {
    expect(containsPII('일반 텍스트입니다.')).toBe(false)
    expect(containsPII('숫자만 있어요: 12345')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(containsPII('')).toBe(false)
  })
})
