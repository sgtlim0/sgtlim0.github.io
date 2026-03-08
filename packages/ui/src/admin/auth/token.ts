/**
 * Browser-only JWT token generation and verification using Web Crypto API.
 * Signs tokens with HMAC-SHA256.
 */

const TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1시간

// mock 환경용 고정 시크릿 (프로덕션에서는 서버 측 시크릿 사용)
const SECRET = 'hchat-mock-secret-key-do-not-use-in-production'

function getCrypto(): Crypto {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    return globalThis.crypto
  }
  throw new Error('Web Crypto API를 사용할 수 없는 환경입니다')
}

function base64UrlEncode(data: string): string {
  // TextEncoder -> Uint8Array -> binary string -> btoa -> URL-safe
  const bytes = new TextEncoder().encode(data)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(str: string): string {
  // URL-safe -> standard base64 -> atob -> Uint8Array -> TextDecoder
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  if (pad) {
    base64 += '='.repeat(4 - pad)
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

async function getSigningKey(): Promise<CryptoKey> {
  const crypto = getCrypto()
  const encoder = new TextEncoder()
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET) as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

async function sign(data: string): Promise<string> {
  const crypto = getCrypto()
  const key = await getSigningKey()
  const encoder = new TextEncoder()
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data) as BufferSource)
  const bytes = new Uint8Array(signature)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function verifySignature(data: string, signatureB64: string): Promise<boolean> {
  const crypto = getCrypto()
  const key = await getSigningKey()
  const encoder = new TextEncoder()

  let base64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  if (pad) {
    base64 += '='.repeat(4 - pad)
  }
  const binary = atob(base64)
  const sigBytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    sigBytes[i] = binary.charCodeAt(i)
  }

  return crypto.subtle.verify('HMAC', key, sigBytes as BufferSource, encoder.encode(data) as BufferSource)
}

/**
 * Payload structure embedded in a JWT token.
 * Standard claims `exp` (expiration) and `iat` (issued-at) are optional.
 */
export interface TokenPayload {
  [key: string]: unknown
  exp?: number
  iat?: number
}

/**
 * Generates a JWT token signed with HMAC-SHA256.
 * @param payload - Data to embed in the token
 * @param expiresInMs - Token lifetime in milliseconds (default: 1 hour)
 * @returns Encoded JWT string (header.payload.signature)
 */
export async function generateToken(
  payload: Record<string, unknown>,
  expiresInMs: number = TOKEN_EXPIRY_MS,
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Date.now()

  const fullPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInMs,
  }

  const headerEncoded = base64UrlEncode(JSON.stringify(header))
  const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload))
  const unsigned = `${headerEncoded}.${payloadEncoded}`
  const signature = await sign(unsigned)

  return `${unsigned}.${signature}`
}

/**
 * Verifies a JWT token's signature and expiration, then returns the decoded payload.
 * @param token - JWT string to verify
 * @returns Decoded TokenPayload if valid, or null if invalid/expired
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const [headerEncoded, payloadEncoded, signatureEncoded] = parts
    const unsigned = `${headerEncoded}.${payloadEncoded}`

    const isValid = await verifySignature(unsigned, signatureEncoded)
    if (!isValid) {
      return null
    }

    const payload: TokenPayload = JSON.parse(base64UrlDecode(payloadEncoded))

    // 만료 시간 검증
    if (payload.exp && typeof payload.exp === 'number' && Date.now() > payload.exp) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
