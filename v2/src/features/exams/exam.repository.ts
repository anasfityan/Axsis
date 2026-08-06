import { getAllRecords, putRecord, stores } from '@/database/database'
import type { Exam, ExamDraft } from '@/features/exams/exam.types'
import { enqueueSyncOperation } from '@/services/sync/sync.repository'

const DEVICE_KEY = 'axsis-v2-device-id'

function getDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(DEVICE_KEY, id)
  return id
}

export async function listExams(): Promise<Exam[]> {
  const records = await getAllRecords<Exam>(stores.exams)
  return records.filter((exam) => !exam.deletedAt).sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))
}

export async function saveExam(draft: ExamDraft, existing?: Exam): Promise<Exam> {
  const now = new Date().toISOString()
  const exam: Exam = {
    id: existing?.id ?? crypto.randomUUID(),
    userId: existing?.userId ?? 'local-user',
    courseId: draft.courseId,
    title: draft.title.trim(),
    type: draft.type,
    date: draft.date,
    startTime: draft.startTime,
    room: draft.room.trim(),
    notes: draft.notes.trim(),
    reminderMinutes: draft.reminderMinutes,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    deletedAt: null,
    version: (existing?.version ?? 0) + 1,
    deviceId: getDeviceId(),
  }
  await putRecord(stores.exams, exam)
  await enqueueSyncOperation('exam', exam.id, 'upsert', exam)
  return exam
}

export async function removeExam(exam: Exam): Promise<void> {
  const now = new Date().toISOString()
  const tombstone: Exam = {
    ...exam,
    deletedAt: now,
    updatedAt: now,
    version: exam.version + 1,
    deviceId: getDeviceId(),
  }
  await putRecord(stores.exams, tombstone)
  await enqueueSyncOperation('exam', exam.id, 'delete', tombstone)
}
