import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarClock, Pencil, Plus, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { listCourses } from '@/features/courses/course.repository'
import type { Course } from '@/features/courses/course.types'
import { listExams, removeExam, saveExam } from '@/features/exams/exam.repository'
import { emptyExamDraft, type Exam, type ExamDraft } from '@/features/exams/exam.types'

const typeLabels: Record<Exam['type'], string> = {
  midterm: 'نصفي',
  final: 'نهائي',
  quiz: 'اختبار قصير',
  other: 'أخرى',
}

function daysUntil(date: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${date}T00:00:00`)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

export function ExamsPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [draft, setDraft] = useState<ExamDraft>(emptyExamDraft)
  const [editing, setEditing] = useState<Exam | undefined>()
  const [isOpen, setOpen] = useState(false)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const [courseRecords, examRecords] = await Promise.all([listCourses(), listExams()])
      setCourses(courseRecords)
      setExams(examRecords)
    } catch (loadError) {
      console.error(loadError)
      setError('تعذر تحميل الاختبارات من التخزين المحلي.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const coursesById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses])

  function openCreate() {
    setEditing(undefined)
    setDraft({ ...emptyExamDraft, courseId: courses[0]?.id ?? '' })
    setOpen(true)
  }

  function openEdit(exam: Exam) {
    setEditing(exam)
    setDraft({
      courseId: exam.courseId,
      title: exam.title,
      type: exam.type,
      date: exam.date,
      startTime: exam.startTime,
      room: exam.room,
      notes: exam.notes,
      reminderMinutes: exam.reminderMinutes,
    })
    setOpen(true)
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.courseId || !draft.title.trim() || !draft.date) return
    try {
      await saveExam(draft, editing)
      setOpen(false)
      await load()
    } catch (saveError) {
      console.error(saveError)
      setError('تعذر حفظ الاختبار.')
    }
  }

  async function deleteExam(exam: Exam) {
    if (!window.confirm(`حذف اختبار «${exam.title}»؟`)) return
    await removeExam(exam)
    await load()
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--accent)]">المواعيد القادمة</p>
          <h1 className="text-3xl font-black tracking-tight">الاختبارات</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">أضف الاختبارات واربطها بالمواد، مع عد تنازلي واضح.</p>
        </div>
        <Button onClick={openCreate} disabled={!courses.length} className="gap-2"><Plus className="h-4 w-4" /> إضافة اختبار</Button>
      </header>

      {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}

      {!courses.length && !isLoading ? (
        <Card><CardContent className="py-12 text-center text-[var(--text-secondary)]">أضف مادة أولًا قبل إنشاء اختبار.</CardContent></Card>
      ) : isLoading ? (
        <Card><CardContent className="py-12 text-center text-[var(--text-secondary)]">جاري تحميل الاختبارات…</CardContent></Card>
      ) : exams.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-14 text-center"><CalendarClock className="mb-4 h-8 w-8 text-[var(--accent)]" /><h2 className="text-lg font-bold">لا توجد اختبارات بعد</h2><Button className="mt-5" onClick={openCreate}>إضافة أول اختبار</Button></CardContent></Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {exams.map((exam) => {
            const course = coursesById.get(exam.courseId)
            const remaining = daysUntil(exam.date)
            const status = remaining < 0 ? 'منتهي' : remaining === 0 ? 'اليوم' : remaining === 1 ? 'غدًا' : `باقي ${remaining} يوم`
            return (
              <Card key={exam.id}>
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div><CardTitle>{exam.title}</CardTitle><CardDescription>{course?.name ?? 'مادة غير موجودة'} · {typeLabels[exam.type]}</CardDescription></div>
                  <div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(exam)} aria-label="تعديل"><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => void deleteExam(exam)} aria-label="حذف"><Trash2 className="h-4 w-4" /></Button></div>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                  <div><span className="text-[var(--text-muted)]">التاريخ</span><p className="font-bold">{exam.date}</p></div>
                  <div><span className="text-[var(--text-muted)]">الوقت</span><p className="font-bold">{exam.startTime}</p></div>
                  <div><span className="text-[var(--text-muted)]">القاعة</span><p className="font-bold">{exam.room || course?.room || 'غير محددة'}</p></div>
                  <div><span className="text-[var(--text-muted)]">الحالة</span><p className="font-bold text-[var(--accent)]">{status}</p></div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-6" onMouseDown={(event) => event.currentTarget === event.target && setOpen(false)}>
          <Card className="max-h-[92vh] w-full overflow-y-auto rounded-b-none sm:max-w-2xl sm:rounded-2xl">
            <CardHeader className="flex-row items-start justify-between"><div><CardTitle>{editing ? 'تعديل الاختبار' : 'إضافة اختبار'}</CardTitle><CardDescription>اختر المادة وحدد الموعد بدقة.</CardDescription></div><Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button></CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
                <Field label="المادة"><select className="input-control" value={draft.courseId} onChange={(e) => setDraft({ ...draft, courseId: e.target.value })}>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></Field>
                <Field label="نوع الاختبار"><select className="input-control" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as Exam['type'] })}>{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
                <Field label="اسم الاختبار"><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
                <Field label="التاريخ"><Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></Field>
                <Field label="الوقت"><Input type="time" value={draft.startTime} onChange={(e) => setDraft({ ...draft, startTime: e.target.value })} /></Field>
                <Field label="القاعة"><Input value={draft.room} onChange={(e) => setDraft({ ...draft, room: e.target.value })} /></Field>
                <Field label="ملاحظات" className="sm:col-span-2"><textarea className="input-control min-h-24" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></Field>
                <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button><Button type="submit" disabled={!draft.courseId || !draft.title.trim() || !draft.date}>حفظ الاختبار</Button></div>
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
