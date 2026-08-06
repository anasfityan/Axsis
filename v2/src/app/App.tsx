import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/services/auth/AuthProvider'

const SyncCloudBridge = lazy(() => import('@/services/sync/SyncCloudBridge').then((module) => ({ default: module.SyncCloudBridge })))
const AuthPage = lazy(() => import('@/features/auth/AuthPage').then((module) => ({ default: module.AuthPage })))
const CoursesPage = lazy(() => import('@/features/courses/CoursesPage').then((module) => ({ default: module.CoursesPage })))
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const ExamsPage = lazy(() => import('@/features/exams/ExamsPage').then((module) => ({ default: module.ExamsPage })))
const FilesPage = lazy(() => import('@/features/files/FilesPage').then((module) => ({ default: module.FilesPage })))
const GradesPage = lazy(() => import('@/features/grades/GradesPage').then((module) => ({ default: module.GradesPage })))
const SchedulePage = lazy(() => import('@/features/schedule/SchedulePage').then((module) => ({ default: module.SchedulePage })))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })))

function LoadingScreen({ message = 'جاري تحميل الصفحة…' }: { message?: string }) {
  return (
    <div className="grid min-h-[40vh] place-items-center text-sm text-[var(--text-secondary)]" role="status" aria-live="polite">
      {message}
    </div>
  )
}

function ProtectedRoutes() {
  const { session, loading } = useAuth()

  if (loading) {
    return <LoadingScreen message="جاري تحميل الجلسة…" />
  }

  return session ? <Outlet /> : <Navigate to="/auth" replace />
}

export function App() {
  return (
    <>
      <Suspense fallback={null}>
        <SyncCloudBridge />
      </Suspense>
      <Suspense fallback={<LoadingScreen />}>
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
      </Suspense>
    </>
  )
}
