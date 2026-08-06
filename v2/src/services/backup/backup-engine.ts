export const BACKUP_FORMAT_VERSION = 1
export const BACKUP_APP_ID = 'axsis-v2' as const

export interface BackupMetadata {
  app: typeof BACKUP_APP_ID
  formatVersion: number
  appVersion: string
  createdAt: string
  deviceId: string
}

export interface BackupEnvelope<TPayload = unknown> {
  metadata: BackupMetadata
  payload: TPayload
  checksum: string
}

export interface CreateBackupEnvelopeOptions {
  appVersion: string
  deviceId: string
  createdAt?: Date
}

export async function createBackupEnvelope<TPayload>(
  payload: TPayload,
  options: CreateBackupEnvelopeOptions,
): Promise<BackupEnvelope<TPayload>> {
  const metadata: BackupMetadata = {
    app: BACKUP_APP_ID,
    formatVersion: BACKUP_FORMAT_VERSION,
    appVersion: options.appVersion.trim() || 'unknown',
    createdAt: (options.createdAt ?? new Date()).toISOString(),
    deviceId: options.deviceId.trim() || 'unknown-device',
  }

  return {
    metadata,
    payload,
    checksum: await calculateBackupChecksum(metadata, payload),
  }
}

export async function verifyBackupEnvelope(
  value: unknown,
): Promise<{ valid: true; envelope: BackupEnvelope } | { valid: false; reason: string }> {
  if (!isBackupEnvelope(value)) return { valid: false, reason: 'invalid-structure' }
  if (value.metadata.app !== BACKUP_APP_ID) return { valid: false, reason: 'wrong-application' }
  if (value.metadata.formatVersion !== BACKUP_FORMAT_VERSION) {
    return { valid: false, reason: 'unsupported-format-version' }
  }

  const expectedChecksum = await calculateBackupChecksum(value.metadata, value.payload)
  if (expectedChecksum !== value.checksum) return { valid: false, reason: 'checksum-mismatch' }

  return { valid: true, envelope: value }
}

export async function parseAndVerifyBackupEnvelope(text: string): Promise<BackupEnvelope> {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('ملف النسخة الاحتياطية ليس JSON صالحًا.')
  }

  const result = await verifyBackupEnvelope(parsed)
  if (!result.valid) throw new Error(verificationMessage(result.reason))
  return result.envelope
}

export function serializeBackupEnvelope(envelope: BackupEnvelope): string {
  return JSON.stringify(envelope, null, 2)
}

async function calculateBackupChecksum(metadata: BackupMetadata, payload: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(stableSerialize({ metadata, payload }))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function isBackupEnvelope(value: unknown): value is BackupEnvelope {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  const metadata = record.metadata
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return false

  const metadataRecord = metadata as Record<string, unknown>
  return typeof metadataRecord.app === 'string'
    && typeof metadataRecord.formatVersion === 'number'
    && typeof metadataRecord.appVersion === 'string'
    && typeof metadataRecord.createdAt === 'string'
    && typeof metadataRecord.deviceId === 'string'
    && typeof record.checksum === 'string'
    && 'payload' in record
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`
  if (value === null || typeof value !== 'object') return JSON.stringify(value)

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
  return `{${entries.join(',')}}`
}

function verificationMessage(reason: string): string {
  switch (reason) {
    case 'wrong-application':
      return 'هذه النسخة الاحتياطية لا تخص تطبيق Axsis.'
    case 'unsupported-format-version':
      return 'إصدار ملف النسخة الاحتياطية غير مدعوم.'
    case 'checksum-mismatch':
      return 'فشل التحقق من سلامة النسخة الاحتياطية؛ قد يكون الملف تالفًا أو معدّلًا.'
    default:
      return 'بنية ملف النسخة الاحتياطية غير صالحة.'
  }
}
