/**
 * Browser-only password hashing using Web Crypto API.
 * Uses PBKDF2 with SHA-256 and a random salt (bcrypt alternative for browser environments).
 */

const ITERATIONS = 100_000
const KEY_LENGTH = 256
const SALT_LENGTH = 16

function getCrypto(): Crypto {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    return globalThis.crypto
  }
  throw new Error('Web Crypto API를 사용할 수 없는 환경입니다')
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const crypto = getCrypto()
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password) as BufferSource,
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH,
  )
}

/**
 * Hashes a password using PBKDF2 with a random salt.
 * @param password - Plain-text password to hash
 * @returns Hex string in the format "salt:hash"
 */
export async function hashPassword(password: string): Promise<string> {
  const crypto = getCrypto()
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const derivedBits = await deriveKey(password, salt)

  return `${bufferToHex(salt.buffer)}:${bufferToHex(derivedBits)}`
}

/**
 * Verifies a password against a stored hash using constant-time comparison.
 * @param password - Plain-text password to verify
 * @param storedHash - Previously stored hash in "salt:hash" hex format
 * @returns True if the password matches the stored hash
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':')
  if (!saltHex || !hashHex) {
    return false
  }

  const salt = hexToBuffer(saltHex)
  const derivedBits = await deriveKey(password, salt)
  const derivedHex = bufferToHex(derivedBits)

  // 타이밍 공격 방지: 고정 시간 비교
  if (derivedHex.length !== hashHex.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < derivedHex.length; i++) {
    result |= derivedHex.charCodeAt(i) ^ hashHex.charCodeAt(i)
  }

  return result === 0
}
