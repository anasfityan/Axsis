import { getAllRecords, putRecord, removeRecord, stores } from '@/database/database'
import { moveToDeadLetter } from '@/services/sync/sync.reliability'
import { getSyncRetryDecision } from '@/services/sync/sync.retry'
import type {
  SyncEntity,
  SyncOperation,
  SyncOperationStatus,
  SyncOperationType,
  SyncQueueSummary,
} from '@/services/sync/sync.types'

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
  const retry = getSyncRetryDecision(operation.attempts, now)
  const message = error instanceof Error ? error.message : String(error)
  const status: SyncOperationStatus = retry.exhausted ? 'failed' : 'pending'

  const updated: SyncOperation = {
    ...operation,
    status,
    attempts: retry.attempts,
    updatedAt: now.toISOString(),
    nextAttemptAt: retry.nextAttemptAt,
    lastError: message,
  }

  if (retry.exhausted) {
    await moveToDeadLetter(updated, message, now)
    return updated
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
