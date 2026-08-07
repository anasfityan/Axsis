import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, BriefcaseBusiness, ChartNoAxesColumn, FilePlus2, Files, GraduationCap, Pencil, Plus, Search, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getAllRecords, stores } from '@/database/database'
import { listCourses, removeCourse, saveCourse } from '@/features/courses/course.repository'
import { emptyCourseDraft, type Course, type CourseDraft } from '@/features/courses/course.types'
import { useLanguage } from '@/i18n/LanguageProvider'

const colorOptions = [
  ['amber', '#f4b942'], ['blue', '#3b82f6'], ['green', '#22c55e'],
  ['rose', '#f43f5e'], ['violet', '#8b5cf6'], ['cyan', '#06b6d4'],
] as const

type InspectorTab = 'files' | 'exams' | 'grades'
type RelatedRecord = { id: string; courseId: string; deletedAt?: string | null }
type ExamRecord = RelatedRecord & { title: string; date: string; startTime?: string }
type GradeRecord = RelatedRecord & { title: string; score: number; maximumScore: number }
type FileRecord = RelatedRecord & { name: string; folder?: string; fileType?: string }

const copy = {
  ar: { eyebrow: 'إدارة الدراسة', title: 'المواد', subtitle: 'نظّم موادك وملفاتها واختباراتها من مساحة واحدة.', add: 'إضافة مادة', search: 'ابحث باسم المادة أو المدرس أو الرمز', choose: 'اختر مادة', chooseHint: 'اختر بطاقة مادة لعرض ملفاتها واختباراتها ودرجاتها.', files: 'الملفات', exams: 'الاختبارات', grades: 'الدرجات', noFiles: 'لا توجد ملفات مرتبطة بهذه المادة', noExams: 'لا توجد اختبارات مرتبطة بهذه المادة', noGrades: 'لا توجد درجات مرتبطة بهذه المادة', addFile: 'إضافة ملف', addExam: 'إضافة اختبار', edit: 'تعديل المادة', delete: 'حذف المادة', noCode: 'بدون رمز', noTeacher: 'لم يحدد المدرس', noDepartment: 'لم يحدد القسم', noRoom: 'لم تحدد القاعة', room: 'القاعة', loading: 'جاري تحميل المواد…', noResults: 'لا توجد نتائج مطابقة', noCourses: 'لم تُضف أي مادة بعد' },
  en: { eyebrow: 'Study management', title: 'Courses', subtitle: 'Manage courses, files, exams, and grades from one workspace.', add: 'Add course', search: 'Search by course, instructor, or code', choose: 'Select a course', chooseHint: 'Select a course card to view its files, exams, and grades.', files: 'Files', exams: 'Exams', grades: 'Grades', noFiles: 'No files are linked to this course', noExams: 'No exams are linked to this course', noGrades: 'No grades are linked to this course', addFile: 'Add file', addExam: 'Add exam', edit: 'Edit course', delete: 'Delete course', noCode: 'No code', noTeacher: 'Instructor not set', noDepartment: 'Department not set', noRoom: 'Room not set', room: 'Room', loading: 'Loading courses…', noResults: 'No matching results', noCourses: 'No courses added yet' },
  tr: { eyebrow: 'Ders yönetimi', title: 'Dersler', subtitle: 'Dersleri, dosyaları, sınavları ve notları tek alandan yönetin.', add: 'Ders ekle', search: 'Ders, öğretim görevlisi veya kod ile ara', choose: 'Ders seçin', chooseHint: 'Dosya, sınav ve notlarını görmek için bir ders kartı seçin.', files: 'Dosyalar', exams: 'Sınavlar', grades: 'Notlar', noFiles: 'Bu derse bağlı dosya yok', noExams: 'Bu derse bağlı sınav yok', noGrades: 'Bu derse bağlı not yok', addFile: 'Dosya ekle', addExam: 'Sınav ekle', edit: 'Dersi düzenle', delete: 'Dersi sil', noCode: 'Kod yok', noTeacher: 'Öğretim görevlisi belirtilmedi', noDepartment: 'Bölüm belirtilmedi', noRoom: 'Derslik belirtilmedi', room: 'Derslik', loading: 'Dersler yükleniyor…', noResults: 'Eşleşen sonuç yok', noCourses: 'Henüz ders eklenmedi' },
} as const

