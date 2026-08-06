export interface Course {
  id: string
  userId: string
  semesterId: string | null
  name: string
  code: string
  instructor: string
  department: string
  room: string
  colorToken: string
  notes: string
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  version: number
  deviceId: string
}

export interface CourseDraft {
  name: string
  code: string
  instructor: string
  department: string
  room: string
  colorToken: string
  notes: string
}

export const emptyCourseDraft: CourseDraft = {
  name: '',
  code: '',
  instructor: '',
  department: '',
  room: '',
  colorToken: 'amber',
  notes: '',
}
