import type { BackupEnvelope } from '@/services/backup/backup-engine'

export interface StoredBackupSummary {
  id: string
  name: string
  createdAt: string
  appVersion: string
  deviceId: string
  sizeBytes: number
  provider: string
}

export interface BackupStorageHealth {
  configured: boolean
  reachable: boolean
  authenticated: boolean
  provider: string
}

export interface BackupStorageAdapter {
  readonly provider: string
  checkHealth(): Promise<BackupStorageHealth>
  listBackups(): Promise<StoredBackupSummary[]>
  uploadBackup(envelope: BackupEnvelope, fileName: string): Promise<StoredBackupSummary>
  downloadBackup(id: string): Promise<BackupEnvelope>
  deleteBackup(id: string): Promise<void>
}
