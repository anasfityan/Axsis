import { putRecord, removeRecord, stores } from '@/database/database'
import type { Locale } from '@/types/domain'

const DEMO_PREFIX = 'demo-'

type LocalizedText = Record<Locale, string>

const text = (ar: string, en: string, tr: string): LocalizedText => ({ ar, en, tr })

const demoCopy = {
  courses: {
    strategy: {
      name: text('الإدارة الاستراتيجية', 'Strategic Management', 'Stratejik Yönetim'),
      instructor: text('د. أحمد السامرائي', 'Dr. Ahmed Al-Samarrai', 'Dr. Ahmed Al-Samarrai'),
      department: text('إدارة الأعمال', 'Business Administration', 'İşletme'),
      notes: text(
        'مادة أساسية تتضمن التحليل الداخلي والخارجي والميزة التنافسية.',
        'A core course covering internal and external analysis and competitive advantage.',
        'İç ve dış analiz ile rekabet avantajını kapsayan temel bir ders.',
      ),
    },
    marketing: {
      name: text('التسويق الرقمي', 'Digital Marketing', 'Dijital Pazarlama'),
      instructor: text('د. سارة محمود', 'Dr. Sara Mahmoud', 'Dr. Sara Mahmoud'),
      department: text('التسويق', 'Marketing', 'Pazarlama'),
      notes: text(
        'التسويق عبر المنصات الرقمية وتحليل سلوك المستهلك.',
        'Marketing through digital platforms and consumer behavior analysis.',
        'Dijital platformlarda pazarlama ve tüketici davranışı analizi.',
      ),
    },
    finance: {
      name: text('الإدارة المالية', 'Financial Management', 'Finansal Yönetim'),
      instructor: text('د. عمر الجبوري', 'Dr. Omar Al-Jubouri', 'Dr. Omar Al-Jubouri'),
      department: text('المالية', 'Finance', 'Finans'),
      notes: text(
        'تحليل القوائم المالية وقرارات الاستثمار والتمويل.',
        'Financial statement analysis and investment and financing decisions.',
        'Finansal tablo analizi ile yatırım ve finansman kararları.',
      ),
    },
    innovation: {
      name: text('إدارة الابتكار', 'Innovation Management', 'İnovasyon Yönetimi'),
      instructor: text('د. ليلى حسن', 'Dr. Layla Hassan', 'Dr. Layla Hassan'),
      department: text('ريادة الأعمال', 'Entrepreneurship', 'Girişimcilik'),
      notes: text(
        'نماذج الابتكار وريادة الأعمال وتصميم نماذج الأعمال.',
        'Innovation models, entrepreneurship, and business model design.',
        'İnovasyon modelleri, girişimcilik ve iş modeli tasarımı.',
      ),
    },
  },
  exams: {
    midterm: {
      title: text('الاختبار النصفي', 'Midterm Exam', 'Vize Sınavı'),
      notes: text('الفصول 1–5', 'Chapters 1–5', 'Bölümler 1–5'),
    },
    quiz: {
      title: text('اختبار قصير 2', 'Quiz 2', 'Kısa Sınav 2'),
      notes: text('النسب المالية', 'Financial ratios', 'Finansal oranlar'),
    },
    project: {
      title: text('عرض المشروع', 'Project Presentation', 'Proje Sunumu'),
      notes: text('عرض مدته 10 دقائق', 'A 10-minute presentation', '10 dakikalık sunum'),
    },
  },
  grades: {
    environment: {
      title: text('واجب تحليل البيئة', 'Environment Analysis Assignment', 'Çevre Analizi Ödevi'),
      notes: text('أداء ممتاز', 'Excellent performance', 'Mükemmel performans'),
    },
    quiz: { title: text('اختبار قصير 1', 'Quiz 1', 'Kısa Sınav 1'), notes: text('', '', '') },
    campaign: {
      title: text('مشروع الحملة', 'Campaign Project', 'Kampanya Projesi'),
      notes: text('الفكرة جيدة وتحتاج تحسين القياس', 'A good idea that needs better measurement.', 'Fikir iyi; ölçüm geliştirilmelidir.'),
    },
    midterm: { title: text('الاختبار النصفي', 'Midterm Exam', 'Vize Sınavı'), notes: text('', '', '') },
    model: {
      title: text('نموذج العمل', 'Business Model', 'İş Modeli'),
      notes: text('عرض واضح ومترابط', 'A clear and coherent presentation.', 'Açık ve tutarlı bir sunum.'),
    },
  },
  files: {
    strategy: {
      name: text('ملخص الفصل الأول', 'Chapter One Summary', 'Birinci Bölüm Özeti'),
      folder: text('المحاضرات', 'Lectures', 'Dersler'),
      note: text('مبادئ الإدارة الاستراتيجية', 'Strategic management principles', 'Stratejik yönetim ilkeleri'),
    },
    marketing: {
      name: text('دليل المشروع النهائي', 'Final Project Guide', 'Final Proje Rehberi'),
      folder: text('النهائي', 'Final', 'Final'),
      note: text('متطلبات وتقييم المشروع', 'Project requirements and assessment', 'Proje gereksinimleri ve değerlendirme'),
    },
    finance: {
      name: text('شرح النسب المالية', 'Financial Ratios Explanation', 'Finansal Oranlar Açıklaması'),
      folder: text('المحاضرات', 'Lectures', 'Dersler'),
      note: text('فيديو مراجعة قبل الاختبار', 'Review video before the exam', 'Sınav öncesi tekrar videosu'),
    },
    innovation: {
      name: text('قالب نموذج العمل', 'Business Model Template', 'İş Modeli Şablonu'),
      folder: text('الواجبات', 'Assignments', 'Ödevler'),
      note: text('Business Model Canvas', 'Business Model Canvas', 'Business Model Canvas'),
    },
  },
} as const

