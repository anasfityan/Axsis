import { getRecord, putRecord, removeRecord, stores } from '@/database/database'
import type { CloudAdapter, CloudChange } from '@/services/cloud/cloud.types'
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

  if (local && isEqualVersionConflict(change, local)) {
    await saveConflict(change, local)
  }

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

  const localUpdatedAt = readString(local.updatedAt)
  return change.updatedAt > localUpdatedAt
}

function isEqualVersionConflict(
  change: CloudChange,
  local: Record<string, unknown>,
): boolean {
  const localVersion = readFiniteNumber(local.version)
  if (localVersion !== change.recordVersion) return false

  const localUpdatedAt = readString(local.updatedAt)
  if (!localUpdatedAt || localUpdatedAt === change.updatedAt) return false

  if (change.deletedAt) return true
  return stableSerialize(cleanMetadata(local)) !== stableSerialize(change.payload)
}

async function saveConflict(
  change: CloudChange,
  local: Record<string, unknown>,
): Promise<void> {
  const localUpdatedAt = readString(local.updatedAt)
  const remoteWins = change.updatedAt > localUpdatedAt

  const conflict: SyncConflictRecord = {
    id: `conflict:${change.entity}:${change.entityId}:${change.changeId}`,
    entity: change.entity,
    entityId: change.entityId,
    localPayload: local,
    remotePayload: change.deletedAt ? null : change.payload,
    localUpdatedAt,
    remoteUpdatedAt: change.updatedAt,
    recordVersion: change.recordVersion,
    detectedAt: new Date().toISOString(),
    resolution: remoteWins ? 'remote-newer' : 'local-newer',
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

function cleanMetadata(record: Record<string, unknown>): Record<string, unknown> {
  const payload = { ...record }
  delete payload.updatedAt
  delete payload.version
  return payload
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`
  if (!value || typeof value !== 'object') return JSON.stringify(value)

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
  return `{${entries.join(',')}}`
}

function readFiniteNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
