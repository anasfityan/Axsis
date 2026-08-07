import type { Locale } from '@/types/domain'

type TargetLocale = Exclude<Locale, 'ar'>

const phrases: Record<string, Record<TargetLocale, string>> = {
  'الرئيسية': { en: 'Dashboard', tr: 'Ana Sayfa' },
  'المواد': { en: 'Courses', tr: 'Dersler' },
  'الجدول': { en: 'Schedule', tr: 'Program' },
  'جدول المحاضرات': { en: 'Class Schedule', tr: 'Ders Programı' },
  'الاختبارات': { en: 'Exams', tr: 'Sınavlar' },
  'الدرجات': { en: 'Grades', tr: 'Notlar' },
  'الملفات': { en: 'Files', tr: 'Dosyalar' },
  'الإعدادات': { en: 'Settings', tr: 'Ayarlar' },
  'إدارة الدراسة': { en: 'Study management', tr: 'Ders yönetimi' },
  'تنظيم الأسبوع': { en: 'Organize your week', tr: 'Haftanı düzenle' },
  'المواعيد القادمة': { en: 'Upcoming dates', tr: 'Yaklaşan tarihler' },
  'متابعة الأداء': { en: 'Performance tracking', tr: 'Performans takibi' },
  'مكتبة الدراسة': { en: 'Study library', tr: 'Ders kitaplığı' },
  'نظرة سريعة': { en: 'Quick overview', tr: 'Hızlı görünüm' },
  'تخصيص وحماية البيانات': { en: 'Customize and protect data', tr: 'Verileri özelleştir ve koru' },
  'إضافة مادة': { en: 'Add course', tr: 'Ders ekle' },
  'إضافة أول مادة': { en: 'Add first course', tr: 'İlk dersi ekle' },
  'تعديل المادة': { en: 'Edit course', tr: 'Dersi düzenle' },
  'حفظ المادة': { en: 'Save course', tr: 'Dersi kaydet' },
  'إضافة محاضرة': { en: 'Add class', tr: 'Ders saati ekle' },
  'تعديل المحاضرة': { en: 'Edit class', tr: 'Ders saatini düzenle' },
  'حفظ المحاضرة': { en: 'Save class', tr: 'Ders saatini kaydet' },
  'إضافة اختبار': { en: 'Add exam', tr: 'Sınav ekle' },
  'إضافة أول اختبار': { en: 'Add first exam', tr: 'İlk sınavı ekle' },
  'تعديل الاختبار': { en: 'Edit exam', tr: 'Sınavı düzenle' },
  'حفظ الاختبار': { en: 'Save exam', tr: 'Sınavı kaydet' },
  'إضافة درجة': { en: 'Add grade', tr: 'Not ekle' },
  'إضافة أول درجة': { en: 'Add first grade', tr: 'İlk notu ekle' },
  'تعديل الدرجة': { en: 'Edit grade', tr: 'Notu düzenle' },
  'إضافة ملف أو رابط': { en: 'Add file or link', tr: 'Dosya veya bağlantı ekle' },
  'إضافة أول ملف': { en: 'Add first file', tr: 'İlk dosyayı ekle' },
  'تعديل الملف': { en: 'Edit file', tr: 'Dosyayı düzenle' },
  'حفظ': { en: 'Save', tr: 'Kaydet' },
  'إلغاء': { en: 'Cancel', tr: 'İptal' },
  'حذف': { en: 'Delete', tr: 'Sil' },
  'تعديل': { en: 'Edit', tr: 'Düzenle' },
  'إغلاق': { en: 'Close', tr: 'Kapat' },
  'إعادة المحاولة': { en: 'Try again', tr: 'Tekrar dene' },
  'فتح المصدر': { en: 'Open source', tr: 'Kaynağı aç' },
  'اللغة': { en: 'Language', tr: 'Dil' },
  'المظهر': { en: 'Appearance', tr: 'Görünüm' },
  'داكن': { en: 'Dark', tr: 'Koyu' },
  'فاتح': { en: 'Light', tr: 'Açık' },
  'العربية': { en: 'Arabic', tr: 'Arapça' },
  'التخزين المحلي': { en: 'Local storage', tr: 'Yerel depolama' },
  'النسخ الاحتياطي والاستعادة': { en: 'Backup and restore', tr: 'Yedekleme ve geri yükleme' },
  'المزامنة السحابية': { en: 'Cloud synchronization', tr: 'Bulut eşitleme' },
  'بيانات العرض التجريبية': { en: 'Demo data', tr: 'Demo verileri' },
  'تحميل البيانات التجريبية': { en: 'Load demo data', tr: 'Demo verilerini yükle' },
  'حذف البيانات التجريبية': { en: 'Remove demo data', tr: 'Demo verilerini sil' },
  'تصدير نسخة موثقة': { en: 'Export verified backup', tr: 'Doğrulanmış yedek dışa aktar' },
  'تحقق واستيراد نسخة': { en: 'Verify and import backup', tr: 'Yedeği doğrula ve içe aktar' },
  'قاعدة البيانات': { en: 'Database', tr: 'Veritabanı' },
  'العمل دون إنترنت': { en: 'Offline use', tr: 'Çevrimdışı kullanım' },
  'حالة النظام': { en: 'System status', tr: 'Sistem durumu' },
  'اليوم': { en: 'Today', tr: 'Bugün' },
  'غدًا': { en: 'Tomorrow', tr: 'Yarın' },
  'الأداء الدراسي': { en: 'Academic performance', tr: 'Akademik performans' },
  'الاختبارات القادمة': { en: 'Upcoming exams', tr: 'Yaklaşan sınavlar' },
  'آخر الملفات': { en: 'Recent files', tr: 'Son dosyalar' },
  'كل المواد': { en: 'All courses', tr: 'Tüm dersler' },
  'كل المجلدات': { en: 'All folders', tr: 'Tüm klasörler' },
  'اسم المادة': { en: 'Course name', tr: 'Ders adı' },
  'رمز المادة': { en: 'Course code', tr: 'Ders kodu' },
  'المدرس': { en: 'Instructor', tr: 'Öğretim görevlisi' },
  'القسم أو التخصص': { en: 'Department or major', tr: 'Bölüm veya uzmanlık' },
  'القاعة': { en: 'Room', tr: 'Derslik' },
  'لون المادة': { en: 'Course color', tr: 'Ders rengi' },
  'ملاحظات': { en: 'Notes', tr: 'Notlar' },
  'المادة': { en: 'Course', tr: 'Ders' },
  'اليوم': { en: 'Day', tr: 'Gün' },
  'وقت البداية': { en: 'Start time', tr: 'Başlangıç saati' },
  'وقت النهاية': { en: 'End time', tr: 'Bitiş saati' },
  'نوع الاختبار': { en: 'Exam type', tr: 'Sınav türü' },
  'اسم الاختبار': { en: 'Exam name', tr: 'Sınav adı' },
  'التاريخ': { en: 'Date', tr: 'Tarih' },
  'الوقت': { en: 'Time', tr: 'Saat' },
  'الحالة': { en: 'Status', tr: 'Durum' },
  'اسم التقييم': { en: 'Assessment name', tr: 'Değerlendirme adı' },
  'النوع': { en: 'Type', tr: 'Tür' },
  'الدرجة': { en: 'Score', tr: 'Not' },
  'من أصل': { en: 'Out of', tr: 'Üzerinden' },
  'الوزن %': { en: 'Weight %', tr: 'Ağırlık %' },
  'اسم الملف': { en: 'File name', tr: 'Dosya adı' },
  'نوع المصدر': { en: 'Source type', tr: 'Kaynak türü' },
  'المجلد': { en: 'Folder', tr: 'Klasör' },
  'الرابط': { en: 'Link', tr: 'Bağlantı' },
  'بحث': { en: 'Search', tr: 'Ara' },
  'لا توجد نتائج مطابقة': { en: 'No matching results', tr: 'Eşleşen sonuç yok' },
  'لم تُضف أي مادة بعد': { en: 'No courses added yet', tr: 'Henüz ders eklenmedi' },
  'لا توجد محاضرات في هذا اليوم.': { en: 'No classes on this day.', tr: 'Bu gün ders yok.' },
  'لا توجد اختبارات بعد': { en: 'No exams yet', tr: 'Henüz sınav yok' },
  'لا توجد درجات مسجلة': { en: 'No grades recorded', tr: 'Kayıtlı not yok' },
  'لا توجد ملفات بعد': { en: 'No files yet', tr: 'Henüz dosya yok' },
  'أضف مادة أولًا': { en: 'Add a course first', tr: 'Önce bir ders ekleyin' },
  'جاري التحميل…': { en: 'Loading…', tr: 'Yükleniyor…' },
  'جاري تحميل المواد…': { en: 'Loading courses…', tr: 'Dersler yükleniyor…' },
  'جاري تحميل الجدول…': { en: 'Loading schedule…', tr: 'Program yükleniyor…' },
  'جاري تحميل الاختبارات…': { en: 'Loading exams…', tr: 'Sınavlar yükleniyor…' },
  'جاري تحميل الملفات…': { en: 'Loading files…', tr: 'Dosyalar yükleniyor…' },
  'جاري تجهيز الصفحة الرئيسية…': { en: 'Preparing dashboard…', tr: 'Ana sayfa hazırlanıyor…' },
  'جاري تجهيز الجلسة…': { en: 'Preparing session…', tr: 'Oturum hazırlanıyor…' },
  'جاري تحميل الجلسة…': { en: 'Loading session…', tr: 'Oturum yükleniyor…' },
  'المتابعة محليًا': { en: 'Continue locally', tr: 'Yerel olarak devam et' },
  'تسجيل الدخول': { en: 'Sign in', tr: 'Giriş yap' },
  'إنشاء حساب': { en: 'Create account', tr: 'Hesap oluştur' },
  'البريد الإلكتروني': { en: 'Email', tr: 'E-posta' },
  'كلمة المرور': { en: 'Password', tr: 'Şifre' },
  'الاسم الظاهر': { en: 'Display name', tr: 'Görünen ad' },
  'تسجيل الخروج': { en: 'Sign out', tr: 'Çıkış yap' },
  'متصل بالإنترنت': { en: 'Online', tr: 'İnternete bağlı' },
  'يعمل دون إنترنت': { en: 'Working offline', tr: 'Çevrimdışı çalışıyor' },
  'الحساب السحابي غير مفعّل على هذه النسخة لأن إعدادات Firebase غير مكتملة. الوضع المحلي متاح ويعمل بشكل طبيعي.': {
    en: 'Cloud accounts are unavailable because Firebase is not configured. Local mode remains fully available.',
    tr: 'Firebase yapılandırılmadığı için bulut hesapları kullanılamıyor. Yerel mod tamamen kullanılabilir.'
  },
}

