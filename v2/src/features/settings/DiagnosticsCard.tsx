import { Activity, CloudOff, Database, HardDrive, Laptop, UserRound, Wifi, WifiOff } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/services/auth/AuthProvider'
import { getDeviceIdentity } from '@/services/device/device'
import { useSyncRuntime } from '@/services/sync/SyncRuntimeProvider'

export function DiagnosticsCard() {
  const { session } = useAuth()
  const { online, workerState, queue } = useSyncRuntime()
  const device = getDeviceIdentity()

  const checks = [
    {
      label: 'الحساب',
      value: session?.user.mode === 'cloud' ? 'حساب سحابي' : 'وضع محلي',
      detail: session?.user.displayName ?? 'غير مسجل',
      icon: UserRound,
      ok: Boolean(session),
    },
    {
      label: 'الاتصال',
      value: online ? 'متصل بالإنترنت' : 'دون اتصال',
      detail: online ? 'يمكن تشغيل المزامنة عند تفعيل السحابة' : 'التطبيق مستمر محليًا',
      icon: online ? Wifi : WifiOff,
      ok: online,
    },
    {
      label: 'قاعدة البيانات',
      value: 'IndexedDB جاهزة',
      detail: 'الحفظ المحلي هو المصدر الأساسي على هذا الجهاز',
      icon: Database,
      ok: true,
    },
    {
      label: 'عامل المزامنة',
      value: workerStateLabel(workerState),
      detail: `${queue.pending} معلقة · ${queue.failed} فاشلة`,
      icon: Activity,
      ok: queue.failed === 0,
    },
    {
      label: 'السحابة',
      value: 'غير مفعّلة',
      detail: 'لن تُرسل أي بيانات قبل إعداد Firebase بأمان',
      icon: CloudOff,
      ok: false,
    },
    {
      label: 'الجهاز',
      value: device.name,
      detail: `${device.platform} · الإصدار ${device.appVersion}`,
      icon: Laptop,
      ok: true,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--surface-3)] p-2 text-[var(--accent)]">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>تشخيص النظام</CardTitle>
            <CardDescription>ملخص مباشر لحالة الحساب والجهاز والتخزين والمزامنة.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {checks.map(({ label, value, detail, icon: Icon, ok }) => (
          <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-lg bg-[var(--surface-3)] p-2 text-[var(--text-secondary)]">
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={
                  ok
                    ? 'rounded-full bg-green-500/10 px-2 py-1 text-[11px] font-bold text-green-300'
                    : 'rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-bold text-amber-300'
                }
              >
                {ok ? 'سليم' : 'تنبيه'}
              </span>
            </div>
            <p className="mt-4 text-xs text-[var(--text-muted)]">{label}</p>
            <p className="mt-1 font-bold">{value}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{detail}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function workerStateLabel(state: ReturnType<typeof useSyncRuntime>['workerState']): string {
  const labels = {
    idle: 'جاهز',
    running: 'يعمل الآن',
    offline: 'متوقف لعدم الاتصال',
    unconfigured: 'بانتظار مزود سحابي',
    stopped: 'متوقف',
  }
  return labels[state]
}
