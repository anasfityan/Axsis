export interface AuthUser {
  id: string
  email: string | null
  displayName: string
  mode: 'local' | 'cloud'
}

export interface AuthSession {
  user: AuthUser
  accessToken: string | null
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends SignInCredentials {
  displayName: string
}

export interface AuthAdapter {
  getSession(): Promise<AuthSession | null>
  subscribe(listener: (session: AuthSession | null) => void): () => void
  continueLocally(displayName?: string): Promise<AuthSession>
  signIn(credentials: SignInCredentials): Promise<AuthSession>
  signUp(credentials: SignUpCredentials): Promise<AuthSession>
  signOut(): Promise<void>
}
