import { describe, it, expect } from 'vitest'
import { isBlockedSite, isSensitivePattern, shouldBlockExtraction } from '../../src/utils/blocklist'

describe('isBlockedSite', () => {
  describe('Banking sites', () => {
    it('should block banking.nonghyup.com', () => {
      expect(isBlockedSite('https://banking.nonghyup.com/main')).toBe(true)
    })

    it('should block KB Star banking', () => {
      expect(isBlockedSite('https://ibank.kbstar.com/login')).toBe(true)
    })

    it('should block Shinhan MyBank', () => {
      expect(isBlockedSite('https://mybank.shinhan.com/transfer')).toBe(true)
    })

    it('should block Woori eBank', () => {
      expect(isBlockedSite('https://ebank.wooribank.com/account')).toBe(true)
    })

    it('should block all 7 banking domains', () => {
      const bankingSites = [
        'https://banking.nonghyup.com',
        'https://ibank.kbstar.com',
        'https://mybank.shinhan.com',
        'https://ebank.wooribank.com',
        'https://banking.hanabank.com',
        'https://ibank.ibk.co.kr',
        'https://online.citibank.co.kr',
      ]

      for (const site of bankingSites) {
        expect(isBlockedSite(site)).toBe(true)
      }
    })
  })

  describe('Payment sites', () => {
    it('should block Naver Pay', () => {
      expect(isBlockedSite('https://pay.naver.com/checkout')).toBe(true)
    })

    it('should block Kakao Pay', () => {
      expect(isBlockedSite('https://kakaopay.com/payment')).toBe(true)
    })

    it('should block Toss Payments', () => {
      expect(isBlockedSite('https://tosspayments.com/order')).toBe(true)
    })
  })

  describe('Government sites', () => {
    it('should block NTS (국세청)', () => {
      expect(isBlockedSite('https://www.nts.go.kr/hometax')).toBe(true)
    })

    it('should block government portal', () => {
      expect(isBlockedSite('https://www.gov.kr/portal')).toBe(true)
    })

    it('should block WeTax', () => {
      expect(isBlockedSite('https://www.wetax.go.kr/main')).toBe(true)
    })
  })

  describe('Authentication sites', () => {
    it('should block Kakao auth', () => {
      expect(isBlockedSite('https://auth.kakao.com/login')).toBe(true)
      expect(isBlockedSite('https://accounts.kakao.com/profile')).toBe(true)
    })

    it('should block Naver ID', () => {
      expect(isBlockedSite('https://nid.naver.com/login')).toBe(true)
    })

    it('should block Google accounts', () => {
      expect(isBlockedSite('https://accounts.google.com/signin')).toBe(true)
    })

    it('should block Microsoft online', () => {
      expect(isBlockedSite('https://login.microsoftonline.com/oauth2')).toBe(true)
    })
  })

  describe('Email sites', () => {
    it('should block Gmail', () => {
      expect(isBlockedSite('https://mail.google.com/mail')).toBe(true)
    })

    it('should block Outlook', () => {
      expect(isBlockedSite('https://outlook.office.com/mail')).toBe(true)
    })
  })

  describe('Subdomain handling', () => {
    it('should block subdomains of blocked sites', () => {
      expect(isBlockedSite('https://secure.banking.nonghyup.com')).toBe(true)
      expect(isBlockedSite('https://mobile.ibank.kbstar.com')).toBe(true)
    })

    it('should not block similar but different domains', () => {
      expect(isBlockedSite('https://notbanking.nonghyup.com')).toBe(false)
      expect(isBlockedSite('https://ibanking.example.com')).toBe(false)
    })
  })

  describe('Invalid URLs', () => {
    it('should return false for invalid URLs', () => {
      expect(isBlockedSite('not-a-url')).toBe(false)
      expect(isBlockedSite('')).toBe(false)
      expect(isBlockedSite('javascript:alert(1)')).toBe(false)
    })
  })

  describe('Non-blocked sites', () => {
    it('should allow general websites', () => {
      expect(isBlockedSite('https://www.google.com')).toBe(false)
      expect(isBlockedSite('https://www.naver.com')).toBe(false)
      expect(isBlockedSite('https://github.com')).toBe(false)
    })
  })
})

