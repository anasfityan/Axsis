export interface FirebasePublicConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

type FirebaseEnvKey = (typeof requiredKeys)[number]
type FirebaseEnv = Partial<Record<FirebaseEnvKey, string | undefined>>

export interface FirebaseConfigState {
  configured: boolean
  missing: FirebaseEnvKey[]
  config: FirebasePublicConfig | null
}

export function readFirebaseConfig(env: FirebaseEnv): FirebaseConfigState {
  const missing = requiredKeys.filter((key) => !env[key]?.trim())
  if (missing.length > 0) {
    return { configured: false, missing, config: null }
  }

  return {
    configured: true,
    missing: [],
    config: {
      apiKey: env.VITE_FIREBASE_API_KEY!.trim(),
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN!.trim(),
      projectId: env.VITE_FIREBASE_PROJECT_ID!.trim(),
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET!.trim(),
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID!.trim(),
      appId: env.VITE_FIREBASE_APP_ID!.trim(),
    },
  }
}

function readViteFirebaseEnv(): FirebaseEnv {
  return {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
  }
}

export const firebaseConfigState = readFirebaseConfig(readViteFirebaseEnv())
