import {
  getReadySyncOperations,
  markSyncOperationFailed,
  markSyncOperationProcessing,
  markSyncOperationSucceeded,
} from '@/services/sync/sync.repository'
import { saveSyncAudit } from '@/services/sync/sync.reliability'
import type { SyncOperation } from '@/services/sync/sync.types'

export type SyncOperationHandler = (operation: SyncOperation) => Promise<void>
export type SyncWorkerState = 'idle' | 'running' | 'offline' | 'unconfigured' | 'stopped'

export interface SyncWorkerOptions {
  intervalMs?: number
  batchSize?: number
  onStateChange?: (state: SyncWorkerState) => void
  onQueueChange?: () => void
}

const DEFAULT_INTERVAL_MS = 30_000
const DEFAULT_BATCH_SIZE = 10

export class SyncWorker {
  private timer: number | null = null
  private running = false
  private stopped = true
  private handler: SyncOperationHandler | null = null
  private readonly intervalMs: number
  private readonly batchSize: number
  private readonly onStateChange?: (state: SyncWorkerState) => void
  private readonly onQueueChange?: () => void

  constructor(options: SyncWorkerOptions = {}) {
    this.intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS
    this.batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE
    this.onStateChange = options.onStateChange
    this.onQueueChange = options.onQueueChange
  }

  setHandler(handler: SyncOperationHandler | null): void {
    this.handler = handler
    if (!handler && !this.stopped) this.emitState('unconfigured')
  }

  start(): void {
    if (!this.stopped) return
    this.stopped = false
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
    this.schedule(0)
  }

  stop(): void {
    if (this.stopped) return
    this.stopped = true
    if (this.timer !== null) window.clearTimeout(this.timer)
    this.timer = null
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
    this.emitState('stopped')
  }

  async runNow(): Promise<void> {
    if (this.stopped || this.running) return
    if (!navigator.onLine) {
      this.emitState('offline')
      return
    }
    if (!this.handler) {
      this.emitState('unconfigured')
      return
    }

    this.running = true
    this.emitState('running')

    const startedAt = new Date()
    let attempted = 0
    let succeeded = 0
    let failed = 0
    let movedToDeadLetter = 0
    let cycleError: string | null = null

    try {
      const operations = (await getReadySyncOperations()).slice(0, this.batchSize)
      attempted = operations.length

      for (const operation of operations) {
        const processing = await markSyncOperationProcessing(operation)
        try {
          await this.handler(processing)
          await markSyncOperationSucceeded(processing)
          succeeded += 1
        } catch (error) {
          const updated = await markSyncOperationFailed(processing, error)
          failed += 1
          if (updated.status === 'failed') movedToDeadLetter += 1
        }
        this.onQueueChange?.()
      }
    } catch (error) {
      cycleError = error instanceof Error ? error.message : String(error)
      throw error
    } finally {
      const finishedAt = new Date()
      try {
        await saveSyncAudit({
          id: crypto.randomUUID(),
          startedAt: startedAt.toISOString(),
          finishedAt: finishedAt.toISOString(),
          durationMs: finishedAt.getTime() - startedAt.getTime(),
          attempted,
          succeeded,
          failed,
          movedToDeadLetter,
          error: cycleError,
        })
      } catch (auditError) {
        console.error('Failed to save sync audit.', auditError)
      } finally {
        this.running = false
        this.emitState('idle')
      }
    }
  }

  private schedule(delay = this.intervalMs): void {
    if (this.stopped) return
    if (this.timer !== null) window.clearTimeout(this.timer)
    this.timer = window.setTimeout(() => {
      void this.runNow().catch((error) => {
        console.error('Scheduled sync cycle failed.', error)
      }).finally(() => this.schedule())
    }, delay)
  }

  private readonly handleOnline = (): void => {
    this.schedule(0)
  }

  private readonly handleOffline = (): void => {
    this.emitState('offline')
  }

  private emitState(state: SyncWorkerState): void {
    this.onStateChange?.(state)
  }
}