export function CoursesPage() {
  const { locale, direction } = useLanguage()
  const text = copy[locale]
  const [courses, setCourses] = useState<Course[]>([])
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<InspectorTab>('files')
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
      const [courseRecords, examRecords, gradeRecords, fileRecords] = await Promise.all([
        listCourses(), getAllRecords<ExamRecord>(stores.exams), getAllRecords<GradeRecord>(stores.grades), getAllRecords<FileRecord>(stores.files),
      ])
      setCourses(courseRecords)
      setExams(examRecords.filter((item) => !item.deletedAt))
      setGrades(gradeRecords.filter((item) => !item.deletedAt))
      setFiles(fileRecords.filter((item) => !item.deletedAt))
      setSelectedId((current) => current && courseRecords.some((course) => course.id === current) ? current : courseRecords[0]?.id ?? null)
    } catch (loadError) {
      console.error(loadError)
      setError(locale === 'ar' ? 'تعذر تحميل المواد من التخزين المحلي.' : locale === 'tr' ? 'Dersler yerel depolamadan yüklenemedi.' : 'Could not load courses from local storage.')
    } finally { setLoading(false) }
  }, [locale])

  useEffect(() => { void load() }, [load])

  const filteredCourses = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale)
    if (!normalized) return courses
    return courses.filter((course) => [course.name, course.code, course.instructor, course.department].join(' ').toLocaleLowerCase(locale).includes(normalized))
  }, [courses, locale, query])

  const selectedCourse = courses.find((course) => course.id === selectedId)
  const related = useMemo(() => ({
    exams: exams.filter((item) => item.courseId === selectedId),
    grades: grades.filter((item) => item.courseId === selectedId),
    files: files.filter((item) => item.courseId === selectedId),
  }), [exams, files, grades, selectedId])

  function openCreate() { setEditingCourse(undefined); setDraft(emptyCourseDraft); setEditorOpen(true) }
  function openEdit(course: Course) { setEditingCourse(course); setDraft({ name: course.name, code: course.code, instructor: course.instructor, department: course.department, room: course.room, colorToken: course.colorToken, notes: course.notes }); setEditorOpen(true) }

  async function submitCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.name.trim()) return
    try {
      const saved = await saveCourse(draft, editingCourse)
      setEditorOpen(false)
      if (saved?.id) setSelectedId(saved.id)
      await load()
    } catch (saveError) { console.error(saveError); setError('تعذر حفظ المادة.') }
  }

  async function deleteCourse(course: Course) {
    if (!window.confirm(`حذف مادة «${course.name}»؟`)) return
    try { await removeCourse(course); if (selectedId === course.id) setSelectedId(null); await load() }
    catch (deleteError) { console.error(deleteError); setError('تعذر حذف المادة.') }
  }

  return (
    <div className="space-y-5" dir={direction}>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-[var(--accent)]">{text.eyebrow}</p>
          <h1 className="text-3xl font-black tracking-tight">{text.title}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{text.subtitle}</p>
        </div>
        <Button onClick={openCreate} className="gap-2 self-start lg:self-auto"><Plus className="h-4 w-4" />{text.add}</Button>
      </header>

      {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{error}</div> : null}

      <div className="grid items-start gap-5 xl:grid-cols-[320px_minmax(0,1fr)]" style={{ direction: 'ltr' }}>
        <CourseInspector course={selectedCourse} related={related} activeTab={activeTab} onTab={setActiveTab} onEdit={openEdit} onDelete={(course) => void deleteCourse(course)} text={text} direction={direction} />

        <section className="space-y-4" dir={direction}>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-3 shadow-sm">
            <div className="relative">
              <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.search} className="border-0 bg-transparent pe-10 shadow-none focus-visible:ring-0" />
            </div>
          </div>

          {isLoading ? (
            <Card><CardContent className="py-12 text-center text-[var(--text-secondary)]">{text.loading}</CardContent></Card>
          ) : filteredCourses.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center py-14 text-center"><BookOpen className="mb-4 h-7 w-7 text-[var(--accent)]" /><h2 className="text-lg font-bold">{courses.length ? text.noResults : text.noCourses}</h2></CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {filteredCourses.map((course) => {
                const color = colorOptions.find(([name]) => name === course.colorToken)?.[1] ?? '#f4b942'
                const selected = course.id === selectedId
                const counts = { files: files.filter((item) => item.courseId === course.id).length, exams: exams.filter((item) => item.courseId === course.id).length, grades: grades.filter((item) => item.courseId === course.id).length }
                return (
                  <Card key={course.id} role="button" tabIndex={0} onClick={() => { setSelectedId(course.id); setActiveTab('files') }} onKeyDown={(event) => event.key === 'Enter' && setSelectedId(course.id)} className={`group relative cursor-pointer overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-lg ${selected ? 'border-[var(--accent)] shadow-[0_0_0_1px_var(--accent-soft)]' : 'hover:border-[var(--border-strong)]'}`}>
                    <div className="pointer-events-none absolute -end-12 -top-12 h-32 w-32 rounded-full opacity-10 blur-2xl" style={{ backgroundColor: color }} />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}18`, color }}><BriefcaseBusiness className="h-5 w-5" /></div>
                          <CardTitle className="truncate">{course.name}</CardTitle>
                          <CardDescription className="mt-1">{course.code || text.noCode} · {course.instructor || text.noTeacher}</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" aria-label={text.edit} onClick={(event) => { event.stopPropagation(); openEdit(course) }}><Pencil className="h-4 w-4" /></Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1 text-sm text-[var(--text-secondary)]"><p>{course.department || text.noDepartment}</p><p>{course.room ? `${text.room}: ${course.room}` : text.noRoom}</p></div>
                      <div className="grid grid-cols-3 gap-2 border-t border-[var(--border)] pt-4 text-center">
                        <MiniStat value={counts.files} label={text.files} />
                        <MiniStat value={counts.exams} label={text.exams} />
                        <MiniStat value={counts.grades} label={text.grades} />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {isEditorOpen ? <EditorModal editingCourse={editingCourse} draft={draft} setDraft={setDraft} close={() => setEditorOpen(false)} submit={submitCourse} colorOptions={colorOptions} /> : null}
    </div>
  )
}

function CourseInspector({ course, related, activeTab, onTab, onEdit, onDelete, text, direction }: { course?: Course; related: { exams: ExamRecord[]; grades: GradeRecord[]; files: FileRecord[] }; activeTab: InspectorTab; onTab: (tab: InspectorTab) => void; onEdit: (course: Course) => void; onDelete: (course: Course) => void; text: typeof copy.ar | typeof copy.en | typeof copy.tr; direction: 'rtl' | 'ltr' }) {
  if (!course) return <Card className="xl:sticky xl:top-6" dir={direction}><CardContent className="flex min-h-72 flex-col items-center justify-center px-6 text-center"><Files className="mb-4 h-9 w-9 text-[var(--accent)]" /><h2 className="font-black">{text.choose}</h2><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{text.chooseHint}</p></CardContent></Card>
  const tabs: Array<[InspectorTab, string, typeof Files, number]> = [['files', text.files, Files, related.files.length], ['exams', text.exams, GraduationCap, related.exams.length], ['grades', text.grades, ChartNoAxesColumn, related.grades.length]]
  return (
    <Card className="overflow-hidden xl:sticky xl:top-6" dir={direction}>
      <CardHeader className="border-b border-[var(--border)] pb-4"><p className="text-xs font-bold text-[var(--accent)]">{course.code || 'COURSE'}</p><CardTitle className="mt-1 text-xl">{course.name}</CardTitle></CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--surface-2)] p-1">{tabs.map(([tab, label, Icon, count]) => <button key={tab} type="button" onClick={() => onTab(tab)} className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[10px] ${activeTab === tab ? 'bg-[var(--surface-3)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-muted)]'}`}><Icon className="h-4 w-4" /><span>{label}</span><span className="absolute end-1 top-1 rounded-full bg-[var(--surface-1)] px-1.5 text-[9px]">{count}</span></button>)}</div>
        {activeTab === 'files' ? <RecordList empty={text.noFiles}>{related.files.map((file) => <RecordRow key={file.id} icon={Files} title={file.name} subtitle={file.folder || file.fileType || ''} />)}</RecordList> : null}
        {activeTab === 'exams' ? <RecordList empty={text.noExams}>{related.exams.map((exam) => <RecordRow key={exam.id} icon={GraduationCap} title={exam.title} subtitle={`${exam.date}${exam.startTime ? ` · ${exam.startTime}` : ''}`} />)}</RecordList> : null}
        {activeTab === 'grades' ? <RecordList empty={text.noGrades}>{related.grades.map((grade) => <RecordRow key={grade.id} icon={ChartNoAxesColumn} title={grade.title} subtitle={`${grade.score} / ${grade.maximumScore}`} />)}</RecordList> : null}
        <div className="grid grid-cols-2 gap-2"><Link to="/files"><Button variant="secondary" className="w-full gap-2"><FilePlus2 className="h-4 w-4" />{text.addFile}</Button></Link><Link to="/exams"><Button variant="secondary" className="w-full gap-2"><Plus className="h-4 w-4" />{text.addExam}</Button></Link><Button onClick={() => onEdit(course)} className="gap-2"><Pencil className="h-4 w-4" />{text.edit}</Button><Button variant="ghost" onClick={() => onDelete(course)} className="gap-2 text-red-400"><Trash2 className="h-4 w-4" />{text.delete}</Button></div>
      </CardContent>
    </Card>
  )
}

