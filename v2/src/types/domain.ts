export type Locale = "ar" | "tr" | "en"
export type ThemeMode = "dark" | "light"

export interface SyncRecord {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  version: number
  deviceId: string
}

export interface Semester extends SyncRecord {
  name: string
  startDate: string
  endDate: string
  isActive: boolean
}

export interface Course extends SyncRecord {
  semesterId: string | null
  name: string
  code: string
  instructor: string
  department: string
  room: string
  colorToken: string
  notes: string
  archivedAt: string | null
}

export interface CourseSession extends SyncRecord {
  courseId: string
  weekday: number
  startTime: string
  endTime: string
  room: string
}

export interface Exam extends SyncRecord {
  courseId: string
  title: string
  type: string
  date: string
  startTime: string
  room: string
  notes: string
  reminderMinutes: number | null
}

export interface GradeItem extends SyncRecord {
  courseId: string
  title: string
  type: string
  score: number
  maximumScore: number
  weight: number
  date: string | null
  notes: string
}

export interface StudyFile extends SyncRecord {
  courseId: string
  name: string
  fileType: string
  folder: string
  note: string
  source: "link" | "drive" | "local"
  url: string
  driveFileId: string | null
  size: number | null
  mimeType: string | null
}

export interface UserSettings {
  userId: string
  locale: Locale
  appearance: ThemeMode
  timeFormat: "12" | "24"
  weekStartsOn: 0 | 1 | 6
  notificationsEnabled: boolean
  updatedAt: string
}
