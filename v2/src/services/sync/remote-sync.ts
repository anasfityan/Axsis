import { getRecord, putRecord, removeRecord, stores } from '@/database/database'
import type { CloudAdapter, CloudChange } from '@/services/cloud/cloud.types'
import type { SyncEntity } from '@/services/sync/sync.types'

interface SyncCursorRecord {
  id: string
  cursor: string | null
  updatedAt: string
}

const MAX_PULL_PAGES = 10

const storeByEntity: Record<SyncEntity, string> = {
  course: stores.courses,
  courseSession: stores.courseSessions,
  exam: stores.exams,
  grade: stores.grades,
  file: stores.files,
}

export async function pullAndApplyCloudChanges(
  adapter: CloudAdapter,
  userId: string,
): Promise<number> {
  let cursor = await readCursor(userId)
  let applied = 0

  for (let page = 0; page < MAX_PULL_PAGES; page += 1) {
    const result = await adapter.pullChanges(cursor)

    for (const change of result.changes) {
      if (await applyCloudChange(change)) applied += 1
    }

    const nextCursor = result.nextCursor
    if (nextCursor && nextCursor !== cursor) {
      cursor = nextCursor
      await writeCursor(userId, cursor)
    }

    if (result.changes.length === 0 || !nextCursor || nextCursor === result.nextCursor && result.changes.length < 100) {
      break
    }
  }

  if (applied > 0) {
    window.dispatchEvent(new CustomEvent('axsis:data-changed', { detail: { source: 'cloud' } }))
  }

  return applied
}

async function applyCloudChange(change: CloudChange): Promise<boolean> {
  const storeName = storeByEntity[change.entity]
  const local = await getRecord<Record<string, unknown>>(storeName, change.entityId)

  if (!isRemoteNewer(change, local)) return false

  if (change.deletedAt) {
    if (local) await removeRecord(storeName, change.entityId)
    return Boolean(local)
  }

  if (!change.payload || typeof change.payload !== 'object' || Array.isArray(change.payload)) {
    return false
  }

  await putRecord(storeName, {
    ...(change.payload as Record<string, unknown>),
    id: change.entityId,
    version: change.recordVersion,
    updatedAt: change.updatedAt,
  })
  return true
}

function isRemoteNewer(
  change: CloudChange,
  local: Record<string, unknown> | undefined,
): boolean {
  if (!local) return true

  const localVersion = readFiniteNumber(local.version)
  if (change.recordVersion !== localVersion) return change.recordVersion > localVersion

  const localUpdatedAt = typeof local.updatedAt === 'string' ? local.updatedAt : ''
  return change.updatedAt > localUpdatedAt
}

async function readCursor(userId: string): Promise<string | null> {
  const record = await getRecord<SyncCursorRecord>(stores.settings, cursorId(userId))
  return record?.cursor ?? null
}

async function writeCursor(userId: string, cursor: string): Promise<void> {
  await putRecord(stores.settings, {
    id: cursorId(userId),
    cursor,
    updatedAt: new Date().toISOString(),
  })
}

function cursorId(userId: string): string {
  return `sync-cursor:${userId}`
}

function readFiniteNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}
