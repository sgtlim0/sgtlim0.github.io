import { describe, it, expect } from 'vitest'
import { validate, patterns } from '../src/validation'

describe('validate', () => {
  it('returns null for valid fields', () => {
    const result = validate(
      { email: 'test@example.com' },
      { email: { required: true, pattern: patterns.email } },
    )
    expect(result.email).toBeNull()
  })

  it('returns error for required empty field', () => {
    const result = validate({ name: '' }, { name: { required: true } })
    expect(result.name).toBeTruthy()
  })

  it('returns error for whitespace-only required field', () => {
    const result = validate({ name: '   ' }, { name: { required: true } })
    expect(result.name).toBeTruthy()
  })

  it('returns null for empty optional field', () => {
    const result = validate({ name: '' }, { name: { minLength: 2 } })
    expect(result.name).toBeNull()
  })

  it('validates minLength', () => {
    const result = validate({ name: 'a' }, { name: { minLength: 2 } })
    expect(result.name).toBeTruthy()
  })

  it('passes minLength when met', () => {
    const result = validate({ name: 'ab' }, { name: { minLength: 2 } })
    expect(result.name).toBeNull()
  })

  it('validates maxLength', () => {
    const result = validate({ name: 'abcdef' }, { name: { maxLength: 5 } })
    expect(result.name).toBeTruthy()
  })

  it('passes maxLength when met', () => {
    const result = validate({ name: 'abc' }, { name: { maxLength: 5 } })
    expect(result.name).toBeNull()
  })

  it('validates pattern', () => {
    const result = validate({ email: 'invalid' }, { email: { pattern: patterns.email } })
    expect(result.email).toBeTruthy()
  })

  it('validates custom rule', () => {
    const result = validate(
      { age: '15' },
      {
        age: {
          custom: (v) => (Number(v) < 18 ? 'Must be 18+' : null),
        },
      },
    )
    expect(result.age).toBe('Must be 18+')
  })

  it('passes custom rule', () => {
    const result = validate(
      { age: '20' },
      {
        age: {
          custom: (v) => (Number(v) < 18 ? 'Must be 18+' : null),
        },
      },
    )
    expect(result.age).toBeNull()
  })

  it('handles missing field value', () => {
    const result = validate({}, { name: { required: true } })
    expect(result.name).toBeTruthy()
  })

  it('validates multiple fields', () => {
    const result = validate(
      { name: '', email: 'bad' },
      {
        name: { required: true },
        email: { pattern: patterns.email },
      },
    )
    expect(result.name).toBeTruthy()
    expect(result.email).toBeTruthy()
  })

  it('required check takes priority over minLength', () => {
    const result = validate({ name: '' }, { name: { required: true, minLength: 5 } })
    expect(result.name).toContain('필수')
  })
})

describe('patterns', () => {
  describe('email', () => {
    it('matches valid emails', () => {
      expect(patterns.email.test('user@example.com')).toBe(true)
      expect(patterns.email.test('a@b.co')).toBe(true)
    })

    it('rejects invalid emails', () => {
      expect(patterns.email.test('invalid')).toBe(false)
      expect(patterns.email.test('@example.com')).toBe(false)
      expect(patterns.email.test('user@')).toBe(false)
    })
  })

  describe('url', () => {
    it('matches valid urls', () => {
      expect(patterns.url.test('https://example.com')).toBe(true)
      expect(patterns.url.test('http://localhost')).toBe(true)
    })

    it('rejects invalid urls', () => {
      expect(patterns.url.test('ftp://file')).toBe(false)
      expect(patterns.url.test('example.com')).toBe(false)
    })
  })

  describe('apiKey', () => {
    it('matches valid api keys', () => {
      expect(patterns.apiKey.test('sk-abc1234567890')).toBe(true)
    })

    it('rejects invalid api keys', () => {
      expect(patterns.apiKey.test('pk-abc')).toBe(false)
      expect(patterns.apiKey.test('sk-short')).toBe(false)
    })
  })

  describe('phone', () => {
    it('matches valid korean phones', () => {
      expect(patterns.phone.test('010-1234-5678')).toBe(true)
      expect(patterns.phone.test('01012345678')).toBe(true)
    })

    it('rejects invalid phones', () => {
      expect(patterns.phone.test('02-123-4567')).toBe(false)
      expect(patterns.phone.test('12345')).toBe(false)
    })
  })

  describe('number', () => {
    it('matches numbers', () => {
      expect(patterns.number.test('12345')).toBe(true)
    })

    it('rejects non-numbers', () => {
      expect(patterns.number.test('12.5')).toBe(false)
      expect(patterns.number.test('abc')).toBe(false)
    })
  })

  describe('alphanumeric', () => {
    it('matches alphanumeric', () => {
      expect(patterns.alphanumeric.test('abc123')).toBe(true)
    })

    it('rejects special chars', () => {
      expect(patterns.alphanumeric.test('abc-123')).toBe(false)
    })
  })
})