const originalText = new WeakMap<Text, string>()
const originalAttributes = new WeakMap<Element, Map<string, string>>()
const translatedText = new WeakMap<Text, string>()

function translateDynamic(value: string, locale: TargetLocale): string | null {
  const patterns: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
    [/^باقي (\d+) يوم$/, (m) => locale === 'en' ? `${m[1]} days left` : `${m[1]} gün kaldı`],
    [/^بعد (\d+) أيام$/, (m) => locale === 'en' ? `In ${m[1]} days` : `${m[1]} gün sonra`],
    [/^(\d+) محاضرة$/, (m) => locale === 'en' ? `${m[1]} classes` : `${m[1]} ders`],
    [/^(\d+) عناصر تقييم$/, (m) => locale === 'en' ? `${m[1]} assessments` : `${m[1]} değerlendirme`],
  ]
  for (const [pattern, formatter] of patterns) {
    const match = value.match(pattern)
    if (match) return formatter(match)
  }
  return null
}

function translateValue(value: string, locale: Locale): string {
  if (locale === 'ar') return value
  const trimmed = value.trim()
  const translated = phrases[trimmed]?.[locale] ?? translateDynamic(trimmed, locale)
  if (!translated) return value
  return value.replace(trimmed, translated)
}

function translateTextNode(node: Text, locale: Locale): void {
  const current = node.nodeValue ?? ''
  const lastTranslated = translatedText.get(node)
  if (!originalText.has(node) || (lastTranslated !== undefined && current !== lastTranslated)) {
    originalText.set(node, current)
  }
  const original = originalText.get(node) ?? current
  const next = locale === 'ar' ? original : translateValue(original, locale)
  if (current !== next) node.nodeValue = next
  translatedText.set(node, next)
}

