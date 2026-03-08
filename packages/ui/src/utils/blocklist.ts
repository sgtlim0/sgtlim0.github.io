/**
 * URL blocklist for Chrome Extension content extraction.
 * Blocks sensitive sites (banking, payment, government, auth, email).
 */

const BLOCKED_DOMAINS: readonly string[] = [
  // Korean banking
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
 * Check if URL matches an explicitly blocked domain or subdomain.
 */
export function isBlockedSite(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    return BLOCKED_DOMAINS.some(
      (b) => hostname === b || hostname.endsWith(`.${b}`)
    )
  } catch {
    return false
  }
}

/**
 * Check if URL hostname matches sensitive patterns (bank, login, auth, payment, etc.).
 */
export function isSensitivePattern(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    return [
      /\bbank(ing)?\b/i,
      /\blogin\b/i,
      /\bauth\b/i,
      /\bsignin\b/i,
      /\bpayment\b/i,
      /\bcheckout\b/i,
    ].some((p) => p.test(hostname))
  } catch {
    return false
  }
}

/**
 * Combined check: should the extension skip content extraction for this URL?
 */
export function shouldBlockExtraction(url: string): boolean {
  return isBlockedSite(url) || isSensitivePattern(url)
}
