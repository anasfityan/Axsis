import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  where,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore'

import type {
  CloudAdapter,
  CloudChange,
  CloudHealth,
  CloudOperation,
  PullResult,
  PushResult,
} from '@/services/cloud/cloud.types'
import { getFirebaseServices } from '@/services/cloud/firebase.client'

const MAX_PULL_CHANGES = 100

export class FirestoreCloudAdapter implements CloudAdapter {
  readonly provider = 'firestore'
  private readonly firestore: Firestore
  private readonly userId: string

  constructor(userId: string) {
    const services = getFirebaseServices()
    if (!services) throw new Error('إعداد Firebase غير مكتمل.')
    if (!userId.trim()) throw new Error('لا يمكن تشغيل المزامنة دون مستخدم سحابي.')

    this.firestore = services.firestore
    this.userId = userId
  }

  async checkHealth(): Promise<CloudHealth> {
    const services = getFirebaseServices()
    return {
      reachable: navigator.onLine,
      authenticated: services?.auth.currentUser?.uid === this.userId,
      provider: this.provider,
    }
  }

  async pushOperations(operations: CloudOperation[]): Promise<PushResult> {
    const acceptedOperationIds: string[] = []
    const rejected: Array<{ operationId: string; reason: string }> = []

    for (const operation of operations) {
      if (operation.userId !== this.userId) {
        rejected.push({ operationId: operation.operationId, reason: 'user-mismatch' })
        continue
      }

      try {
        await this.pushOperation(operation)
        acceptedOperationIds.push(operation.operationId)
      } catch (error) {
        rejected.push({
          operationId: operation.operationId,
          reason: error instanceof Error ? error.message : 'unknown-firestore-error',
        })
      }
    }

    return {
      acceptedOperationIds,
      rejected,
      serverCursor: new Date().toISOString(),
    }
  }

  async pullChanges(cursor: string | null): Promise<PullResult> {
    const changesRef = collection(this.firestore, 'users', this.userId, 'changes')
    const constraints = cursor
      ? [where('updatedAt', '>', cursor), orderBy('updatedAt', 'asc'), limit(MAX_PULL_CHANGES)]
      : [orderBy('updatedAt', 'asc'), limit(MAX_PULL_CHANGES)]
    const snapshot = await getDocs(query(changesRef, ...constraints))
    const changes = snapshot.docs.map((changeDoc) => toCloudChange(changeDoc.id, changeDoc.data()))

    return {
      changes,
      nextCursor: changes.at(-1)?.updatedAt ?? cursor,
    }
  }

  private async pushOperation(operation: CloudOperation): Promise<void> {
    const operationRef = doc(
      this.firestore,
      'users',
      this.userId,
      'operations',
      operation.operationId,
    )
    const recordRef = doc(
      this.firestore,
      'users',
      this.userId,
      'records',
      `${operation.entity}__${operation.entityId}`,
    )
    const changeRef = doc(
      this.firestore,
      'users',
      this.userId,
      'changes',
      operation.operationId,
    )

    await runTransaction(this.firestore, async (transaction) => {
      const existingOperation = await transaction.get(operationRef)
      if (existingOperation.exists()) return

      const currentRecord = await transaction.get(recordRef)
      const currentVersion = currentRecord.exists()
        ? readFiniteNumber(currentRecord.data().recordVersion)
        : 0
      const currentUpdatedAt = currentRecord.exists()
        ? readString(currentRecord.data().updatedAt)
        : ''
      const shouldApply = operation.recordVersion > currentVersion
        || (operation.recordVersion === currentVersion && operation.occurredAt >= currentUpdatedAt)

      transaction.set(operationRef, {
        ...operation,
        receivedAt: new Date().toISOString(),
      })

      if (!shouldApply) return

      const deletedAt = operation.operation === 'delete' ? operation.occurredAt : null
      const record = {
        entity: operation.entity,
        entityId: operation.entityId,
        payload: operation.operation === 'delete' ? null : operation.payload,
        deletedAt,
        recordVersion: operation.recordVersion,
        updatedAt: operation.occurredAt,
        deviceId: operation.device.id,
        operationId: operation.operationId,
      }

      transaction.set(recordRef, record)
      transaction.set(changeRef, record)
    })
  }
}

function toCloudChange(changeId: string, data: DocumentData): CloudChange {
  return {
    changeId,
    entity: data.entity,
    entityId: readString(data.entityId),
    payload: data.payload ?? null,
    deletedAt: typeof data.deletedAt === 'string' ? data.deletedAt : null,
    recordVersion: readFiniteNumber(data.recordVersion) || 1,
    updatedAt: readString(data.updatedAt),
    deviceId: readString(data.deviceId),
  }
}

function readFiniteNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
