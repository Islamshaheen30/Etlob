import React, { createContext, ReactNode, useMemo } from 'react';
import { getString, Locale, StringKey } from '@/constants/i18n';

interface LocaleContextType {
  locale: Locale;
  isRTL: boolean;
  t: (key: StringKey) => string;
}

export const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Arabic-only locale provider. Kept as a Context for API compatibility,
// future-proofed should multi-language ever be re-enabled from the admin.
export function LocaleProvider({ children }: { children: ReactNode }) {
  const value = useMemo<LocaleContextType>(
    () => ({
      locale: 'ar',
      isRTL: true,
      t: (key: StringKey) => getString(key),
    }),
    []
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
