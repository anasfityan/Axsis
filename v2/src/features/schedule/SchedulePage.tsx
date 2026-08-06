import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Pencil, Plus, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { listCourses } from '@/features/courses/course.repository'
import type { Course } from '@/features/courses/course.types'
import {
  listCourseSessions,
  removeCourseSession,
  saveCourseSession,
} from '@/features/schedule/session.repository'
import {
  emptyCourseSessionDraft,
  type CourseSession,
  type CourseSessionDraft,
  type Weekday,
  weekdays,
} from '@/features/schedule/session.types'

const courseColors: Record<string, string> = {
  amber: '#f4b942',
  blue: '#3b82f6',
  green: '#22c55e',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  cyan: '#06b6d4',
}

export function SchedulePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [sessions, setSessions] = useState<CourseSession[]>([])
  const [draft, setDraft] = useState<CourseSessionDraft>(emptyCourseSessionDraft)
  const [editing, setEditing] = useState<CourseSession | undefined>()
  const [isEditorOpen, setEditorOpen] = useState(false)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const [courseRecords, sessionRecords] = await Promise.all([
        listCourses(),
        listCourseSessions(),
      ])
      setCourses(courseRecords)
      setSessions(sessionRecords)
    } catch (loadError) {
      console.error(loadError)
      setError('تعذر تحميل جدول المحاضرات من التخزين المحلي.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const coursesById = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses],
  )

  const sessionsByDay = useMemo(() => {
    const map = new Map<Weekday, CourseSession[]>()
    weekdays.forEach(({ value }) => map.set(value, []))
    sessions.forEach((session) => map.get(session.weekday)?.push(session))
    return map
  }, [sessions])

  function openCreate() {
    setEditing(undefined)
    setDraft({ ...emptyCourseSessionDraft, courseId: courses[0]?.id ?? '' })
    setEditorOpen(true)
  }

  function openEdit(session: CourseSession) {
    setEditing(session)
    setDraft({
      courseId: session.courseId,
      weekday: session.weekday,
      startTime: session.startTime,
      endTime: session.endTime,
      room: session.room,
    })
    setEditorOpen(true)
  }

  async function submitSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.courseId) return
    try {
      await saveCourseSession(draft, editing)
      setEditorOpen(false)
      await load()
    } catch (saveError) {
      console.error(saveError)
      setError(
        draft.endTime <= draft.startTime
          ? 'وقت نهاية المحاضرة يجب أن يكون بعد وقت البداية.'
          : 'تعذر حفظ جلسة المحاضرة.',
      )
    }
  }

  async function deleteSession(session: CourseSession) {
    const course = coursesById.get(session.courseId)
    if (!window.confirm(`حذف محاضرة «${course?.name ?? 'المادة'}»؟`)) return
    try {
      await removeCourseSession(session)
      await load()
    } catch (deleteError) {
      console.error(deleteError)
      setError('تعذر حذف جلسة المحاضرة.')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--accent)]">تنظيم الأسبوع</p>
          <h1 className="text-3xl font-black tracking-tight">جدول المحاضرات</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            يمكن إضافة أكثر من جلسة للمادة نفسها، وتظهر البيانات ذاتها على الهاتف والكمبيوتر.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!courses.length} className="gap-2">
          <Plus className="h-4 w-4" /> إضافة محاضرة
        </Button>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <Card><CardContent className="py-12 text-center text-[var(--text-secondary)]">جاري تحميل الجدول…</CardContent></Card>
      ) : !courses.length ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14 text-center">
            <CalendarDays className="mb-4 h-8 w-8 text-[var(--accent)]" />
            <h2 className="text-lg font-bold">أضف مادة أولًا</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">لا يمكن إنشاء محاضرة دون ربطها بمادة.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {weekdays.map((day) => {
            const daySessions = sessionsByDay.get(day.value) ?? []
            return (
              <Card key={day.value} className="min-h-48">
                <CardHeader>
                  <CardTitle>{day.label}</CardTitle>
                  <CardDescription>{daySessions.length} محاضرة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {daySessions.length ? daySessions.map((session) => {
                    const course = coursesById.get(session.courseId)
                    const color = courseColors[course?.colorToken ?? 'amber'] ?? courseColors.amber
                    return (
                      <div key={session.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                              <p className="truncate font-bold">{course?.name ?? 'مادة محذوفة'}</p>
                            </div>
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                              {session.startTime} – {session.endTime}
                            </p>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                              {session.room || course?.room || 'لم تحدد القاعة'}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" aria-label="تعديل المحاضرة" onClick={() => openEdit(session)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" aria-label="حذف المحاضرة" onClick={() => void deleteSession(session)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  }) : (
                    <p className="py-8 text-center text-sm text-[var(--text-muted)]">لا توجد محاضرات في هذا اليوم.</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {isEditorOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(event) => event.currentTarget === event.target && setEditorOpen(false)}>
          <Card className="w-full rounded-b-none sm:max-w-xl sm:rounded-2xl">
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>{editing ? 'تعديل المحاضرة' : 'إضافة محاضرة'}</CardTitle>
                <CardDescription>اربط الموعد بمادة وحدد اليوم والوقت.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" aria-label="إغلاق" onClick={() => setEditorOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={submitSession}>
                <Field label="المادة" className="sm:col-span-2">
                  <select
                    value={draft.courseId}
                    onChange={(event) => setDraft({ ...draft, courseId: event.target.value })}
                    className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm outline-none focus:border-[var(--accent)]"
                  >
                    {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
                  </select>
                </Field>
                <Field label="اليوم">
                  <select
                    value={draft.weekday}
                    onChange={(event) => setDraft({ ...draft, weekday: Number(event.target.value) as Weekday })}
                    className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm outline-none focus:border-[var(--accent)]"
                  >
                    {weekdays.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}
                  </select>
                </Field>
                <Field label="القاعة"><Input value={draft.room} onChange={(event) => setDraft({ ...draft, room: event.target.value })} /></Field>
                <Field label="وقت البداية"><Input type="time" value={draft.startTime} onChange={(event) => setDraft({ ...draft, startTime: event.target.value })} /></Field>
                <Field label="وقت النهاية"><Input type="time" value={draft.endTime} onChange={(event) => setDraft({ ...draft, endTime: event.target.value })} /></Field>
                <div className="flex justify-end gap-2 sm:col-span-2">
                  <Button type="button" variant="ghost" onClick={() => setEditorOpen(false)}>إلغاء</Button>
                  <Button type="submit" disabled={!draft.courseId}>حفظ المحاضرة</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

function Field({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) {
  return <label className={`space-y-2 text-sm font-semibold ${className}`}><span>{label}</span>{children}</label>
}
