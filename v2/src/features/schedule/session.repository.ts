import { getAllRecords, putRecord, stores } from '@/database/database'
import type { CourseSession, CourseSessionDraft } from '@/features/schedule/session.types'
import { enqueueSyncOperation } from '@/services/sync/sync.repository'

const DEVICE_KEY = 'axsis-v2-device-id'

function getDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(DEVICE_KEY, id)
  return id
}

export async function listCourseSessions(): Promise<CourseSession[]> {
  const sessions = await getAllRecords<CourseSession>(stores.courseSessions)
  return sessions
    .filter((session) => !session.deletedAt)
    .sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime))
}

export async function saveCourseSession(
  draft: CourseSessionDraft,
  existing?: CourseSession,
): Promise<CourseSession> {
  if (draft.endTime <= draft.startTime) {
    throw new Error('Session end time must be after its start time.')
  }

  const now = new Date().toISOString()
  const session: CourseSession = {
    id: existing?.id ?? crypto.randomUUID(),
    userId: existing?.userId ?? 'local-user',
    courseId: draft.courseId,
    weekday: draft.weekday,
    startTime: draft.startTime,
    endTime: draft.endTime,
    room: draft.room.trim(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    deletedAt: null,
    version: (existing?.version ?? 0) + 1,
    deviceId: getDeviceId(),
  }

  await putRecord(stores.courseSessions, session)
  await enqueueSyncOperation('courseSession', session.id, 'upsert', session)
  return session
}

export async function removeCourseSession(session: CourseSession): Promise<void> {
  const now = new Date().toISOString()
  const tombstone: CourseSession = {
    ...session,
    deletedAt: now,
    updatedAt: now,
    version: session.version + 1,
    deviceId: getDeviceId(),
  }
  await putRecord(stores.courseSessions, tombstone)
  await enqueueSyncOperation('courseSession', session.id, 'delete', tombstone)
}
