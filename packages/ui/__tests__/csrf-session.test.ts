/**
 * Tests for CSRF Session Matching (Double Submit Cookie + HMAC)
 * and Enhanced Rate Limiting (Sliding Window + Endpoint Presets)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─────────────────────────────────────────────────────────────────────────────
// CSRF: We test the pure functions (hmacSign, hmacVerify, parseSignedToken,
// generateSignedCsrfToken, parseCookieValue) and the validation logic.
// Since these use Web Crypto API (available in Node 20+), we test directly.
// ─────────────────────────────────────────────────────────────────────────────

describe('CSRF Double Submit Cookie + HMAC', () => {
  // Dynamic imports to avoid module-level side effects with crypto
  let hmacSign: (payload: string) => Promise<string>
  let hmacVerify: (payload: string, signature: string) => Promise<boolean>
  let generateSignedCsrfToken: () => Promise<string>
  let parseSignedToken: (
    token: string,
  ) => Promise<{ valid: boolean; uuid?: string; timestamp?: number }>
  let parseCookieValue: (cookieHeader: string, name: string) => string | null
  let validateCsrfHeader: (request: Request) => import('next/server').NextResponse | null
  let validateCsrfToken: (
    request: Request,
  ) => Promise<import('next/server').NextResponse | null>
  let createCsrfTokenResponse: () => Promise<import('next/server').NextResponse>

  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00.000Z'))

    const csrfModule = await import(
      '../../../apps/user/app/api/lib/csrf'
    )
    hmacSign = csrfModule.hmacSign
    hmacVerify = csrfModule.hmacVerify
    generateSignedCsrfToken = csrfModule.generateSignedCsrfToken
    parseSignedToken = csrfModule.parseSignedToken
    parseCookieValue = csrfModule.parseCookieValue
    validateCsrfHeader = csrfModule.validateCsrfHeader
    validateCsrfToken = csrfModule.validateCsrfToken
    createCsrfTokenResponse = csrfModule.createCsrfTokenResponse
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('hmacSign / hmacVerify', () => {
    it('should produce a hex-encoded signature', async () => {
      const signature = await hmacSign('test-payload')

      expect(signature).toMatch(/^[0-9a-f]+$/)
      expect(signature.length).toBe(64) // SHA-256 = 32 bytes = 64 hex chars
    })

    it('should produce consistent signatures for same input', async () => {
      const sig1 = await hmacSign('consistent-payload')
      const sig2 = await hmacSign('consistent-payload')

      expect(sig1).toBe(sig2)
    })

    it('should produce different signatures for different inputs', async () => {
      const sig1 = await hmacSign('payload-one')
      const sig2 = await hmacSign('payload-two')

      expect(sig1).not.toBe(sig2)
    })

    it('should verify a valid signature', async () => {
      const payload = 'verify-me'
      const signature = await hmacSign(payload)

      const result = await hmacVerify(payload, signature)
      expect(result).toBe(true)
    })

    it('should reject a tampered signature', async () => {
      const payload = 'original-payload'
      const signature = await hmacSign(payload)

      // Tamper with the signature
      const tampered = signature.slice(0, -1) + (signature.endsWith('0') ? '1' : '0')
      const result = await hmacVerify(payload, tampered)
      expect(result).toBe(false)
    })

    it('should reject wrong payload for valid signature', async () => {
      const signature = await hmacSign('correct-payload')

      const result = await hmacVerify('wrong-payload', signature)
      expect(result).toBe(false)
    })

    it('should reject signatures with different length', async () => {
      const result = await hmacVerify('payload', 'short')
      expect(result).toBe(false)
    })
  })

  describe('generateSignedCsrfToken', () => {
    it('should generate token in uuid.timestamp.signature format', async () => {
      const token = await generateSignedCsrfToken()
      const parts = token.split('.')

      expect(parts.length).toBe(3)
    })

    it('should include valid UUID as first part', async () => {
      const token = await generateSignedCsrfToken()
      const uuid = token.split('.')[0]

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(uuid).toMatch(uuidRegex)
    })

    it('should include current timestamp as second part', async () => {
      const token = await generateSignedCsrfToken()
      const timestamp = token.split('.')[1]

      expect(parseInt(timestamp, 10)).toBe(Date.now())
    })

    it('should include hex HMAC signature as third part', async () => {
      const token = await generateSignedCsrfToken()
      const signature = token.split('.')[2]

      expect(signature).toMatch(/^[0-9a-f]+$/)
      expect(signature.length).toBe(64)
    })

    it('should generate unique tokens', async () => {
      const token1 = await generateSignedCsrfToken()
      const token2 = await generateSignedCsrfToken()

      expect(token1).not.toBe(token2)
    })
  })

  describe('parseSignedToken', () => {
    it('should accept a valid, non-expired token', async () => {
      const token = await generateSignedCsrfToken()
      const result = await parseSignedToken(token)

      expect(result.valid).toBe(true)
      expect(result.uuid).toBeDefined()
      expect(result.timestamp).toBe(Date.now())
    })

    it('should reject empty token', async () => {
      const result = await parseSignedToken('')
      expect(result.valid).toBe(false)
    })

    it('should reject token with wrong number of parts', async () => {
      const result1 = await parseSignedToken('only-one-part')
      expect(result1.valid).toBe(false)

      const result2 = await parseSignedToken('two.parts')
      expect(result2.valid).toBe(false)

      const result4 = await parseSignedToken('four.parts.here.extra')
      expect(result4.valid).toBe(false)
    })

    it('should reject token with invalid timestamp', async () => {
      const result = await parseSignedToken('uuid.notanumber.sig')
      expect(result.valid).toBe(false)
    })

    it('should reject expired token (> 1 hour)', async () => {
      const token = await generateSignedCsrfToken()

      // Advance time past expiry
      vi.advanceTimersByTime(3_600_001)

      const result = await parseSignedToken(token)
      expect(result.valid).toBe(false)
    })

    it('should accept token just before expiry', async () => {
      const token = await generateSignedCsrfToken()

      // Advance to just before expiry
      vi.advanceTimersByTime(3_599_999)

      const result = await parseSignedToken(token)
      expect(result.valid).toBe(true)
    })

    it('should reject token with future timestamp', async () => {
      // Create a token with a future timestamp (negative age)
      const futureTimestamp = (Date.now() + 10_000).toString()
      const signature = await hmacSign(`fake-uuid.${futureTimestamp}`)
      const token = `fake-uuid.${futureTimestamp}.${signature}`

      const result = await parseSignedToken(token)
      expect(result.valid).toBe(false)
    })

    it('should reject token with forged signature', async () => {
      const token = await generateSignedCsrfToken()
      const parts = token.split('.')
      const forgedToken = `${parts[0]}.${parts[1]}.${'a'.repeat(64)}`

      const result = await parseSignedToken(forgedToken)
      expect(result.valid).toBe(false)
    })
  })

  describe('parseCookieValue', () => {
    it('should parse a single cookie', () => {
      const result = parseCookieValue('csrf_token=abc123', 'csrf_token')
      expect(result).toBe('abc123')
    })

    it('should parse cookie from multiple cookies', () => {
      const header = 'session=xyz; csrf_token=abc123; theme=dark'
      const result = parseCookieValue(header, 'csrf_token')
      expect(result).toBe('abc123')
    })

    it('should return null for missing cookie', () => {
      const result = parseCookieValue('session=xyz; theme=dark', 'csrf_token')
      expect(result).toBeNull()
    })

    it('should return null for empty header', () => {
      const result = parseCookieValue('', 'csrf_token')
      expect(result).toBeNull()
    })

    it('should handle cookie values with = signs', () => {
      const result = parseCookieValue('token=abc=def=ghi', 'token')
      expect(result).toBe('abc=def=ghi')
    })
  })

  describe('validateCsrfHeader (backward compatible)', () => {
    it('should accept valid UUID token', () => {
      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'x-csrf-token': '550e8400-e29b-41d4-a716-446655440000' },
      })

      const result = validateCsrfHeader(request)
      expect(result).toBeNull()
    })

    it('should accept signed token format', () => {
      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: {
          'x-csrf-token': '550e8400-e29b-41d4-a716-446655440000.1705320000000.abcdef1234567890',
        },
      })

      const result = validateCsrfHeader(request)
      expect(result).toBeNull()
    })

    it('should reject missing token', () => {
      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
      })

      const result = validateCsrfHeader(request)
      expect(result).not.toBeNull()
      expect(result?.status).toBe(403)
    })

    it('should reject invalid format', () => {
      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'x-csrf-token': 'not-valid' },
      })

      const result = validateCsrfHeader(request)
      expect(result).not.toBeNull()
      expect(result?.status).toBe(403)
    })
  })

  describe('validateCsrfToken (Double Submit Cookie)', () => {
    it('should accept matching header and cookie tokens', async () => {
      const token = await generateSignedCsrfToken()

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
          cookie: `csrf_token=${token}`,
        },
      })

      const result = await validateCsrfToken(request)
      expect(result).toBeNull()
    })

    it('should reject missing header token', async () => {
      const token = await generateSignedCsrfToken()

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: {
          cookie: `csrf_token=${token}`,
        },
      })

      const result = await validateCsrfToken(request)
      expect(result).not.toBeNull()
      expect(result?.status).toBe(403)
    })

    it('should reject missing cookie', async () => {
      const token = await generateSignedCsrfToken()

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
        },
      })

      const result = await validateCsrfToken(request)
      expect(result).not.toBeNull()
      expect(result?.status).toBe(403)
    })

    it('should reject mismatched header and cookie tokens', async () => {
      const token1 = await generateSignedCsrfToken()
      const token2 = await generateSignedCsrfToken()

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: {
          'x-csrf-token': token1,
          cookie: `csrf_token=${token2}`,
        },
      })

      const result = await validateCsrfToken(request)
      expect(result).not.toBeNull()
      expect(result?.status).toBe(403)
    })

    it('should reject expired token even if cookie and header match', async () => {
      const token = await generateSignedCsrfToken()

      // Advance past expiry
      vi.advanceTimersByTime(3_600_001)

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
          cookie: `csrf_token=${token}`,
        },
      })

      const result = await validateCsrfToken(request)
      expect(result).not.toBeNull()
      expect(result?.status).toBe(403)
    })

    it('should reject forged token even if cookie and header match', async () => {
      const forgedToken = 'fake-uuid.1705320000000.' + 'a'.repeat(64)

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: {
          'x-csrf-token': forgedToken,
          cookie: `csrf_token=${forgedToken}`,
        },
      })

      const result = await validateCsrfToken(request)
      expect(result).not.toBeNull()
      expect(result?.status).toBe(403)
    })
  })

  describe('createCsrfTokenResponse', () => {
    it('should return JSON with csrfToken field', async () => {
      const response = await createCsrfTokenResponse()
      const body = await response.json()

      expect(body.csrfToken).toBeDefined()
      expect(typeof body.csrfToken).toBe('string')
    })

    it('should return token in signed format', async () => {
      const response = await createCsrfTokenResponse()
      const body = await response.json()
      const parts = body.csrfToken.split('.')

      expect(parts.length).toBe(3)
    })

    it('should set httpOnly cookie', async () => {
      const response = await createCsrfTokenResponse()
      const setCookie = response.headers.get('set-cookie') || ''

      expect(setCookie).toContain('csrf_token=')
      expect(setCookie).toContain('HttpOnly')
      expect(setCookie.toLowerCase()).toContain('samesite=strict')
      expect(setCookie).toContain('Path=/')
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limit: Sliding Window + Endpoint Presets
// ─────────────────────────────────────────────────────────────────────────────

describe('Enhanced Rate Limiter (Sliding Window)', () => {
  let checkRateLimit: (
    ip: string,
    endpoint?: string,
    presetOverride?: { limit: number; windowMs: number },
  ) => { allowed: boolean; remaining: number; resetAt: number; retryAfterMs: number }
  let resetAllRateLimits: () => void
  let resetRateLimit: (ip: string, endpoint?: string) => void
  let createRateLimitResponse: (
    result: { allowed: boolean; remaining: number; resetAt: number; retryAfterMs: number },
  ) => import('next/server').NextResponse
  let addRateLimitHeaders: (
    response: import('next/server').NextResponse,
    result: { allowed: boolean; remaining: number; resetAt: number; retryAfterMs: number },
  ) => import('next/server').NextResponse
  let getStoreSize: () => number
  let RATE_LIMIT_PRESETS: Record<string, { limit: number; windowMs: number }>

  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00.000Z'))

    const rlModule = await import(
      '../../../apps/user/app/api/lib/rateLimit'
    )
    checkRateLimit = rlModule.checkRateLimit
    resetAllRateLimits = rlModule.resetAllRateLimits
    resetRateLimit = rlModule.resetRateLimit
    createRateLimitResponse = rlModule.createRateLimitResponse
    addRateLimitHeaders = rlModule.addRateLimitHeaders
    getStoreSize = rlModule.getStoreSize
    RATE_LIMIT_PRESETS = rlModule.RATE_LIMIT_PRESETS

    resetAllRateLimits()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('sliding window basics', () => {
    it('should allow the first request', () => {
      const result = checkRateLimit('10.0.0.1', 'default')

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(29) // default limit: 30
    })

    it('should track remaining count accurately', () => {
      const preset = { limit: 5, windowMs: 60_000 }

      const r1 = checkRateLimit('10.0.0.1', 'test', preset)
      expect(r1.remaining).toBe(4)

      const r2 = checkRateLimit('10.0.0.1', 'test', preset)
      expect(r2.remaining).toBe(3)

      const r3 = checkRateLimit('10.0.0.1', 'test', preset)
      expect(r3.remaining).toBe(2)
    })

    it('should block after limit is reached', () => {
      const preset = { limit: 3, windowMs: 60_000 }

      checkRateLimit('10.0.0.1', 'test', preset)
      checkRateLimit('10.0.0.1', 'test', preset)
      checkRateLimit('10.0.0.1', 'test', preset)

      const blocked = checkRateLimit('10.0.0.1', 'test', preset)
      expect(blocked.allowed).toBe(false)
      expect(blocked.remaining).toBe(0)
    })

    it('should report positive retryAfterMs when blocked', () => {
      const preset = { limit: 2, windowMs: 60_000 }

      checkRateLimit('10.0.0.1', 'test', preset)
      checkRateLimit('10.0.0.1', 'test', preset)

      const blocked = checkRateLimit('10.0.0.1', 'test', preset)
      expect(blocked.retryAfterMs).toBeGreaterThan(0)
      expect(blocked.retryAfterMs).toBeLessThanOrEqual(60_000)
    })

    it('should report zero retryAfterMs when allowed', () => {
      const result = checkRateLimit('10.0.0.1', 'default')
      expect(result.retryAfterMs).toBe(0)
    })
  })

  describe('sliding window behavior', () => {
    it('should allow new requests as old ones slide out of window', () => {
      const preset = { limit: 3, windowMs: 60_000 }

      // Make 3 requests at t=0
      checkRateLimit('10.0.0.1', 'test', preset)
      checkRateLimit('10.0.0.1', 'test', preset)
      checkRateLimit('10.0.0.1', 'test', preset)

      // Should be blocked at t=0
      expect(checkRateLimit('10.0.0.1', 'test', preset).allowed).toBe(false)

      // Advance 61s — all 3 old timestamps should have expired
      vi.advanceTimersByTime(60_001)

      // Should be allowed again
      const after = checkRateLimit('10.0.0.1', 'test', preset)
      expect(after.allowed).toBe(true)
      expect(after.remaining).toBe(2)
    })

    it('should allow requests gradually as window slides', () => {
      const preset = { limit: 2, windowMs: 10_000 }

      // t=0: first request
      checkRateLimit('10.0.0.1', 'test', preset)

      // t=5s: second request
      vi.advanceTimersByTime(5_000)
      checkRateLimit('10.0.0.1', 'test', preset)

      // t=5s: should be blocked (2 requests in last 10s)
      expect(checkRateLimit('10.0.0.1', 'test', preset).allowed).toBe(false)

      // t=10.001s: first request slides out, should be allowed (only 1 in window)
      vi.advanceTimersByTime(5_001)
      const result = checkRateLimit('10.0.0.1', 'test', preset)
      expect(result.allowed).toBe(true)
    })
  })

  describe('endpoint-specific limits', () => {
    it('should use login preset (5/min)', () => {
      expect(RATE_LIMIT_PRESETS.login.limit).toBe(5)

      for (let i = 0; i < 5; i++) {
        expect(checkRateLimit('10.0.0.1', 'login').allowed).toBe(true)
      }

      expect(checkRateLimit('10.0.0.1', 'login').allowed).toBe(false)
    })

    it('should use chat preset (30/min)', () => {
      expect(RATE_LIMIT_PRESETS.chat.limit).toBe(30)

      for (let i = 0; i < 30; i++) {
        expect(checkRateLimit('10.0.0.1', 'chat').allowed).toBe(true)
      }

      expect(checkRateLimit('10.0.0.1', 'chat').allowed).toBe(false)
    })

    it('should use research preset (10/min)', () => {
      expect(RATE_LIMIT_PRESETS.research.limit).toBe(10)

      for (let i = 0; i < 10; i++) {
        expect(checkRateLimit('10.0.0.1', 'research').allowed).toBe(true)
      }

      expect(checkRateLimit('10.0.0.1', 'research').allowed).toBe(false)
    })

    it('should track endpoints independently for same IP', () => {
      const preset = { limit: 2, windowMs: 60_000 }

      // Exhaust limit for endpoint A
      checkRateLimit('10.0.0.1', 'endpointA', preset)
      checkRateLimit('10.0.0.1', 'endpointA', preset)
      expect(checkRateLimit('10.0.0.1', 'endpointA', preset).allowed).toBe(false)

      // Endpoint B should still work
      expect(checkRateLimit('10.0.0.1', 'endpointB', preset).allowed).toBe(true)
    })

    it('should use default preset for unknown endpoints', () => {
      const result = checkRateLimit('10.0.0.1', 'unknown-endpoint')
      expect(result.remaining).toBe(RATE_LIMIT_PRESETS.default.limit - 1)
    })

    it('should accept custom preset override', () => {
      const custom = { limit: 1, windowMs: 1_000 }

      checkRateLimit('10.0.0.1', 'chat', custom)
      expect(checkRateLimit('10.0.0.1', 'chat', custom).allowed).toBe(false)
    })
  })

  describe('IP isolation', () => {
    it('should track different IPs independently', () => {
      const preset = { limit: 2, windowMs: 60_000 }

      checkRateLimit('10.0.0.1', 'test', preset)
      checkRateLimit('10.0.0.1', 'test', preset)
      expect(checkRateLimit('10.0.0.1', 'test', preset).allowed).toBe(false)

      expect(checkRateLimit('10.0.0.2', 'test', preset).allowed).toBe(true)
    })
  })

  describe('reset functions', () => {
    it('should reset specific IP + endpoint', () => {
      const preset = { limit: 2, windowMs: 60_000 }

      checkRateLimit('10.0.0.1', 'test', preset)
      checkRateLimit('10.0.0.1', 'test', preset)
      expect(checkRateLimit('10.0.0.1', 'test', preset).allowed).toBe(false)

      resetRateLimit('10.0.0.1', 'test')

      expect(checkRateLimit('10.0.0.1', 'test', preset).allowed).toBe(true)
    })

    it('should reset all limits', () => {
      const preset = { limit: 1, windowMs: 60_000 }

      checkRateLimit('10.0.0.1', 'a', preset)
      checkRateLimit('10.0.0.2', 'b', preset)

      expect(checkRateLimit('10.0.0.1', 'a', preset).allowed).toBe(false)
      expect(checkRateLimit('10.0.0.2', 'b', preset).allowed).toBe(false)

      resetAllRateLimits()

      expect(checkRateLimit('10.0.0.1', 'a', preset).allowed).toBe(true)
      expect(checkRateLimit('10.0.0.2', 'b', preset).allowed).toBe(true)
    })

    it('should report store size', () => {
      const preset = { limit: 10, windowMs: 60_000 }

      checkRateLimit('10.0.0.1', 'a', preset)
      checkRateLimit('10.0.0.2', 'b', preset)
      checkRateLimit('10.0.0.3', 'c', preset)

      expect(getStoreSize()).toBe(3)

      resetAllRateLimits()
      expect(getStoreSize()).toBe(0)
    })
  })

  describe('createRateLimitResponse', () => {
    it('should return 429 status', () => {
      const result = {
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 30_000,
        retryAfterMs: 30_000,
      }

      const response = createRateLimitResponse(result)
      expect(response.status).toBe(429)
    })

    it('should include Retry-After header in seconds', () => {
      const result = {
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 45_000,
        retryAfterMs: 45_000,
      }

      const response = createRateLimitResponse(result)
      expect(response.headers.get('Retry-After')).toBe('45')
    })

    it('should include X-RateLimit-Remaining header', () => {
      const result = {
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 30_000,
        retryAfterMs: 30_000,
      }

      const response = createRateLimitResponse(result)
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
    })

    it('should include X-RateLimit-Reset header', () => {
      const result = {
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 30_000,
        retryAfterMs: 30_000,
      }

      const response = createRateLimitResponse(result)
      const reset = response.headers.get('X-RateLimit-Reset')
      expect(reset).toBeDefined()
      expect(parseInt(reset!, 10)).toBeGreaterThan(0)
    })
  })

  describe('addRateLimitHeaders', () => {
    it('should add rate limit headers to existing response', async () => {
      const { NextResponse } = await import('next/server')
      const response = NextResponse.json({ ok: true })

      const result = {
        allowed: true,
        remaining: 5,
        resetAt: Date.now() + 60_000,
        retryAfterMs: 0,
      }

      const enhanced = addRateLimitHeaders(response, result)
      expect(enhanced.headers.get('X-RateLimit-Remaining')).toBe('5')
      expect(enhanced.headers.get('X-RateLimit-Reset')).toBeDefined()
    })
  })
})
