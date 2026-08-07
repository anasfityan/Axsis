import type { Locale } from '@/types/domain'

type TargetLocale = Exclude<Locale, 'ar'>
type Translation = Record<TargetLocale, string>

const copy: Record<string, Translation> = {
  'ملخص مباشر من بياناتك المحلية، ويعمل حتى عند انقطاع الإنترنت.': { en: 'A live summary of your local data that remains available offline.', tr: 'Yerel verilerinizin canlı özeti; internet olmadan da çalışır.' },
  'محاضرات اليوم': { en: "Today's classes", tr: 'Bugünkü dersler' },
  'محاضراتك مرتبة حسب الوقت.': { en: 'Your classes ordered by time.', tr: 'Dersleriniz saate göre sıralanır.' },
  'مادة غير متاحة': { en: 'Unavailable course', tr: 'Kullanılamayan ders' },
  'لا توجد محاضرات مسجلة لهذا اليوم.': { en: 'No classes are scheduled for today.', tr: 'Bugün için kayıtlı ders yok.' },
  'إدارة الجدول': { en: 'Manage schedule', tr: 'Programı yönet' },
  'متوسط مبني على الدرجات المسجلة.': { en: 'Average based on recorded grades.', tr: 'Kayıtlı notlara dayalı ortalama.' },
  'أضف درجات لبدء حساب الأداء.': { en: 'Add grades to start calculating performance.', tr: 'Performansı hesaplamak için not ekleyin.' },
  'عرض الدرجات': { en: 'View grades', tr: 'Notları görüntüle' },
  'أقرب ثلاثة مواعيد مسجلة.': { en: 'The three nearest recorded dates.', tr: 'Kayıtlı en yakın üç tarih.' },
  'لا توجد اختبارات قادمة.': { en: 'No upcoming exams.', tr: 'Yaklaşan sınav yok.' },
  'أحدث العناصر التي أضفتها أو عدّلتها.': { en: 'The latest items you added or edited.', tr: 'Eklediğiniz veya düzenlediğiniz son öğeler.' },
  'بدون مادة': { en: 'No course', tr: 'Ders yok' },
  'لم تضف ملفات بعد.': { en: 'You have not added any files yet.', tr: 'Henüz dosya eklemediniz.' },
  'إضافة ملف': { en: 'Add file', tr: 'Dosya ekle' },
  'فحص محلي سريع قبل إضافة المزامنة السحابية.': { en: 'A quick local check before enabling cloud sync.', tr: 'Bulut eşitlemesini etkinleştirmeden önce hızlı yerel kontrol.' },
  'تم تحميل البيانات المحلية بنجاح': { en: 'Local data loaded successfully', tr: 'Yerel veriler başarıyla yüklendi' },
  'البيانات الأساسية متاحة محليًا': { en: 'Core data is available locally', tr: 'Temel veriler yerel olarak kullanılabilir' },
  'غير مفعلة بعد، ولن تمنع استخدام التطبيق': { en: 'Not enabled yet; local use remains available', tr: 'Henüz etkin değil; yerel kullanım devam eder' },
  'أضف موادك وعدّل بياناتها. تُحفظ التغييرات فورًا على هذا الجهاز.': { en: 'Add courses and edit their details. Changes are saved immediately on this device.', tr: 'Ders ekleyin ve bilgilerini düzenleyin. Değişiklikler bu cihaza hemen kaydedilir.' },
  'ابحث باسم المادة أو المدرس أو الرمز': { en: 'Search by course, instructor, or code', tr: 'Ders, öğretim görevlisi veya kod ile ara' },
  'جرّب كلمة بحث مختلفة.': { en: 'Try a different search term.', tr: 'Farklı bir arama sözcüğü deneyin.' },
  'ابدأ بإضافة أول مادة، ثم سنربط بها المحاضرات والاختبارات والملفات.': { en: 'Add your first course, then connect classes, exams, and files to it.', tr: 'İlk dersinizi ekleyin; ardından ders saatlerini, sınavları ve dosyaları bağlayın.' },
  'بدون رمز': { en: 'No code', tr: 'Kod yok' },
  'لم يحدد المدرس': { en: 'Instructor not set', tr: 'Öğretim görevlisi belirtilmedi' },
  'لم يحدد القسم': { en: 'Department not set', tr: 'Bölüm belirtilmedi' },
  'لم تحدد القاعة': { en: 'Room not set', tr: 'Derslik belirtilmedi' },
  'الاسم مطلوب، وبقية البيانات يمكن إكمالها لاحقًا.': { en: 'The name is required; other details can be completed later.', tr: 'Ad zorunludur; diğer bilgiler daha sonra tamamlanabilir.' },
  'تعذر تحميل المواد من التخزين المحلي.': { en: 'Could not load courses from local storage.', tr: 'Dersler yerel depolamadan yüklenemedi.' },
  'تعذر حفظ المادة. لم تُفقد بيانات النموذج.': { en: 'Could not save the course. Form data was preserved.', tr: 'Ders kaydedilemedi. Form verileri korundu.' },
  'تعذر حذف المادة.': { en: 'Could not delete the course.', tr: 'Ders silinemedi.' },
  'يمكن إضافة أكثر من جلسة للمادة نفسها، وتظهر البيانات ذاتها على الهاتف والكمبيوتر.': { en: 'You can add multiple sessions for the same course, with the same data on phone and desktop.', tr: 'Aynı ders için birden fazla oturum ekleyebilirsiniz; veriler telefonda ve bilgisayarda aynıdır.' },
  'لا يمكن إنشاء محاضرة دون ربطها بمادة.': { en: 'A class cannot be created without a course.', tr: 'Bir derse bağlanmadan ders saati oluşturulamaz.' },
  'اربط الموعد بمادة وحدد اليوم والوقت.': { en: 'Link the session to a course and choose the day and time.', tr: 'Oturumu bir derse bağlayın; gün ve saati seçin.' },
  'تعذر تحميل جدول المحاضرات من التخزين المحلي.': { en: 'Could not load the class schedule from local storage.', tr: 'Ders programı yerel depolamadan yüklenemedi.' },
  'وقت نهاية المحاضرة يجب أن يكون بعد وقت البداية.': { en: 'The class end time must be after the start time.', tr: 'Ders bitiş saati başlangıç saatinden sonra olmalıdır.' },
  'تعذر حفظ جلسة المحاضرة.': { en: 'Could not save the class session.', tr: 'Ders oturumu kaydedilemedi.' },
  'تعذر حذف جلسة المحاضرة.': { en: 'Could not delete the class session.', tr: 'Ders oturumu silinemedi.' },
  'الأحد': { en: 'Sunday', tr: 'Pazar' },
  'الاثنين': { en: 'Monday', tr: 'Pazartesi' },
  'الثلاثاء': { en: 'Tuesday', tr: 'Salı' },
  'الأربعاء': { en: 'Wednesday', tr: 'Çarşamba' },
  'الخميس': { en: 'Thursday', tr: 'Perşembe' },
  'الجمعة': { en: 'Friday', tr: 'Cuma' },
  'السبت': { en: 'Saturday', tr: 'Cumartesi' },
  'أضف الاختبارات واربطها بالمواد، مع عد تنازلي واضح.': { en: 'Add exams, link them to courses, and track a clear countdown.', tr: 'Sınav ekleyin, derslere bağlayın ve net bir geri sayım izleyin.' },
  'أضف مادة أولًا قبل إنشاء اختبار.': { en: 'Add a course before creating an exam.', tr: 'Sınav oluşturmadan önce bir ders ekleyin.' },
  'مادة غير موجودة': { en: 'Missing course', tr: 'Ders bulunamadı' },
  'منتهي': { en: 'Finished', tr: 'Bitti' },
  'غير محددة': { en: 'Not specified', tr: 'Belirtilmedi' },
  'اختر المادة وحدد الموعد بدقة.': { en: 'Choose the course and set the date precisely.', tr: 'Dersi seçin ve tarihi doğru belirleyin.' },
  'نصفي': { en: 'Midterm', tr: 'Vize' },
  'نهائي': { en: 'Final', tr: 'Final' },
  'اختبار قصير': { en: 'Quiz', tr: 'Kısa sınav' },
  'أخرى': { en: 'Other', tr: 'Diğer' },
  'تعذر تحميل الاختبارات من التخزين المحلي.': { en: 'Could not load exams from local storage.', tr: 'Sınavlar yerel depolamadan yüklenemedi.' },
  'تعذر حفظ الاختبار.': { en: 'Could not save the exam.', tr: 'Sınav kaydedilemedi.' },
  'سجّل نتائجك وشاهد متوسط كل مادة ونسبة الأوزان المكتملة.': { en: 'Record results and view each course average and completed weight.', tr: 'Sonuçları kaydedin; her dersin ortalamasını ve tamamlanan ağırlığı görün.' },
  'الوزن المكتمل: غير محدد': { en: 'Completed weight: not specified', tr: 'Tamamlanan ağırlık: belirtilmedi' },
  'لا يمكن تسجيل درجة بلا مادة مرتبطة.': { en: 'A grade cannot be recorded without a linked course.', tr: 'Bir derse bağlanmadan not kaydedilemez.' },
  'الوزن اختياري، ويستخدم لحساب المتوسط الموزون.': { en: 'Weight is optional and is used for the weighted average.', tr: 'Ağırlık isteğe bağlıdır ve ağırlıklı ortalama için kullanılır.' },
  'واجب': { en: 'Assignment', tr: 'Ödev' },
  'مشروع': { en: 'Project', tr: 'Proje' },
  'تعذر تحميل الدرجات من التخزين المحلي.': { en: 'Could not load grades from local storage.', tr: 'Notlar yerel depolamadan yüklenemedi.' },
  'تعذر حفظ الدرجة.': { en: 'Could not save the grade.', tr: 'Not kaydedilemedi.' },
  'نظّم روابط الملفات والمصادر حسب المادة والمجلد. رفع Drive سيُضاف كخدمة مستقلة لاحقًا.': { en: 'Organize file links and resources by course and folder. Drive upload is an optional separate service.', tr: 'Dosya bağlantılarını ve kaynakları ders ve klasöre göre düzenleyin. Drive yükleme ayrı ve isteğe bağlı bir hizmettir.' },
  'ابحث في الملفات والملاحظات': { en: 'Search files and notes', tr: 'Dosyalarda ve notlarda ara' },
  'أضف مادة أولًا قبل إضافة ملفات مرتبطة بها.': { en: 'Add a course before adding linked files.', tr: 'Bağlı dosyalar eklemeden önce bir ders ekleyin.' },
  'أضف رابط محاضرة أو ملف PDF أو فيديو، ثم رتبه داخل مجلد واضح.': { en: 'Add a lecture link, PDF, or video, then organize it in a clear folder.', tr: 'Ders bağlantısı, PDF veya video ekleyin; sonra uygun bir klasöre düzenleyin.' },
  'النسخة الحالية تحفظ بيانات المصدر ورابطه محليًا.': { en: 'This version stores source details and links locally.', tr: 'Bu sürüm kaynak bilgilerini ve bağlantıları yerel olarak saklar.' },
  'عام': { en: 'General', tr: 'Genel' },
  'المحاضرات': { en: 'Lectures', tr: 'Dersler' },
  'الواجبات': { en: 'Assignments', tr: 'Ödevler' },
  'النصفي': { en: 'Midterm', tr: 'Vize' },
  'النهائي': { en: 'Final', tr: 'Final' },
  'مستند': { en: 'Document', tr: 'Belge' },
  'فيديو': { en: 'Video', tr: 'Video' },
  'صورة': { en: 'Image', tr: 'Görsel' },
  'رابط': { en: 'Link', tr: 'Bağlantı' },
  'تعذر تحميل الملفات من التخزين المحلي.': { en: 'Could not load files from local storage.', tr: 'Dosyalar yerel depolamadan yüklenemedi.' },
  'تعذر حفظ الملف. تأكد من صحة الرابط.': { en: 'Could not save the file. Check the link.', tr: 'Dosya kaydedilemedi. Bağlantıyı kontrol edin.' },
  'تعذر حذف الملف.': { en: 'Could not delete the file.', tr: 'Dosya silinemedi.' },
  'تحكم في اللغة والمظهر والنسخ الاحتياطي المحلي دون ربط استقرار التطبيق بالخدمات السحابية.': { en: 'Control language, appearance, and local backups without depending on cloud services.', tr: 'Dil, görünüm ve yerel yedeklemeyi bulut hizmetlerine bağlı kalmadan yönetin.' },
  'يتغير اتجاه الواجهة تلقائيًا حسب اللغة.': { en: 'Interface direction changes automatically with the language.', tr: 'Arayüz yönü dile göre otomatik değişir.' },
  'هوية واحدة بوضعين متناسقين.': { en: 'One visual identity with two coordinated themes.', tr: 'İki uyumlu tema ile tek görsel kimlik.' },
  'البيانات محفوظة داخل IndexedDB على هذا الجهاز.': { en: 'Data is stored in IndexedDB on this device.', tr: 'Veriler bu cihazdaki IndexedDB içinde saklanır.' },
  'تُوقّع النسخة ببصمة SHA-256 ويُتحقق من سلامتها قبل الاستعادة.': { en: 'Backups use a SHA-256 checksum and are verified before restore.', tr: 'Yedekler SHA-256 sağlama toplamı kullanır ve geri yüklemeden önce doğrulanır.' },
  'Firestore مهيأة للحسابات السحابية عند توفير إعداد Firebase.': { en: 'Firestore is ready for cloud accounts when Firebase is configured.', tr: 'Firebase yapılandırıldığında Firestore bulut hesapları için hazırdır.' },
  'تشخيص النظام': { en: 'System diagnostics', tr: 'Sistem tanılama' },
  'ملخص مباشر لحالة الحساب والجهاز والتخزين والمزامنة.': { en: 'Live summary of account, device, storage, and sync status.', tr: 'Hesap, cihaz, depolama ve eşitleme durumunun canlı özeti.' },
  'الحساب': { en: 'Account', tr: 'Hesap' },
  'حساب سحابي': { en: 'Cloud account', tr: 'Bulut hesabı' },
  'وضع محلي': { en: 'Local mode', tr: 'Yerel mod' },
  'غير مسجل': { en: 'Not signed in', tr: 'Oturum açılmadı' },
  'الاتصال': { en: 'Connection', tr: 'Bağlantı' },
  'دون اتصال': { en: 'Offline', tr: 'Çevrimdışı' },
  'يمكن تشغيل المزامنة عند تفعيل السحابة': { en: 'Sync can run after cloud setup', tr: 'Bulut etkinleştirildiğinde eşitleme çalışabilir' },
  'التطبيق مستمر محليًا': { en: 'The app continues locally', tr: 'Uygulama yerel olarak çalışmaya devam eder' },
  'IndexedDB جاهزة': { en: 'IndexedDB is ready', tr: 'IndexedDB hazır' },
  'الحفظ المحلي هو المصدر الأساسي على هذا الجهاز': { en: 'Local storage is the primary source on this device', tr: 'Bu cihazda ana kaynak yerel depolamadır' },
  'عامل المزامنة': { en: 'Sync worker', tr: 'Eşitleme işlemi' },
  'السحابة': { en: 'Cloud', tr: 'Bulut' },
  'غير مفعّلة': { en: 'Not enabled', tr: 'Etkin değil' },
  'لن تُرسل أي بيانات قبل إعداد Firebase بأمان': { en: 'No data is sent before Firebase is configured safely', tr: 'Firebase güvenli biçimde ayarlanmadan veri gönderilmez' },
  'الجهاز': { en: 'Device', tr: 'Cihaz' },
  'الإصدار': { en: 'Version', tr: 'Sürüm' },
  'سليم': { en: 'Healthy', tr: 'Sağlıklı' },
  'تنبيه': { en: 'Notice', tr: 'Uyarı' },
  'جاهز': { en: 'Ready', tr: 'Hazır' },
  'يعمل الآن': { en: 'Running now', tr: 'Şimdi çalışıyor' },
  'متوقف لعدم الاتصال': { en: 'Paused while offline', tr: 'Çevrimdışıyken duraklatıldı' },
  'بانتظار مزود سحابي': { en: 'Waiting for cloud provider', tr: 'Bulut sağlayıcısı bekleniyor' },
  'متوقف': { en: 'Stopped', tr: 'Durduruldu' },
  'مساحة دراسة مستقرة تعمل محليًا وتتزامن عند الحاجة': { en: 'A stable study workspace that works locally and syncs when needed', tr: 'Yerel çalışan ve gerektiğinde eşitlenen kararlı bir çalışma alanı' },
  'استخدم حسابًا سحابيًا للمزامنة بين الأجهزة، أو تابع محليًا من دون إرسال بياناتك إلى أي خدمة خارجية.': { en: 'Use a cloud account to sync devices, or continue locally without sending data to external services.', tr: 'Cihazlar arasında eşitleme için bulut hesabı kullanın veya verilerinizi dış hizmetlere göndermeden yerel devam edin.' },
  'بيانات محلية أولًا': { en: 'Local data first', tr: 'Önce yerel veri' },
  'حساب سحابي اختياري': { en: 'Optional cloud account', tr: 'İsteğe bağlı bulut hesabı' },
  'الدخول إلى الحساب السحابي': { en: 'Sign in to cloud account', tr: 'Bulut hesabına giriş yap' },
  'إنشاء حساب سحابي': { en: 'Create cloud account', tr: 'Bulut hesabı oluştur' },
  'ستُستخدم Firebase للمصادقة فقط في هذه المرحلة.': { en: 'Firebase is used for authentication at this stage.', tr: 'Bu aşamada Firebase yalnızca kimlik doğrulama için kullanılır.' },
  'لن يتم إرسال أي بيانات إلى خدمة خارجية.': { en: 'No data will be sent to an external service.', tr: 'Dış bir hizmete veri gönderilmez.' },
  'الحساب السحابي غير مفعّل على هذه النسخة لأن إعدادات Firebase غير مكتملة. الوضع المحلي متاح ويعمل بشكل طبيعي.': { en: 'Cloud accounts are unavailable because Firebase is not configured. Local mode remains fully available.', tr: 'Firebase yapılandırılmadığı için bulut hesapları kullanılamıyor. Yerel mod tamamen kullanılabilir.' }
}

