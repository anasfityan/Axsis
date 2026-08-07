import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  ChartNoAxesColumn,
  Clock3,
  FilePlus2,
  Files,
  GraduationCap,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getAllRecords, stores } from '@/database/database'
import { listCourses, removeCourse, saveCourse } from '@/features/courses/course.repository'
import { emptyCourseDraft, type Course, type CourseDraft } from '@/features/courses/course.types'
import { useLanguage } from '@/i18n/LanguageProvider'

const colorOptions = [
  ['amber', '#f4b942'],
  ['blue', '#3b82f6'],
  ['green', '#22c55e'],
  ['rose', '#f43f5e'],
  ['violet', '#8b5cf6'],
  ['cyan', '#06b6d4'],
] as const

type InspectorTab = 'info' | 'files' | 'exams' | 'grades'
type RelatedRecord = { id: string; courseId: string; deletedAt?: string | null }
type SessionRecord = RelatedRecord & { weekday: number; startTime: string; endTime: string; room?: string }
type ExamRecord = RelatedRecord & { title: string; date: string; startTime?: string }
type GradeRecord = RelatedRecord & { title: string; score: number; maximumScore: number }
type FileRecord = RelatedRecord & { name: string; folder?: string; fileType?: string }

const inspectorText = {
  ar: {
    choose: 'اختر مادة', chooseHint: 'اختر مادة من القائمة لعرض معلوماتها وإدارة ملفاتها واختباراتها ودرجاتها.',
    info: 'المعلومات', files: 'الملفات', exams: 'الاختبارات', grades: 'الدرجات', instructor: 'المدرس', room: 'القاعة',
    schedule: 'المحاضرات', noSessions: 'لا توجد محاضرات', noFiles: 'لا توجد ملفات مرتبطة', noExams: 'لا توجد اختبارات مرتبطة',
    noGrades: 'لا توجد درجات مرتبطة', addFile: 'إضافة ملف', addExam: 'إضافة اختبار', edit: 'تعديل المادة', delete: 'حذف المادة',
    average: 'المتوسط', courseProgress: 'ملخص المادة', items: 'عناصر',
  },
  en: {
    choose: 'Select a course', chooseHint: 'Select a course to view its details and manage files, exams, and grades.',
    info: 'Information', files: 'Files', exams: 'Exams', grades: 'Grades', instructor: 'Instructor', room: 'Room',
    schedule: 'Classes', noSessions: 'No classes', noFiles: 'No linked files', noExams: 'No linked exams', noGrades: 'No linked grades',
    addFile: 'Add file', addExam: 'Add exam', edit: 'Edit course', delete: 'Delete course', average: 'Average', courseProgress: 'Course summary', items: 'items',
  },
  tr: {
    choose: 'Ders seçin', chooseHint: 'Bilgilerini görmek ve dosya, sınav ve notlarını yönetmek için bir ders seçin.',
    info: 'Bilgiler', files: 'Dosyalar', exams: 'Sınavlar', grades: 'Notlar', instructor: 'Öğretim görevlisi', room: 'Derslik',
    schedule: 'Ders saatleri', noSessions: 'Ders saati yok', noFiles: 'Bağlı dosya yok', noExams: 'Bağlı sınav yok', noGrades: 'Bağlı not yok',
    addFile: 'Dosya ekle', addExam: 'Sınav ekle', edit: 'Dersi düzenle', delete: 'Dersi sil', average: 'Ortalama', courseProgress: 'Ders özeti', items: 'öğe',
  },
} as const

