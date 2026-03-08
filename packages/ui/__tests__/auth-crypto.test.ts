import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { hashPassword, verifyPassword } from '../src/admin/auth/crypto'
import { generateToken, verifyToken } from '../src/admin/auth/token'
import { mockAuthService, _resetForTesting } from '../src/admin/auth/mockAuthService'

// ---------------------------------------------------------------------------
// crypto.ts — PBKDF2 password hashing
// ---------------------------------------------------------------------------

describe('crypto - hashPassword / verifyPassword', () => {
  it('should hash a password and verify it successfully', async () => {
    const password = 'Admin123!'
    const hash = await hashPassword(password)

    expect(hash).toContain(':')
    expect(typeof hash).toBe('string')

    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)
  })

  it('should reject an incorrect password', async () => {
    const hash = await hashPassword('CorrectPassword')
    const isValid = await verifyPassword('WrongPassword', hash)
    expect(isValid).toBe(false)
  })

  it('should generate different hashes for the same password (random salt)', async () => {
    const password = 'SamePassword123'
    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)

    expect(hash1).not.toBe(hash2)

    // Both should still verify
    expect(await verifyPassword(password, hash1)).toBe(true)
    expect(await verifyPassword(password, hash2)).toBe(true)
  })

  it('should return false for malformed hash (no colon)', async () => {
    const isValid = await verifyPassword('password', 'nocolonhere')
    expect(isValid).toBe(false)
  })

  it('should return false for empty hash', async () => {
    const isValid = await verifyPassword('password', '')
    expect(isValid).toBe(false)
  })

  it('should handle empty password', async () => {
    const hash = await hashPassword('')
    expect(await verifyPassword('', hash)).toBe(true)
    expect(await verifyPassword('notempty', hash)).toBe(false)
  })

  it('should handle unicode passwords', async () => {
    const password = '비밀번호123!'
    const hash = await hashPassword(password)
    expect(await verifyPassword(password, hash)).toBe(true)
    expect(await verifyPassword('wrong', hash)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// token.ts — HMAC-SHA256 JWT
// ---------------------------------------------------------------------------

describe('token - generateToken / verifyToken', () => {
  it('should generate a valid JWT with 3 parts', async () => {
    const token = await generateToken({ email: 'test@test.com' })
    const parts = token.split('.')
    expect(parts).toHaveLength(3)
  })

  it('should verify a valid token and return payload', async () => {
    const token = await generateToken({ email: 'admin@hchat.ai', role: 'admin' })
    const payload = await verifyToken(token)

    expect(payload).not.toBeNull()
    expect(payload!.email).toBe('admin@hchat.ai')
    expect(payload!.role).toBe('admin')
    expect(payload!.iat).toBeTypeOf('number')
    expect(payload!.exp).toBeTypeOf('number')
  })

  it('should include iat and exp claims', async () => {
    const before = Date.now()
    const token = await generateToken({ data: 'test' })
    const after = Date.now()
    const payload = await verifyToken(token)

    expect(payload).not.toBeNull()
    expect(payload!.iat).toBeGreaterThanOrEqual(before)
    expect(payload!.iat).toBeLessThanOrEqual(after)
    expect(payload!.exp).toBeGreaterThan(payload!.iat!)
  })

  it('should reject a tampered token', async () => {
    const token = await generateToken({ email: 'test@test.com' })
    // Tamper with payload
    const parts = token.split('.')
    parts[1] = parts[1] + 'x'
    const tampered = parts.join('.')

    const payload = await verifyToken(tampered)
    expect(payload).toBeNull()
  })

  it('should reject an expired token', async () => {
    // Generate token that expires immediately (negative expiry)
    const token = await generateToken({ email: 'test@test.com' }, -1000)
    const payload = await verifyToken(token)
    expect(payload).toBeNull()
  })

  it('should accept a token with custom expiry', async () => {
    const token = await generateToken({ email: 'test@test.com' }, 30_000)
    const payload = await verifyToken(token)
    expect(payload).not.toBeNull()
    expect(payload!.exp! - payload!.iat!).toBe(30_000)
  })

  it('should return null for malformed token (wrong parts count)', async () => {
    expect(await verifyToken('only.two')).toBeNull()
    expect(await verifyToken('no-dots')).toBeNull()
    expect(await verifyToken('')).toBeNull()
  })

  it('should return null for token with invalid signature', async () => {
    const token = await generateToken({ data: 'test' })
    const parts = token.split('.')
    // Replace signature with random data
    parts[2] = 'invalidsignaturedata'
    const invalid = parts.join('.')

    const payload = await verifyToken(invalid)
    expect(payload).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// mockAuthService — integration with crypto + token
// ---------------------------------------------------------------------------

describe('mockAuthService (secured)', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    _resetForTesting()
  })

  it('should login admin user with correct password', async () => {
    const user = await mockAuthService.login({
      email: 'admin@hchat.ai',
      password: 'Admin123!',
      rememberMe: false,
    })

    expect(user.email).toBe('admin@hchat.ai')
    expect(user.name).toBe('관리자')
    expect(user.role).toBe('admin')
  })

  it('should store a valid JWT token (not plain base64)', async () => {
    await mockAuthService.login({
      email: 'admin@hchat.ai',
      password: 'Admin123!',
      rememberMe: false,
    })

    const token = sessionStorage.getItem('hchat_admin_auth_token')
    expect(token).toBeTruthy()

    // JWT has 3 parts separated by dots
    const parts = token!.split('.')
    expect(parts).toHaveLength(3)

    // Verify token is actually signed
    const payload = await verifyToken(token!)
    expect(payload).not.toBeNull()
    expect(payload!.email).toBe('admin@hchat.ai')
  })

  it('should reject wrong password', async () => {
    await expect(
      mockAuthService.login({
        email: 'admin@hchat.ai',
        password: 'WrongPassword!',
        rememberMe: false,
      }),
    ).rejects.toThrow('이메일 또는 비밀번호가 올바르지 않습니다.')
  })

  it('should reject unknown email', async () => {
    await expect(
      mockAuthService.login({
        email: 'unknown@hchat.ai',
        password: 'Admin123!',
        rememberMe: false,
      }),
    ).rejects.toThrow('이메일 또는 비밀번호가 올바르지 않습니다.')
  })

  it('should login manager user', async () => {
    const user = await mockAuthService.login({
      email: 'manager@hchat.ai',
      password: 'Manager123!',
      rememberMe: false,
    })

    expect(user.role).toBe('manager')
  })

  it('should validate token in getCurrentUser', async () => {
    await mockAuthService.login({
      email: 'admin@hchat.ai',
      password: 'Admin123!',
      rememberMe: false,
    })

    const user = await mockAuthService.getCurrentUser()
    expect(user).not.toBeNull()
    expect(user!.email).toBe('admin@hchat.ai')
  })

  it('should reject tampered token in getCurrentUser', async () => {
    await mockAuthService.login({
      email: 'admin@hchat.ai',
      password: 'Admin123!',
      rememberMe: false,
    })

    // Tamper with stored token
    const token = sessionStorage.getItem('hchat_admin_auth_token')!
    sessionStorage.setItem('hchat_admin_auth_token', token + 'tampered')

    const user = await mockAuthService.getCurrentUser()
    expect(user).toBeNull()
    // Should have cleared storage
    expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeNull()
  })

  it('should clear storage on logout', async () => {
    await mockAuthService.login({
      email: 'admin@hchat.ai',
      password: 'Admin123!',
      rememberMe: false,
    })

    expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeTruthy()

    await mockAuthService.logout()

    expect(sessionStorage.getItem('hchat_admin_auth_token')).toBeNull()
    expect(sessionStorage.getItem('hchat_admin_user')).toBeNull()
  })

  it('should throw Zod error for invalid email format', async () => {
    await expect(
      mockAuthService.login({
        email: 'not-an-email',
        password: 'password123',
        rememberMe: false,
      }),
    ).rejects.toThrow('올바른 이메일 형식이 아닙니다')
  })

  it('should throw Zod error for empty password', async () => {
    await expect(
      mockAuthService.login({
        email: 'admin@hchat.ai',
        password: '',
        rememberMe: false,
      }),
    ).rejects.toThrow('비밀번호를 입력해주세요')
  })
})
