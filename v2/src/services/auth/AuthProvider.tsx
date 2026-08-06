import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { FirebaseAuthAdapter } from '@/services/auth/firebase-auth.adapter'
import { LocalAuthAdapter } from '@/services/auth/local-auth.adapter'
import type {
  AuthSession,
  SignInCredentials,
  SignUpCredentials,
} from '@/services/auth/auth.types'
import { firebaseConfigState } from '@/services/cloud/firebase.config'

interface AuthContextValue {
  session: AuthSession | null
  loading: boolean
  cloudConfigured: boolean
  continueLocally: (displayName?: string) => Promise<void>
  signIn: (credentials: SignInCredentials) => Promise<void>
  signUp: (credentials: SignUpCredentials) => Promise<void>
  signOut: () => Promise<void>
}

const localAdapter = new LocalAuthAdapter()
const cloudAdapter = firebaseConfigState.configured ? new FirebaseAuthAdapter() : null
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [localSession, setLocalSession] = useState<AuthSession | null>(null)
  const [cloudSession, setCloudSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const unsubscribeLocal = localAdapter.subscribe((nextSession) => {
      if (active) setLocalSession(nextSession)
    })
    const unsubscribeCloud = cloudAdapter?.subscribe((nextSession) => {
      if (active) setCloudSession(nextSession)
    })

    void Promise.all([
      localAdapter.getSession(),
      cloudAdapter?.getSession() ?? Promise.resolve(null),
    ]).then(([savedLocalSession, savedCloudSession]) => {
      if (!active) return
      setLocalSession(savedLocalSession)
      setCloudSession(savedCloudSession)
      setLoading(false)
    })

    return () => {
      active = false
      unsubscribeLocal()
      unsubscribeCloud?.()
    }
  }, [])

  const session = cloudSession ?? localSession

  const value = useMemo<AuthContextValue>(() => ({
    session,
    loading,
    cloudConfigured: cloudAdapter !== null,
    continueLocally: async (displayName) => {
      if (cloudSession) await cloudAdapter?.signOut()
      await localAdapter.continueLocally(displayName)
    },
    signIn: async (credentials) => {
      if (!cloudAdapter) throw new Error('إعداد Firebase غير مكتمل.')
      if (localSession) await localAdapter.signOut()
      await cloudAdapter.signIn(credentials)
    },
    signUp: async (credentials) => {
      if (!cloudAdapter) throw new Error('إعداد Firebase غير مكتمل.')
      if (localSession) await localAdapter.signOut()
      await cloudAdapter.signUp(credentials)
    },
    signOut: async () => {
      if (cloudSession) await cloudAdapter?.signOut()
      if (localSession) await localAdapter.signOut()
    },
  }), [cloudSession, loading, localSession, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
