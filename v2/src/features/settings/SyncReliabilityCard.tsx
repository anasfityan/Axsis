import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, History, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  listDeadLetters,
  listSyncAudit,
  restoreDeadLetter,
  type SyncAuditEntry,
  type SyncDeadLetter,
} from '@/services/sync/sync.reliability'
import { useSyncRuntime } from '@/services/sync/SyncRuntimeProvider'

export function SyncReliabilityCard() {
  const { refreshQueue, runNow } = useSyncRuntime()
  const [audit, setAudit] = useState<SyncAuditEntry[]>([])
  const [deadLetters, setDeadLetters] = useState<SyncDeadLetter[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const [nextAudit, nextDeadLetters] = await Promise.all([
      listSyncAudit(8),
      listDeadLetters(),
    ])
    setAudit(nextAudit)
    setDeadLetters(nextDeadLetters)
  }, [])

  useEffect(() => {
    void refresh().catch((loadError) => {
      console.error(loadError)
      setError('تعذر قراءة سجل المزامنة.')
    })
  }, [refresh])

  async function restore(id: string) {
    try {
      setBusyId(id)
      setError(null)
      await restoreDeadLetter(id)
      await refreshQueue()
      await refresh()
      await runNow()
    } catch (restoreError) {
      console.error(restoreError)
      setError('تعذر إعادة العملية إلى طابور المزامنة.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--surface-3)] p-2 text-[var(--accent)]">
            <History className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>اعتمادية المزامنة</CardTitle>
            <CardDescription>سجل آخر الدورات والعمليات التي توقفت بعد تكرار الفشل.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div> : null}

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold">العمليات المتوقفة</h3>
            <span className="rounded-full bg-[var(--surface-3)] px-3 py-1 text-xs text-[var(--text-secondary)]">{deadLetters.length}</span>
          </div>
          {deadLetters.length === 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text-secondary)]">
              لا توجد عمليات متوقفة. هذا ممتاز، والطابور لم يقرر أخذ إجازة مفتوحة.
            </div>
          ) : (
            <div className="space-y-2">
              {deadLetters.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-bold"><AlertTriangle className="h-4 w-4 text-amber-400" /> {item.operation.entity} · {item.operation.operation}</div>
                    <p className="mt-1 truncate text-xs text-[var(--text-muted)]">{item.operation.entityId}</p>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.reason}</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{item.attempts} محاولات · {formatDate(item.failedAt)}</p>
                  </div>
                  <Button variant="secondary" className="gap-2" disabled={busyId === item.id} onClick={() => void restore(item.id)}>
                    <RotateCcw className="h-4 w-4" />
                    {busyId === item.id ? 'جاري الإعادة…' : 'إعادة المحاولة'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="font-bold">آخر دورات المزامنة</h3>
          {audit.length === 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text-secondary)]">لا يوجد سجل مزامنة بعد.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="bg-[var(--surface-2)] text-[var(--text-secondary)]">
                  <tr>
                    <th className="px-4 py-3 text-start">الوقت</th>
                    <th className="px-4 py-3 text-start">المدة</th>
                    <th className="px-4 py-3 text-start">محاولات</th>
                    <th className="px-4 py-3 text-start">نجح</th>
                    <th className="px-4 py-3 text-start">فشل</th>
                    <th className="px-4 py-3 text-start">متوقفة</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.map((entry) => (
                    <tr key={entry.id} className="border-t border-[var(--border)]">
                      <td className="px-4 py-3">{formatDate(entry.startedAt)}</td>
                      <td className="px-4 py-3">{entry.durationMs} ms</td>
                      <td className="px-4 py-3">{entry.attempted}</td>
                      <td className="px-4 py-3">{entry.succeeded}</td>
                      <td className="px-4 py-3">{entry.failed}</td>
                      <td className="px-4 py-3">{entry.movedToDeadLetter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ar')
}
