/**
 * API Key Security Utilities
 * Pure functions for API key management, rate limiting, and cost calculation.
 */

export function maskAPIKey(key: string, showChars = 7): string {
  if (key.length <= showChars + 4) {
    return key
  }
  const prefix = key.slice(0, showChars)
  const suffix = key.slice(-4)
  return `${prefix}...${suffix}`
}

export function validateAPIKey(key: string): { valid: boolean; error?: string } {
  if (!key.startsWith('sk-')) {
    return { valid: false, error: 'API 키는 "sk-"로 시작해야 합니다' }
  }
  if (key.length <= 20) {
    return { valid: false, error: 'API 키는 20자를 초과해야 합니다' }
  }
  const allowedPattern = /^[a-zA-Z0-9_-]+$/
  if (!allowedPattern.test(key)) {
    return { valid: false, error: '허용되지 않는 문자가 포함되어 있습니다' }
  }
  return { valid: true }
}

export function generateAPIKey(prefix = 'sk-proj-'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const randomPart = Array.from({ length: 48 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join('')
  return `${prefix}${randomPart}`
}

export function calculateRateLimit(
  requestsThisMinute: number,
  limit: number,
): { remaining: number; percentage: number; isLimited: boolean } {
  const remaining = Math.max(0, limit - requestsThisMinute)
  const percentage = Math.min(100, (requestsThisMinute / limit) * 100)
  return {
    remaining,
    percentage: Math.round(percentage * 100) / 100,
    isLimited: requestsThisMinute >= limit,
  }
}

export function estimateTokens(text: string): number {
  let tokenCount = 0
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    // Korean characters (Hangul Syllables + Jamo)
    if ((code >= 0xac00 && code <= 0xd7af) || (code >= 0x1100 && code <= 0x11ff)) {
      tokenCount += 0.5
    } else {
      tokenCount += 0.25
    }
  }
  return Math.ceil(tokenCount)
}

export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  inputPrice: number,
  outputPrice: number,
): { inputCost: number; outputCost: number; totalCost: number } {
  const inputCost = Math.round((inputTokens / 1_000_000) * inputPrice * 100) / 100
  const outputCost = Math.round((outputTokens / 1_000_000) * outputPrice * 100) / 100
  return {
    inputCost,
    outputCost,
    totalCost: Math.round((inputCost + outputCost) * 100) / 100,
  }
}
