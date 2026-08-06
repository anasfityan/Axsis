import { describe, expect, it } from 'vitest'

import type { CloudChange } from '@/services/cloud/cloud.types'
import { decideCloudChange } from '@/services/sync/conflict.policy'

function change(overrides: Partial<CloudChange> = {}): CloudChange {
  return {
    changeId: 'change-1',
    entity: 'course',
    entityId: 'course-1',
    payload: { id: 'course-1', name: 'Remote' },
    deletedAt: null,
    recordVersion: 2,
    updatedAt: '2026-08-06T10:00:00.000Z',
    deviceId: 'device-2',
    ...overrides,
  }
}

describe('decideCloudChange', () => {
  it('applies a remote record when no local record exists', () => {
    expect(decideCloudChange(change(), undefined)).toEqual({
      shouldApplyRemote: true,
      hasConflict: false,
      resolution: 'remote-newer',
    })
  })

  it('rejects an older remote version without creating a conflict', () => {
    const local = { id: 'course-1', name: 'Local', version: 3, updatedAt: '2026-08-06T09:00:00.000Z' }

    expect(decideCloudChange(change({ recordVersion: 2 }), local)).toEqual({
      shouldApplyRemote: false,
      hasConflict: false,
      resolution: 'local-newer',
    })
  })

  it('applies a newer remote version without creating a conflict', () => {
    const local = { id: 'course-1', name: 'Local', version: 1, updatedAt: '2026-08-06T09:00:00.000Z' }

    expect(decideCloudChange(change({ recordVersion: 2 }), local)).toEqual({
      shouldApplyRemote: true,
      hasConflict: false,
      resolution: 'remote-newer',
    })
  })

  it('records a conflict when equal versions have different content', () => {
    const local = { id: 'course-1', name: 'Local', version: 2, updatedAt: '2026-08-06T09:00:00.000Z' }

    expect(decideCloudChange(change(), local)).toEqual({
      shouldApplyRemote: true,
      hasConflict: true,
      resolution: 'remote-newer',
    })
  })

  it('does not create a conflict when equal versions and payloads match', () => {
    const local = { id: 'course-1', name: 'Remote', version: 2, updatedAt: '2026-08-06T09:00:00.000Z' }

    expect(decideCloudChange(change(), local)).toEqual({
      shouldApplyRemote: true,
      hasConflict: false,
      resolution: 'remote-newer',
    })
  })

  it('records a delete conflict and keeps the newer local record', () => {
    const local = { id: 'course-1', name: 'Local', version: 2, updatedAt: '2026-08-06T11:00:00.000Z' }

    expect(decideCloudChange(change({ payload: null, deletedAt: '2026-08-06T10:00:00.000Z' }), local)).toEqual({
      shouldApplyRemote: false,
      hasConflict: true,
      resolution: 'local-newer',
    })
  })
})
