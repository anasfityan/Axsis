import { getAllRecords, putRecord, removeRecord, stores } from '@/database/database'
import type { SyncOperation } from '@/services/sync/sync.types'

export interface SyncAuditEntry {
  id: string
  startedAt: string
  finishedAt: string
  durationMs: number
  attempted: number
  succeeded: number
  failed: number
  movedToDeadLetter: number
  error: string | null
}

export interface SyncDeadLetter {
  id: string
  operation: SyncOperation
  reason: string
  attempts: number
  failedAt: string
}

export async function saveSyncAudit(entry: SyncAuditEntry): Promise<void> {
  await putRecord(stores.syncAudit, entry)
}

export async function listSyncAudit(limit = 20): Promise<SyncAuditEntry[]> {
  const entries = await getAllRecords<SyncAuditEntry>(stores.syncAudit)
  return entries
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, limit)
}

export async function moveToDeadLetter(
  operation: SyncOperation,
  reason: string,
  failedAt = new Date(),
): Promise<void> {
  const record: SyncDeadLetter = {
    id: operation.id,
    operation: {
      ...operation,
      status: 'failed',
      lastError: reason,
      updatedAt: failedAt.toISOString(),
    },
    reason,
    attempts: operation.attempts,
    failedAt: failedAt.toISOString(),
  }

  await putRecord(stores.syncDeadLetters, record)
  await removeRecord(stores.syncQueue, operation.id)
}

export async function listDeadLetters(): Promise<SyncDeadLetter[]> {
  const records = await getAllRecords<SyncDeadLetter>(stores.syncDeadLetters)
  return records.sort((a, b) => b.failedAt.localeCompare(a.failedAt))
}

export async function restoreDeadLetter(id: string): Promise<void> {
  const records = await listDeadLetters()
  const deadLetter = records.find((item) => item.id === id)
  if (!deadLetter) return

  const now = new Date().toISOString()
  await putRecord(stores.syncQueue, {
    ...deadLetter.operation,
    status: 'pending' as const,
    attempts: 0,
    updatedAt: now,
    nextAttemptAt: now,
    lastError: null,
  })
  await removeRecord(stores.syncDeadLetters, id)
}
