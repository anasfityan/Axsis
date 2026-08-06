import type { CloudOperation } from '@/services/cloud/cloud.types'
import { getDeviceIdentity } from '@/services/device/device'
import type { SyncOperation } from '@/services/sync/sync.types'

export function toCloudOperation(operation: SyncOperation, userId: string): CloudOperation {
  return {
    operationId: operation.id,
    userId,
    device: getDeviceIdentity(),
    entity: operation.entity,
    entityId: operation.entityId,
    operation: operation.operation,
    payload: operation.payload,
    recordVersion: readRecordVersion(operation.payload),
    occurredAt: operation.updatedAt,
  }
}

function readRecordVersion(payload: unknown): number {
  if (!payload || typeof payload !== 'object') return 1
  const version = Reflect.get(payload, 'version')
  return typeof version === 'number' && Number.isFinite(version) && version > 0 ? version : 1
}
