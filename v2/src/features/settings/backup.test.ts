import { describe, expect, it } from 'vitest'

import { validateAxsisBackup, type BackupCollections } from '@/features/settings/backup'
import { BACKUP_APP_ID, BACKUP_FORMAT_VERSION, type BackupEnvelope } from '@/services/backup/backup-engine'

const metadata = {
  app: BACKUP_APP_ID,
  formatVersion: BACKUP_FORMAT_VERSION,
  appVersion: '0.1.0',
  createdAt: '2026-08-07T00:00:00.000Z',
  deviceId: 'device-1',
}

const common = {
  userId: 'local-user',
  createdAt: '2026-08-07T00:00:00.000Z',
  updatedAt: '2026-08-07T00:00:00.000Z',
  deletedAt: null,
  version: 1,
  deviceId: 'device-1',
}

function envelope(payload: BackupCollections): BackupEnvelope<BackupCollections> {
  return { metadata, payload, checksum: 'verified-before-schema-validation' }
}

describe('Axsis backup schema validation', () => {
  it('accepts records that match every local collection schema', () => {
    const payload: BackupCollections = {
      courses: [{
        ...common,
        id: 'course-1',
        semesterId: null,
        name: 'Strategy',
        code: 'BUS401',
        instructor: 'Instructor',
        department: 'Business',
        room: 'A1',
        colorToken: 'amber',
        notes: '',
        archivedAt: null,
      }],
      courseSessions: [{
        ...common,
        id: 'session-1',
        courseId: 'course-1',
        weekday: 1,
        startTime: '09:00',
        endTime: '10:00',
        room: 'A1',
      }],
      exams: [{
        ...common,
        id: 'exam-1',
        courseId: 'course-1',
        title: 'Final',
        type: 'final',
        date: '2026-08-10',
        startTime: '09:00',
        room: 'A1',
        notes: '',
        reminderMinutes: 60,
      }],
      grades: [{
        ...common,
        id: 'grade-1',
        courseId: 'course-1',
        title: 'Final',
        type: 'final',
        score: 90,
        maximumScore: 100,
        weight: 40,
        date: '2026-08-10',
        notes: '',
      }],
      files: [{
        ...common,
        id: 'file-1',
        courseId: 'course-1',
        name: 'Lecture',
        fileType: 'pdf',
        folder: 'المحاضرات',
        note: '',
        source: 'link',
        url: 'https://example.com/lecture.pdf',
        driveFileId: null,
        size: null,
        mimeType: null,
      }],
    }

    expect(validateAxsisBackup(envelope(payload)).payload).toEqual(payload)
  })

  it('rejects malformed records before import starts', () => {
    const payload: BackupCollections = {
      courses: [],
      courseSessions: [],
      exams: [],
      grades: [{ ...common, id: 'grade-1', courseId: 'course-1', maximumScore: 0 }],
      files: [],
    }

    expect(() => validateAxsisBackup(envelope(payload))).toThrow(
      'السجل رقم 1 داخل مجموعة grades غير صالح.',
    )
  })
})
