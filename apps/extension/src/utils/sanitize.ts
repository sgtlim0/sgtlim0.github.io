/**
 * PII (Personally Identifiable Information) sanitization utility
 * Detects and masks 7 types of sensitive Korean personal data
 */

interface PIIPattern {
  name: string
  pattern: RegExp
  replacement: string
}

/**
 * Korean PII patterns with comprehensive matching rules
 */
const PII_PATTERNS: readonly PIIPattern[] = [
  // 주민번호 (RRN): 6 digits - 7 digits (e.g., 900101-1234567)
  {
    name: 'rrn',
    pattern: /\b\d{6}[-]\d{7}\b/g,
    replacement: '[주민번호]',
  },

  // 카드번호 (Card): 4 groups of 4 digits with optional separators
  {
    name: 'card',
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    replacement: '[카드번호]',
  },

  // 이메일 (Email): standard email pattern
  {
    name: 'email',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: '[이메일]',
  },

  // 전화번호 (Phone): Korean mobile (010/011/016/017/018/019)
  {
    name: 'phone',
    pattern: /\b01[016789][-\s]?\d{3,4}[-\s]?\d{4}\b/g,
    replacement: '[전화번호]',
  },

  // 사업자번호 (Business Registration): 3-2-5 format
  {
    name: 'bizno',
    pattern: /\b\d{3}-\d{2}-\d{5}\b/g,
    replacement: '[사업자번호]',
  },

  // 여권번호 (Passport): 1-2 letters + 7-8 digits
  {
    name: 'passport',
    pattern: /\b[A-Z]{1,2}\d{7,8}\b/g,
    replacement: '[여권번호]',
  },

  // 계좌번호 (Account): typical Korean bank account format (bank code 3-4 digits, branch 2-6 digits, account 4-8 digits)
  // More conservative pattern to avoid false positives
  {
    name: 'account',
    pattern: /\b\d{3,4}-\d{4,6}-\d{5,8}\b/g,
    replacement: '[계좌번호]',
  },
]

/**
 * Result of PII sanitization with metadata
 */
export interface SanitizeResult {
  text: string
  detectedPatterns: string[]
  originalLength: number
  sanitizedLength: number
}

/**
 * Sanitizes text by detecting and replacing PII patterns
 *
 * @param text - Input text to sanitize
 * @returns Sanitization result with masked text and metadata
 *
 * @example
 * ```ts
 * const result = sanitizePII('주민번호: 900101-1234567')
 * // result.text === '주민번호: [주민번호]'
 * // result.detectedPatterns === ['rrn']
 * ```
 */
export function sanitizePII(text: string): SanitizeResult {
  const detectedPatterns: string[] = []
  let sanitized = text

  for (const { name, pattern, replacement } of PII_PATTERNS) {
    // Create new regex instance to avoid global flag state issues
    const regex = new RegExp(pattern.source, pattern.flags)

    if (regex.test(sanitized)) {
      detectedPatterns.push(name)
      // Replace with new regex instance
      sanitized = sanitized.replace(new RegExp(pattern.source, pattern.flags), replacement)
    }
  }

  return {
    text: sanitized,
    detectedPatterns,
    originalLength: text.length,
    sanitizedLength: sanitized.length,
  }
}

/**
 * Quick check for presence of sensitive data without full sanitization
 * Useful for validation before processing
 *
 * @param text - Input text to check
 * @returns true if any PII pattern is detected
 *
 * @example
 * ```ts
 * hasSensitiveData('카드: 1234-5678-9012-3456') // true
 * hasSensitiveData('일반 텍스트입니다') // false
 * ```
 */
export function hasSensitiveData(text: string): boolean {
  return PII_PATTERNS.some(({ pattern }) => new RegExp(pattern.source, pattern.flags).test(text))
}

/**
 * Get all supported PII pattern types
 * Useful for documentation and UI display
 */
export function getSupportedPIITypes(): readonly string[] {
  return PII_PATTERNS.map((p) => p.name)
}
