import { afterEach, describe, expect, it, vi } from 'vitest'

import { createBackupEnvelope } from '@/services/backup/backup-engine'
import { GoogleDriveBackupAdapter } from '@/services/backup/google-drive-backup.adapter'

describe('GoogleDriveBackupAdapter', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lists only Axsis backups and sends the OAuth token', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      files: [{
        id: 'drive-1',
        name: 'axsis-backup.json',
        createdTime: '2026-08-06T10:00:00.000Z',
        modifiedTime: '2026-08-06T10:01:00.000Z',
        size: '1200',
        appProperties: {
          createdAt: '2026-08-06T09:59:00.000Z',
          appVersion: '0.1.0',
          deviceId: 'device-1',
        },
      }],
    }), { status: 200 }))

    const adapter = new GoogleDriveBackupAdapter(async () => 'token-123')
    const backups = await adapter.listBackups()

    expect(backups).toEqual([expect.objectContaining({
      id: 'drive-1',
      provider: 'google-drive',
      sizeBytes: 1200,
    })])
    const request = fetchMock.mock.calls[0]
    expect(String(request[0])).toContain('spaces=appDataFolder')
    expect(new Headers(request[1]?.headers).get('Authorization')).toBe('Bearer token-123')
  })

  it('verifies a downloaded backup before returning it', async () => {
    const envelope = await createBackupEnvelope(
      { courses: [] },
      {
        appVersion: '0.1.0',
        deviceId: 'device-1',
        createdAt: new Date('2026-08-06T10:00:00.000Z'),
      },
    )
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(envelope), { status: 200 }),
    )

    const adapter = new GoogleDriveBackupAdapter(async () => 'token-123')
    await expect(adapter.downloadBackup('drive-1')).resolves.toEqual(envelope)
  })

  it('rejects requests when no access token is available', async () => {
    const adapter = new GoogleDriveBackupAdapter(async () => '   ')
    await expect(adapter.listBackups()).rejects.toThrow('رمز الوصول')
  })
})
