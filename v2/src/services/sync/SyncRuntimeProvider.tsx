import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { getSyncQueueSummary } from '@/services/sync/sync.repository'
import { SyncWorker, type SyncOperationHandler, type SyncWorkerState } from '@/services/sync/sync.worker'
import type { SyncQueueSummary } from '@/services/sync/sync.types'

interface SyncRuntimeContextValue {
  online: boolean
  workerState: SyncWorkerState
  queue: SyncQueueSummary
  runNow: () => Promise<void>
  refreshQueue: () => Promise<void>
  setHandler: (handler: SyncOperationHandler | null) => void
}

const emptyQueue: SyncQueueSummary = { pending: 0, processing: 0, failed: 0, total: 0 }
const SyncRuntimeContext = createContext<SyncRuntimeContextValue | null>(null)

export function SyncRuntimeProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(() => navigator.onLine)
  const [workerState, setWorkerState] = useState<SyncWorkerState>('stopped')
  const [queue, setQueue] = useState<SyncQueueSummary>(emptyQueue)
  const workerRef = useRef<SyncWorker | null>(null)

  const refreshQueue = useCallback(async (): Promise<void> => {
    setQueue(await getSyncQueueSummary())
  }, [])

  useEffect(() => {
    const worker = new SyncWorker({
      onStateChange: setWorkerState,
      onQueueChange: () => void refreshQueue(),
    })
    workerRef.current = worker

    const updateOnline = () => setOnline(navigator.onLine)
    window.addEventListener('online', updateOnline)
    window.addEventListener('offline', updateOnline)
    worker.start()
    void refreshQueue()

    return () => {
      window.removeEventListener('online', updateOnline)
      window.removeEventListener('offline', updateOnline)
      worker.stop()
      workerRef.current = null
    }
  }, [refreshQueue])

  const value = useMemo<SyncRuntimeContextValue>(() => ({
    online,
    workerState,
    queue,
    runNow: async () => {
      await workerRef.current?.runNow()
      await refreshQueue()
    },
    refreshQueue,
    setHandler: (handler) => workerRef.current?.setHandler(handler),
  }), [online, queue, refreshQueue, workerState])

  return <SyncRuntimeContext.Provider value={value}>{children}</SyncRuntimeContext.Provider>
}

export function useSyncRuntime(): SyncRuntimeContextValue {
  const context = useContext(SyncRuntimeContext)
  if (!context) throw new Error('useSyncRuntime must be used inside SyncRuntimeProvider')
  return context
}
