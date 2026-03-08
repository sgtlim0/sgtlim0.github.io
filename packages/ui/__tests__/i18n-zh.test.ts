import { describe, it, expect } from 'vitest';
import { ko } from '../src/i18n/ko';
import { en } from '../src/i18n/en';
import { zh } from '../src/i18n/zh';

const koKeys = Object.keys(ko).sort();
const enKeys = Object.keys(en).sort();
const zhKeys = Object.keys(zh).sort();

describe('zh translations - key structure', () => {
  it('should have the same number of keys as ko', () => {
    expect(zhKeys.length).toBe(koKeys.length);
  });

  it('should have the same keys as ko', () => {
    expect(zhKeys).toEqual(koKeys);
  });

  it('should have the same keys as en', () => {
    expect(zhKeys).toEqual(enKeys);
  });
});

describe('zh translations - value quality', () => {
  it('should have no empty string values', () => {
    const emptyKeys = Object.entries(zh).filter(([, value]) => value.trim() === '');
    expect(emptyKeys).toEqual([]);
  });

  it('should have no undefined values', () => {
    const undefinedKeys = Object.entries(zh).filter(([, value]) => value === undefined);
    expect(undefinedKeys).toEqual([]);
  });

  it('should contain Chinese characters in translated values', () => {
    const chineseRegex = /[\u4e00-\u9fff]/;
    const translatedKeys = Object.entries(zh).filter(
      ([key]) => !key.startsWith('footer.copyright') && !key.startsWith('lang.')
    );
    const nonChineseKeys = translatedKeys.filter(([, value]) => !chineseRegex.test(value));
    expect(nonChineseKeys).toEqual([]);
  });

  it('should preserve brand names (H Chat) in translations', () => {
    const keysWithHChat = Object.entries(ko).filter(([, value]) => value.includes('H Chat'));
    for (const [key] of keysWithHChat) {
      expect(zh[key as keyof typeof zh]).toContain('H Chat');
    }
  });
});

describe('zh translations - locale type compatibility', () => {
  it('should be assignable to Record<TranslationKey, string>', () => {
    const record: Record<keyof typeof ko, string> = zh;
    expect(record).toBeDefined();
    expect(typeof record['nav.service']).toBe('string');
  });

  it('should have nav keys matching expected pattern', () => {
    const navKeys = zhKeys.filter((key) => key.startsWith('nav.'));
    expect(navKeys.length).toBeGreaterThanOrEqual(4);
  });

  it('should have footer.copyright keep English copyright text', () => {
    expect(zh['footer.copyright']).toContain('Hyundai Motor Group');
    expect(zh['footer.copyright']).toContain('2024');
  });
});
