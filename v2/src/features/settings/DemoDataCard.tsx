import { useState } from 'react'
import { DatabaseZap, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { clearDemoData, loadDemoData } from '@/database/demoData'
import { useLanguage } from '@/i18n/LanguageProvider'

const copy = {
  ar: {
    title: 'بيانات العرض التجريبية',
    description: 'املأ النظام ببيانات مترابطة لتقييم التصميم والوظائف قبل إدخال بياناتك الحقيقية.',
    load: 'تحميل البيانات التجريبية',
    clear: 'حذف البيانات التجريبية',
    loaded: 'تمت إضافة مواد ومحاضرات واختبارات ودرجات وملفات تجريبية. افتح الرئيسية أو أي قسم لرؤيتها.',
    loadError: 'تعذر إضافة البيانات التجريبية.',
    confirm: 'حذف جميع البيانات التجريبية؟ لن تتأثر بياناتك التي أضفتها بنفسك.',
    cleared: 'تم حذف البيانات التجريبية.',
    clearError: 'تعذر حذف البيانات التجريبية.',
  },
  en: {
    title: 'Demo data',
    description: 'Fill the system with connected sample data to evaluate the design and features before entering real data.',
    load: 'Load demo data',
    clear: 'Remove demo data',
    loaded: 'Demo courses, classes, exams, grades, and files were added. Open the dashboard or any section to view them.',
    loadError: 'Could not add demo data.',
    confirm: 'Remove all demo data? Data you added yourself will not be affected.',
    cleared: 'Demo data was removed.',
    clearError: 'Could not remove demo data.',
  },
  tr: {
    title: 'Demo verileri',
    description: 'Gerçek verilerinizi girmeden önce tasarımı ve özellikleri değerlendirmek için sistemi bağlantılı örnek verilerle doldurun.',
    load: 'Demo verilerini yükle',
    clear: 'Demo verilerini sil',
    loaded: 'Demo dersler, ders saatleri, sınavlar, notlar ve dosyalar eklendi. Görmek için ana sayfayı veya herhangi bir bölümü açın.',
    loadError: 'Demo verileri eklenemedi.',
    confirm: 'Tüm demo verileri silinsin mi? Kendi eklediğiniz veriler etkilenmez.',
    cleared: 'Demo verileri silindi.',
    clearError: 'Demo verileri silinemedi.',
  },
} as const

export function DemoDataCard() {
  const { locale } = useLanguage()
  const text = copy[locale]
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      setBusy(true)
      setMessage(null)
      setError(null)
      await loadDemoData(locale)
      setMessage(text.loaded)
    } catch (loadError) {
      console.error(loadError)
      setError(text.loadError)
    } finally {
      setBusy(false)
    }
  }

  async function clear() {
    if (!window.confirm(text.confirm)) return
    try {
      setBusy(true)
      setMessage(null)
      setError(null)
      await clearDemoData()
      setMessage(text.cleared)
    } catch (clearError) {
      console.error(clearError)
      setError(text.clearError)
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
            <CardTitle>{text.title}</CardTitle>
            <CardDescription>{text.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {message ? <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600">{message}</div> : null}
        {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">{error}</div> : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => void load()} disabled={busy} className="gap-2"><DatabaseZap className="h-4 w-4" /> {text.load}</Button>
          <Button variant="secondary" onClick={() => void clear()} disabled={busy} className="gap-2"><Trash2 className="h-4 w-4" /> {text.clear}</Button>
        </div>
      </CardContent>
    </Card>
  )
}
