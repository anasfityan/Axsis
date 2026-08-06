export const translations = {
  ar: {
    appName: 'موادي',
    dashboard: 'الرئيسية',
    courses: 'المواد',
    schedule: 'الجدول',
    exams: 'الاختبارات',
    grades: 'الدرجات',
    files: 'الملفات',
    settings: 'الإعدادات',
  },
  tr: {
    appName: 'Derslerim',
    dashboard: 'Ana Sayfa',
    courses: 'Dersler',
    schedule: 'Program',
    exams: 'Sınavlar',
    grades: 'Notlar',
    files: 'Dosyalar',
    settings: 'Ayarlar',
  },
  en: {
    appName: 'My Courses',
    dashboard: 'Dashboard',
    courses: 'Courses',
    schedule: 'Schedule',
    exams: 'Exams',
    grades: 'Grades',
    files: 'Files',
    settings: 'Settings',
  },
} as const

export type Locale = keyof typeof translations
export type TranslationKey = keyof typeof translations.ar

export function directionForLocale(locale: Locale) {
  return locale === 'ar' ? 'rtl' : 'ltr'
}
