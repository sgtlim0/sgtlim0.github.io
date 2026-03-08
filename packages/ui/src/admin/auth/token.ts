/**
 * Web Crypto API 기반 JWT 토큰 생성/검증
 * HMAC-SHA256 서명 사용 (브라우저 환경 전용)
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

export interface TokenPayload {
  [key: string]: unknown
  exp?: number
  iat?: number
}

/**
 * HMAC-SHA256 서명된 JWT 토큰 생성
 * @param payload 토큰에 포함할 데이터
 * @param expiresInMs 만료 시간 (기본 1시간)
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
 * JWT 토큰 검증 및 페이로드 반환
 * @returns 유효한 경우 페이로드, 무효한 경우 null
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
