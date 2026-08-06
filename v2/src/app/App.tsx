import { Navigate, Route, Routes } from "react-router-dom"

import { AppShell } from "@/components/layout/AppShell"
import { PlaceholderPage } from "@/components/feedback/PlaceholderPage"

const pages = [
  ["/dashboard", "الرئيسية", "ملخص المواد والاختبارات والملفات وحالة المزامنة."],
  ["/courses", "المواد", "إدارة المواد والمحاضرات المرتبطة بها."],
  ["/schedule", "الجدول", "عرض أسبوعي موحد للهاتف والكمبيوتر."],
  ["/exams", "الاختبارات", "مواعيد الاختبارات والتنبيهات والعد التنازلي."],
  ["/grades", "الدرجات", "متابعة الدرجات والتقدم لكل مادة."],
  ["/files", "الملفات", "تنظيم ملفات الدراسة وروابطها ومجلداتها."],
  ["/settings", "الإعدادات", "اللغة والمظهر والمزامنة والخصوصية."],
] as const

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {pages.map(([path, title, description]) => (
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
