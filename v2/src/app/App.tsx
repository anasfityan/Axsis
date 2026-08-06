import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { CoursesPage } from '@/features/courses/CoursesPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ExamsPage } from '@/features/exams/ExamsPage'
import { FilesPage } from '@/features/files/FilesPage'
import { GradesPage } from '@/features/grades/GradesPage'
import { SchedulePage } from '@/features/schedule/SchedulePage'
import { SettingsPage } from '@/features/settings/SettingsPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/exams" element={<ExamsPage />} />
        <Route path="/grades" element={<GradesPage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
