import { describe, expect, it } from 'vitest'

import {
  BASE_SYNC_RETRY_DELAY_MS,
  MAX_SYNC_ATTEMPTS,
  MAX_SYNC_RETRY_DELAY_MS,
  getSyncRetryDecision,
} from '@/services/sync/sync.retry'

describe('getSyncRetryDecision', () => {
  const now = new Date('2026-08-06T04:00:00.000Z')

  it('starts with the base delay', () => {
    const decision = getSyncRetryDecision(0, now)

    expect(decision.attempts).toBe(1)
    expect(decision.delayMs).toBe(BASE_SYNC_RETRY_DELAY_MS)
    expect(decision.exhausted).toBe(false)
    expect(decision.nextAttemptAt).toBe('2026-08-06T04:00:05.000Z')
  })

  it('doubles the delay on each failure', () => {
    expect(getSyncRetryDecision(1, now).delayMs).toBe(10_000)
    expect(getSyncRetryDecision(2, now).delayMs).toBe(20_000)
    expect(getSyncRetryDecision(3, now).delayMs).toBe(40_000)
  })

  it('moves the operation to dead letter at the maximum attempt', () => {
    const decision = getSyncRetryDecision(MAX_SYNC_ATTEMPTS - 1, now)

    expect(decision.attempts).toBe(MAX_SYNC_ATTEMPTS)
    expect(decision.exhausted).toBe(true)
  })

  it('never exceeds the maximum retry delay', () => {
    expect(getSyncRetryDecision(20, now).delayMs).toBe(MAX_SYNC_RETRY_DELAY_MS)
  })
})
