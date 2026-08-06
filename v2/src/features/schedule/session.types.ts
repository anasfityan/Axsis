export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface CourseSession {
  id: string
  userId: string
  courseId: string
  weekday: Weekday
  startTime: string
  endTime: string
  room: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  version: number
  deviceId: string
}

export interface CourseSessionDraft {
  courseId: string
  weekday: Weekday
  startTime: string
  endTime: string
  room: string
}

export const emptyCourseSessionDraft: CourseSessionDraft = {
  courseId: '',
  weekday: 1,
  startTime: '08:00',
  endTime: '10:00',
  room: '',
}

export const weekdays: Array<{ value: Weekday; label: string }> = [
  { value: 1, label: 'الاثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
  { value: 6, label: 'السبت' },
  { value: 7, label: 'الأحد' },
]
