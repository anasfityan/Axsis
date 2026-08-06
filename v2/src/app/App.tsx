import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { AuthPage } from '@/features/auth/AuthPage'
import { CoursesPage } from '@/features/courses/CoursesPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ExamsPage } from '@/features/exams/ExamsPage'
import { FilesPage } from '@/features/files/FilesPage'
import { GradesPage } from '@/features/grades/GradesPage'
import { SchedulePage } from '@/features/schedule/SchedulePage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { useAuth } from '@/services/auth/AuthProvider'

function ProtectedRoutes() {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-[var(--background)] text-[var(--text-secondary)]">جاري تحميل الجلسة…</div>
  }

  return session ? <Outlet /> : <Navigate to="/auth" replace />
}

export function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<ProtectedRoutes />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