const originalTexts = new WeakMap<Text, string>()
const renderedTexts = new WeakMap<Text, string>()
const originalAttributes = new WeakMap<Element, Map<string, string>>()
let activeLocale: Locale = 'ar'
let savedConfirm: typeof window.confirm | undefined
let savedAlert: typeof window.alert | undefined

function dynamic(value: string, locale: TargetLocale): string | null {
  const rules: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
    [/^محسوب من (\d+) تقييم$/, (m) => locale === 'en' ? `Calculated from ${m[1]} assessments` : `${m[1]} değerlendirmeden hesaplandı`],
    [/^الوزن المكتمل: (\d+)%$/, (m) => locale === 'en' ? `Completed weight: ${m[1]}%` : `Tamamlanan ağırlık: %${m[1]}`],
    [/^القاعة: (.+)$/, (m) => locale === 'en' ? `Room: ${m[1]}` : `Derslik: ${m[1]}`],
    [/^حذف مادة «(.+)»\؟$/, (m) => locale === 'en' ? `Delete course “${m[1]}”?` : `“${m[1]}” dersi silinsin mi?`],
    [/^حذف محاضرة «(.+)»\؟$/, (m) => locale === 'en' ? `Delete class “${m[1]}”?` : `“${m[1]}” dersi silinsin mi?`],
    [/^حذف اختبار «(.+)»\؟$/, (m) => locale === 'en' ? `Delete exam “${m[1]}”?` : `“${m[1]}” sınavı silinsin mi?`],
    [/^حذف «(.+)»\؟$/, (m) => locale === 'en' ? `Delete “${m[1]}”?` : `“${m[1]}” silinsin mi?`],
    [/^(\d+) معلقة · (\d+) فاشلة$/, (m) => locale === 'en' ? `${m[1]} pending · ${m[2]} failed` : `${m[1]} bekliyor · ${m[2]} başarısız`],
    [/^(.+) مستخدم$/, (m) => locale === 'en' ? `${m[1]} used` : `${m[1]} kullanıldı`],
    [/^(.+) متاح تقريبًا$/, (m) => locale === 'en' ? `${m[1]} approximately available` : `yaklaşık ${m[1]} kullanılabilir`]
  ]
  for (const [pattern, formatter] of rules) {
    const match = value.match(pattern)
    if (match) return formatter(match)
  }
  return null
}

