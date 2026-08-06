import { getAllRecords, putRecord, stores } from '@/database/database'

const BACKUP_VERSION = 1

export type BackupCollections = {
  courses: unknown[]
  courseSessions: unknown[]
  exams: unknown[]
  grades: unknown[]
  files: unknown[]
}

export type AxsisBackup = {
  app: 'axsis-v2'
  version: number
  exportedAt: string
  collections: BackupCollections
}

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

  return {
    app: 'axsis-v2',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    collections: Object.fromEntries(entries) as BackupCollections,
  }
}

export function downloadBackup(backup: AxsisBackup): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `axsis-backup-${backup.exportedAt.slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function parseBackup(text: string): AxsisBackup {
  const parsed = JSON.parse(text) as Partial<AxsisBackup>
  if (parsed.app !== 'axsis-v2' || parsed.version !== BACKUP_VERSION || !parsed.collections) {
    throw new Error('ملف النسخة الاحتياطية غير صالح أو غير مدعوم.')
  }

  for (const key of Object.keys(collectionStores) as Array<keyof BackupCollections>) {
    if (!Array.isArray(parsed.collections[key])) {
      throw new Error(`المجموعة ${key} غير صالحة داخل ملف النسخة الاحتياطية.`)
    }
  }

  return parsed as AxsisBackup
}

function isRecordWithId(value: unknown): value is { id: string } {
  return typeof value === 'object' && value !== null && typeof (value as { id?: unknown }).id === 'string'
}

export async function importBackup(backup: AxsisBackup): Promise<Record<keyof BackupCollections, number>> {
  const imported = {} as Record<keyof BackupCollections, number>

  for (const [name, storeName] of Object.entries(collectionStores) as Array<
    [keyof BackupCollections, (typeof collectionStores)[keyof typeof collectionStores]]
  >) {
    const records = backup.collections[name]
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
