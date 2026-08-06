import {
  BookOpen,
  CalendarDays,
  ChartNoAxesColumn,
  Files,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/services/auth/AuthProvider'
import { getDeviceIdentity } from '@/services/device/device'
import { useSyncRuntime } from '@/services/sync/SyncRuntimeProvider'

const navigation = [
  { to: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { to: '/courses', label: 'المواد', icon: BookOpen },
  { to: '/schedule', label: 'الجدول', icon: CalendarDays },
  { to: '/exams', label: 'الاختبارات', icon: GraduationCap },
  { to: '/grades', label: 'الدرجات', icon: ChartNoAxesColumn },
  { to: '/files', label: 'الملفات', icon: Files },
  { to: '/settings', label: 'الإعدادات', icon: Settings },
]

export function AppShell() {
  const { session, signOut } = useAuth()
  const { online, workerState, queue } = useSyncRuntime()
  const navigate = useNavigate()
  const device = getDeviceIdentity()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="التنقل الرئيسي">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <strong>Axsis</strong>
            <span>Student workspace</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? 'nav-item nav-item-active' : 'nav-item'
              }
            >
              <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="sync-card">
            {online ? (
              <Wifi aria-hidden="true" size={17} />
            ) : (
              <WifiOff aria-hidden="true" size={17} />
            )}
            <div>
              <strong>{online ? 'متصل بالإنترنت' : 'يعمل دون إنترنت'}</strong>
              <span>
                {workerState === 'unconfigured'
                  ? 'السحابة غير مفعلة بعد'
                  : `${queue.pending} معلقة، ${queue.failed} فاشلة`}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <div className="mb-3 min-w-0">
              <strong className="block truncate text-sm text-[var(--text-primary)]">
                {session?.user.displayName ?? 'طالب'}
              </strong>
              <span className="block truncate text-xs text-[var(--text-secondary)]">
                {session?.user.mode === 'cloud' ? session.user.email : 'حساب محلي'}
              </span>
              <span className="mt-1 block truncate text-xs text-[var(--text-muted)]">
                {device.name} · {device.appVersion}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => void handleSignOut()}
            >
              <LogOut aria-hidden="true" size={16} />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      <nav className="mobile-nav" aria-label="التنقل على الهاتف">
        {navigation.slice(0, 5).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? 'mobile-nav-item mobile-nav-item-active' : 'mobile-nav-item'
            }
          >
            <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
