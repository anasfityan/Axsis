import { useState } from 'react'
import { Cloud, Laptop, ShieldCheck } from 'lucide-react'
import { Navigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/services/auth/AuthProvider'

export function AuthPage() {
  const { session, loading, continueLocally } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-[var(--background)] text-[var(--text-secondary)]">جاري تجهيز الجلسة…</div>
  }

  if (session) return <Navigate to="/dashboard" replace />

  async function handleLocalSession() {
    try {
      setBusy(true)
      setError(null)
      await continueLocally(displayName)
    } catch (sessionError) {
      console.error(sessionError)
      setError('تعذر بدء الجلسة المحلية.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--text-primary)]">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)] text-2xl font-black text-[#15100a]">A</div>
          <div>
            <p className="mb-2 text-sm font-semibold text-[var(--accent)]">Axsis V2</p>
            <h1 className="text-4xl font-black leading-tight">مساحة دراسة مستقرة تعمل أولًا على جهازك</h1>
            <p className="mt-4 max-w-xl leading-8 text-[var(--text-secondary)]">
              يمكنك البدء محليًا الآن. تسجيل الدخول والمزامنة السحابية سيُفعّلان لاحقًا من خلال طبقة منفصلة، من دون تعطيل بياناتك المحلية.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Feature icon={Laptop} title="يعمل دون إنترنت" />
            <Feature icon={ShieldCheck} title="بيانات محلية أولًا" />
            <Feature icon={Cloud} title="جاهز للسحابة" />
          </div>
        </section>

        <Card className="bg-[var(--surface-1)]">
          <CardHeader>
            <CardTitle>ابدأ على هذا الجهاز</CardTitle>
            <CardDescription>لن يتم إرسال أي بيانات إلى خدمة خارجية.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block space-y-2 text-sm font-semibold">
              <span>الاسم الظاهر</span>
              <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="مثال: أنس" />
            </label>
            {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div> : null}
            <Button className="w-full" disabled={busy} onClick={() => void handleLocalSession()}>
              {busy ? 'جاري البدء…' : 'المتابعة محليًا'}
            </Button>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-7 text-[var(--text-secondary)]">
              إنشاء الحساب وتسجيل الدخول السحابي غير مفعّلين بعد، حتى يتم ربط Firebase وإعداد قواعد الحماية بصورة صحيحة.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function Feature({ icon: Icon, title }: { icon: typeof Laptop; title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm font-semibold">
      <Icon className="h-4 w-4 text-[var(--accent)]" />
      <span>{title}</span>
    </div>
  )
}
