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

type ImportableRecord = Record<string, unknown> & { id: string }

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
  validateBackupRecords(envelope.payload)
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

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value)
}

function hasCommonRecordFields(value: unknown): value is ImportableRecord {
  if (!isObjectRecord(value)) return false
  return isString(value.id)
    && value.id.length > 0
    && isString(value.userId)
    && isString(value.createdAt)
    && isString(value.updatedAt)
    && isNullableString(value.deletedAt)
    && typeof value.version === 'number'
    && Number.isInteger(value.version)
    && value.version > 0
    && isString(value.deviceId)
}

function isValidCollectionRecord(collection: keyof BackupCollections, value: unknown): value is ImportableRecord {
  if (!hasCommonRecordFields(value)) return false

  switch (collection) {
    case 'courses':
      return isString(value.name)
        && isString(value.code)
        && isString(value.instructor)
        && isString(value.department)
        && isString(value.room)
        && isString(value.colorToken)
        && isString(value.notes)
        && isNullableString(value.semesterId)
        && isNullableString(value.archivedAt)
    case 'courseSessions':
      return isString(value.courseId)
        && typeof value.weekday === 'number'
        && Number.isInteger(value.weekday)
        && value.weekday >= 0
        && value.weekday <= 6
        && isString(value.startTime)
        && isString(value.endTime)
        && isString(value.room)
    case 'exams':
      return isString(value.courseId)
        && isString(value.title)
        && isString(value.type)
        && isString(value.date)
        && isString(value.startTime)
        && isString(value.room)
        && isString(value.notes)
        && typeof value.reminderMinutes === 'number'
    case 'grades':
      return isString(value.courseId)
        && isString(value.title)
        && isString(value.type)
        && typeof value.score === 'number'
        && Number.isFinite(value.score)
        && typeof value.maximumScore === 'number'
        && Number.isFinite(value.maximumScore)
        && value.maximumScore > 0
        && typeof value.weight === 'number'
        && Number.isFinite(value.weight)
        && isString(value.date)
        && isString(value.notes)
    case 'files':
      return isString(value.courseId)
        && isString(value.name)
        && isString(value.fileType)
        && isString(value.folder)
        && isString(value.note)
        && isString(value.source)
        && isString(value.url)
        && isNullableString(value.driveFileId)
        && (value.size === null || typeof value.size === 'number')
        && isNullableString(value.mimeType)
  }
}

function validateBackupRecords(collections: BackupCollections): void {
  for (const collection of Object.keys(collectionStores) as Array<keyof BackupCollections>) {
    const invalidIndex = collections[collection].findIndex((record) => !isValidCollectionRecord(collection, record))
    if (invalidIndex >= 0) {
      throw new Error(`السجل رقم ${invalidIndex + 1} داخل مجموعة ${collection} غير صالح.`)
    }
  }
}

export async function importBackup(backup: AxsisBackup): Promise<Record<keyof BackupCollections, number>> {
  validateBackupRecords(backup.payload)
  const imported = {} as Record<keyof BackupCollections, number>

  for (const [name, storeName] of Object.entries(collectionStores) as Array<
    [keyof BackupCollections, (typeof collectionStores)[keyof typeof collectionStores]]
  >) {
    const records = backup.payload[name] as ImportableRecord[]
    for (const record of records) {
      await putRecord(storeName, record)
    }
    imported[name] = records.length
  }

  return imported
}

export async function getLocalCounts(): Promise<Record<keyof BackupCollections, number>> {
  const entries = await Promise.all(
    Object.entries(collectionStores).map(async ([name, storeName]) => [name, (await getAllRecords(storeName)).length] as const),
  )
  return Object.fromEntries(entries) as Record<keyof BackupCollections, number>
}
