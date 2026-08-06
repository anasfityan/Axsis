import { Navigate, Route, Routes } from 'react-router-dom'

import { PlaceholderPage } from '@/components/feedback/PlaceholderPage'
import { AppShell } from '@/components/layout/AppShell'
import { CoursesPage } from '@/features/courses/CoursesPage'
import { SchedulePage } from '@/features/schedule/SchedulePage'

const placeholderPages = [
  ['/dashboard', 'الرئيسية', 'ملخص المواد والاختبارات والملفات وحالة المزامنة.'],
  ['/exams', 'الاختبارات', 'مواعيد الاختبارات والتنبيهات والعد التنازلي.'],
  ['/grades', 'الدرجات', 'متابعة الدرجات والتقدم لكل مادة.'],
  ['/files', 'الملفات', 'تنظيم ملفات الدراسة وروابطها ومجلداتها.'],
  ['/settings', 'الإعدادات', 'اللغة والمظهر والمزامنة والخصوصية.'],
] as const

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
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
