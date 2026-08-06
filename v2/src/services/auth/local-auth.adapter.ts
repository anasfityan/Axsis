import type {
  AuthAdapter,
  AuthSession,
  SignInCredentials,
  SignUpCredentials,
} from '@/services/auth/auth.types'

const SESSION_KEY = 'axsis-v2-auth-session'
const LOCAL_USER_ID_KEY = 'axsis-v2-local-user-id'

function readSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

function persistSession(session: AuthSession | null): void {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}

function getLocalUserId(): string {
  const existing = localStorage.getItem(LOCAL_USER_ID_KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(LOCAL_USER_ID_KEY, id)
  return id
}

export class LocalAuthAdapter implements AuthAdapter {
  private listeners = new Set<(session: AuthSession | null) => void>()

  async getSession(): Promise<AuthSession | null> {
    return readSession()
  }

  subscribe(listener: (session: AuthSession | null) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  async continueLocally(displayName = 'طالب'): Promise<AuthSession> {
    const session: AuthSession = {
      user: {
        id: getLocalUserId(),
        email: null,
        displayName: displayName.trim() || 'طالب',
        mode: 'local',
      },
      accessToken: null,
    }
    this.setSession(session)
    return session
  }

  async signIn(credentials: SignInCredentials): Promise<AuthSession> {
    void credentials
    throw new Error('تسجيل الدخول السحابي غير مفعّل بعد.')
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthSession> {
    void credentials
    throw new Error('إنشاء الحساب السحابي غير مفعّل بعد.')
  }

  async signOut(): Promise<void> {
    this.setSession(null)
  }

  private setSession(session: AuthSession | null): void {
    persistSession(session)
    this.listeners.forEach((listener) => listener(session))
  }
}
