import { getRecord, putRecord, removeRecord, stores } from '@/database/database'
import type { CloudAdapter, CloudChange } from '@/services/cloud/cloud.types'
import { decideCloudChange } from '@/services/sync/conflict.policy'
import type { SyncEntity } from '@/services/sync/sync.types'

interface SyncCursorRecord {
  id: string
  cursor: string | null
  updatedAt: string
}

interface SyncConflictRecord {
  id: string
  entity: SyncEntity
  entityId: string
  localPayload: Record<string, unknown> | null
  remotePayload: unknown | null
  localUpdatedAt: string
  remoteUpdatedAt: string
  recordVersion: number
  detectedAt: string
  resolution: 'remote-newer' | 'local-newer'
}

const MAX_PULL_PAGES = 10
const CLOUD_PAGE_SIZE = 100

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
    const previousCursor = cursor
    const result = await adapter.pullChanges(cursor)

    for (const change of result.changes) {
      if (await applyCloudChange(change)) applied += 1
    }

    if (result.nextCursor && result.nextCursor !== cursor) {
      cursor = result.nextCursor
      await writeCursor(userId, cursor)
    }

    if (
      result.changes.length < CLOUD_PAGE_SIZE
      || !result.nextCursor
      || result.nextCursor === previousCursor
    ) {
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
  const decision = decideCloudChange(change, local)

  if (local && decision.hasConflict) {
    await saveConflict(change, local, decision.resolution)
  }

  if (!decision.shouldApplyRemote) return false

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

async function saveConflict(
  change: CloudChange,
  local: Record<string, unknown>,
  resolution: 'remote-newer' | 'local-newer',
): Promise<void> {
  const conflict: SyncConflictRecord = {
    id: `conflict:${change.entity}:${change.entityId}:${change.changeId}`,
    entity: change.entity,
    entityId: change.entityId,
    localPayload: local,
    remotePayload: change.deletedAt ? null : change.payload,
    localUpdatedAt: readString(local.updatedAt),
    remoteUpdatedAt: change.updatedAt,
    recordVersion: change.recordVersion,
    detectedAt: new Date().toISOString(),
    resolution,
  }

  await putRecord(stores.syncConflicts, conflict)
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

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
