export type StudyFileType = 'pdf' | 'document' | 'video' | 'image' | 'link' | 'other'
export type StudyFileSource = 'link' | 'drive'

export interface StudyFile {
  id: string
  userId: string
  courseId: string
  name: string
  fileType: StudyFileType
  folder: string
  note: string
  source: StudyFileSource
  url: string
  driveFileId: string | null
  size: number | null
  mimeType: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  version: number
  deviceId: string
}

export interface StudyFileDraft {
  courseId: string
  name: string
  fileType: StudyFileType
  folder: string
  note: string
  source: StudyFileSource
  url: string
}

export const emptyStudyFileDraft: StudyFileDraft = {
  courseId: '',
  name: '',
  fileType: 'link',
  folder: 'عام',
  note: '',
  source: 'link',
  url: '',
}
