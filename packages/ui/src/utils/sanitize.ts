/**
 * PII sanitization patterns and masking utility.
 * Used before sending user-extracted text to AI backend.
 */

const PII_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Korean resident registration number: 000000-0000000 (MUST be before phone)
  { pattern: /\d{6}-[1-4]\d{6}/g, replacement: '[주민등록번호]' },
  // Korean phone numbers: 010-1234-5678, 01012345678
  { pattern: /01[016789]-?\d{3,4}-?\d{4}/g, replacement: '[전화번호]' },
  // Email addresses
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[이메일]' },
  // Credit card numbers (space or dash separated)
  { pattern: /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g, replacement: '[카드번호]' },
  // Korean business registration number: 000-00-00000
  { pattern: /\d{3}-\d{2}-\d{5}/g, replacement: '[사업자번호]' },
  // IP addresses
  { pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, replacement: '[IP주소]' },
]

/**
 * Scans text for PII patterns and replaces them with Korean-labeled placeholders.
 * Detects: resident registration numbers, phone numbers, emails, credit cards,
 * business registration numbers, and IP addresses.
 * @param text - Raw text to sanitize
 * @returns Object with sanitized text and the count of masked items
 */
export function sanitizePII(text: string): { sanitized: string; maskedCount: number } {
  let sanitized = text
  let maskedCount = 0

  for (const { pattern, replacement } of PII_PATTERNS) {
    const matches = sanitized.match(pattern)
    if (matches) {
      maskedCount += matches.length
      sanitized = sanitized.replace(pattern, replacement)
    }
  }

  return { sanitized, maskedCount }
}

/**
 * Checks whether text contains any PII patterns without modifying it.
 * @param text - Text to check
 * @returns True if any PII pattern matches
 */
export function containsPII(text: string): boolean {
  return PII_PATTERNS.some(({ pattern }) => {
    const fresh = new RegExp(pattern.source, pattern.flags)
    return fresh.test(text)
  })
}
