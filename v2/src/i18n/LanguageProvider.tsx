import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { localizeDemoData } from '@/database/demoData'
import { installCompleteInterfaceTranslator } from '@/i18n/complete-interface-runtime'
import { installInterfaceTranslator } from '@/i18n/interface-runtime'
import { translations } from '@/i18n/translations'
import type { Locale } from '@/types/domain'

type TranslationKey = keyof (typeof translations)['ar']

type LanguageContextValue = {
  locale: Locale
  direction: 'rtl' | 'ltr'
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const STORAGE_KEY = 'axsis-v2-locale'
const LanguageContext = createContext<LanguageContextValue | null>(null)

function getInitialLocale(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'tr' || saved === 'en' || saved === 'ar' ? saved : 'ar'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)
  const direction = locale === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
    document.documentElement.dir = direction
    document.documentElement.dataset.locale = locale
    document.title = locale === 'ar'
      ? 'Axsis - مساحة الطالب'
      : locale === 'tr'
        ? 'Axsis - Öğrenci Alanı'
        : 'Axsis - Student Workspace'

    void localizeDemoData(locale).catch((error) => {
      console.error('Unable to localize demo data.', error)
    })

    const cleanupComplete = installCompleteInterfaceTranslator(locale)
    const cleanupBase = installInterfaceTranslator(locale)

    return () => {
      cleanupBase()
      cleanupComplete()
    }
  }, [direction, locale])

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    direction,
    setLocale: setLocaleState,
    t: (key) => translations[locale][key],
  }), [direction, locale])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
