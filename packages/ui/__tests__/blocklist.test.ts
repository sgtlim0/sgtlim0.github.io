import { describe, it, expect } from 'vitest'
import {
  isBlockedSite,
  isSensitivePattern,
  shouldBlockExtraction,
} from '../src/utils/blocklist'

describe('blocklist', () => {
  describe('isBlockedSite', () => {
    it('blocks Korean banking sites', () => {
      expect(isBlockedSite('https://ibank.kbstar.com/quics')).toBe(true)
      expect(isBlockedSite('https://mybank.shinhan.com/login')).toBe(true)
      expect(isBlockedSite('https://banking.nonghyup.com/')).toBe(true)
    })

    it('blocks payment sites', () => {
      expect(isBlockedSite('https://pay.naver.com/payments')).toBe(true)
      expect(isBlockedSite('https://kakaopay.com/send')).toBe(true)
    })

    it('blocks government sites', () => {
      expect(isBlockedSite('https://www.nts.go.kr/tax')).toBe(true)
      expect(isBlockedSite('https://www.gov.kr/portal')).toBe(true)
    })

    it('blocks authentication sites', () => {
      expect(isBlockedSite('https://accounts.google.com/signin')).toBe(true)
      expect(isBlockedSite('https://nid.naver.com/login')).toBe(true)
    })

    it('blocks subdomains of blocked sites', () => {
      expect(isBlockedSite('https://sub.accounts.google.com/oauth')).toBe(true)
    })

    it('allows normal websites', () => {
      expect(isBlockedSite('https://www.google.com/search')).toBe(false)
      expect(isBlockedSite('https://news.naver.com')).toBe(false)
      expect(isBlockedSite('https://github.com')).toBe(false)
    })

    it('handles invalid URLs', () => {
      expect(isBlockedSite('')).toBe(false)
      expect(isBlockedSite('not-a-url')).toBe(false)
    })
  })

  describe('isSensitivePattern', () => {
    it('detects banking patterns', () => {
      expect(isSensitivePattern('https://my-banking-app.com')).toBe(true)
      expect(isSensitivePattern('https://bank.example.com')).toBe(true)
    })

    it('detects login patterns', () => {
      expect(isSensitivePattern('https://login.example.com')).toBe(true)
      expect(isSensitivePattern('https://auth.example.com')).toBe(true)
    })

    it('detects payment patterns', () => {
      expect(isSensitivePattern('https://payment.example.com')).toBe(true)
      expect(isSensitivePattern('https://checkout.example.com')).toBe(true)
    })

    it('allows non-sensitive domains', () => {
      expect(isSensitivePattern('https://www.example.com')).toBe(false)
      expect(isSensitivePattern('https://docs.google.com')).toBe(false)
    })

    it('handles invalid URLs', () => {
      expect(isSensitivePattern('')).toBe(false)
    })
  })

  describe('shouldBlockExtraction', () => {
    it('blocks explicitly listed sites', () => {
      expect(shouldBlockExtraction('https://ibank.kbstar.com')).toBe(true)
    })

    it('blocks by sensitive pattern', () => {
      expect(shouldBlockExtraction('https://login.unknown-site.com')).toBe(
        true
      )
    })

    it('allows safe sites', () => {
      expect(
        shouldBlockExtraction('https://en.wikipedia.org/wiki/AI')
      ).toBe(false)
      expect(shouldBlockExtraction('https://hchat.hmg.com/docs')).toBe(
        false
      )
    })
  })
})
