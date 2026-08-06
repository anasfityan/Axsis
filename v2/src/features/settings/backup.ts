import { getAllRecords, putRecord, stores } from '@/database/database'
import {
  createBackupEnvelope,
  parseAndVerifyBackupEnvelope,
  serializeBackupEnvelope,
  type BackupEnvelope,
} from '@/services/backup/backup-engine'
import { getDeviceIdentity } from '@/services/device/device'

export type BackupCollections = {
  courses: unknown[]
  courseSessions: unknown[]
  exams: unknown[]
  grades: unknown[]
  files: unknown[]
}

export type AxsisBackup = BackupEnvelope<BackupCollections>

const collectionStores = {
  courses: stores.courses,
  courseSessions: stores.courseSessions,
  exams: stores.exams,
  grades: stores.grades,
  files: stores.files,
} as const

export async function createBackup(): Promise<AxsisBackup> {
  const entries = await Promise.all(
    Object.entries(collectionStores).map(async ([name, storeName]) => [name, await getAllRecords(storeName)] as const),
  )
  const device = getDeviceIdentity()

  return createBackupEnvelope(
    Object.fromEntries(entries) as BackupCollections,
    {
      appVersion: device.appVersion,
      deviceId: device.id,
    },
  )
}

export function downloadBackup(backup: AxsisBackup): void {
  const blob = new Blob([serializeBackupEnvelope(backup)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `axsis-backup-${backup.metadata.createdAt.slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function parseBackup(text: string): Promise<AxsisBackup> {
  return validateAxsisBackup(await parseAndVerifyBackupEnvelope(text))
}

export function validateAxsisBackup(envelope: BackupEnvelope): AxsisBackup {
  assertBackupCollections(envelope.payload)
  return envelope as AxsisBackup
}

function assertBackupCollections(value: unknown): asserts value is BackupCollections {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('بيانات النسخة الاحتياطية غير صالحة.')
  }

  const collections = value as Record<string, unknown>
  for (const key of Object.keys(collectionStores) as Array<keyof BackupCollections>) {
    if (!Array.isArray(collections[key])) {
      throw new Error(`المجموعة ${key} غير صالحة داخل ملف النسخة الاحتياطية.`)
    }
  }
}

function isRecordWithId(value: unknown): value is { id: string } {
  return typeof value === 'object' && value !== null && typeof (value as { id?: unknown }).id === 'string'
}

export async function importBackup(backup: AxsisBackup): Promise<Record<keyof BackupCollections, number>> {
  const imported = {} as Record<keyof BackupCollections, number>

  for (const [name, storeName] of Object.entries(collectionStores) as Array<
    [keyof BackupCollections, (typeof collectionStores)[keyof typeof collectionStores]]
  >) {
    const records = backup.payload[name]
    let count = 0
    for (const record of records) {
      if (!isRecordWithId(record)) continue
      await putRecord(storeName, record)
      count += 1
    }
    imported[name] = count
  }

  return imported
}

export async function getLocalCounts(): Promise<Record<keyof BackupCollections, number>> {
  const entries = await Promise.all(
    Object.entries(collectionStores).map(async ([name, storeName]) => [name, (await getAllRecords(storeName)).length] as const),
  )
  return Object.fromEntries(entries) as Record<keyof BackupCollections, number>
}
