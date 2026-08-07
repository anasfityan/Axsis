import { useState } from 'react'
import {
  BookOpen,
  CalendarDays,
  ChartNoAxesColumn,
  Files,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
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

const SIDEBAR_STORAGE_KEY = 'axsis-v2-sidebar-collapsed'

const shellText = {
  ar: {
    workspace: 'مساحة الطالب', online: 'متصل بالإنترنت', offline: 'يعمل دون إنترنت',
    cloudOff: 'السحابة غير مفعلة بعد', pending: 'معلقة', failed: 'فاشلة', student: 'طالب',
    local: 'حساب محلي', device: 'جهاز', logout: 'تسجيل الخروج', navLabel: 'التنقل الرئيسي', mobileNavLabel: 'التنقل على الهاتف',
    collapse: 'طي القائمة الجانبية', expand: 'فتح القائمة الجانبية',
  },
  tr: {
    workspace: 'Öğrenci alanı', online: 'İnternete bağlı', offline: 'Çevrimdışı çalışıyor',
    cloudOff: 'Bulut henüz yapılandırılmadı', pending: 'bekliyor', failed: 'başarısız', student: 'Öğrenci',
    local: 'Yerel hesap', device: 'Cihaz', logout: 'Çıkış yap', navLabel: 'Ana gezinme', mobileNavLabel: 'Mobil gezinme',
    collapse: 'Kenar çubuğunu daralt', expand: 'Kenar çubuğunu aç',
  },
  en: {
    workspace: 'Student workspace', online: 'Online', offline: 'Working offline',
    cloudOff: 'Cloud is not configured', pending: 'pending', failed: 'failed', student: 'Student',
    local: 'Local account', device: 'Device', logout: 'Sign out', navLabel: 'Main navigation', mobileNavLabel: 'Mobile navigation',
    collapse: 'Collapse sidebar', expand: 'Expand sidebar',
  },
} as const

function getInitialSidebarState(): boolean {
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
}

export function AppShell() {
  const { session, signOut } = useAuth()
  const { online, workerState, queue } = useSyncRuntime()
  const { locale, t } = useLanguage()
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(getInitialSidebarState)
  const navigate = useNavigate()
  const device = getDeviceIdentity()
  const text = shellText[locale]
  const isRtl = locale === 'ar'
  const isCloud = session?.user.mode === 'cloud'
  const displayName = isCloud ? (session?.user.displayName ?? text.student) : text.student
  const accountLabel = isCloud ? session?.user.email : text.local
  const deviceLabel = `${text.device}: ${device.platform} · ${device.appVersion}`

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth', { replace: true })
  }

  const toggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const next = !current
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      return next
    })
  }

  const CollapseIcon = isRtl
    ? (isSidebarCollapsed ? PanelRightOpen : PanelRightClose)
    : (isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose)

  return (
    <div className={isSidebarCollapsed ? 'app-shell sidebar-is-collapsed' : 'app-shell'}>
      <aside className="sidebar" aria-label={text.navLabel}>
        <button type="button" className="sidebar-toggle" onClick={toggleSidebar} aria-label={isSidebarCollapsed ? text.expand : text.collapse} title={isSidebarCollapsed ? text.expand : text.collapse}>
          <CollapseIcon aria-hidden="true" size={19} strokeWidth={1.8} />
        </button>

        <div className="brand">
          <div className="brand-mark">A</div>
          <div className="sidebar-copy"><strong>Axsis</strong><span>{text.workspace}</span></div>
        </div>

        <nav className="sidebar-nav">
          {navigation.map(({ to, key, icon: Icon }) => (
            <NavLink key={to} to={to} title={isSidebarCollapsed ? t(key) : undefined} aria-label={t(key)} className={({ isActive }) => isActive ? 'nav-item nav-item-active' : 'nav-item'}>
              <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
              <span className="sidebar-copy">{t(key)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer mt-auto space-y-3">
          <div className="sync-card" title={isSidebarCollapsed ? (online ? text.online : text.offline) : undefined}>
            {online ? <Wifi aria-hidden="true" size={17} /> : <WifiOff aria-hidden="true" size={17} />}
            <div className="sidebar-copy">
              <strong>{online ? text.online : text.offline}</strong>
              <span>{workerState === 'unconfigured' ? text.cloudOff : `${queue.pending} ${text.pending}، ${queue.failed} ${text.failed}`}</span>
            </div>
          </div>

          <div className="account-card rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <div className="sidebar-copy mb-3 min-w-0">
              <strong className="block truncate text-sm text-[var(--text-primary)]">{displayName}</strong>
              <span className="block truncate text-xs text-[var(--text-secondary)]">{accountLabel}</span>
              <span className="mt-1 block truncate text-xs text-[var(--text-muted)]">{deviceLabel}</span>
            </div>
            <Button type="button" variant="ghost" size="sm" title={isSidebarCollapsed ? text.logout : undefined} aria-label={text.logout} className="sidebar-logout w-full justify-start" onClick={() => void handleSignOut()}>
              <LogOut aria-hidden="true" size={16} />
              <span className="sidebar-copy">{text.logout}</span>
            </Button>
          </div>
        </div>
      </aside>

      <main className="main-content"><Outlet /></main>

      <nav className="mobile-nav" aria-label={text.mobileNavLabel}>
        {navigation.map(({ to, key, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'mobile-nav-item mobile-nav-item-active' : 'mobile-nav-item'}>
            <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
            <span>{t(key)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
