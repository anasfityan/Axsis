import { getAllRecords, putRecord, removeRecord, stores } from '@/database/database'
import type {
  SyncEntity,
  SyncOperation,
  SyncOperationStatus,
  SyncOperationType,
  SyncQueueSummary,
} from '@/services/sync/sync.types'

const MAX_ATTEMPTS = 6
const BASE_RETRY_DELAY_MS = 5_000

export async function enqueueSyncOperation(
  entity: SyncEntity,
  entityId: string,
  operation: SyncOperationType,
  payload: unknown | null,
): Promise<SyncOperation> {
  const now = new Date().toISOString()
  const existing = (await listSyncOperations()).find(
    (item) => item.entity === entity && item.entityId === entityId && item.status !== 'processing',
  )

  const record: SyncOperation = {
    id: existing?.id ?? crypto.randomUUID(),
    entity,
    entityId,
    operation,
    payload,
    status: 'pending',
    attempts: existing?.attempts ?? 0,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    nextAttemptAt: now,
    lastError: null,
  }

  await putRecord(stores.syncQueue, record)
  return record
}

export async function listSyncOperations(): Promise<SyncOperation[]> {
  const operations = await getAllRecords<SyncOperation>(stores.syncQueue)
  return operations.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function getReadySyncOperations(now = new Date()): Promise<SyncOperation[]> {
  const nowTime = now.getTime()
  return (await listSyncOperations()).filter(
    (item) => item.status !== 'processing' && new Date(item.nextAttemptAt).getTime() <= nowTime,
  )
}

export async function markSyncOperationProcessing(operation: SyncOperation): Promise<SyncOperation> {
  return updateStatus(operation, 'processing', null, operation.attempts)
}

export async function markSyncOperationSucceeded(operation: SyncOperation): Promise<void> {
  await removeRecord(stores.syncQueue, operation.id)
}

export async function markSyncOperationFailed(
  operation: SyncOperation,
  error: unknown,
  now = new Date(),
): Promise<SyncOperation> {
  const attempts = operation.attempts + 1
  const status: SyncOperationStatus = attempts >= MAX_ATTEMPTS ? 'failed' : 'pending'
  const delay = Math.min(BASE_RETRY_DELAY_MS * 2 ** Math.max(0, attempts - 1), 60 * 60 * 1_000)
  const nextAttemptAt = new Date(now.getTime() + delay).toISOString()
  const message = error instanceof Error ? error.message : String(error)

  const updated: SyncOperation = {
    ...operation,
    status,
    attempts,
    updatedAt: now.toISOString(),
    nextAttemptAt,
    lastError: message,
  }
  await putRecord(stores.syncQueue, updated)
  return updated
}

export async function retryFailedSyncOperations(): Promise<void> {
  const now = new Date().toISOString()
  const operations = await listSyncOperations()
  await Promise.all(
    operations
      .filter((item) => item.status === 'failed')
      .map((item) => putRecord(stores.syncQueue, {
        ...item,
        status: 'pending' as const,
        attempts: 0,
        updatedAt: now,
        nextAttemptAt: now,
        lastError: null,
      })),
  )
}

export async function clearSyncQueue(): Promise<void> {
  const operations = await listSyncOperations()
  await Promise.all(operations.map((item) => removeRecord(stores.syncQueue, item.id)))
}

export async function getSyncQueueSummary(): Promise<SyncQueueSummary> {
  const operations = await listSyncOperations()
  return {
    pending: operations.filter((item) => item.status === 'pending').length,
    processing: operations.filter((item) => item.status === 'processing').length,
    failed: operations.filter((item) => item.status === 'failed').length,
    total: operations.length,
  }
}

async function updateStatus(
  operation: SyncOperation,
  status: SyncOperationStatus,
  lastError: string | null,
  attempts: number,
): Promise<SyncOperation> {
  const updated: SyncOperation = {
    ...operation,
    status,
    attempts,
    updatedAt: new Date().toISOString(),
    lastError,
  }
  await putRecord(stores.syncQueue, updated)
  return updated
}
