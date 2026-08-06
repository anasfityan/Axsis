import type { CloudChange } from '@/services/cloud/cloud.types'

export type ConflictResolution = 'remote-newer' | 'local-newer'

export interface ConflictDecision {
  shouldApplyRemote: boolean
  hasConflict: boolean
  resolution: ConflictResolution
}

export function decideCloudChange(
  change: CloudChange,
  local: Record<string, unknown> | undefined,
): ConflictDecision {
  if (!local) {
    return { shouldApplyRemote: true, hasConflict: false, resolution: 'remote-newer' }
  }

  const localVersion = readFiniteNumber(local.version)
  if (change.recordVersion !== localVersion) {
    const remoteWins = change.recordVersion > localVersion
    return {
      shouldApplyRemote: remoteWins,
      hasConflict: false,
      resolution: remoteWins ? 'remote-newer' : 'local-newer',
    }
  }

  const localUpdatedAt = readString(local.updatedAt)
  const remoteWins = change.updatedAt > localUpdatedAt
  const sameTimestamp = change.updatedAt === localUpdatedAt
  const hasConflict = Boolean(localUpdatedAt)
    && !sameTimestamp
    && (Boolean(change.deletedAt) || !payloadsEqual(local, change.payload))

  return {
    shouldApplyRemote: remoteWins,
    hasConflict,
    resolution: remoteWins ? 'remote-newer' : 'local-newer',
  }
}

function payloadsEqual(local: Record<string, unknown>, remote: unknown): boolean {
  return stableSerialize(cleanMetadata(local)) === stableSerialize(remote)
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
