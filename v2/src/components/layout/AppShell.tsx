import {
  BookOpen,
  CalendarDays,
  ChartNoAxesColumn,
  Files,
  GraduationCap,
  LayoutDashboard,
  Settings,
} from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"

const navigation = [
  { to: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { to: "/courses", label: "المواد", icon: BookOpen },
  { to: "/schedule", label: "الجدول", icon: CalendarDays },
  { to: "/exams", label: "الاختبارات", icon: GraduationCap },
  { to: "/grades", label: "الدرجات", icon: ChartNoAxesColumn },
  { to: "/files", label: "الملفات", icon: Files },
  { to: "/settings", label: "الإعدادات", icon: Settings },
]

export function AppShell() {
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
                isActive ? "nav-item nav-item-active" : "nav-item"
              }
            >
              <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sync-card">
          <span className="sync-dot" aria-hidden="true" />
          <div>
            <strong>محفوظ محليًا</strong>
            <span>المزامنة ستُضاف في مرحلة لاحقة</span>
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
              isActive ? "mobile-nav-item mobile-nav-item-active" : "mobile-nav-item"
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
