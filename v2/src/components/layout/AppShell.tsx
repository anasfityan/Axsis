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
import { useLanguage } from '@/i18n/LanguageProvider'
import { useAuth } from '@/services/auth/AuthProvider'
import { getDeviceIdentity } from '@/services/device/device'
import { useSyncRuntime } from '@/services/sync/SyncRuntimeProvider'

const navigation = [
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { to: '/courses', key: 'courses', icon: BookOpen },
  { to: '/schedule', key: 'schedule', icon: CalendarDays },
  { to: '/exams', key: 'exams', icon: GraduationCap },
  { to: '/grades', key: 'grades', icon: ChartNoAxesColumn },
  { to: '/files', key: 'files', icon: Files },
  { to: '/settings', key: 'settings', icon: Settings },
] as const

const shellText = {
  ar: {
    workspace: 'مساحة الطالب',
    online: 'متصل بالإنترنت',
    offline: 'يعمل دون إنترنت',
    cloudOff: 'السحابة غير مفعلة بعد',
    pending: 'معلقة',
    failed: 'فاشلة',
    student: 'طالب',
    local: 'حساب محلي',
    logout: 'تسجيل الخروج',
    navLabel: 'التنقل الرئيسي',
    mobileNavLabel: 'التنقل على الهاتف',
  },
  tr: {
    workspace: 'Öğrenci alanı',
    online: 'İnternete bağlı',
    offline: 'Çevrimdışı çalışıyor',
    cloudOff: 'Bulut henüz yapılandırılmadı',
    pending: 'bekliyor',
    failed: 'başarısız',
    student: 'Öğrenci',
    local: 'Yerel hesap',
    logout: 'Çıkış yap',
    navLabel: 'Ana gezinme',
    mobileNavLabel: 'Mobil gezinme',
  },
  en: {
    workspace: 'Student workspace',
    online: 'Online',
    offline: 'Working offline',
    cloudOff: 'Cloud is not configured',
    pending: 'pending',
    failed: 'failed',
    student: 'Student',
    local: 'Local account',
    logout: 'Sign out',
    navLabel: 'Main navigation',
    mobileNavLabel: 'Mobile navigation',
  },
} as const

export function AppShell() {
  const { session, signOut } = useAuth()
  const { online, workerState, queue } = useSyncRuntime()
  const { locale, t } = useLanguage()
  const navigate = useNavigate()
  const device = getDeviceIdentity()
  const text = shellText[locale]

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label={text.navLabel}>
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <strong>Axsis</strong>
            <span>{text.workspace}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigation.map(({ to, key, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => isActive ? 'nav-item nav-item-active' : 'nav-item'}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
              <span>{t(key)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="sync-card">
            {online ? <Wifi aria-hidden="true" size={17} /> : <WifiOff aria-hidden="true" size={17} />}
            <div>
              <strong>{online ? text.online : text.offline}</strong>
              <span>
                {workerState === 'unconfigured'
                  ? text.cloudOff
                  : `${queue.pending} ${text.pending}، ${queue.failed} ${text.failed}`}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <div className="mb-3 min-w-0">
              <strong className="block truncate text-sm text-[var(--text-primary)]">
                {session?.user.displayName ?? text.student}
              </strong>
              <span className="block truncate text-xs text-[var(--text-secondary)]">
                {session?.user.mode === 'cloud' ? session.user.email : text.local}
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
              {text.logout}
            </Button>
          </div>
        </div>
      </aside>

      <main className="main-content"><Outlet /></main>

      <nav className="mobile-nav" aria-label={text.mobileNavLabel}>
        {navigation.slice(0, 5).map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => isActive ? 'mobile-nav-item mobile-nav-item-active' : 'mobile-nav-item'}
          >
            <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
            <span>{t(key)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
