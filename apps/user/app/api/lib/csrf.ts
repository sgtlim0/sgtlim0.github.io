/**
 * Server-side CSRF protection using Double Submit Cookie pattern with HMAC signing.
 *
 * Flow:
 * 1. GET /api/csrf → generates HMAC-signed token, sets it as httpOnly cookie + returns in body
 * 2. Client sends token in X-CSRF-Token header on subsequent POST requests
 * 3. Server compares cookie token with header token (both must match and be validly signed)
 *
 * HMAC signing prevents token forgery — attackers cannot fabricate valid tokens
 * without knowledge of the server-side secret.
 */

import { NextResponse } from 'next/server'

const CSRF_HEADER = 'x-csrf-token'
const CSRF_COOKIE = 'csrf_token'
const TOKEN_EXPIRY_MS = 3_600_000 // 1 hour

/**
 * CSRF secret for HMAC signing.
 * In production, set CSRF_SECRET env var. Falls back to a random per-process secret.
 */
const CSRF_SECRET =
  process.env.CSRF_SECRET ||
  (() => {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  })()

/**
 * Signs a payload using HMAC-SHA256.
 * @param payload - The data to sign
 * @returns Hex-encoded HMAC signature
 */
async function hmacSign(payload: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(CSRF_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Verifies an HMAC-SHA256 signature using constant-time comparison.
 * @param payload - The original data
 * @param signature - The hex-encoded signature to verify
 * @returns true if the signature is valid
 */
async function hmacVerify(payload: string, signature: string): Promise<boolean> {
  const expected = await hmacSign(payload)
  if (expected.length !== signature.length) {
    return false
  }
  let result = 0
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return result === 0
}

/**
 * Token format: `<uuid>.<timestamp>.<hmac>`
 * - uuid: random identifier
 * - timestamp: creation time (ms since epoch)
 * - hmac: HMAC-SHA256(uuid.timestamp, CSRF_SECRET)
 */

/**
 * Generates a signed CSRF token.
 * @returns The signed token string
 */
export async function generateSignedCsrfToken(): Promise<string> {
  const uuid = crypto.randomUUID()
  const timestamp = Date.now().toString()
  const payload = `${uuid}.${timestamp}`
  const signature = await hmacSign(payload)
  return `${payload}.${signature}`
}

/**
 * Parses and validates a signed CSRF token.
 * @param token - The token string to validate
 * @returns Object with validity status, parsed uuid, and timestamp
 */
export async function parseSignedToken(
  token: string,
): Promise<{ valid: boolean; uuid?: string; timestamp?: number }> {
  if (!token) {
    return { valid: false }
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    return { valid: false }
  }

  const [uuid, timestampStr, signature] = parts
  const timestamp = parseInt(timestampStr, 10)

  if (!uuid || !timestampStr || !signature || isNaN(timestamp)) {
    return { valid: false }
  }

  // Check expiry
  const age = Date.now() - timestamp
  if (age < 0 || age > TOKEN_EXPIRY_MS) {
    return { valid: false }
  }

  // Verify HMAC signature
  const payload = `${uuid}.${timestampStr}`
  const isValid = await hmacVerify(payload, signature)

  if (!isValid) {
    return { valid: false }
  }

  return { valid: true, uuid, timestamp }
}

/**
 * Validates the CSRF token from request header against the cookie value.
 * Implements Double Submit Cookie pattern:
 * - Cookie token and header token must both be present
 * - Both must have valid HMAC signatures
 * - Both must match exactly (constant-time comparison)
 *
 * @param request - The incoming request
 * @returns null if valid, or a NextResponse with 403 if invalid
 */
export async function validateCsrfToken(
  request: Request,
): Promise<NextResponse | null> {
  const headerToken = request.headers.get(CSRF_HEADER)

  if (!headerToken) {
    return NextResponse.json({ error: 'Missing CSRF token' }, { status: 403 })
  }

  // Extract cookie token
  const cookieHeader = request.headers.get('cookie') || ''
  const cookieToken = parseCookieValue(cookieHeader, CSRF_COOKIE)

  if (!cookieToken) {
    return NextResponse.json(
      { error: 'Missing CSRF cookie' },
      { status: 403 },
    )
  }

  // Constant-time comparison of cookie and header tokens
  if (headerToken.length !== cookieToken.length) {
    return NextResponse.json(
      { error: 'CSRF token mismatch' },
      { status: 403 },
    )
  }

  let mismatch = 0
  for (let i = 0; i < headerToken.length; i++) {
    mismatch |= headerToken.charCodeAt(i) ^ cookieToken.charCodeAt(i)
  }

  if (mismatch !== 0) {
    return NextResponse.json(
      { error: 'CSRF token mismatch' },
      { status: 403 },
    )
  }

  // Verify HMAC signature (prevents forged tokens)
  const parsed = await parseSignedToken(headerToken)
  if (!parsed.valid) {
    return NextResponse.json(
      { error: 'Invalid or expired CSRF token' },
      { status: 403 },
    )
  }

  return null
}

/**
 * Backward-compatible wrapper: validates CSRF header only (UUID format check).
 * Used when cookies are not available (e.g., static export mode).
 * @param request - The incoming request
 * @returns null if valid, or a NextResponse with 403 if invalid
 */
export function validateCsrfHeader(
  request: Request,
): NextResponse | null {
  const token = request.headers.get(CSRF_HEADER)

  if (!token) {
    return NextResponse.json({ error: 'Missing CSRF token' }, { status: 403 })
  }

  // Accept both UUID format (legacy) and signed token format (new)
  const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const SIGNED_TOKEN_PATTERN = /^[0-9a-f-]+\.\d+\.[0-9a-f]+$/

  if (!UUID_PATTERN.test(token) && !SIGNED_TOKEN_PATTERN.test(token)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token format' },
      { status: 403 },
    )
  }

  return null
}

/**
 * Creates a response with CSRF token set as httpOnly cookie and in body.
 * Call this from a GET /api/csrf endpoint.
 * @returns NextResponse with token in cookie and JSON body
 */
export async function createCsrfTokenResponse(): Promise<NextResponse> {
  const token = await generateSignedCsrfToken()

  const response = NextResponse.json({ csrfToken: token })

  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: TOKEN_EXPIRY_MS / 1000,
  })

  return response
}

/**
 * Parses a specific cookie value from a Cookie header string.
 * @param cookieHeader - The raw Cookie header value
 * @param name - The cookie name to find
 * @returns The cookie value or null
 */
function parseCookieValue(cookieHeader: string, name: string): string | null {
  const cookies = cookieHeader.split(';')
  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.trim().split('=')
    if (key === name) {
      return valueParts.join('=')
    }
  }
  return null
}

// Exports for testing
export { CSRF_HEADER, CSRF_COOKIE, TOKEN_EXPIRY_MS, hmacSign, hmacVerify, parseCookieValue }
