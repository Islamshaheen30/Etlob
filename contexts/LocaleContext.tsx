import React, { createContext, ReactNode, useCallback, useMemo, useState } from 'react';
import { getString, Locale, StringKey } from '@/constants/i18n';

interface LocaleContextType {
  locale: Locale;
  isRTL: boolean;
  setLocale: (locale: Locale) => void;
  toggle: () => void;
  t: (key: StringKey) => string;
}

export const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  const toggle = useCallback(() => {
    setLocale((cur) => (cur === 'en' ? 'ar' : 'en'));
  }, []);

  const t = useCallback((key: StringKey) => getString(key, locale), [locale]);

  const value = useMemo(
    () => ({ locale, isRTL: locale === 'ar', setLocale, toggle, t }),
    [locale, toggle, t]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
