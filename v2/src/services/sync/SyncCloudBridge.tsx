import { useEffect } from 'react'

import { useAuth } from '@/services/auth/AuthProvider'
import { FirestoreCloudAdapter } from '@/services/cloud/firestore-cloud.adapter'
import { toCloudOperation } from '@/services/sync/sync.protocol'
import { useSyncRuntime } from '@/services/sync/SyncRuntimeProvider'

export function SyncCloudBridge() {
  const { session } = useAuth()
  const { setHandler } = useSyncRuntime()

  useEffect(() => {
    if (!session || session.user.mode !== 'cloud') {
      setHandler(null)
      return
    }

    const adapter = new FirestoreCloudAdapter(session.user.id)
    setHandler(async (operation) => {
      const cloudOperation = toCloudOperation(operation, session.user.id)
      const result = await adapter.pushOperations([cloudOperation])
      const rejection = result.rejected.find((item) => item.operationId === operation.id)
      if (rejection) throw new Error(rejection.reason)
      if (!result.acceptedOperationIds.includes(operation.id)) {
        throw new Error('لم يؤكد Firestore حفظ العملية.')
      }
    })

    return () => setHandler(null)
  }, [session, setHandler])

  return null
}
