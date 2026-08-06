import {
  parseAndVerifyBackupEnvelope,
  serializeBackupEnvelope,
  type BackupEnvelope,
} from '@/services/backup/backup-engine'
import type {
  BackupStorageAdapter,
  BackupStorageHealth,
  StoredBackupSummary,
} from '@/services/backup/backup-storage.types'

export type DriveAccessTokenProvider = () => Promise<string>

interface DriveFile {
  id?: string
  name?: string
  createdTime?: string
  modifiedTime?: string
  size?: string
  appProperties?: Record<string, string>
}

interface DriveFileListResponse {
  files?: DriveFile[]
}

const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3'
const BACKUP_MARKER_KEY = 'axsisBackup'
const BACKUP_MARKER_VALUE = 'true'

export class GoogleDriveBackupAdapter implements BackupStorageAdapter {
  readonly provider = 'google-drive'

  constructor(private readonly getAccessToken: DriveAccessTokenProvider) {}

  async checkHealth(): Promise<BackupStorageHealth> {
    try {
      const response = await this.request(`${DRIVE_API}/about?fields=user`)
      return {
        configured: true,
        reachable: response.ok,
        authenticated: response.ok,
        provider: this.provider,
      }
    } catch {
      return {
        configured: true,
        reachable: false,
        authenticated: false,
        provider: this.provider,
      }
    }
  }

  async listBackups(): Promise<StoredBackupSummary[]> {
    const query = encodeURIComponent(
      `trashed = false and appProperties has { key='${BACKUP_MARKER_KEY}' and value='${BACKUP_MARKER_VALUE}' }`,
    )
    const fields = encodeURIComponent(
      'files(id,name,createdTime,modifiedTime,size,appProperties)',
    )
    const response = await this.request(
      `${DRIVE_API}/files?q=${query}&spaces=appDataFolder&orderBy=createdTime desc&fields=${fields}`,
    )
    await assertOk(response, 'تعذر جلب النسخ الاحتياطية من Google Drive.')

    const payload = await response.json() as DriveFileListResponse
    return (payload.files ?? []).map(toSummary)
  }

  async uploadBackup(
    envelope: BackupEnvelope,
    fileName: string,
  ): Promise<StoredBackupSummary> {
    const metadata = {
      name: fileName,
      parents: ['appDataFolder'],
      mimeType: 'application/json',
      appProperties: {
        [BACKUP_MARKER_KEY]: BACKUP_MARKER_VALUE,
        appVersion: envelope.metadata.appVersion,
        deviceId: envelope.metadata.deviceId,
        createdAt: envelope.metadata.createdAt,
      },
    }

    const boundary = `axsis-${crypto.randomUUID()}`
    const body = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(metadata),
      `--${boundary}`,
      'Content-Type: application/json',
      '',
      serializeBackupEnvelope(envelope),
      `--${boundary}--`,
      '',
    ].join('\r\n')

    const response = await this.request(
      `${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,name,createdTime,modifiedTime,size,appProperties`,
      {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      },
    )
    await assertOk(response, 'تعذر رفع النسخة الاحتياطية إلى Google Drive.')
    return toSummary(await response.json() as DriveFile)
  }

  async downloadBackup(id: string): Promise<BackupEnvelope> {
    const response = await this.request(`${DRIVE_API}/files/${encodeURIComponent(id)}?alt=media`)
    await assertOk(response, 'تعذر تنزيل النسخة الاحتياطية من Google Drive.')
    return parseAndVerifyBackupEnvelope(await response.text())
  }

  async deleteBackup(id: string): Promise<void> {
    const response = await this.request(
      `${DRIVE_API}/files/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
    )
    await assertOk(response, 'تعذر حذف النسخة الاحتياطية من Google Drive.')
  }

  private async request(url: string, init: RequestInit = {}): Promise<Response> {
    const accessToken = (await this.getAccessToken()).trim()
    if (!accessToken) throw new Error('رمز الوصول إلى Google Drive غير متاح.')

    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${accessToken}`)
    return fetch(url, { ...init, headers })
  }
}

function toSummary(file: DriveFile): StoredBackupSummary {
  if (!file.id || !file.name) throw new Error('استجابة Google Drive لا تحتوي معرّفًا صالحًا للنسخة.')
  const properties = file.appProperties ?? {}
  return {
    id: file.id,
    name: file.name,
    createdAt: properties.createdAt || file.createdTime || new Date(0).toISOString(),
    appVersion: properties.appVersion || 'unknown',
    deviceId: properties.deviceId || 'unknown-device',
    sizeBytes: Number.parseInt(file.size ?? '0', 10) || 0,
    provider: 'google-drive',
  }
}

async function assertOk(response: Response, fallbackMessage: string): Promise<void> {
  if (response.ok) return
  let detail = ''
  try {
    const payload = await response.json() as { error?: { message?: string } }
    detail = payload.error?.message?.trim() ?? ''
  } catch {
    detail = ''
  }
  throw new Error(detail ? `${fallbackMessage} ${detail}` : fallbackMessage)
}
