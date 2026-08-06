import { useCallback, useEffect, useRef, useState } from 'react'
import { Database, Download, Languages, Moon, ShieldCheck, Sun, Upload } from 'lucide-react'

import { useTheme } from '@/app/ThemeProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/i18n/LanguageProvider'
import type { Locale } from '@/types/domain'
import {
  createBackup,
  downloadBackup,
  getLocalCounts,
  importBackup,
  parseBackup,
  type BackupCollections,
} from '@/features/settings/backup'
import { DiagnosticsCard } from '@/features/settings/DiagnosticsCard'
import { SyncQueueCard } from '@/features/settings/SyncQueueCard'
import { SyncReliabilityCard } from '@/features/settings/SyncReliabilityCard'

const countLabels: Record<keyof BackupCollections, string> = {
  courses: 'المواد',
  courseSessions: 'المحاضرات',
  exams: 'الاختبارات',
  grades: 'الدرجات',
  files: 'الملفات',
}

const localeOptions: Array<{ value: Locale; label: string }> = [
  { value: 'ar', label: 'العربية' },
  { value: 'tr', label: 'Türkçe' },
  { value: 'en', label: 'English' },
]

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { locale, setLocale } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [counts, setCounts] = useState<Record<keyof BackupCollections, number> | null>(null)
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const loadStorage = useCallback(async () => {
    setCounts(await getLocalCounts())
    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate()
      setStorage({ usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 })
    }
  }, [])

  useEffect(() => {
    void loadStorage().catch((loadError) => {
      console.error(loadError)
      setError('تعذر قراءة حالة التخزين المحلي.')
    })
  }, [loadStorage])

  async function exportData() {
    try {
      setBusy(true)
      setError(null)
      setStatus(null)
      const backup = await createBackup()
      downloadBackup(backup)
      setStatus('تم إنشاء نسخة احتياطية محلية بنجاح.')
    } catch (exportError) {
      console.error(exportError)
      setError('تعذر إنشاء النسخة الاحتياطية.')
    } finally {
      setBusy(false)
    }
  }

  async function handleImport(file: File) {
    try {
      setBusy(true)
      setError(null)
      setStatus(null)
      const backup = parseBackup(await file.text())
      const confirmed = window.confirm(
        'سيتم دمج بيانات النسخة الاحتياطية مع البيانات الحالية حسب المعرّف. لن تُحذف البيانات الموجودة. هل تريد المتابعة؟',
      )
      if (!confirmed) return
      const imported = await importBackup(backup)
      const total = Object.values(imported).reduce((sum, count) => sum + count, 0)
      setStatus(`تم استيراد ${total} سجلًا بنجاح. أعد فتح الصفحات لرؤية البيانات.`)
      await loadStorage()
    } catch (importError) {
      console.error(importError)
      setError(importError instanceof Error ? importError.message : 'تعذر استيراد النسخة الاحتياطية.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const usagePercent = storage?.quota ? Math.min(100, (storage.usage / storage.quota) * 100) : 0

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-2 text-sm font-medium text-[var(--accent)]">تخصيص وحماية البيانات</p>
        <h1 className="text-3xl font-black tracking-tight">الإعدادات</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          تحكم في اللغة والمظهر والنسخ الاحتياطي المحلي دون ربط استقرار التطبيق بالخدمات السحابية.
        </p>
      </header>

      {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}
      {status ? <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">{status}</div> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[var(--surface-3)] p-2 text-[var(--accent)]"><Languages className="h-5 w-5" /></div>
              <div><CardTitle>اللغة</CardTitle><CardDescription>يتغير اتجاه الواجهة تلقائيًا حسب اللغة.</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-3">
            {localeOptions.map((option) => (
              <Button
                key={option.value}
                variant={locale === option.value ? 'primary' : 'secondary'}
                onClick={() => setLocale(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[var(--surface-3)] p-2 text-[var(--accent)]">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </div>
              <div><CardTitle>المظهر</CardTitle><CardDescription>هوية واحدة بوضعين متناسقين.</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <Button variant={theme === 'dark' ? 'primary' : 'secondary'} onClick={() => setTheme('dark')} className="gap-2"><Moon className="h-4 w-4" /> داكن</Button>
            <Button variant={theme === 'light' ? 'primary' : 'secondary'} onClick={() => setTheme('light')} className="gap-2"><Sun className="h-4 w-4" /> فاتح</Button>
          </CardContent>
        </Card>
      </div>

      <DiagnosticsCard />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[var(--surface-3)] p-2 text-[var(--accent)]"><Database className="h-5 w-5" /></div>
            <div><CardTitle>التخزين المحلي</CardTitle><CardDescription>البيانات محفوظة داخل IndexedDB على هذا الجهاز.</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(countLabels).map(([key, label]) => (
              <div key={key} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
                <p className="mt-1 text-2xl font-black">{counts?.[key as keyof BackupCollections] ?? '—'}</p>
              </div>
            ))}
          </div>
          {storage ? (
            <div>
              <div className="mb-2 flex justify-between text-xs text-[var(--text-secondary)]">
                <span>{formatBytes(storage.usage)} مستخدم</span>
                <span>{formatBytes(storage.quota)} متاح تقريبًا</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${usagePercent}%` }} />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[var(--surface-3)] p-2 text-[var(--accent)]"><ShieldCheck className="h-5 w-5" /></div>
            <div><CardTitle>النسخ الاحتياطي والاستعادة</CardTitle><CardDescription>التصدير يشمل المواد والمحاضرات والاختبارات والدرجات والملفات.</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => void exportData()} disabled={busy} className="gap-2"><Download className="h-4 w-4" /> تصدير نسخة JSON</Button>
          <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={busy} className="gap-2"><Upload className="h-4 w-4" /> استيراد ودمج نسخة</Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleImport(file)
            }}
          />
        </CardContent>
      </Card>

      <SyncQueueCard />
      <SyncReliabilityCard />

      <Card>
        <CardHeader><CardTitle>المزامنة السحابية</CardTitle><CardDescription>Firestone مهيأة للحسابات السحابية عند توفير إعداد Firebase.</CardDescription></CardHeader>
        <CardContent className="text-sm leading-7 text-[var(--text-secondary)]">
          تعمل البيانات محليًا أولًا، ثم تُرفع وتُنزل تدريجيًا عبر Firestore. يبقى Google Drive مخصصًا للملفات والنسخ الاحتياطية الاختيارية، ولا يمنع فشل أي خدمة سحابية استخدام التطبيق محليًا.
        </CardContent>
      </Card>
    </div>
  )
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`
  if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(1)} MB`
  return `${(value / 1024 ** 3).toFixed(1)} GB`
}
