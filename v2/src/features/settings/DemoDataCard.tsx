import { useState } from 'react'
import { DatabaseZap, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { clearDemoData, loadDemoData } from '@/database/demoData'

export function DemoDataCard() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      setBusy(true)
      setMessage(null)
      setError(null)
      await loadDemoData()
      setMessage('تمت إضافة مواد ومحاضرات واختبارات ودرجات وملفات تجريبية. افتح الرئيسية أو أي قسم لرؤيتها.')
    } catch (loadError) {
      console.error(loadError)
      setError('تعذر إضافة البيانات التجريبية.')
    } finally {
      setBusy(false)
    }
  }

  async function clear() {
    if (!window.confirm('حذف جميع البيانات التجريبية؟ لن تتأثر بياناتك التي أضفتها بنفسك.')) return
    try {
      setBusy(true)
      setMessage(null)
      setError(null)
      await clearDemoData()
      setMessage('تم حذف البيانات التجريبية.')
    } catch (clearError) {
      console.error(clearError)
      setError('تعذر حذف البيانات التجريبية.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--surface-3)] p-2 text-[var(--accent)]"><DatabaseZap className="h-5 w-5" /></div>
          <div>
            <CardTitle>بيانات العرض التجريبية</CardTitle>
            <CardDescription>املأ النظام ببيانات مترابطة لتقييم التصميم والوظائف قبل إدخال بياناتك الحقيقية.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {message ? <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600">{message}</div> : null}
        {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">{error}</div> : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => void load()} disabled={busy} className="gap-2"><DatabaseZap className="h-4 w-4" /> تحميل البيانات التجريبية</Button>
          <Button variant="secondary" onClick={() => void clear()} disabled={busy} className="gap-2"><Trash2 className="h-4 w-4" /> حذف البيانات التجريبية</Button>
        </div>
      </CardContent>
    </Card>
  )
}
