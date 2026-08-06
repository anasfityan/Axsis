import { deleteRecord, getAllRecords, putRecord, stores } from '@/database/database'
import type { Course, CourseDraft } from '@/features/courses/course.types'

const DEVICE_KEY = 'axsis-v2-device-id'

function getDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(DEVICE_KEY, id)
  return id
}

export async function listCourses(): Promise<Course[]> {
  const records = await getAllRecords<Course>(stores.courses)
  return records
    .filter((course) => !course.deletedAt)
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
}

export async function saveCourse(draft: CourseDraft, existing?: Course): Promise<Course> {
  const now = new Date().toISOString()
  const course: Course = {
    id: existing?.id ?? crypto.randomUUID(),
    userId: existing?.userId ?? 'local-user',
    semesterId: existing?.semesterId ?? null,
    name: draft.name.trim(),
    code: draft.code.trim(),
    instructor: draft.instructor.trim(),
    department: draft.department.trim(),
    room: draft.room.trim(),
    colorToken: draft.colorToken,
    notes: draft.notes.trim(),
    archivedAt: existing?.archivedAt ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    deletedAt: null,
    version: (existing?.version ?? 0) + 1,
    deviceId: getDeviceId(),
  }

  await putRecord(stores.courses, course)
  return course
}

export async function removeCourse(course: Course): Promise<void> {
  await deleteRecord(stores.courses, course.id)
}