function EditorModal({ editingCourse, draft, setDraft, close, submit, colorOptions }: { editingCourse?: Course; draft: CourseDraft; setDraft: React.Dispatch<React.SetStateAction<CourseDraft>>; close: () => void; submit: (event: React.FormEvent<HTMLFormElement>) => void; colorOptions: readonly (readonly [string, string])[] }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(event) => event.currentTarget === event.target && close()}><Card className="max-h-[92vh] w-full overflow-y-auto rounded-b-none sm:max-w-2xl sm:rounded-2xl"><CardHeader className="flex-row items-start justify-between"><div><CardTitle>{editingCourse ? 'تعديل المادة' : 'إضافة مادة'}</CardTitle><CardDescription>الاسم مطلوب، وبقية البيانات يمكن إكمالها لاحقًا.</CardDescription></div><Button variant="ghost" size="icon" onClick={close}><X className="h-4 w-4" /></Button></CardHeader><CardContent><form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}><Field label="اسم المادة" required><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} autoFocus /></Field><Field label="رمز المادة"><Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} /></Field><Field label="المدرس"><Input value={draft.instructor} onChange={(e) => setDraft({ ...draft, instructor: e.target.value })} /></Field><Field label="القسم أو التخصص"><Input value={draft.department} onChange={(e) => setDraft({ ...draft, department: e.target.value })} /></Field><Field label="القاعة"><Input value={draft.room} onChange={(e) => setDraft({ ...draft, room: e.target.value })} /></Field><Field label="لون المادة"><div className="flex h-10 items-center gap-2">{colorOptions.map(([name, color]) => <button key={name} type="button" onClick={() => setDraft({ ...draft, colorToken: name })} className={`h-7 w-7 rounded-full border-2 ${draft.colorToken === name ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} />)}</div></Field><Field label="ملاحظات" className="sm:col-span-2"><textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} rows={4} className="input-control w-full" /></Field><div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="ghost" onClick={close}>إلغاء</Button><Button type="submit" disabled={!draft.name.trim()}>حفظ المادة</Button></div></form></CardContent></Card></div>
}

function MiniStat({ value, label }: { value: number; label: string }) { return <div><p className="text-lg font-black">{value}</p><p className="text-[10px] text-[var(--text-muted)]">{label}</p></div> }
function RecordList({ empty, children }: { empty: string; children: React.ReactNode }) { const items = Array.isArray(children) ? children : [children]; return <div className="max-h-80 space-y-2 overflow-y-auto">{items.length === 0 ? <p className="py-10 text-center text-sm text-[var(--text-muted)]">{empty}</p> : children}</div> }
function RecordRow({ icon: Icon, title, subtitle }: { icon: typeof Files; title: string; subtitle: string }) { return <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3"><div className="rounded-lg bg-[var(--surface-3)] p-2 text-[var(--accent)]"><Icon className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate text-sm font-bold">{title}</p><p className="mt-1 truncate text-xs text-[var(--text-muted)]">{subtitle}</p></div></div> }
function Field({ label, required, className = '', children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) { return <label className={`space-y-2 text-sm font-semibold ${className}`}><span>{label}{required ? <span className="text-red-400"> *</span> : null}</span>{children}</label> }
