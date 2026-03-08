'use client';

import { useI18n } from './I18nProvider';
import type { Locale } from './I18nProvider';

const localeOrder: readonly Locale[] = ['ko', 'en', 'zh'] as const;

const localeLabels: Record<Locale, string> = {
  ko: 'KO',
  en: 'EN',
  zh: '中文',
};

const localeAriaLabels: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  zh: '中文',
};

export default function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  const cycleLocale = () => {
    const currentIndex = localeOrder.indexOf(locale);
    const nextIndex = (currentIndex + 1) % localeOrder.length;
    setLocale(localeOrder[nextIndex]);
  };

  const nextLocale = localeOrder[(localeOrder.indexOf(locale) + 1) % localeOrder.length];

  return (
    <button
      onClick={cycleLocale}
      className="px-3 py-1.5 text-sm font-medium rounded-md border border-hmg-border bg-hmg-bg-card text-hmg-text-body hover:bg-hmg-bg-surface transition-colors"
      aria-label={localeAriaLabels[nextLocale]}
    >
      {localeLabels[nextLocale]}
    </button>
  );
}
