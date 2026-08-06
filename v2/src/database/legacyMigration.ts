import type { Course, CourseSession, Exam, GradeItem, StudyFile } from "@/types/domain"

const LEGACY_KEYS = ["mw2_courses", "mw2_exams", "mw2_files", "mw2_grades"] as const

type LegacyCourse = {
  id: number
  name?: string
  doc?: string
  dept?: string
  code?: string
  day?: string
  s?: string
  e?: string
  room?: string
  notes?: string
  ci?: number
}

export type LegacyMigrationPreview = {
  found: boolean
  courses: Course[]
  sessions: CourseSession[]
  exams: Exam[]
  grades: GradeItem[]
  files: StudyFile[]
  warnings: string[]
}

function parseJson<T>(key: string, fallback: T, warnings: string[]): T {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    warnings.push(`تعذر قراءة البيانات القديمة من ${key}`)
    return fallback
  }
}

function legacyId(prefix: string, value: string | number) {
  return `legacy-${prefix}-${String(value)}`
}

function now() {
  return new Date().toISOString()
}

function weekdayFromArabic(day?: string): number {
  const days: Record<string, number> = {
    الأحد: 0,
    الاثنين: 1,
    الثلاثاء: 2,
    الأربعاء: 3,
    الخميس: 4,
    الجمعة: 5,
    السبت: 6,
  }
  return day ? (days[day] ?? 1) : 1
}

export function createLegacyMigrationPreview(userId = "local-user", deviceId = "legacy-device"): LegacyMigrationPreview {
  const warnings: string[] = []
  const legacyCourses = parseJson<LegacyCourse[]>("mw2_courses", [], warnings)
  const legacyExams = parseJson<Record<string, Record<string, unknown>>>("mw2_exams", {}, warnings)
  const legacyGrades = parseJson<Record<string, unknown>[]>("mw2_grades", [], warnings)
  const legacyFiles = parseJson<Record<string, Record<string, unknown>[]>>("mw2_files", {}, warnings)
  const timestamp = now()

  const base = {
    userId,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
    version: 1,
    deviceId,
  }

  const courses: Course[] = legacyCourses.map((course) => ({
    ...base,
    id: legacyId("course", course.id),
    semesterId: null,
    name: course.name ?? "مادة بلا اسم",
    code: course.code ?? "",
    instructor: course.doc ?? "",
    department: course.dept ?? "",
    room: course.room ?? "",
    colorToken: `course-${course.ci ?? 0}`,
    notes: course.notes ?? "",
    archivedAt: null,
  }))

  const sessions: CourseSession[] = legacyCourses.map((course) => ({
    ...base,
    id: legacyId("session", course.id),
    courseId: legacyId("course", course.id),
    weekday: weekdayFromArabic(course.day),
    startTime: course.s ?? "08:00",
    endTime: course.e ?? "10:00",
    room: course.room ?? "",
  }))

  const exams: Exam[] = Object.entries(legacyExams).map(([courseId, exam]) => ({
    ...base,
    id: legacyId("exam", courseId),
    courseId: legacyId("course", courseId),
    title: String(exam.title ?? "اختبار"),
    type: String(exam.type ?? "exam"),
    date: String(exam.date ?? ""),
    startTime: String(exam.time ?? "09:00"),
    room: String(exam.room ?? ""),
    notes: String(exam.notes ?? ""),
    reminderMinutes: null,
  }))

  const grades: GradeItem[] = legacyGrades.map((grade, index) => ({
    ...base,
    id: legacyId("grade", index),
    courseId: legacyId("course", String(grade.courseId ?? grade.cid ?? "unknown")),
    title: String(grade.title ?? grade.name ?? "درجة"),
    type: String(grade.type ?? "grade"),
    score: Number(grade.score ?? grade.value ?? 0),
    maximumScore: Number(grade.maximumScore ?? grade.max ?? 100),
    weight: Number(grade.weight ?? 0),
    date: grade.date ? String(grade.date) : null,
    notes: String(grade.notes ?? ""),
  }))

  const files: StudyFile[] = Object.entries(legacyFiles).flatMap(([courseId, courseFiles]) =>
    courseFiles.map((file, index) => ({
      ...base,
      id: legacyId("file", String(file.id ?? `${courseId}-${index}`)),
      courseId: legacyId("course", courseId),
      name: String(file.name ?? "ملف"),
      fileType: String(file.type ?? "link"),
      folder: String(file.folder ?? ""),
      note: String(file.note ?? ""),
      source: "link" as const,
      url: String(file.url ?? ""),
      driveFileId: null,
      size: null,
      mimeType: null,
    })),
  )

  const found = LEGACY_KEYS.some((key) => localStorage.getItem(key) !== null)
  return { found, courses, sessions, exams, grades, files, warnings }
}
