import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookOpen, Pencil, Plus, Search, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { listCourses, removeCourse, saveCourse } from '@/features/courses/course.repository'
import { emptyCourseDraft, type Course, type CourseDraft } from '@/features/courses/course.types'

const colorOptions = [
  ['amber', '#f4b942'],
  ['blue', '#3b82f6'],
  ['green', '#22c55e'],
  ['rose', '#f43f5e'],
  ['violet', '#8b5cf6'],
  ['cyan', '#06b6d4'],
] as const

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [query, setQuery] = useState('')
  const [isEditorOpen, setEditorOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | undefined>()
  const [draft, setDraft] = useState<CourseDraft>(emptyCourseDraft)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      setCourses(await listCourses())
    } catch (loadError) {
      console.error(loadError)
      setError('تعذر تحميل المواد من التخزين المحلي.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filteredCourses = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ar')
    if (!normalized) return courses
    return courses.filter((course) =>
      [course.name, course.code, course.instructor, course.department]
        .join(' ')
        .toLocaleLowerCase('ar')
        .includes(normalized),
    )
  }, [courses, query])

  function openCreate() {
    setEditingCourse(undefined)
    setDraft(emptyCourseDraft)
    setEditorOpen(true)
  }

  function openEdit(course: Course) {
    setEditingCourse(course)
    setDraft({
      name: course.name,
      code: course.code,
      instructor: course.instructor,
      department: course.department,
      room: course.room,
      colorToken: course.colorToken,
      notes: course.notes,
    })
    setEditorOpen(true)
  }

  async function submitCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.name.trim()) return
    try {
      await saveCourse(draft, editingCourse)
      setEditorOpen(false)
      await load()
    } catch (saveError) {
      console.error(saveError)
      setError('تعذر حفظ المادة. لم تُفقد بيانات النموذج.')
    }
  }

  async function deleteCourse(course: Course) {
    const confirmed = window.confirm(`حذف مادة «${course.name}»؟`)
    if (!confirmed) return
    try {
      await removeCourse(course)
      await load()
    } catch (deleteError) {
      console.error(deleteError)
      setError('تعذر حذف المادة.')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--accent)]">إدارة الدراسة</p>
          <h1 className="text-3xl font-black tracking-tight">المواد</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            أضف موادك وعدّل بياناتها. تُحفظ التغييرات فورًا على هذا الجهاز.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> إضافة مادة
        </Button>
      </header>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث باسم المادة أو المدرس أو الرمز"
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}

      {isLoading ? (
        <Card><CardContent className="py-12 text-center text-[var(--text-secondary)]">جاري تحميل المواد…</CardContent></Card>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14 text-center">
            <div className="mb-4 rounded-2xl bg-[var(--surface-3)] p-4 text-[var(--accent)]"><BookOpen className="h-7 w-7" /></div>
            <h2 className="text-lg font-bold">{courses.length ? 'لا توجد نتائج مطابقة' : 'لم تُضف أي مادة بعد'}</h2>
            <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
              {courses.length ? 'جرّب كلمة بحث مختلفة.' : 'ابدأ بإضافة أول مادة، ثم سنربط بها المحاضرات والاختبارات والملفات.'}
            </p>
            {!courses.length ? <Button onClick={openCreate} className="mt-5 gap-2"><Plus className="h-4 w-4" /> إضافة أول مادة</Button> : null}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => {
            const color = colorOptions.find(([name]) => name === course.colorToken)?.[1] ?? '#f4b942'
            return (
              <Card key={course.id} className="overflow-hidden transition hover:-translate-y-0.5 hover:border-white/15">
                <div className="h-1" style={{ backgroundColor: color }} />
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="truncate">{course.name}</CardTitle>
                      <CardDescription className="mt-1">{course.code || 'بدون رمز'} · {course.instructor || 'لم يحدد المدرس'}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" aria-label="تعديل المادة" onClick={() => openEdit(course)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" aria-label="حذف المادة" onClick={() => void deleteCourse(course)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <p>{course.department || 'لم يحدد القسم'}</p>
                  <p>{course.room ? `القاعة: ${course.room}` : 'لم تحدد القاعة'}</p>
                  {course.notes ? <p className="line-clamp-2 text-[var(--text-muted)]">{course.notes}</p> : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {isEditorOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(event) => event.currentTarget === event.target && setEditorOpen(false)}>
          <Card className="max-h-[92vh] w-full overflow-y-auto rounded-b-none sm:max-w-2xl sm:rounded-2xl">
            <CardHeader className="flex-row items-start justify-between">
              <div><CardTitle>{editingCourse ? 'تعديل المادة' : 'إضافة مادة'}</CardTitle><CardDescription>الاسم مطلوب، وبقية البيانات يمكن إكمالها لاحقًا.</CardDescription></div>
              <Button variant="ghost" size="icon" onClick={() => setEditorOpen(false)} aria-label="إغلاق"><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={submitCourse}>
                <Field label="اسم المادة" required><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} autoFocus /></Field>
                <Field label="رمز المادة"><Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} /></Field>
                <Field label="المدرس"><Input value={draft.instructor} onChange={(e) => setDraft({ ...draft, instructor: e.target.value })} /></Field>
                <Field label="القسم أو التخصص"><Input value={draft.department} onChange={(e) => setDraft({ ...draft, department: e.target.value })} /></Field>
                <Field label="القاعة"><Input value={draft.room} onChange={(e) => setDraft({ ...draft, room: e.target.value })} /></Field>
                <Field label="لون المادة"><div className="flex h-10 items-center gap-2">{colorOptions.map(([name, color]) => <button key={name} type="button" aria-label={`لون ${name}`} onClick={() => setDraft({ ...draft, colorToken: name })} className={`h-7 w-7 rounded-full border-2 ${draft.colorToken === name ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} />)}</div></Field>
                <Field label="ملاحظات" className="sm:col-span-2"><textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} rows={4} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none transition focus:border-[var(--accent)]" /></Field>
                <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="ghost" onClick={() => setEditorOpen(false)}>إلغاء</Button><Button type="submit" disabled={!draft.name.trim()}>حفظ المادة</Button></div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

function Field({ label, required, className = '', children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return <label className={`space-y-2 text-sm font-semibold ${className}`}><span>{label}{required ? <span className="text-red-400"> *</span> : null}</span>{children}</label>
}
