import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, CloudOff, RefreshCw, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getSyncQueueSummary,
  listSyncOperations,
  retryFailedSyncOperations,
} from '@/services/sync/sync.repository'
import type { SyncOperation, SyncQueueSummary } from '@/services/sync/sync.types'

const emptySummary: SyncQueueSummary = { pending: 0, processing: 0, failed: 0, total: 0 }

export function SyncQueueCard() {
  const [summary, setSummary] = useState<SyncQueueSummary>(emptySummary)
  const [recentFailures, setRecentFailures] = useState<SyncOperation[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [nextSummary, operations] = await Promise.all([
      getSyncQueueSummary(),
      listSyncOperations(),
    ])
    setSummary(nextSummary)
    setRecentFailures(operations.filter((item) => item.status === 'failed').slice(-3).reverse())
  }, [])

  useEffect(() => {
    void load().catch((loadError) => {
      console.error(loadError)
      setError('تعذر قراءة طابور المزامنة المحلي.')
    })
  }, [load])

  async function retryFailed() {
    try {
      setBusy(true)
      setError(null)
      await retryFailedSyncOperations()
      await load()
    } catch (retryError) {
      console.error(retryError)
      setError('تعذرت إعادة تهيئة العمليات الفاشلة.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--surface-3)] p-2 text-[var(--accent)]">
            <CloudOff className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>طابور المزامنة المحلي</CardTitle>
            <CardDescription>
              يحفظ التغييرات بأمان حتى تصبح الخدمة السحابية متاحة.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-4">
          <QueueMetric label="الكل" value={summary.total} />
          <QueueMetric label="بانتظار المزامنة" value={summary.pending} />
          <QueueMetric label="قيد المعالجة" value={summary.processing} />
          <QueueMetric label="فشل نهائيًا" value={summary.failed} danger={summary.failed > 0} />
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold">
              {summary.total === 0 ? 'لا توجد تغييرات معلقة' : `${summary.total} عملية محفوظة محليًا`}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
              عدم وجود اتصال أو حساب سحابي لا يمنع إضافة البيانات أو تعديلها على هذا الجهاز.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => void load()} disabled={busy}>
              <RefreshCw className="h-4 w-4" /> تحديث
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void retryFailed()}
              disabled={busy || summary.failed === 0}
            >
              <RotateCcw className="h-4 w-4" /> إعادة محاولة الفاشل
            </Button>
          </div>
        </div>

        {recentFailures.length > 0 ? (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-bold text-red-300">
              <AlertTriangle className="h-4 w-4" /> آخر العمليات الفاشلة
            </p>
            {recentFailures.map((operation) => (
              <div key={operation.id} className="rounded-xl border border-red-500/15 bg-red-500/5 p-3 text-xs">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-bold">{operation.entity} · {operation.operation}</span>
                  <span className="text-[var(--text-muted)]">{operation.attempts} محاولات</span>
                </div>
                <p className="mt-1 break-words text-red-300/90">{operation.lastError ?? 'خطأ غير معروف'}</p>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function QueueMetric({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className={`mt-1 text-2xl font-black ${danger ? 'text-red-300' : ''}`}>{value}</p>
    </div>
  )
}
