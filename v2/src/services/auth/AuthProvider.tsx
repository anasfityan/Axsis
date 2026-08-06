import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { LocalAuthAdapter } from '@/services/auth/local-auth.adapter'
import type {
  AuthAdapter,
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
const AuthContext = createContext<AuthContextValue | null>(null)
let cloudAdapterPromise: Promise<AuthAdapter> | null = null

async function getCloudAdapter(): Promise<AuthAdapter> {
  if (!firebaseConfigState.configured) throw new Error('إعداد Firebase غير مكتمل.')
  cloudAdapterPromise ??= import('@/services/auth/firebase-auth.adapter').then(
    ({ FirebaseAuthAdapter }) => new FirebaseAuthAdapter(),
  )
  return cloudAdapterPromise
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [localSession, setLocalSession] = useState<AuthSession | null>(null)
  const [cloudSession, setCloudSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    let unsubscribeCloud: (() => void) | undefined
    const unsubscribeLocal = localAdapter.subscribe((nextSession) => {
      if (active) setLocalSession(nextSession)
    })

    async function initialize(): Promise<void> {
      const savedLocalSession = await localAdapter.getSession()
      let savedCloudSession: AuthSession | null = null

      if (firebaseConfigState.configured) {
        const cloudAdapter = await getCloudAdapter()
        if (!active) return
        unsubscribeCloud = cloudAdapter.subscribe((nextSession) => {
          if (active) setCloudSession(nextSession)
        })
        savedCloudSession = await cloudAdapter.getSession()
      }

      if (!active) return
      setLocalSession(savedLocalSession)
      setCloudSession(savedCloudSession)
      setLoading(false)
    }

    void initialize().catch((error) => {
      console.error(error)
      if (active) setLoading(false)
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
    cloudConfigured: firebaseConfigState.configured,
    continueLocally: async (displayName) => {
      if (cloudSession) await (await getCloudAdapter()).signOut()
      await localAdapter.continueLocally(displayName)
    },
    signIn: async (credentials) => {
      const cloudAdapter = await getCloudAdapter()
      if (localSession) await localAdapter.signOut()
      await cloudAdapter.signIn(credentials)
    },
    signUp: async (credentials) => {
      const cloudAdapter = await getCloudAdapter()
      if (localSession) await localAdapter.signOut()
      await cloudAdapter.signUp(credentials)
    },
    signOut: async () => {
      if (cloudSession) await (await getCloudAdapter()).signOut()
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
