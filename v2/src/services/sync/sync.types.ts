export type SyncEntity = 'course' | 'courseSession' | 'exam' | 'grade' | 'file'
export type SyncOperationType = 'upsert' | 'delete'
export type SyncOperationStatus = 'pending' | 'processing' | 'failed'

export interface SyncOperation {
  id: string
  entity: SyncEntity
  entityId: string
  operation: SyncOperationType
  payload: unknown | null
  status: SyncOperationStatus
  attempts: number
  createdAt: string
  updatedAt: string
  nextAttemptAt: string
  lastError: string | null
}

export interface SyncQueueSummary {
  pending: number
  processing: number
  failed: number
  total: number
}
