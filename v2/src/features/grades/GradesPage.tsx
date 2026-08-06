import { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChart3, Pencil, Plus, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { listCourses } from '@/features/courses/course.repository'
import type { Course } from '@/features/courses/course.types'
import { courseGradeSummary, gradePercentage } from '@/features/grades/grade.calculations'
import { listGrades, removeGrade, saveGrade } from '@/features/grades/grade.repository'
import { emptyGradeDraft, type GradeDraft, type GradeItem, type GradeType } from '@/features/grades/grade.types'

const typeLabels: Record<GradeType, string> = {
  quiz: 'اختبار قصير', assignment: 'واجب', midterm: 'نصفي', final: 'نهائي', project: 'مشروع', other: 'أخرى',
}

export function GradesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [grades, setGrades] = useState<GradeItem[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState('all')
  const [editing, setEditing] = useState<GradeItem | undefined>()
  const [draft, setDraft] = useState<GradeDraft>(emptyGradeDraft)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const [courseRecords, gradeRecords] = await Promise.all([listCourses(), listGrades()])
      setCourses(courseRecords)
      setGrades(gradeRecords)
    } catch (loadError) {
      console.error(loadError)
      setError('تعذر تحميل الدرجات من التخزين المحلي.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const courseMap = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses])
  const visibleGrades = selectedCourseId === 'all' ? grades : grades.filter((grade) => grade.courseId === selectedCourseId)
  const summaries = useMemo(() => courses.map((course) => ({
    course,
    summary: courseGradeSummary(grades.filter((grade) => grade.courseId === course.id)),
  })).filter(({ summary }) => summary.itemCount > 0), [courses, grades])

  function openCreate() {
    setEditing(undefined)
    setDraft({ ...emptyGradeDraft, courseId: selectedCourseId === 'all' ? courses[0]?.id ?? '' : selectedCourseId })
    setOpen(true)
  }

  function openEdit(grade: GradeItem) {
    setEditing(grade)
    setDraft({ courseId: grade.courseId, title: grade.title, type: grade.type, score: String(grade.score), maximumScore: String(grade.maximumScore), weight: grade.weight ? String(grade.weight) : '', date: grade.date, notes: grade.notes })
    setOpen(true)
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.courseId || !draft.title.trim() || Number(draft.maximumScore) <= 0 || Number(draft.score) < 0) return
    try {
      await saveGrade(draft, editing)
      setOpen(false)
      await load()
    } catch (saveError) {
      console.error(saveError)
      setError('تعذر حفظ الدرجة.')
    }
  }

  async function remove(grade: GradeItem) {
    if (!window.confirm(`حذف «${grade.title}»؟`)) return
    await removeGrade(grade)
    await load()
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 text-sm font-medium text-[var(--accent)]">متابعة الأداء</p><h1 className="text-3xl font-black">الدرجات</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">سجّل نتائجك وشاهد متوسط كل مادة ونسبة الأوزان المكتملة.</p></div>
        <Button onClick={openCreate} disabled={!courses.length} className="gap-2"><Plus className="h-4 w-4" /> إضافة درجة</Button>
      </header>

      {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}

      <Card><CardContent className="pt-6"><select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm outline-none sm:max-w-xs"><option value="all">كل المواد</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></CardContent></Card>

      {summaries.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{summaries.map(({ course, summary }) => <Card key={course.id}><CardHeader><CardTitle>{course.name}</CardTitle><CardDescription>{summary.itemCount} عناصر تقييم</CardDescription></CardHeader><CardContent><div className="flex items-end justify-between"><strong className="text-3xl">{summary.percentage.toFixed(1)}%</strong><span className="text-sm text-[var(--text-secondary)]">الوزن المكتمل: {summary.completedWeight || 'غير محدد'}{summary.completedWeight ? '%' : ''}</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.min(summary.percentage, 100)}%` }} /></div></CardContent></Card>)}</div> : null}

      {loading ? <Card><CardContent className="py-12 text-center">جاري التحميل…</CardContent></Card> : !courses.length ? <Card><CardContent className="py-14 text-center"><BarChart3 className="mx-auto mb-4 h-8 w-8 text-[var(--accent)]" /><h2 className="font-bold">أضف مادة أولًا</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">لا يمكن تسجيل درجة بلا مادة مرتبطة.</p></CardContent></Card> : visibleGrades.length === 0 ? <Card><CardContent className="py-14 text-center"><h2 className="font-bold">لا توجد درجات مسجلة</h2><Button onClick={openCreate} className="mt-4">إضافة أول درجة</Button></CardContent></Card> : <div className="space-y-3">{visibleGrades.map((grade) => <Card key={grade.id}><CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">{grade.title}</h2><span className="rounded-full bg-[var(--surface-3)] px-2 py-1 text-xs">{typeLabels[grade.type]}</span></div><p className="mt-1 text-sm text-[var(--text-secondary)]">{courseMap.get(grade.courseId)?.name ?? 'مادة محذوفة'} · {grade.date}</p></div><div className="flex items-center gap-4"><div className="text-left"><strong className="text-xl">{grade.score}/{grade.maximumScore}</strong><p className="text-xs text-[var(--text-secondary)]">{gradePercentage(grade.score, grade.maximumScore).toFixed(1)}%{grade.weight ? ` · وزن ${grade.weight}%` : ''}</p></div><Button variant="ghost" size="icon" onClick={() => openEdit(grade)} aria-label="تعديل"><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => void remove(grade)} aria-label="حذف"><Trash2 className="h-4 w-4" /></Button></div></CardContent></Card>)}</div>}

      {open ? <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-6"><Card className="max-h-[92vh] w-full overflow-y-auto rounded-b-none sm:max-w-2xl sm:rounded-2xl"><CardHeader className="flex-row items-start justify-between"><div><CardTitle>{editing ? 'تعديل الدرجة' : 'إضافة درجة'}</CardTitle><CardDescription>الوزن اختياري، ويستخدم لحساب المتوسط الموزون.</CardDescription></div><Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button></CardHeader><CardContent><form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}><Field label="المادة"><select required value={draft.courseId} onChange={(e) => setDraft({ ...draft, courseId: e.target.value })} className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3"><option value="">اختر المادة</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></Field><Field label="اسم التقييم"><Input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field><Field label="النوع"><select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as GradeType })} className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3">{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="التاريخ"><Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></Field><Field label="الدرجة"><Input required type="number" min="0" step="0.01" value={draft.score} onChange={(e) => setDraft({ ...draft, score: e.target.value })} /></Field><Field label="من أصل"><Input required type="number" min="0.01" step="0.01" value={draft.maximumScore} onChange={(e) => setDraft({ ...draft, maximumScore: e.target.value })} /></Field><Field label="الوزن %"><Input type="number" min="0" max="100" step="0.01" value={draft.weight} onChange={(e) => setDraft({ ...draft, weight: e.target.value })} /></Field><Field label="ملاحظات"><Input value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></Field><div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button><Button type="submit">حفظ</Button></div></form></CardContent></Card></div> : null}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="space-y-2 text-sm font-semibold"><span>{label}</span>{children}</label> }
