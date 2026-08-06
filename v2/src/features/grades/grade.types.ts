export type GradeType = 'quiz' | 'assignment' | 'midterm' | 'final' | 'project' | 'other'

export interface GradeItem {
  id: string
  userId: string
  courseId: string
  title: string
  type: GradeType
  score: number
  maximumScore: number
  weight: number
  date: string
  notes: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  version: number
  deviceId: string
}

export interface GradeDraft {
  courseId: string
  title: string
  type: GradeType
  score: string
  maximumScore: string
  weight: string
  date: string
  notes: string
}

export const emptyGradeDraft: GradeDraft = {
  courseId: '',
  title: '',
  type: 'quiz',
  score: '',
  maximumScore: '100',
  weight: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
}
