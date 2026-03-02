'use client';

import { useI18n } from './I18nProvider';

export default function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  const toggleLocale = () => {
    setLocale(locale === 'ko' ? 'en' : 'ko');
  };

  return (
    <button
      onClick={toggleLocale}
      className="px-3 py-1.5 text-sm font-medium rounded-md border border-hmg-border bg-hmg-bg-card text-hmg-text-body hover:bg-hmg-bg-surface transition-colors"
      aria-label={locale === 'ko' ? t('lang.english') : t('lang.korean')}
    >
      {locale === 'ko' ? 'EN' : 'KO'}
    </button>
  );
}