function isoNow(): string {
  return new Date().toISOString()
}

function dateFromToday(offsetDays: number): string {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

function baseRecord(id: string) {
  const now = isoNow()
  return {
    id,
    userId: 'local-user',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    version: 1,
    deviceId: 'demo-device',
  }
}

function buildDemoData(locale: Locale) {
  const courses = [
    { ...baseRecord('demo-course-strategy'), semesterId: null, name: demoCopy.courses.strategy.name[locale], code: 'BUS 401', instructor: demoCopy.courses.strategy.instructor[locale], department: demoCopy.courses.strategy.department[locale], room: 'B-204', colorToken: 'amber', notes: demoCopy.courses.strategy.notes[locale], archivedAt: null },
    { ...baseRecord('demo-course-marketing'), semesterId: null, name: demoCopy.courses.marketing.name[locale], code: 'MKT 315', instructor: demoCopy.courses.marketing.instructor[locale], department: demoCopy.courses.marketing.department[locale], room: 'A-108', colorToken: 'blue', notes: demoCopy.courses.marketing.notes[locale], archivedAt: null },
    { ...baseRecord('demo-course-finance'), semesterId: null, name: demoCopy.courses.finance.name[locale], code: 'FIN 302', instructor: demoCopy.courses.finance.instructor[locale], department: demoCopy.courses.finance.department[locale], room: 'C-112', colorToken: 'green', notes: demoCopy.courses.finance.notes[locale], archivedAt: null },
    { ...baseRecord('demo-course-innovation'), semesterId: null, name: demoCopy.courses.innovation.name[locale], code: 'ENT 220', instructor: demoCopy.courses.innovation.instructor[locale], department: demoCopy.courses.innovation.department[locale], room: 'D-301', colorToken: 'violet', notes: demoCopy.courses.innovation.notes[locale], archivedAt: null },
  ]

  const sessions = [
    { ...baseRecord('demo-session-1'), courseId: 'demo-course-strategy', weekday: 0, startTime: '09:00', endTime: '10:30', room: 'B-204' },
    { ...baseRecord('demo-session-2'), courseId: 'demo-course-marketing', weekday: 1, startTime: '11:00', endTime: '12:30', room: 'A-108' },
    { ...baseRecord('demo-session-3'), courseId: 'demo-course-finance', weekday: 2, startTime: '09:30', endTime: '11:00', room: 'C-112' },
    { ...baseRecord('demo-session-4'), courseId: 'demo-course-innovation', weekday: 3, startTime: '13:00', endTime: '14:30', room: 'D-301' },
    { ...baseRecord('demo-session-5'), courseId: 'demo-course-strategy', weekday: 4, startTime: '10:00', endTime: '11:30', room: 'B-204' },
  ]

  const exams = [
    { ...baseRecord('demo-exam-1'), courseId: 'demo-course-strategy', title: demoCopy.exams.midterm.title[locale], type: 'midterm', date: dateFromToday(5), startTime: '10:00', room: 'B-204', notes: demoCopy.exams.midterm.notes[locale], reminderMinutes: 1440 },
    { ...baseRecord('demo-exam-2'), courseId: 'demo-course-finance', title: demoCopy.exams.quiz.title[locale], type: 'quiz', date: dateFromToday(9), startTime: '09:30', room: 'C-112', notes: demoCopy.exams.quiz.notes[locale], reminderMinutes: 720 },
    { ...baseRecord('demo-exam-3'), courseId: 'demo-course-marketing', title: demoCopy.exams.project.title[locale], type: 'other', date: dateFromToday(14), startTime: '12:00', room: 'A-108', notes: demoCopy.exams.project.notes[locale], reminderMinutes: 1440 },
  ]

  const grades = [
    { ...baseRecord('demo-grade-1'), courseId: 'demo-course-strategy', title: demoCopy.grades.environment.title[locale], type: 'assignment', score: 18, maximumScore: 20, weight: 10, date: dateFromToday(-12), notes: demoCopy.grades.environment.notes[locale] },
    { ...baseRecord('demo-grade-2'), courseId: 'demo-course-strategy', title: demoCopy.grades.quiz.title[locale], type: 'quiz', score: 8, maximumScore: 10, weight: 10, date: dateFromToday(-7), notes: demoCopy.grades.quiz.notes[locale] },
    { ...baseRecord('demo-grade-3'), courseId: 'demo-course-marketing', title: demoCopy.grades.campaign.title[locale], type: 'project', score: 42, maximumScore: 50, weight: 30, date: dateFromToday(-5), notes: demoCopy.grades.campaign.notes[locale] },
    { ...baseRecord('demo-grade-4'), courseId: 'demo-course-finance', title: demoCopy.grades.midterm.title[locale], type: 'midterm', score: 34, maximumScore: 40, weight: 35, date: dateFromToday(-10), notes: demoCopy.grades.midterm.notes[locale] },
    { ...baseRecord('demo-grade-5'), courseId: 'demo-course-innovation', title: demoCopy.grades.model.title[locale], type: 'project', score: 27, maximumScore: 30, weight: 25, date: dateFromToday(-3), notes: demoCopy.grades.model.notes[locale] },
  ]

  const files = [
    { ...baseRecord('demo-file-1'), courseId: 'demo-course-strategy', name: demoCopy.files.strategy.name[locale], fileType: 'pdf', folder: demoCopy.files.strategy.folder[locale], note: demoCopy.files.strategy.note[locale], source: 'url', url: 'https://example.com/strategy-ch1.pdf', driveFileId: null, size: null, mimeType: 'application/pdf' },
    { ...baseRecord('demo-file-2'), courseId: 'demo-course-marketing', name: demoCopy.files.marketing.name[locale], fileType: 'document', folder: demoCopy.files.marketing.folder[locale], note: demoCopy.files.marketing.note[locale], source: 'url', url: 'https://example.com/marketing-project', driveFileId: null, size: null, mimeType: null },
    { ...baseRecord('demo-file-3'), courseId: 'demo-course-finance', name: demoCopy.files.finance.name[locale], fileType: 'video', folder: demoCopy.files.finance.folder[locale], note: demoCopy.files.finance.note[locale], source: 'url', url: 'https://example.com/finance-ratios', driveFileId: null, size: null, mimeType: null },
    { ...baseRecord('demo-file-4'), courseId: 'demo-course-innovation', name: demoCopy.files.innovation.name[locale], fileType: 'image', folder: demoCopy.files.innovation.folder[locale], note: demoCopy.files.innovation.note[locale], source: 'url', url: 'https://example.com/business-model-canvas', driveFileId: null, size: null, mimeType: null },
  ]

  return { courses, sessions, exams, grades, files }
}

export async function loadDemoData(locale: Locale = 'ar'): Promise<void> {
  const { courses, sessions, exams, grades, files } = buildDemoData(locale)
  await Promise.all([
    ...courses.map((record) => putRecord(stores.courses, record)),
    ...sessions.map((record) => putRecord(stores.courseSessions, record)),
    ...exams.map((record) => putRecord(stores.exams, record)),
    ...grades.map((record) => putRecord(stores.grades, record)),
    ...files.map((record) => putRecord(stores.files, record)),
  ])
}

export async function localizeDemoData(locale: Locale): Promise<void> {
  await loadDemoData(locale)
}

export async function clearDemoData(): Promise<void> {
  const ids = [
    ['courses', ['demo-course-strategy', 'demo-course-marketing', 'demo-course-finance', 'demo-course-innovation']],
    ['courseSessions', ['demo-session-1', 'demo-session-2', 'demo-session-3', 'demo-session-4', 'demo-session-5']],
    ['exams', ['demo-exam-1', 'demo-exam-2', 'demo-exam-3']],
    ['grades', ['demo-grade-1', 'demo-grade-2', 'demo-grade-3', 'demo-grade-4', 'demo-grade-5']],
    ['files', ['demo-file-1', 'demo-file-2', 'demo-file-3', 'demo-file-4']],
  ] as const

  await Promise.all(ids.flatMap(([store, recordIds]) => recordIds.map((id) => removeRecord(stores[store], id))))
}

export function isDemoRecordId(id: string): boolean {
  return id.startsWith(DEMO_PREFIX)
}
