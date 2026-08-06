import { useCallback, useEffect, useMemo, useState } from 'react'
import { ExternalLink, FileText, FolderOpen, Link2, Pencil, Plus, Search, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { listCourses } from '@/features/courses/course.repository'
import type { Course } from '@/features/courses/course.types'
import { listStudyFiles, removeStudyFile, saveStudyFile } from '@/features/files/file.repository'
import {
  emptyStudyFileDraft,
  type StudyFile,
  type StudyFileDraft,
  type StudyFileType,
} from '@/features/files/file.types'

const folders = ['عام', 'المحاضرات', 'الواجبات', 'النصفي', 'النهائي']
const fileTypes: Array<[StudyFileType, string]> = [
  ['pdf', 'PDF'],
  ['document', 'مستند'],
  ['video', 'فيديو'],
  ['image', 'صورة'],
  ['link', 'رابط'],
  ['other', 'أخرى'],
]

export function FilesPage() {
  const [files, setFiles] = useState<StudyFile[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [query, setQuery] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [folderFilter, setFolderFilter] = useState('all')
  const [isEditorOpen, setEditorOpen] = useState(false)
  const [editingFile, setEditingFile] = useState<StudyFile | undefined>()
  const [draft, setDraft] = useState<StudyFileDraft>(emptyStudyFileDraft)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const [nextFiles, nextCourses] = await Promise.all([listStudyFiles(), listCourses()])
      setFiles(nextFiles)
      setCourses(nextCourses)
    } catch (loadError) {
      console.error(loadError)
      setError('تعذر تحميل الملفات من التخزين المحلي.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const coursesById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses])

  const visibleFiles = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ar')
    return files.filter((file) => {
      const course = coursesById.get(file.courseId)
      const matchesQuery = !normalized || [file.name, file.folder, file.note, course?.name ?? '']
        .join(' ')
        .toLocaleLowerCase('ar')
        .includes(normalized)
      const matchesCourse = courseFilter === 'all' || file.courseId === courseFilter
      const matchesFolder = folderFilter === 'all' || file.folder === folderFilter
      return matchesQuery && matchesCourse && matchesFolder
    })
  }, [courseFilter, coursesById, files, folderFilter, query])

  const availableFolders = useMemo(
    () => Array.from(new Set([...folders, ...files.map((file) => file.folder)])).filter(Boolean),
    [files],
  )

  function openCreate() {
    setEditingFile(undefined)
    setDraft({ ...emptyStudyFileDraft, courseId: courses[0]?.id ?? '' })
    setEditorOpen(true)
  }

  function openEdit(file: StudyFile) {
    setEditingFile(file)
    setDraft({
      courseId: file.courseId,
      name: file.name,
      fileType: file.fileType,
      folder: file.folder,
      note: file.note,
      source: file.source,
      url: file.url,
    })
    setEditorOpen(true)
  }

  async function submitFile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.courseId || !draft.name.trim() || !draft.url.trim()) return
    try {
      new URL(draft.url)
      await saveStudyFile(draft, editingFile)
      setEditorOpen(false)
      await load()
    } catch (saveError) {
      console.error(saveError)
      setError('تعذر حفظ الملف. تأكد من صحة الرابط.')
    }
  }

  async function deleteFile(file: StudyFile) {
    if (!window.confirm(`حذف «${file.name}»؟`)) return
    try {
      await removeStudyFile(file)
      await load()
    } catch (deleteError) {
      console.error(deleteError)
      setError('تعذر حذف الملف.')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--accent)]">مكتبة الدراسة</p>
          <h1 className="text-3xl font-black tracking-tight">الملفات</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            نظّم روابط الملفات والمصادر حسب المادة والمجلد. رفع Drive سيُضاف كخدمة مستقلة لاحقًا.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!courses.length} className="gap-2">
          <Plus className="h-4 w-4" /> إضافة ملف أو رابط
        </Button>
      </header>

      <Card>
        <CardContent className="grid gap-3 pt-6 lg:grid-cols-[1fr_220px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث في الملفات والملاحظات" className="pr-10" />
          </div>
          <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm outline-none">
            <option value="all">كل المواد</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
          </select>
          <select value={folderFilter} onChange={(event) => setFolderFilter(event.target.value)} className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm outline-none">
            <option value="all">كل المجلدات</option>
            {availableFolders.map((folder) => <option key={folder} value={folder}>{folder}</option>)}
          </select>
        </CardContent>
      </Card>

      {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}

      {!courses.length && !isLoading ? (
        <Card><CardContent className="py-12 text-center text-[var(--text-secondary)]">أضف مادة أولًا قبل إضافة ملفات مرتبطة بها.</CardContent></Card>
      ) : isLoading ? (
        <Card><CardContent className="py-12 text-center text-[var(--text-secondary)]">جاري تحميل الملفات…</CardContent></Card>
      ) : visibleFiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14 text-center">
            <div className="mb-4 rounded-2xl bg-[var(--surface-3)] p-4 text-[var(--accent)]"><FolderOpen className="h-7 w-7" /></div>
            <h2 className="text-lg font-bold">{files.length ? 'لا توجد نتائج مطابقة' : 'لا توجد ملفات بعد'}</h2>
            <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">أضف رابط محاضرة أو ملف PDF أو فيديو، ثم رتبه داخل مجلد واضح.</p>
            {!files.length ? <Button onClick={openCreate} className="mt-5 gap-2"><Plus className="h-4 w-4" /> إضافة أول ملف</Button> : null}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleFiles.map((file) => {
            const course = coursesById.get(file.courseId)
            return (
              <Card key={file.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="rounded-xl bg-[var(--surface-3)] p-3 text-[var(--accent)]">{file.fileType === 'link' ? <Link2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}</div>
                      <div className="min-w-0">
                        <CardTitle className="truncate text-base">{file.name}</CardTitle>
                        <CardDescription className="mt-1">{course?.name ?? 'مادة غير موجودة'} · {file.folder}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" aria-label="تعديل الملف" onClick={() => openEdit(file)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" aria-label="حذف الملف" onClick={() => void deleteFile(file)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {file.note ? <p className="line-clamp-2 text-sm text-[var(--text-secondary)]">{file.note}</p> : null}
                  <a href={file.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline">
                    فتح المصدر <ExternalLink className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {isEditorOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(event) => event.currentTarget === event.target && setEditorOpen(false)}>
          <Card className="max-h-[92vh] w-full overflow-y-auto rounded-b-none sm:max-w-2xl sm:rounded-2xl">
            <CardHeader className="flex-row items-start justify-between">
              <div><CardTitle>{editingFile ? 'تعديل الملف' : 'إضافة ملف أو رابط'}</CardTitle><CardDescription>النسخة الحالية تحفظ بيانات المصدر ورابطه محليًا.</CardDescription></div>
              <Button variant="ghost" size="icon" onClick={() => setEditorOpen(false)} aria-label="إغلاق"><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={submitFile}>
                <Field label="المادة" required><select value={draft.courseId} onChange={(e) => setDraft({ ...draft, courseId: e.target.value })} className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm outline-none">{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></Field>
                <Field label="اسم الملف" required><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} autoFocus /></Field>
                <Field label="نوع المصدر"><select value={draft.fileType} onChange={(e) => setDraft({ ...draft, fileType: e.target.value as StudyFileType })} className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm outline-none">{fileTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
                <Field label="المجلد"><Input list="file-folders" value={draft.folder} onChange={(e) => setDraft({ ...draft, folder: e.target.value })} /><datalist id="file-folders">{availableFolders.map((folder) => <option key={folder} value={folder} />)}</datalist></Field>
                <Field label="الرابط" required className="sm:col-span-2"><Input type="url" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://..." dir="ltr" /></Field>
                <Field label="ملاحظات" className="sm:col-span-2"><textarea value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} rows={4} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none transition focus:border-[var(--accent)]" /></Field>
                <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="ghost" onClick={() => setEditorOpen(false)}>إلغاء</Button><Button type="submit" disabled={!draft.courseId || !draft.name.trim() || !draft.url.trim()}>حفظ</Button></div>
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
