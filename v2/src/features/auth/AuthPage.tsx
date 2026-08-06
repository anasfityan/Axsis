import { useState } from 'react'
import { Cloud, Laptop, ShieldCheck } from 'lucide-react'
import { Navigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/services/auth/AuthProvider'

export function AuthPage() {
  const { session, loading, cloudConfigured, continueLocally, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  async function handleCloudSession() {
    try {
      setBusy(true)
      setError(null)
      if (mode === 'signup') {
        await signUp({ displayName, email, password })
      } else {
        await signIn({ email, password })
      }
    } catch (sessionError) {
      console.error(sessionError)
      setError(mapAuthError(sessionError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--text-primary)]">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
        <section className="space-y-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)] text-2xl font-black text-[#15100a]">A</div>
          <div>
            <p className="mb-2 text-sm font-semibold text-[var(--accent)]">Axsis V2</p>
            <h1 className="text-4xl font-black leading-tight">مساحة دراسة مستقرة تعمل محليًا وتتزامن عند الحاجة</h1>
            <p className="mt-4 max-w-xl leading-8 text-[var(--text-secondary)]">
              استخدم حسابًا سحابيًا للمزامنة بين الأجهزة، أو تابع محليًا من دون إرسال بياناتك إلى أي خدمة خارجية.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Feature icon={Laptop} title="يعمل دون إنترنت" />
            <Feature icon={ShieldCheck} title="بيانات محلية أولًا" />
            <Feature icon={Cloud} title="حساب سحابي اختياري" />
          </div>
        </section>

        <div className="space-y-4">
          {cloudConfigured ? (
            <Card className="bg-[var(--surface-1)]">
              <CardHeader>
                <div className="flex gap-2">
                  <Button variant={mode === 'signin' ? 'primary' : 'secondary'} onClick={() => setMode('signin')}>تسجيل الدخول</Button>
                  <Button variant={mode === 'signup' ? 'primary' : 'secondary'} onClick={() => setMode('signup')}>إنشاء حساب</Button>
                </div>
                <CardTitle>{mode === 'signin' ? 'الدخول إلى الحساب السحابي' : 'إنشاء حساب سحابي'}</CardTitle>
                <CardDescription>ستُستخدم Firebase للمصادقة فقط في هذه المرحلة.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mode === 'signup' ? (
                  <label className="block space-y-2 text-sm font-semibold">
                    <span>الاسم الظاهر</span>
                    <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="مثال: أنس" />
                  </label>
                ) : null}
                <label className="block space-y-2 text-sm font-semibold">
                  <span>البريد الإلكتروني</span>
                  <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
                </label>
                <label className="block space-y-2 text-sm font-semibold">
                  <span>كلمة المرور</span>
                  <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
                </label>
                {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div> : null}
                <Button className="w-full" disabled={busy || !email.trim() || password.length < 6} onClick={() => void handleCloudSession()}>
                  {busy ? 'جاري المعالجة…' : mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-7 text-amber-200">
              الحساب السحابي غير مفعّل على هذه النسخة لأن إعدادات Firebase غير مكتملة. الوضع المحلي متاح ويعمل بشكل طبيعي.
            </div>
          )}

          <Card className="bg-[var(--surface-1)]">
            <CardHeader>
              <CardTitle>المتابعة محليًا</CardTitle>
              <CardDescription>لن يتم إرسال أي بيانات إلى خدمة خارجية.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block space-y-2 text-sm font-semibold">
                <span>الاسم الظاهر</span>
                <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="مثال: أنس" />
              </label>
              {!cloudConfigured && error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div> : null}
              <Button variant="secondary" className="w-full" disabled={busy} onClick={() => void handleLocalSession()}>
                {busy ? 'جاري البدء…' : 'المتابعة محليًا'}
              </Button>
            </CardContent>
          </Card>
        </div>
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

function mapAuthError(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : ''
  if (code.includes('invalid-credential')) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
  if (code.includes('email-already-in-use')) return 'هذا البريد مستخدم في حساب آخر.'
  if (code.includes('invalid-email')) return 'صيغة البريد الإلكتروني غير صحيحة.'
  if (code.includes('weak-password')) return 'كلمة المرور ضعيفة. استخدم ستة أحرف على الأقل.'
  if (code.includes('network-request-failed')) return 'تعذر الاتصال بالخدمة. تحقق من الإنترنت وحاول مجددًا.'
  return error instanceof Error ? error.message : 'تعذر إكمال عملية الحساب.'
}
