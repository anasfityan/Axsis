import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { LocalAuthAdapter } from '@/services/auth/local-auth.adapter'
import type { AuthAdapter, AuthSession } from '@/services/auth/auth.types'

interface AuthContextValue {
  session: AuthSession | null
  loading: boolean
  continueLocally: (displayName?: string) => Promise<void>
  signOut: () => Promise<void>
}

const adapter: AuthAdapter = new LocalAuthAdapter()
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const unsubscribe = adapter.subscribe((nextSession) => {
      if (active) setSession(nextSession)
    })

    void adapter.getSession().then((savedSession) => {
      if (!active) return
      setSession(savedSession)
      setLoading(false)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    session,
    loading,
    continueLocally: async (displayName) => {
      await adapter.continueLocally(displayName)
    },
    signOut: async () => {
      await adapter.signOut()
    },
  }), [loading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
