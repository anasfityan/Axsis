import { putRecord, removeRecord, stores } from '@/database/database'

const DEMO_PREFIX = 'demo-'

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

export async function loadDemoData(): Promise<void> {
  const courses = [
    { ...baseRecord('demo-course-strategy'), semesterId: null, name: 'الإدارة الاستراتيجية', code: 'BUS 401', instructor: 'د. أحمد السامرائي', department: 'إدارة الأعمال', room: 'B-204', colorToken: 'amber', notes: 'مادة أساسية تتضمن التحليل الداخلي والخارجي والميزة التنافسية.', archivedAt: null },
    { ...baseRecord('demo-course-marketing'), semesterId: null, name: 'التسويق الرقمي', code: 'MKT 315', instructor: 'د. سارة محمود', department: 'التسويق', room: 'A-108', colorToken: 'blue', notes: 'التسويق عبر المنصات الرقمية وتحليل سلوك المستهلك.', archivedAt: null },
    { ...baseRecord('demo-course-finance'), semesterId: null, name: 'الإدارة المالية', code: 'FIN 302', instructor: 'د. عمر الجبوري', department: 'المالية', room: 'C-112', colorToken: 'green', notes: 'تحليل القوائم المالية وقرارات الاستثمار والتمويل.', archivedAt: null },
    { ...baseRecord('demo-course-innovation'), semesterId: null, name: 'إدارة الابتكار', code: 'ENT 220', instructor: 'د. ليلى حسن', department: 'ريادة الأعمال', room: 'D-301', colorToken: 'violet', notes: 'نماذج الابتكار وريادة الأعمال وتصميم نماذج الأعمال.', archivedAt: null },
  ]

  const sessions = [
    { ...baseRecord('demo-session-1'), courseId: 'demo-course-strategy', weekday: 0, startTime: '09:00', endTime: '10:30', room: 'B-204' },
    { ...baseRecord('demo-session-2'), courseId: 'demo-course-marketing', weekday: 1, startTime: '11:00', endTime: '12:30', room: 'A-108' },
    { ...baseRecord('demo-session-3'), courseId: 'demo-course-finance', weekday: 2, startTime: '09:30', endTime: '11:00', room: 'C-112' },
    { ...baseRecord('demo-session-4'), courseId: 'demo-course-innovation', weekday: 3, startTime: '13:00', endTime: '14:30', room: 'D-301' },
    { ...baseRecord('demo-session-5'), courseId: 'demo-course-strategy', weekday: 4, startTime: '10:00', endTime: '11:30', room: 'B-204' },
  ]

  const exams = [
    { ...baseRecord('demo-exam-1'), courseId: 'demo-course-strategy', title: 'الاختبار النصفي', type: 'midterm', date: dateFromToday(5), startTime: '10:00', room: 'B-204', notes: 'الفصول 1–5', reminderMinutes: 1440 },
    { ...baseRecord('demo-exam-2'), courseId: 'demo-course-finance', title: 'اختبار قصير 2', type: 'quiz', date: dateFromToday(9), startTime: '09:30', room: 'C-112', notes: 'النسب المالية', reminderMinutes: 720 },
    { ...baseRecord('demo-exam-3'), courseId: 'demo-course-marketing', title: 'عرض المشروع', type: 'other', date: dateFromToday(14), startTime: '12:00', room: 'A-108', notes: 'عرض مدته 10 دقائق', reminderMinutes: 1440 },
  ]

  const grades = [
    { ...baseRecord('demo-grade-1'), courseId: 'demo-course-strategy', title: 'واجب تحليل البيئة', type: 'assignment', score: 18, maximumScore: 20, weight: 10, date: dateFromToday(-12), notes: 'أداء ممتاز' },
    { ...baseRecord('demo-grade-2'), courseId: 'demo-course-strategy', title: 'اختبار قصير 1', type: 'quiz', score: 8, maximumScore: 10, weight: 10, date: dateFromToday(-7), notes: '' },
    { ...baseRecord('demo-grade-3'), courseId: 'demo-course-marketing', title: 'مشروع الحملة', type: 'project', score: 42, maximumScore: 50, weight: 30, date: dateFromToday(-5), notes: 'الفكرة جيدة وتحتاج تحسين القياس' },
    { ...baseRecord('demo-grade-4'), courseId: 'demo-course-finance', title: 'الاختبار النصفي', type: 'midterm', score: 34, maximumScore: 40, weight: 35, date: dateFromToday(-10), notes: '' },
    { ...baseRecord('demo-grade-5'), courseId: 'demo-course-innovation', title: 'نموذج العمل', type: 'project', score: 27, maximumScore: 30, weight: 25, date: dateFromToday(-3), notes: 'عرض واضح ومترابط' },
  ]

  const files = [
    { ...baseRecord('demo-file-1'), courseId: 'demo-course-strategy', name: 'ملخص الفصل الأول', fileType: 'pdf', folder: 'المحاضرات', note: 'مبادئ الإدارة الاستراتيجية', source: 'url', url: 'https://example.com/strategy-ch1.pdf', driveFileId: null, size: null, mimeType: 'application/pdf' },
    { ...baseRecord('demo-file-2'), courseId: 'demo-course-marketing', name: 'دليل المشروع النهائي', fileType: 'document', folder: 'النهائي', note: 'متطلبات وتقييم المشروع', source: 'url', url: 'https://example.com/marketing-project', driveFileId: null, size: null, mimeType: null },
    { ...baseRecord('demo-file-3'), courseId: 'demo-course-finance', name: 'شرح النسب المالية', fileType: 'video', folder: 'المحاضرات', note: 'فيديو مراجعة قبل الاختبار', source: 'url', url: 'https://example.com/finance-ratios', driveFileId: null, size: null, mimeType: null },
    { ...baseRecord('demo-file-4'), courseId: 'demo-course-innovation', name: 'قالب نموذج العمل', fileType: 'image', folder: 'الواجبات', note: 'Business Model Canvas', source: 'url', url: 'https://example.com/business-model-canvas', driveFileId: null, size: null, mimeType: null },
  ]

  await Promise.all([
    ...courses.map((record) => putRecord(stores.courses, record)),
    ...sessions.map((record) => putRecord(stores.courseSessions, record)),
    ...exams.map((record) => putRecord(stores.exams, record)),
    ...grades.map((record) => putRecord(stores.grades, record)),
    ...files.map((record) => putRecord(stores.files, record)),
  ])
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
