export const MAX_SYNC_ATTEMPTS = 6
export const BASE_SYNC_RETRY_DELAY_MS = 5_000
export const MAX_SYNC_RETRY_DELAY_MS = 60 * 60 * 1_000

export interface SyncRetryDecision {
  attempts: number
  exhausted: boolean
  delayMs: number
  nextAttemptAt: string
}

export function getSyncRetryDecision(
  previousAttempts: number,
  now = new Date(),
): SyncRetryDecision {
  const attempts = Math.max(0, previousAttempts) + 1
  const delayMs = Math.min(
    BASE_SYNC_RETRY_DELAY_MS * 2 ** Math.max(0, attempts - 1),
    MAX_SYNC_RETRY_DELAY_MS,
  )

  return {
    attempts,
    exhausted: attempts >= MAX_SYNC_ATTEMPTS,
    delayMs,
    nextAttemptAt: new Date(now.getTime() + delayMs).toISOString(),
  }
}
