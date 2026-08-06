import { describe, expect, it } from 'vitest'

import {
  BACKUP_APP_ID,
  BACKUP_FORMAT_VERSION,
  createBackupEnvelope,
  parseAndVerifyBackupEnvelope,
  serializeBackupEnvelope,
  verifyBackupEnvelope,
} from '@/services/backup/backup-engine'

const options = {
  appVersion: '0.1.0',
  deviceId: 'device-1',
  createdAt: new Date('2026-08-06T04:00:00.000Z'),
}

describe('backup engine', () => {
  it('creates and verifies a deterministic integrity envelope', async () => {
    const envelope = await createBackupEnvelope({ courses: [{ id: 'course-1' }] }, options)

    expect(envelope.metadata).toEqual({
      app: BACKUP_APP_ID,
      formatVersion: BACKUP_FORMAT_VERSION,
      appVersion: '0.1.0',
      createdAt: '2026-08-06T04:00:00.000Z',
      deviceId: 'device-1',
    })
    expect(envelope.checksum).toMatch(/^[a-f0-9]{64}$/)
    await expect(verifyBackupEnvelope(envelope)).resolves.toMatchObject({ valid: true })
  })

  it('rejects a backup whose payload was modified after creation', async () => {
    const envelope = await createBackupEnvelope({ grades: [{ id: 'grade-1', value: 90 }] }, options)
    const tampered = {
      ...envelope,
      payload: { grades: [{ id: 'grade-1', value: 10 }] },
    }

    await expect(verifyBackupEnvelope(tampered)).resolves.toEqual({
      valid: false,
      reason: 'checksum-mismatch',
    })
  })

  it('rejects unsupported format versions', async () => {
    const envelope = await createBackupEnvelope({ files: [] }, options)
    const unsupported = {
      ...envelope,
      metadata: { ...envelope.metadata, formatVersion: BACKUP_FORMAT_VERSION + 1 },
    }

    await expect(verifyBackupEnvelope(unsupported)).resolves.toEqual({
      valid: false,
      reason: 'unsupported-format-version',
    })
  })

  it('serializes and parses a valid backup without losing integrity', async () => {
    const envelope = await createBackupEnvelope({ exams: [{ id: 'exam-1' }] }, options)
    const parsed = await parseAndVerifyBackupEnvelope(serializeBackupEnvelope(envelope))

    expect(parsed).toEqual(envelope)
  })

  it('rejects malformed JSON before restore', async () => {
    await expect(parseAndVerifyBackupEnvelope('{not-json')).rejects.toThrow(
      'ملف النسخة الاحتياطية ليس JSON صالحًا.',
    )
  })
})
