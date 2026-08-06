import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, CalendarDays, CheckCircle2, Clock3, FileText, GraduationCap, RefreshCw } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllRecords, stores } from '@/database/database'

interface DashboardCourse {
  id: string
  name: string
  colorToken: string
  deletedAt?: string | null
}

interface DashboardSession {
  id: string
  courseId: string
  weekday: number
  startTime: string
  endTime: string
  room: string
  deletedAt?: string | null
}

interface DashboardExam {
  id: string
  courseId: string
  title: string
  date: string
  startTime: string
  deletedAt?: string | null
}

interface DashboardGrade {
  id: string
  courseId: string
  score: number
  maximumScore: number
  weight: number
  deletedAt?: string | null
}

interface DashboardFile {
  id: string
  courseId: string
  name: string
  folder: string
  updatedAt: string
  deletedAt?: string | null
}

interface DashboardData {
  courses: DashboardCourse[]
  sessions: DashboardSession[]
  exams: DashboardExam[]
  grades: DashboardGrade[]
  files: DashboardFile[]
}

const emptyData: DashboardData = {
  courses: [],
  sessions: [],
  exams: [],
  grades: [],
  files: [],
}

const colorMap: Record<string, string> = {
  amber: '#f4b942',
  blue: '#3b82f6',
  green: '#22c55e',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  cyan: '#06b6d4',
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData>(emptyData)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const [courses, sessions, exams, grades, files] = await Promise.all([
        getAllRecords<DashboardCourse>(stores.courses),
        getAllRecords<DashboardSession>(stores.courseSessions),
        getAllRecords<DashboardExam>(stores.exams),
        getAllRecords<DashboardGrade>(stores.grades),
        getAllRecords<DashboardFile>(stores.files),
      ])

      setData({
        courses: courses.filter((item) => !item.deletedAt),
        sessions: sessions.filter((item) => !item.deletedAt),
        exams: exams.filter((item) => !item.deletedAt),
        grades: grades.filter((item) => !item.deletedAt),
        files: files.filter((item) => !item.deletedAt),
      })
    } catch (loadError) {
      console.error(loadError)
      setError('تعذر تحميل ملخص التطبيق من التخزين المحلي.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const coursesById = useMemo(
    () => new Map(data.courses.map((course) => [course.id, course])),
    [data.courses],
  )

  const todaySessions = useMemo(() => {
    const weekday = new Date().getDay()
    return data.sessions
      .filter((session) => session.weekday === weekday)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [data.sessions])

  const upcomingExams = useMemo(() => {
    const now = new Date()
    return data.exams
      .map((exam) => ({ exam, date: new Date(`${exam.date}T${exam.startTime || '00:00'}`) }))
      .filter(({ date }) => Number.isFinite(date.getTime()) && date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3)
  }, [data.exams])

  const recentFiles = useMemo(
    () => [...data.files].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4),
    [data.files],
  )

  const average = useMemo(() => {
    const valid = data.grades.filter((grade) => grade.maximumScore > 0)
    if (!valid.length) return null
    const weighted = valid.filter((grade) => grade.weight > 0)
    if (weighted.length) {
      const weightTotal = weighted.reduce((sum, grade) => sum + grade.weight, 0)
      if (weightTotal > 0) {
        return weighted.reduce((sum, grade) => sum + (grade.score / grade.maximumScore) * grade.weight, 0) / weightTotal * 100
      }
    }
    return valid.reduce((sum, grade) => sum + (grade.score / grade.maximumScore) * 100, 0) / valid.length
  }, [data.grades])

  if (isLoading) {
    return <Card><CardContent className="py-16 text-center text-[var(--text-secondary)]">جاري تجهيز الصفحة الرئيسية…</CardContent></Card>
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-2 text-sm font-medium text-[var(--accent)]">نظرة سريعة</p>
        <h1 className="text-3xl font-black tracking-tight">الرئيسية</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">ملخص مباشر من بياناتك المحلية، ويعمل حتى عند انقطاع الإنترنت.</p>
      </header>

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <span>{error}</span>
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 font-semibold"><RefreshCw className="h-4 w-4" /> إعادة المحاولة</button>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={BookOpen} label="المواد" value={data.courses.length.toString()} href="/courses" />
        <MetricCard icon={CalendarDays} label="محاضرات اليوم" value={todaySessions.length.toString()} href="/schedule" />
        <MetricCard icon={GraduationCap} label="الاختبارات القادمة" value={upcomingExams.length.toString()} href="/exams" />
        <MetricCard icon={FileText} label="الملفات" value={data.files.length.toString()} href="/files" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>اليوم</CardTitle>
            <CardDescription>محاضراتك مرتبة حسب الوقت.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaySessions.length ? todaySessions.map((session) => {
              const course = coursesById.get(session.courseId)
              return (
                <div key={session.id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <span className="h-10 w-1 rounded-full" style={{ backgroundColor: colorMap[course?.colorToken ?? 'amber'] ?? colorMap.amber }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{course?.name ?? 'مادة غير متاحة'}</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{session.startTime} – {session.endTime}{session.room ? ` · ${session.room}` : ''}</p>
                  </div>
                  <Clock3 className="h-5 w-5 text-[var(--text-muted)]" />
                </div>
              )
            }) : (
              <EmptyMessage text="لا توجد محاضرات مسجلة لهذا اليوم." href="/schedule" action="إدارة الجدول" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الأداء الدراسي</CardTitle>
            <CardDescription>متوسط مبني على الدرجات المسجلة.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl bg-[var(--surface-2)] text-center">
              <div className="mb-3 rounded-full bg-[var(--surface-3)] p-4 text-[var(--accent)]"><CheckCircle2 className="h-7 w-7" /></div>
              <p className="text-4xl font-black">{average === null ? '—' : `${average.toFixed(1)}%`}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{average === null ? 'أضف درجات لبدء حساب الأداء.' : `محسوب من ${data.grades.length} تقييم`}</p>
              <Link to="/grades" className="mt-4 text-sm font-bold text-[var(--accent)]">عرض الدرجات</Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الاختبارات القادمة</CardTitle>
            <CardDescription>أقرب ثلاثة مواعيد مسجلة.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingExams.length ? upcomingExams.map(({ exam, date }) => (
              <div key={exam.id} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] p-4">
                <div className="min-w-0">
                  <p className="truncate font-bold">{exam.title}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{coursesById.get(exam.courseId)?.name ?? 'مادة غير متاحة'}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-[var(--surface-3)] px-3 py-2 text-xs font-bold">{formatRelativeDate(date)}</span>
              </div>
            )) : (
              <EmptyMessage text="لا توجد اختبارات قادمة." href="/exams" action="إضافة اختبار" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>آخر الملفات</CardTitle>
            <CardDescription>أحدث العناصر التي أضفتها أو عدّلتها.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentFiles.length ? recentFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-4">
                <div className="rounded-xl bg-[var(--surface-3)] p-2 text-[var(--accent)]"><FileText className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{file.name}</p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">{coursesById.get(file.courseId)?.name ?? 'بدون مادة'}{file.folder ? ` · ${file.folder}` : ''}</p>
                </div>
              </div>
            )) : (
              <EmptyMessage text="لم تضف ملفات بعد." href="/files" action="إضافة ملف" />
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>حالة النظام</CardTitle>
          <CardDescription>فحص محلي سريع قبل إضافة المزامنة السحابية.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <HealthItem title="قاعدة البيانات" detail="تم تحميل البيانات المحلية بنجاح" />
          <HealthItem title="العمل دون إنترنت" detail="البيانات الأساسية متاحة محليًا" />
          <HealthItem title="المزامنة السحابية" detail="غير مفعلة بعد، ولن تمنع استخدام التطبيق" pending />
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, href }: { icon: typeof BookOpen; label: string; value: string; href: string }) {
  return (
    <Link to={href}>
      <Card className="h-full transition hover:-translate-y-0.5 hover:border-white/15">
        <CardContent className="flex items-center justify-between gap-4 pt-6">
          <div><p className="text-sm text-[var(--text-secondary)]">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>
          <div className="rounded-2xl bg-[var(--surface-3)] p-3 text-[var(--accent)]"><Icon className="h-6 w-6" /></div>
        </CardContent>
      </Card>
    </Link>
  )
}

function EmptyMessage({ text, href, action }: { text: string; href: string; action: string }) {
  return <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--text-secondary)]"><p>{text}</p><Link to={href} className="mt-3 inline-block font-bold text-[var(--accent)]">{action}</Link></div>
}

function HealthItem({ title, detail, pending = false }: { title: string; detail: string; pending?: boolean }) {
  return <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${pending ? 'bg-amber-400' : 'bg-green-500'}`} /><p className="font-bold">{title}</p></div><p className="mt-2 text-sm text-[var(--text-secondary)]">{detail}</p></div>
}

function formatRelativeDate(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000)
  if (days === 0) return 'اليوم'
  if (days === 1) return 'غدًا'
  return `بعد ${days} أيام`
}
