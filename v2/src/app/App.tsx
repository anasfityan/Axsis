import { Navigate, Route, Routes } from 'react-router-dom'

import { PlaceholderPage } from '@/components/feedback/PlaceholderPage'
import { AppShell } from '@/components/layout/AppShell'
import { CoursesPage } from '@/features/courses/CoursesPage'
import { ExamsPage } from '@/features/exams/ExamsPage'
import { FilesPage } from '@/features/files/FilesPage'
import { GradesPage } from '@/features/grades/GradesPage'
import { SchedulePage } from '@/features/schedule/SchedulePage'

const placeholderPages = [
  ['/dashboard', 'الرئيسية', 'ملخص المواد والاختبارات والملفات وحالة المزامنة.'],
  ['/settings', 'الإعدادات', 'اللغة والمظهر والمزامنة والخصوصية.'],
] as const

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/exams" element={<ExamsPage />} />
        <Route path="/grades" element={<GradesPage />} />
        <Route path="/files" element={<FilesPage />} />
        {placeholderPages.map(([path, title, description]) => (
          <Route
            key={path}
            path={path}
            element={<PlaceholderPage title={title} description={description} />}
          />
        ))}
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
