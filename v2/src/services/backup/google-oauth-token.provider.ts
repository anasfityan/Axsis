const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client'
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata'

type TokenResponse = {
  access_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

type TokenClient = {
  requestAccessToken(options?: { prompt?: string }): void
}

type GoogleAccountsOAuth2 = {
  initTokenClient(config: {
    client_id: string
    scope: string
    callback: (response: TokenResponse) => void
    error_callback?: (error: unknown) => void
  }): TokenClient
}

type GoogleIdentityWindow = Window & {
  google?: {
    accounts?: {
      oauth2?: GoogleAccountsOAuth2
    }
  }
}

export interface GoogleDriveTokenProvider {
  readonly configured: boolean
  getAccessToken(): Promise<string>
  clear(): void
}

export function createGoogleDriveTokenProvider(clientId: string): GoogleDriveTokenProvider {
  let cachedToken = ''
  let expiresAt = 0
  let tokenClient: TokenClient | null = null
  const normalizedClientId = clientId.trim()

  return {
    configured: Boolean(normalizedClientId),

    async getAccessToken(): Promise<string> {
      if (!normalizedClientId) {
        throw new Error('معرّف Google OAuth غير مضبوط في إعدادات التطبيق.')
      }

      if (cachedToken && Date.now() < expiresAt - 60_000) return cachedToken

      await loadGoogleIdentityScript()
      const oauth2 = (window as GoogleIdentityWindow).google?.accounts?.oauth2
      if (!oauth2) throw new Error('تعذر تحميل خدمة تسجيل الدخول إلى Google.')

      return new Promise<string>((resolve, reject) => {
        tokenClient ??= oauth2.initTokenClient({
          client_id: normalizedClientId,
          scope: DRIVE_SCOPE,
          callback: (response) => {
            if (!response.access_token) {
              reject(new Error(response.error_description || response.error || 'لم يمنح Google رمز وصول صالحًا.'))
              return
            }

            cachedToken = response.access_token
            expiresAt = Date.now() + Math.max(60, response.expires_in ?? 3600) * 1_000
            resolve(cachedToken)
          },
          error_callback: () => reject(new Error('تعذر إكمال تسجيل الدخول إلى Google Drive.')),
        })

        tokenClient.requestAccessToken({ prompt: cachedToken ? '' : 'consent' })
      })
    },

    clear(): void {
      cachedToken = ''
      expiresAt = 0
    },
  }
}

let scriptPromise: Promise<void> | null = null

function loadGoogleIdentityScript(): Promise<void> {
  if ((window as GoogleIdentityWindow).google?.accounts?.oauth2) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_IDENTITY_SCRIPT}"]`)
    const script = existing ?? document.createElement('script')

    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('تعذر تحميل مكتبة Google Identity Services.')), { once: true })

    if (!existing) {
      script.src = GOOGLE_IDENTITY_SCRIPT
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  })

  return scriptPromise
}
