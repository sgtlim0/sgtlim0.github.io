import { describe, it, expect } from 'vitest'
import {
  analysisModeSchema,
  analyzeRequestSchema,
  settingsSchema,
  pageContextSchema,
} from '../../src/schemas/extension'

describe('schemas', () => {
  describe('analysisModeSchema', () => {
    it('should accept valid modes', () => {
      expect(analysisModeSchema.parse('summarize')).toBe('summarize')
      expect(analysisModeSchema.parse('explain')).toBe('explain')
      expect(analysisModeSchema.parse('research')).toBe('research')
      expect(analysisModeSchema.parse('translate')).toBe('translate')
    })

    it('should reject invalid modes', () => {
      expect(() => analysisModeSchema.parse('invalid')).toThrow()
      expect(() => analysisModeSchema.parse('analyze')).toThrow()
      expect(() => analysisModeSchema.parse('')).toThrow()
    })
  })

  describe('analyzeRequestSchema', () => {
    it('should validate valid request', () => {
      const valid = {
        text: 'Sample text to analyze',
        mode: 'summarize' as const,
      }

      const result = analyzeRequestSchema.parse(valid)
      expect(result).toEqual(valid)
    })

    it('should validate request with all optional fields', () => {
      const valid = {
        text: 'Full request',
        mode: 'explain' as const,
        url: 'https://example.com',
        title: 'Example Page',
        targetLang: 'en',
      }

      const result = analyzeRequestSchema.parse(valid)
      expect(result).toEqual(valid)
    })

    it('should reject empty text', () => {
      const invalid = {
        text: '',
        mode: 'summarize' as const,
      }

      expect(() => analyzeRequestSchema.parse(invalid)).toThrow('텍스트를 입력해주세요')
    })

    it('should reject text exceeding max length', () => {
      const invalid = {
        text: 'a'.repeat(10001),
        mode: 'summarize' as const,
      }

      expect(() => analyzeRequestSchema.parse(invalid)).toThrow()
    })

    it('should reject invalid mode', () => {
      const invalid = {
        text: 'Valid text',
        mode: 'invalid',
      }

      expect(() => analyzeRequestSchema.parse(invalid)).toThrow()
    })

    it('should reject invalid URL', () => {
      const invalid = {
        text: 'Valid text',
        mode: 'summarize' as const,
        url: 'not-a-url',
      }

      expect(() => analyzeRequestSchema.parse(invalid)).toThrow()
    })

    it('should reject title exceeding max length', () => {
      const invalid = {
        text: 'Valid text',
        mode: 'summarize' as const,
        title: 'a'.repeat(501),
      }

      expect(() => analyzeRequestSchema.parse(invalid)).toThrow()
    })

    it('should reject targetLang exceeding max length', () => {
      const invalid = {
        text: 'Valid text',
        mode: 'translate' as const,
        targetLang: 'a'.repeat(11),
      }

      expect(() => analyzeRequestSchema.parse(invalid)).toThrow()
    })

    it('should allow max length text (10000 chars)', () => {
      const valid = {
        text: 'a'.repeat(10000),
        mode: 'summarize' as const,
      }

      expect(() => analyzeRequestSchema.parse(valid)).not.toThrow()
    })
  })

  describe('settingsSchema', () => {
    it('should validate valid settings', () => {
      const valid = {
        theme: 'light' as const,
        language: 'ko' as const,
        apiMode: 'mock' as const,
        apiBaseUrl: 'https://hchat-user.vercel.app',
        maxTextLength: 5000,
        autoSanitize: true,
        enableSidePanel: true,
        enableShortcuts: true,
      }

      const result = settingsSchema.parse(valid)
      expect(result).toEqual(valid)
    })

    it('should reject invalid theme', () => {
      const invalid = {
        theme: 'blue',
        language: 'ko' as const,
        apiMode: 'mock' as const,
        apiBaseUrl: 'https://api.example.com',
        maxTextLength: 5000,
        autoSanitize: true,
        enableSidePanel: true,
        enableShortcuts: true,
      }

      expect(() => settingsSchema.parse(invalid)).toThrow()
    })

    it('should reject invalid language', () => {
      const invalid = {
        theme: 'light' as const,
        language: 'fr',
        apiMode: 'mock' as const,
        apiBaseUrl: 'https://api.example.com',
        maxTextLength: 5000,
        autoSanitize: true,
        enableSidePanel: true,
        enableShortcuts: true,
      }

      expect(() => settingsSchema.parse(invalid)).toThrow()
    })

    it('should reject invalid URL', () => {
      const invalid = {
        theme: 'light' as const,
        language: 'ko' as const,
        apiMode: 'mock' as const,
        apiBaseUrl: 'not-a-url',
        maxTextLength: 5000,
        autoSanitize: true,
        enableSidePanel: true,
        enableShortcuts: true,
      }

      expect(() => settingsSchema.parse(invalid)).toThrow()
    })

    it('should reject maxTextLength below minimum', () => {
      const invalid = {
        theme: 'light' as const,
        language: 'ko' as const,
        apiMode: 'mock' as const,
        apiBaseUrl: 'https://api.example.com',
        maxTextLength: 99,
        autoSanitize: true,
        enableSidePanel: true,
        enableShortcuts: true,
      }

      expect(() => settingsSchema.parse(invalid)).toThrow()
    })

    it('should reject maxTextLength above maximum', () => {
      const invalid = {
        theme: 'light' as const,
        language: 'ko' as const,
        apiMode: 'mock' as const,
        apiBaseUrl: 'https://api.example.com',
        maxTextLength: 50001,
        autoSanitize: true,
        enableSidePanel: true,
        enableShortcuts: true,
      }

      expect(() => settingsSchema.parse(invalid)).toThrow()
    })

    it('should accept system theme', () => {
      const valid = {
        theme: 'system' as const,
        language: 'en' as const,
        apiMode: 'real' as const,
        apiBaseUrl: 'https://api.example.com',
        maxTextLength: 10000,
        autoSanitize: false,
        enableSidePanel: false,
        enableShortcuts: false,
      }

      expect(() => settingsSchema.parse(valid)).not.toThrow()
    })
  })

  describe('pageContextSchema', () => {
    it('should validate valid context', () => {
      const valid = {
        text: 'Page content',
        url: 'https://example.com',
        title: 'Example',
        timestamp: Date.now(),
        sanitized: false,
      }

      const result = pageContextSchema.parse(valid)
      expect(result).toEqual(valid)
    })

    it('should validate context with favicon', () => {
      const valid = {
        text: 'Page content',
        url: 'https://example.com',
        title: 'Example',
        favicon: 'https://example.com/favicon.ico',
        timestamp: 1234567890,
        sanitized: true,
      }

      const result = pageContextSchema.parse(valid)
      expect(result).toEqual(valid)
    })

    it('should reject text exceeding max length', () => {
      const invalid = {
        text: 'a'.repeat(10001),
        url: 'https://example.com',
        title: 'Example',
        timestamp: Date.now(),
        sanitized: false,
      }

      expect(() => pageContextSchema.parse(invalid)).toThrow()
    })

    it('should reject title exceeding max length', () => {
      const invalid = {
        text: 'Valid content',
        url: 'https://example.com',
        title: 'a'.repeat(501),
        timestamp: Date.now(),
        sanitized: false,
      }

      expect(() => pageContextSchema.parse(invalid)).toThrow()
    })

    it('should reject missing required fields', () => {
      const invalid = {
        text: 'Content',
        url: 'https://example.com',
        // missing: title, timestamp, sanitized
      }

      expect(() => pageContextSchema.parse(invalid)).toThrow()
    })

    it('should allow max length text (10000 chars)', () => {
      const valid = {
        text: 'a'.repeat(10000),
        url: 'https://example.com',
        title: 'Example',
        timestamp: Date.now(),
        sanitized: false,
      }

      expect(() => pageContextSchema.parse(valid)).not.toThrow()
    })

    it('should allow max length title (500 chars)', () => {
      const valid = {
        text: 'Content',
        url: 'https://example.com',
        title: 'a'.repeat(500),
        timestamp: Date.now(),
        sanitized: false,
      }

      expect(() => pageContextSchema.parse(valid)).not.toThrow()
    })

    it('should handle numeric timestamp', () => {
      const valid = {
        text: 'Content',
        url: 'https://example.com',
        title: 'Example',
        timestamp: 1234567890123,
        sanitized: true,
      }

      const result = pageContextSchema.parse(valid)
      expect(result.timestamp).toBe(1234567890123)
    })
  })

  describe('schema type inference', () => {
    it('should infer correct types from analyzeRequestSchema', () => {
      const parsed = analyzeRequestSchema.parse({
        text: 'test',
        mode: 'summarize' as const,
      })

      // TypeScript compile-time check
      const _text: string = parsed.text
      const _mode: 'summarize' | 'explain' | 'research' | 'translate' = parsed.mode
      expect(_text).toBeDefined()
      expect(_mode).toBeDefined()
    })

    it('should infer correct types from settingsSchema', () => {
      const parsed = settingsSchema.parse({
        theme: 'dark' as const,
        language: 'ko' as const,
        apiMode: 'mock' as const,
        apiBaseUrl: 'https://api.example.com',
        maxTextLength: 5000,
        autoSanitize: true,
        enableSidePanel: true,
        enableShortcuts: true,
      })

      // TypeScript compile-time check
      const _theme: 'light' | 'dark' | 'system' = parsed.theme
      const _language: 'ko' | 'en' = parsed.language
      expect(_theme).toBeDefined()
      expect(_language).toBeDefined()
    })
  })
})
