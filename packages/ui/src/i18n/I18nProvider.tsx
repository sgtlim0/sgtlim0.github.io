'use client';

import { createContext, useContext, useEffect, useSyncExternalStore, useCallback, type ReactNode } from 'react';
import { ko, type TranslationKey } from './ko';
import { en } from './en';
import { zh } from './zh';

export type Locale = 'ko' | 'en' | 'zh';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'ko',
  setLocale: () => {},
  t: (key) => key,
});

export function useI18n() {
  return useContext(I18nContext);
}

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'ko';
  const stored = localStorage.getItem('locale') as Locale | null;
  if (stored === 'ko' || stored === 'en' || stored === 'zh') return stored;
  return 'ko';
}

let listeners: Array<() => void> = [];
let currentLocale: Locale = 'ko';

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): Locale {
  return currentLocale;
}

function getServerSnapshot(): Locale {
  return 'ko';
}

function setLocaleInternal(locale: Locale) {
  currentLocale = locale;
  localStorage.setItem('locale', locale);
  for (const listener of listeners) {
    listener();
  }
}

const translations = { ko, en, zh };

export default function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const initial = getStoredLocale();
    if (initial !== currentLocale) {
      setLocaleInternal(initial);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleInternal(newLocale);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[locale][key] || key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
