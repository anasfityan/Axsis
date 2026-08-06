import { useCallback, useMemo, useState } from 'react'
import { Cloud, Download, RefreshCw, Trash2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createBackup, importBackup, validateAxsisBackup } from '@/features/settings/backup'
import { GoogleDriveBackupAdapter } from '@/services/backup/google-drive-backup.adapter'
import { createGoogleDriveTokenProvider } from '@/services/backup/google-oauth-token.provider'
import type { StoredBackupSummary } from '@/services/backup/backup-storage.types'

export function GoogleDriveBackupCard() {
  const tokenProvider = useMemo(
    () => createGoogleDriveTokenProvider(import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID ?? ''),
    [],
  )
  const adapter = useMemo(
    () => new GoogleDriveBackupAdapter(() => tokenProvider.getAccessToken()),
    [tokenProvider],
  )
  const [backups, setBackups] = useState<StoredBackupSummary[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const latestBackup = backups[0] ?? null
  const totalSize = backups.reduce((sum, backup) => sum + backup.sizeBytes, 0)
  const deviceCount = new Set(backups.map((backup) => backup.deviceId)).size

  const refresh = useCallback(async () => {
    if (!tokenProvider.configured) return
    try {
      setBusy(true)
      setError(null)
      setBackups(await adapter.listBackups())
    } catch (refreshError) {
      setError(toMessage(refreshError, 'تعذر قراءة نسخ Google Drive.'))
    } finally {
      setBusy(false)
    }
  }, [adapter, tokenProvider])

  async function upload() {
    try {
      setBusy(true)
      setError(null)
      setMessage(null)
      const backup = await createBackup()
      const fileName = `axsis-backup-${backup.metadata.createdAt.replaceAll(':', '-')}.json`
      await adapter.uploadBackup(backup, fileName)
      setBackups(await adapter.listBackups())
      setMessage('تم رفع نسخة احتياطية موثّقة إلى Google Drive.')
    } catch (uploadError) {
      setError(toMessage(uploadError, 'تعذر رفع النسخة إلى Google Drive.'))
    } finally {
      setBusy(false)
    }
  }

  async function restore(item: StoredBackupSummary) {
    const confirmed = window.confirm(
      `سيتم دمج النسخة «${item.name}» مع البيانات الحالية بعد التحقق من سلامتها. هل تريد المتابعة؟`,
    )
    if (!confirmed) return

    try {
      setBusy(true)
      setError(null)
      setMessage(null)
      const backup = validateAxsisBackup(await adapter.downloadBackup(item.id))
      const imported = await importBackup(backup)
      const total = Object.values(imported).reduce((sum, count) => sum + count, 0)
      window.dispatchEvent(new CustomEvent('axsis:data-changed', { detail: { source: 'google-drive-restore' } }))
      setMessage(`تمت استعادة ودمج ${total} سجلًا من Google Drive.`)
    } catch (restoreError) {
      setError(toMessage(restoreError, 'تعذر استعادة النسخة من Google Drive.'))
    } finally {
      setBusy(false)
    }
  }

  async function remove(item: StoredBackupSummary) {
    if (!window.confirm(`حذف النسخة «${item.name}» نهائيًا من Google Drive؟`)) return

    try {
      setBusy(true)
      setError(null)
      await adapter.deleteBackup(item.id)
      setBackups((current) => current.filter((backup) => backup.id !== item.id))
      setMessage('تم حذف النسخة من Google Drive.')
    } catch (deleteError) {
      setError(toMessage(deleteError, 'تعذر حذف النسخة من Google Drive.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[var(--surface-3)] p-2 text-[var(--accent)]"><Cloud className="h-5 w-5" /></div>
            <div>
              <CardTitle>Google Drive</CardTitle>
              <CardDescription>نسخ خاصة بالتطبيق داخل appDataFolder ولا تظهر ضمن ملفات Drive العادية.</CardDescription>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void refresh()} disabled={busy || !tokenProvider.configured} className="gap-2">
            <RefreshCw className="h-4 w-4" /> تحديث
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!tokenProvider.configured ? (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
            أضف VITE_GOOGLE_OAUTH_CLIENT_ID إلى ملف البيئة لتفعيل Google Drive.
          </div>
        ) : null}
        {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div> : null}
        {message ? <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">{message}</div> : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryItem label="عدد النسخ" value={String(backups.length)} />
          <SummaryItem label="الحجم الإجمالي" value={formatBytes(totalSize)} />
          <SummaryItem label="عدد الأجهزة" value={String(deviceCount)} />
          <SummaryItem
            label="آخر نسخة"
            value={latestBackup ? formatDate(latestBackup.createdAt) : 'لا توجد'}
          />
        </div>

        {latestBackup ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm">
            <p className="font-bold">آخر نسخة موثّقة</p>
            <p className="mt-2 text-[var(--text-secondary)]">
              {latestBackup.name} · إصدار {latestBackup.appVersion} · الجهاز {latestBackup.deviceId}
            </p>
          </div>
        ) : null}

        <Button onClick={() => void upload()} disabled={busy || !tokenProvider.configured} className="gap-2">
          <Upload className="h-4 w-4" /> رفع نسخة جديدة
        </Button>

        {backups.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">لا توجد نسخ محمّلة في هذه الجلسة. اضغط تحديث لقراءة النسخ من Drive.</p>
        ) : (
          <div className="space-y-2">
            {backups.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {formatDate(item.createdAt)} · {formatBytes(item.sizeBytes)} · إصدار {item.appVersion} · الجهاز {item.deviceId}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => void restore(item)} disabled={busy} className="gap-2">
                    <Download className="h-4 w-4" /> استعادة
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void remove(item)} disabled={busy} className="gap-2 text-red-300">
                    <Trash2 className="h-4 w-4" /> حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  )
}

function toMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('ar')
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 ** 2).toFixed(1)} MB`
}