describe('isSensitivePattern', () => {
  describe('Banking patterns', () => {
    it('should detect "bank" or "banking" as word in hostname', () => {
      expect(isSensitivePattern('https://bank.example.com')).toBe(true)
      expect(isSensitivePattern('https://banking.example.com')).toBe(true)
      expect(isSensitivePattern('https://my-bank.example.com')).toBe(true)
    })

    it('should be case-insensitive', () => {
      expect(isSensitivePattern('https://BANK.example.com')).toBe(true)
      expect(isSensitivePattern('https://BankIng.example.com')).toBe(true)
    })
  })

  describe('Login patterns', () => {
    it('should detect "login" in hostname', () => {
      expect(isSensitivePattern('https://login.example.com')).toBe(true)
      expect(isSensitivePattern('https://secure-login.example.com')).toBe(true)
    })

    it('should detect "signin" in hostname', () => {
      expect(isSensitivePattern('https://signin.example.com')).toBe(true)
    })
  })

  describe('Auth patterns', () => {
    it('should detect "auth" as standalone word in hostname', () => {
      expect(isSensitivePattern('https://auth.example.com')).toBe(true)
      expect(isSensitivePattern('https://api-auth.example.com')).toBe(true)
    })

    it('should not match "auth" within compound words', () => {
      // "oauth" is a single word, not "o" + "auth"
      expect(isSensitivePattern('https://oauth.example.com')).toBe(false)
    })
  })

  describe('Payment patterns', () => {
    it('should detect "payment" as standalone word in hostname', () => {
      expect(isSensitivePattern('https://payment.example.com')).toBe(true)
      expect(isSensitivePattern('https://secure-payment.example.com')).toBe(true)
    })

    it('should not match "payment" with suffix', () => {
      // "payments" has an 's' suffix, word boundary doesn't match
      expect(isSensitivePattern('https://payments.example.com')).toBe(false)
    })

    it('should detect "checkout" in hostname', () => {
      expect(isSensitivePattern('https://checkout.example.com')).toBe(true)
    })
  })

  describe('Pattern matching scope', () => {
    it('should only match hostname, not path', () => {
      // Path에 있는 패턴은 매치하지 않음 (hostname만 검사)
      expect(isSensitivePattern('https://example.com/login')).toBe(false)
      expect(isSensitivePattern('https://example.com/banking')).toBe(false)
    })

    it('should match all 6 sensitive patterns', () => {
      const patterns = [
        'https://bank.test.com',
        'https://login.test.com',
        'https://auth.test.com',
        'https://signin.test.com',
        'https://payment.test.com',
        'https://checkout.test.com',
      ]

      for (const url of patterns) {
        expect(isSensitivePattern(url)).toBe(true)
      }
    })
  })

  describe('Invalid URLs', () => {
    it('should return false for invalid URLs', () => {
      expect(isSensitivePattern('not-a-url')).toBe(false)
      expect(isSensitivePattern('')).toBe(false)
    })
  })

  describe('Non-sensitive sites', () => {
    it('should allow general websites', () => {
      expect(isSensitivePattern('https://www.example.com')).toBe(false)
      expect(isSensitivePattern('https://shop.example.com')).toBe(false)
      expect(isSensitivePattern('https://blog.example.com')).toBe(false)
    })
  })
})

describe('shouldBlockExtraction', () => {
  it('should block explicit blocklist sites', () => {
    expect(shouldBlockExtraction('https://banking.nonghyup.com')).toBe(true)
    expect(shouldBlockExtraction('https://pay.naver.com')).toBe(true)
  })

  it('should block pattern-matched sites', () => {
    expect(shouldBlockExtraction('https://bank.example.com')).toBe(true)
    expect(shouldBlockExtraction('https://login.myservice.com')).toBe(true)
  })

  it('should block when either condition is true', () => {
    // Explicit blocklist
    expect(shouldBlockExtraction('https://ibank.kbstar.com')).toBe(true)

    // Pattern match
    expect(shouldBlockExtraction('https://checkout.newsite.com')).toBe(true)

    // Both
    expect(shouldBlockExtraction('https://auth.kakao.com')).toBe(true)
  })

  it('should allow safe sites', () => {
    expect(shouldBlockExtraction('https://www.google.com')).toBe(false)
    expect(shouldBlockExtraction('https://github.com/user/repo')).toBe(false)
    expect(shouldBlockExtraction('https://docs.company.com')).toBe(false)
  })

  it('should handle edge cases', () => {
    expect(shouldBlockExtraction('invalid-url')).toBe(false)
    expect(shouldBlockExtraction('')).toBe(false)
  })

  describe('Real-world scenarios', () => {
    it('should block all major Korean banking sites', () => {
      const koreanBanks = [
        'https://banking.nonghyup.com',
        'https://ibank.kbstar.com',
        'https://mybank.shinhan.com',
        'https://ebank.wooribank.com',
        'https://banking.hanabank.com',
      ]

      for (const bank of koreanBanks) {
        expect(shouldBlockExtraction(bank)).toBe(true)
      }
    })

    it('should block major payment providers', () => {
      const payments = ['https://pay.naver.com', 'https://kakaopay.com', 'https://tosspayments.com']

      for (const pay of payments) {
        expect(shouldBlockExtraction(pay)).toBe(true)
      }
    })

    it('should allow common productivity sites', () => {
      const safeSites = [
        'https://www.google.com',
        'https://www.naver.com',
        'https://github.com',
        'https://stackoverflow.com',
        'https://docs.microsoft.com',
        'https://developer.mozilla.org',
      ]

      for (const site of safeSites) {
        expect(shouldBlockExtraction(site)).toBe(false)
      }
    })
  })
})