function translate(value: string, locale: Locale): string {
  if (locale === 'ar') return value
  const trimmed = value.trim()
  const translated = copy[trimmed]?.[locale] ?? dynamic(trimmed, locale)
  return translated ? value.replace(trimmed, translated) : value
}

function updateText(node: Text, locale: Locale): void {
  const current = node.nodeValue ?? ''
  const last = renderedTexts.get(node)
  if (!originalTexts.has(node) || (last !== undefined && current !== last)) originalTexts.set(node, current)
  const original = originalTexts.get(node) ?? current
  const next = locale === 'ar' ? original : translate(original, locale)
  if (next !== current) node.nodeValue = next
  renderedTexts.set(node, next)
}

function updateAttributes(element: Element, locale: Locale): void {
  const names = ['placeholder', 'title', 'aria-label'] as const
  let originals = originalAttributes.get(element)
  if (!originals) {
    originals = new Map<string, string>()
    originalAttributes.set(element, originals)
  }
  for (const name of names) {
    const current = element.getAttribute(name)
    if (current === null) continue
    if (!originals.has(name)) originals.set(name, current)
    const original = originals.get(name) ?? current
    const next = locale === 'ar' ? original : translate(original, locale)
    if (next !== current) element.setAttribute(name, next)
  }
}

function updateTree(root: Node, locale: Locale): void {
  if (root.nodeType === Node.TEXT_NODE) updateText(root as Text, locale)
  if (root.nodeType === Node.ELEMENT_NODE) updateAttributes(root as Element, locale)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT)
  let node = walker.nextNode()
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) updateText(node as Text, locale)
    else updateAttributes(node as Element, locale)
    node = walker.nextNode()
  }
}

function installDialogs(locale: Locale): () => void {
  activeLocale = locale
  savedConfirm ??= window.confirm.bind(window)
  savedAlert ??= window.alert.bind(window)
  window.confirm = (message?: string) => savedConfirm!(translate(String(message ?? ''), activeLocale))
  window.alert = (message?: string) => savedAlert!(translate(String(message ?? ''), activeLocale))
  return () => {
    if (savedConfirm) window.confirm = savedConfirm
    if (savedAlert) window.alert = savedAlert
  }
}

export function installCompleteInterfaceTranslator(locale: Locale): () => void {
  const root = document.getElementById('root')
  const cleanupDialogs = installDialogs(locale)
  if (!root) return cleanupDialogs
  updateTree(root, locale)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') updateText(mutation.target as Text, locale)
      mutation.addedNodes.forEach((node) => updateTree(node, locale))
    }
  })
  observer.observe(root, { subtree: true, childList: true, characterData: true })
  return () => {
    observer.disconnect()
    cleanupDialogs()
  }
}
