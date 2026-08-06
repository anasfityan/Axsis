import { getAllRecords, putRecord, stores } from '@/database/database'
import type { StudyFile, StudyFileDraft } from '@/features/files/file.types'
import { enqueueSyncOperation } from '@/services/sync/sync.repository'

const DEVICE_KEY = 'axsis-v2-device-id'

function getDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(DEVICE_KEY, id)
  return id
}

export async function listStudyFiles(): Promise<StudyFile[]> {
  const records = await getAllRecords<StudyFile>(stores.files)
  return records
    .filter((file) => !file.deletedAt)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function saveStudyFile(draft: StudyFileDraft, existing?: StudyFile): Promise<StudyFile> {
  const now = new Date().toISOString()
  const file: StudyFile = {
    id: existing?.id ?? crypto.randomUUID(),
    userId: existing?.userId ?? 'local-user',
    courseId: draft.courseId,
    name: draft.name.trim(),
    fileType: draft.fileType,
    folder: draft.folder.trim() || 'عام',
    note: draft.note.trim(),
    source: draft.source,
    url: draft.url.trim(),
    driveFileId: existing?.driveFileId ?? null,
    size: existing?.size ?? null,
    mimeType: existing?.mimeType ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    deletedAt: null,
    version: (existing?.version ?? 0) + 1,
    deviceId: getDeviceId(),
  }

  await putRecord(stores.files, file)
  await enqueueSyncOperation('file', file.id, 'upsert', file)
  return file
}

export async function removeStudyFile(file: StudyFile): Promise<void> {
  const now = new Date().toISOString()
  const tombstone: StudyFile = {
    ...file,
    deletedAt: now,
    updatedAt: now,
    version: file.version + 1,
    deviceId: getDeviceId(),
  }
  await putRecord(stores.files, tombstone)
  await enqueueSyncOperation('file', file.id, 'delete', tombstone)
}
