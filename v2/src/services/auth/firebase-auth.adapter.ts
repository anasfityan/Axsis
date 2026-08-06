import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type Auth,
  type User,
} from 'firebase/auth'

import { getFirebaseServices } from '@/services/cloud/firebase.client'
import type {
  AuthAdapter,
  AuthSession,
  SignInCredentials,
  SignUpCredentials,
} from '@/services/auth/auth.types'

function toSession(user: User | null): AuthSession | null {
  if (!user) return null

  return {
    user: {
      id: user.uid,
      email: user.email,
      displayName: user.displayName?.trim() || user.email || 'طالب',
      mode: 'cloud',
    },
    accessToken: null,
  }
}

export class FirebaseAuthAdapter implements AuthAdapter {
  private readonly auth: Auth

  constructor() {
    const services = getFirebaseServices()
    if (!services) throw new Error('إعداد Firebase غير مكتمل.')
    this.auth = services.auth
  }

  async getSession(): Promise<AuthSession | null> {
    return toSession(this.auth.currentUser)
  }

  subscribe(listener: (session: AuthSession | null) => void): () => void {
    return onAuthStateChanged(this.auth, (user) => listener(toSession(user)))
  }

  async continueLocally(): Promise<AuthSession> {
    throw new Error('الوضع المحلي يستخدم LocalAuthAdapter.')
  }

  async signIn(credentials: SignInCredentials): Promise<AuthSession> {
    const result = await signInWithEmailAndPassword(
      this.auth,
      credentials.email.trim(),
      credentials.password,
    )
    return toSession(result.user)!
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthSession> {
    const result = await createUserWithEmailAndPassword(
      this.auth,
      credentials.email.trim(),
      credentials.password,
    )

    const displayName = credentials.displayName.trim()
    if (displayName) await updateProfile(result.user, { displayName })

    return toSession(result.user)!
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth)
  }
}
