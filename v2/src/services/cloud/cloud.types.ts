import type { DeviceIdentity } from '@/services/device/device'
import type { SyncEntity, SyncOperationType } from '@/services/sync/sync.types'

export interface CloudOperation {
  operationId: string
  userId: string
  device: DeviceIdentity
  entity: SyncEntity
  entityId: string
  operation: SyncOperationType
  payload: unknown | null
  recordVersion: number
  occurredAt: string
}

export interface CloudChange {
  changeId: string
  entity: SyncEntity
  entityId: string
  payload: unknown | null
  deletedAt: string | null
  recordVersion: number
  updatedAt: string
  deviceId: string
}

export interface PushResult {
  acceptedOperationIds: string[]
  rejected: Array<{ operationId: string; reason: string }>
  serverCursor: string | null
}

export interface PullResult {
  changes: CloudChange[]
  nextCursor: string | null
}

export interface CloudHealth {
  reachable: boolean
  authenticated: boolean
  provider: string
}

export interface CloudAdapter {
  readonly provider: string
  checkHealth(): Promise<CloudHealth>
  pushOperations(operations: CloudOperation[]): Promise<PushResult>
  pullChanges(cursor: string | null): Promise<PullResult>
}