export function CoursesPage() {
  const { locale, direction } = useLanguage()
  const text = inspectorText[locale]
  const [courses, setCourses] = useState<Course[]>([])
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<InspectorTab>('info')
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [exams, setExams] = useState<ExamRecord[]>([])
  const [grades, setGrades] = useState<GradeRecord[]>([])
  const [files, setFiles] = useState<FileRecord[]>([])
  const [isEditorOpen, setEditorOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | undefined>()
  const [draft, setDraft] = useState<CourseDraft>(emptyCourseDraft)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const [courseRecords, sessionRecords, examRecords, gradeRecords, fileRecords] = await Promise.all([
        listCourses(),
        getAllRecords<SessionRecord>(stores.courseSessions),
        getAllRecords<ExamRecord>(stores.exams),
        getAllRecords<GradeRecord>(stores.grades),
        getAllRecords<FileRecord>(stores.files),
      ])
      setCourses(courseRecords)
      setSessions(sessionRecords.filter((item) => !item.deletedAt))
      setExams(examRecords.filter((item) => !item.deletedAt))
      setGrades(gradeRecords.filter((item) => !item.deletedAt))
      setFiles(fileRecords.filter((item) => !item.deletedAt))
      setSelectedId((current) => current && courseRecords.some((course) => course.id === current) ? current : courseRecords[0]?.id ?? null)
    } catch (loadError) {
      console.error(loadError)
      setError('تعذر تحميل المواد من التخزين المحلي.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const filteredCourses = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale)
    if (!normalized) return courses
    return courses.filter((course) => [course.name, course.code, course.instructor, course.department].join(' ').toLocaleLowerCase(locale).includes(normalized))
  }, [courses, locale, query])

  const selectedCourse = courses.find((course) => course.id === selectedId)
  const related = useMemo(() => ({
    sessions: sessions.filter((item) => item.courseId === selectedId),
    exams: exams.filter((item) => item.courseId === selectedId),
    grades: grades.filter((item) => item.courseId === selectedId),
    files: files.filter((item) => item.courseId === selectedId),
  }), [exams, files, grades, selectedId, sessions])

  const gradeAverage = useMemo(() => {
    const valid = related.grades.filter((grade) => grade.maximumScore > 0)
    if (!valid.length) return null
    return valid.reduce((sum, grade) => sum + grade.score / grade.maximumScore * 100, 0) / valid.length
  }, [related.grades])

  function openCreate() {
    setEditingCourse(undefined)
    setDraft(emptyCourseDraft)
    setEditorOpen(true)
  }

  function openEdit(course: Course) {
    setEditingCourse(course)
    setDraft({ name: course.name, code: course.code, instructor: course.instructor, department: course.department, room: course.room, colorToken: course.colorToken, notes: course.notes })
    setEditorOpen(true)
  }

  async function submitCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.name.trim()) return
    try {
      const saved = await saveCourse(draft, editingCourse)
      setEditorOpen(false)
      if (saved?.id) setSelectedId(saved.id)
      await load()
    } catch (saveError) {
      console.error(saveError)
      setError('تعذر حفظ المادة. لم تُفقد بيانات النموذج.')
    }
  }

  async function deleteCourse(course: Course) {
    if (!window.confirm(`حذف مادة «${course.name}»؟`)) return
    try {
      await removeCourse(course)
      if (selectedId === course.id) setSelectedId(null)
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
          <p className="mt-2 text-sm text-[var(--text-secondary)]">أضف موادك وعدّل بياناتها. تُحفظ التغييرات فورًا على هذا الجهاز.</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> إضافة مادة</Button>
      </header>

      {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}

      <div className="grid items-start gap-6 xl:grid-cols-[310px_minmax(0,1fr)]" style={{ direction: 'ltr' }}>
        <CourseInspector
          course={selectedCourse}
          related={related}
          average={gradeAverage}
          activeTab={activeTab}
          onTab={setActiveTab}
          onEdit={openEdit}
          onDelete={(course) => void deleteCourse(course)}
          text={text}
          direction={direction}
        />

        <section className="space-y-4" dir={direction}>
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم المادة أو المدرس أو الرمز" className="pe-10" />
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <Card><CardContent className="py-12 text-center text-[var(--text-secondary)]">جاري تحميل المواد…</CardContent></Card>
          ) : filteredCourses.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center py-14 text-center"><BookOpen className="mb-4 h-7 w-7 text-[var(--accent)]" /><h2 className="text-lg font-bold">{courses.length ? 'لا توجد نتائج مطابقة' : 'لم تُضف أي مادة بعد'}</h2>{!courses.length ? <Button onClick={openCreate} className="mt-5"><Plus className="h-4 w-4" /> إضافة أول مادة</Button> : null}</CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {filteredCourses.map((course) => {
                const color = colorOptions.find(([name]) => name === course.colorToken)?.[1] ?? '#f4b942'
                const selected = course.id === selectedId
                return (
                  <Card key={course.id} role="button" tabIndex={0} onClick={() => { setSelectedId(course.id); setActiveTab('info') }} onKeyDown={(event) => event.key === 'Enter' && setSelectedId(course.id)} className={`cursor-pointer overflow-hidden transition hover:-translate-y-0.5 ${selected ? 'border-[var(--accent)] shadow-[0_0_0_1px_var(--accent-soft)]' : 'hover:border-white/15'}`}>
                    <div className="h-1" style={{ backgroundColor: color }} />
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0"><CardTitle className="truncate">{course.name}</CardTitle><CardDescription className="mt-1">{course.code || 'بدون رمز'} · {course.instructor || 'لم يحدد المدرس'}</CardDescription></div>
                        <Button variant="ghost" size="icon" aria-label="تعديل المادة" onClick={(event) => { event.stopPropagation(); openEdit(course) }}><Pencil className="h-4 w-4" /></Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-[var(--text-secondary)]"><p>{course.department || 'لم يحدد القسم'}</p><p>{course.room ? `القاعة: ${course.room}` : 'لم تحدد القاعة'}</p></CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {isEditorOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(event) => event.currentTarget === event.target && setEditorOpen(false)}>
          <Card className="max-h-[92vh] w-full overflow-y-auto rounded-b-none sm:max-w-2xl sm:rounded-2xl">
            <CardHeader className="flex-row items-start justify-between"><div><CardTitle>{editingCourse ? 'تعديل المادة' : 'إضافة مادة'}</CardTitle><CardDescription>الاسم مطلوب، وبقية البيانات يمكن إكمالها لاحقًا.</CardDescription></div><Button variant="ghost" size="icon" onClick={() => setEditorOpen(false)}><X className="h-4 w-4" /></Button></CardHeader>
            <CardContent><form className="grid gap-4 sm:grid-cols-2" onSubmit={submitCourse}>
              <Field label="اسم المادة" required><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} autoFocus /></Field>
              <Field label="رمز المادة"><Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} /></Field>
              <Field label="المدرس"><Input value={draft.instructor} onChange={(e) => setDraft({ ...draft, instructor: e.target.value })} /></Field>
              <Field label="القسم أو التخصص"><Input value={draft.department} onChange={(e) => setDraft({ ...draft, department: e.target.value })} /></Field>
              <Field label="القاعة"><Input value={draft.room} onChange={(e) => setDraft({ ...draft, room: e.target.value })} /></Field>
              <Field label="لون المادة"><div className="flex h-10 items-center gap-2">{colorOptions.map(([name, color]) => <button key={name} type="button" onClick={() => setDraft({ ...draft, colorToken: name })} className={`h-7 w-7 rounded-full border-2 ${draft.colorToken === name ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} />)}</div></Field>
              <Field label="ملاحظات" className="sm:col-span-2"><textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} rows={4} className="input-control w-full" /></Field>
              <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="ghost" onClick={() => setEditorOpen(false)}>إلغاء</Button><Button type="submit" disabled={!draft.name.trim()}>حفظ المادة</Button></div>
            </form></CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

function CourseInspector({ course, related, average, activeTab, onTab, onEdit, onDelete, text, direction }: {
  course?: Course
  related: { sessions: SessionRecord[]; exams: ExamRecord[]; grades: GradeRecord[]; files: FileRecord[] }
  average: number | null
  activeTab: InspectorTab
  onTab: (tab: InspectorTab) => void
  onEdit: (course: Course) => void
  onDelete: (course: Course) => void
  text: typeof inspectorText.ar | typeof inspectorText.en | typeof inspectorText.tr
  direction: 'rtl' | 'ltr'
}) {
  if (!course) return <Card className="xl:sticky xl:top-6" dir={direction}><CardContent className="flex min-h-72 flex-col items-center justify-center px-6 text-center"><BookOpen className="mb-4 h-9 w-9 text-[var(--accent)]" /><h2 className="font-black">{text.choose}</h2><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{text.chooseHint}</p></CardContent></Card>
  const color = colorOptions.find(([name]) => name === course.colorToken)?.[1] ?? '#f4b942'
  const tabs: Array<[InspectorTab, string, typeof Files]> = [['info', text.info, BookOpen], ['files', text.files, Files], ['exams', text.exams, GraduationCap], ['grades', text.grades, ChartNoAxesColumn]]
  return (
    <Card className="overflow-hidden xl:sticky xl:top-6" dir={direction}>
      <div className="h-1.5" style={{ backgroundColor: color }} />
      <CardHeader><div className="rounded-2xl p-4" style={{ background: `linear-gradient(135deg, ${color}25, transparent)` }}><p className="text-xs font-bold text-[var(--accent)]">{course.code || 'COURSE'}</p><CardTitle className="mt-2 text-xl">{course.name}</CardTitle><CardDescription className="mt-1">{course.department}</CardDescription></div></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-1 rounded-xl bg-[var(--surface-2)] p-1">{tabs.map(([tab, label, Icon]) => <button key={tab} type="button" title={label} onClick={() => onTab(tab)} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[10px] ${activeTab === tab ? 'bg-[var(--surface-3)] text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}><Icon className="h-4 w-4" /><span>{label}</span></button>)}</div>
        {activeTab === 'info' ? <div className="space-y-3 text-sm"><Info icon={UserRound} label={text.instructor} value={course.instructor || '—'} /><Info icon={MapPin} label={text.room} value={course.room || '—'} /><Info icon={CalendarDays} label={text.schedule} value={related.sessions.length ? `${related.sessions.length} ${text.items}` : text.noSessions} /><div className="rounded-xl bg-[var(--surface-2)] p-4"><p className="text-xs text-[var(--text-muted)]">{text.courseProgress}</p><div className="mt-3 grid grid-cols-3 gap-2 text-center"><Stat value={related.files.length} label={text.files} /><Stat value={related.exams.length} label={text.exams} /><Stat value={average === null ? '—' : `${average.toFixed(0)}%`} label={text.average} /></div></div></div> : null}
        {activeTab === 'files' ? <RecordList empty={text.noFiles}>{related.files.map((file) => <RecordRow key={file.id} icon={Files} title={file.name} subtitle={file.folder || file.fileType || ''} />)}</RecordList> : null}
        {activeTab === 'exams' ? <RecordList empty={text.noExams}>{related.exams.map((exam) => <RecordRow key={exam.id} icon={GraduationCap} title={exam.title} subtitle={`${exam.date}${exam.startTime ? ` · ${exam.startTime}` : ''}`} />)}</RecordList> : null}
        {activeTab === 'grades' ? <RecordList empty={text.noGrades}>{related.grades.map((grade) => <RecordRow key={grade.id} icon={ChartNoAxesColumn} title={grade.title} subtitle={`${grade.score} / ${grade.maximumScore}`} />)}</RecordList> : null}
        <div className="grid grid-cols-2 gap-2"><Link to="/files"><Button variant="secondary" className="w-full gap-2"><FilePlus2 className="h-4 w-4" />{text.addFile}</Button></Link><Link to="/exams"><Button variant="secondary" className="w-full gap-2"><Plus className="h-4 w-4" />{text.addExam}</Button></Link><Button onClick={() => onEdit(course)} className="gap-2"><Pencil className="h-4 w-4" />{text.edit}</Button><Button variant="ghost" onClick={() => onDelete(course)} className="gap-2 text-red-400"><Trash2 className="h-4 w-4" />{text.delete}</Button></div>
      </CardContent>
    </Card>
  )
}

function Info({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) { return <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3"><Icon className="h-4 w-4 text-[var(--accent)]" /><div><p className="text-xs text-[var(--text-muted)]">{label}</p><p className="mt-1 font-bold">{value}</p></div></div> }
function Stat({ value, label }: { value: string | number; label: string }) { return <div><p className="text-lg font-black">{value}</p><p className="text-[10px] text-[var(--text-muted)]">{label}</p></div> }
function RecordList({ empty, children }: { empty: string; children: React.ReactNode }) { return <div className="max-h-64 space-y-2 overflow-y-auto">{Array.isArray(children) && children.length === 0 ? <p className="py-8 text-center text-sm text-[var(--text-muted)]">{empty}</p> : children}</div> }
function RecordRow({ icon: Icon, title, subtitle }: { icon: typeof Files; title: string; subtitle: string }) { return <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3"><div className="rounded-lg bg-[var(--surface-3)] p-2 text-[var(--accent)]"><Icon className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate text-sm font-bold">{title}</p><p className="mt-1 truncate text-xs text-[var(--text-muted)]">{subtitle}</p></div></div> }
function Field({ label, required, className = '', children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) { return <label className={`space-y-2 text-sm font-semibold ${className}`}><span>{label}{required ? <span className="text-red-400"> *</span> : null}</span>{children}</label> }