const translatedAttributes = ['placeholder', 'title', 'aria-label'] as const

function translateElementAttributes(element: Element, locale: Locale): void {
  let originals = originalAttributes.get(element)
  if (!originals) {
    originals = new Map<string, string>()
    originalAttributes.set(element, originals)
  }
  for (const attribute of translatedAttributes) {
    if (!element.hasAttribute(attribute)) continue
    if (!originals.has(attribute)) originals.set(attribute, element.getAttribute(attribute) ?? '')
    const original = originals.get(attribute) ?? ''
    const next = locale === 'ar' ? original : translateValue(original, locale)
    if (element.getAttribute(attribute) !== next) element.setAttribute(attribute, next)
  }
}

function translateTree(root: Node, locale: Locale): void {
  if (root.nodeType === Node.TEXT_NODE) translateTextNode(root as Text, locale)
  if (root.nodeType === Node.ELEMENT_NODE) translateElementAttributes(root as Element, locale)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) translateTextNode(node as Text, locale)
    else translateElementAttributes(node as Element, locale)
    node = walker.nextNode()
  }
}

export function installInterfaceTranslator(locale: Locale): () => void {
  const root = document.getElementById('root')
  if (!root) return () => undefined
  translateTree(root, locale)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') translateTextNode(mutation.target as Text, locale)
      mutation.addedNodes.forEach((node) => translateTree(node, locale))
    }
  })
  observer.observe(root, { childList: true, subtree: true, characterData: true })
  return () => observer.disconnect()
}
