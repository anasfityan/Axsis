import { useEffect } from 'react'

import { useAuth } from '@/services/auth/AuthProvider'
import { FirestoreCloudAdapter } from '@/services/cloud/firestore-cloud.adapter'
import { toCloudOperation } from '@/services/sync/sync.protocol'
import { pullAndApplyCloudChanges } from '@/services/sync/remote-sync'
import { useSyncRuntime } from '@/services/sync/SyncRuntimeProvider'

const PULL_INTERVAL_MS = 60_000

export function SyncCloudBridge() {
  const { session } = useAuth()
  const { setHandler } = useSyncRuntime()

  useEffect(() => {
    if (!session || session.user.mode !== 'cloud') {
      setHandler(null)
      return
    }

    const userId = session.user.id
    const adapter = new FirestoreCloudAdapter(userId)
    let pulling = false

    const pull = async (): Promise<void> => {
      if (pulling || !navigator.onLine) return
      pulling = true
      try {
        await pullAndApplyCloudChanges(adapter, userId)
      } catch (error) {
        console.error('Unable to pull Firestore changes.', error)
      } finally {
        pulling = false
      }
    }

    setHandler(async (operation) => {
      const cloudOperation = toCloudOperation(operation, userId)
      const result = await adapter.pushOperations([cloudOperation])
      const rejection = result.rejected.find((item) => item.operationId === operation.id)
      if (rejection) throw new Error(rejection.reason)
      if (!result.acceptedOperationIds.includes(operation.id)) {
        throw new Error('لم يؤكد Firestore حفظ العملية.')
      }
      await pull()
    })

    const handleOnline = () => void pull()
    window.addEventListener('online', handleOnline)
    const interval = window.setInterval(() => void pull(), PULL_INTERVAL_MS)
    void pull()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.clearInterval(interval)
      setHandler(null)
    }
  }, [session, setHandler])

  return null
}
