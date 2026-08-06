import { getAllRecords, putRecord, stores } from '@/database/database'
import type { GradeDraft, GradeItem } from '@/features/grades/grade.types'
import { enqueueSyncOperation } from '@/services/sync/sync.repository'

const DEVICE_KEY = 'axsis-v2-device-id'

function getDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(DEVICE_KEY, id)
  return id
}

export async function listGrades(): Promise<GradeItem[]> {
  const records = await getAllRecords<GradeItem>(stores.grades)
  return records
    .filter((grade) => !grade.deletedAt)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function saveGrade(draft: GradeDraft, existing?: GradeItem): Promise<GradeItem> {
  const now = new Date().toISOString()
  const grade: GradeItem = {
    id: existing?.id ?? crypto.randomUUID(),
    userId: existing?.userId ?? 'local-user',
    courseId: draft.courseId,
    title: draft.title.trim(),
    type: draft.type,
    score: Number(draft.score),
    maximumScore: Number(draft.maximumScore),
    weight: draft.weight ? Number(draft.weight) : 0,
    date: draft.date,
    notes: draft.notes.trim(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    deletedAt: null,
    version: (existing?.version ?? 0) + 1,
    deviceId: getDeviceId(),
  }
  await putRecord(stores.grades, grade)
  await enqueueSyncOperation('grade', grade.id, 'upsert', grade)
  return grade
}

export async function removeGrade(grade: GradeItem): Promise<void> {
  const now = new Date().toISOString()
  const tombstone: GradeItem = {
    ...grade,
    deletedAt: now,
    updatedAt: now,
    version: grade.version + 1,
    deviceId: getDeviceId(),
  }
  await putRecord(stores.grades, tombstone)
  await enqueueSyncOperation('grade', grade.id, 'delete', tombstone)
}
