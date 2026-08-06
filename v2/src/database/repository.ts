import { getAllRecords, getRecord, putRecord, removeRecord } from "@/database/database"
import type { Course, CourseSession, Exam, GradeItem, StudyFile } from "@/types/domain"

type StoreMap = {
  courses: Course
  courseSessions: CourseSession
  exams: Exam
  grades: GradeItem
  files: StudyFile
}

export class Repository<K extends keyof StoreMap> {
  constructor(private readonly storeName: K) {}

  getAll(): Promise<StoreMap[K][]> {
    return getAllRecords<StoreMap[K]>(this.storeName)
  }

  get(id: string): Promise<StoreMap[K] | undefined> {
    return getRecord<StoreMap[K]>(this.storeName, id)
  }

  async save(record: StoreMap[K]): Promise<StoreMap[K]> {
    await putRecord(this.storeName, record)
    return record
  }

  remove(id: string): Promise<void> {
    return removeRecord(this.storeName, id)
  }
}

export const coursesRepository = new Repository("courses")
export const courseSessionsRepository = new Repository("courseSessions")
export const examsRepository = new Repository("exams")
export const gradesRepository = new Repository("grades")
export const filesRepository = new Repository("files")
