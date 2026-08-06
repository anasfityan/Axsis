export interface Exam {
  id: string
  userId: string
  courseId: string
  title: string
  type: 'midterm' | 'final' | 'quiz' | 'other'
  date: string
  startTime: string
  room: string
  notes: string
  reminderMinutes: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  version: number
  deviceId: string
}

export interface ExamDraft {
  courseId: string
  title: string
  type: Exam['type']
  date: string
  startTime: string
  room: string
  notes: string
  reminderMinutes: number
}

export const emptyExamDraft: ExamDraft = {
  courseId: '',
  title: '',
  type: 'midterm',
  date: '',
  startTime: '09:00',
  room: '',
  notes: '',
  reminderMinutes: 1440,
}
