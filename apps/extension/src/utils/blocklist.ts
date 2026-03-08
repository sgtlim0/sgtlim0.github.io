/**
 * Sensitive site blocklist — prevents text extraction on banking,
 * payment, authentication, government, and email domains.
 */

const BLOCKED_DOMAINS: readonly string[] = [
  // Banking
  'banking.nonghyup.com',
  'ibank.kbstar.com',
  'mybank.shinhan.com',
  'ebank.wooribank.com',
  'banking.hanabank.com',
  'ibank.ibk.co.kr',
  'online.citibank.co.kr',

  // Payment
  'pay.naver.com',
  'kakaopay.com',
  'tosspayments.com',

  // Government
  'www.nts.go.kr',
  'www.gov.kr',
  'www.wetax.go.kr',

  // Authentication
  'auth.kakao.com',
  'accounts.kakao.com',
  'nid.naver.com',
  'accounts.google.com',
  'login.microsoftonline.com',

  // Email
  'mail.google.com',
  'outlook.office.com',
]

/**
 * Check whether the given URL belongs to a known blocked domain.
 * Matches exact hostname or any subdomain of a blocked entry.
 */
export function isBlockedSite(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    return BLOCKED_DOMAINS.some(
      (b) => hostname === b || hostname.endsWith(`.${b}`),
    )
  } catch {
    return false
  }
}

/** Sensitive hostname patterns (banking, login, auth, payment, checkout). */
const SENSITIVE_PATTERNS: readonly RegExp[] = [
  /\bbank(ing)?\b/i,
  /\blogin\b/i,
  /\bauth\b/i,
  /\bsignin\b/i,
  /\bpayment\b/i,
  /\bcheckout\b/i,
]

/**
 * Check whether the hostname of the given URL matches a sensitive pattern.
 */
export function isSensitivePattern(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    return SENSITIVE_PATTERNS.some((p) => p.test(hostname))
  } catch {
    return false
  }
}

/**
 * Returns true when text extraction should be blocked for the given URL.
 * Combines explicit blocklist and heuristic pattern matching.
 */
export function shouldBlockExtraction(url: string): boolean {
  return isBlockedSite(url) || isSensitivePattern(url)
}
