import { describe, expect, it } from 'vitest'

import { readFirebaseConfig } from '@/services/cloud/firebase.config'

describe('readFirebaseConfig', () => {
  it('reports missing Firebase environment values', () => {
    const state = readFirebaseConfig({
      VITE_FIREBASE_API_KEY: '',
      VITE_FIREBASE_AUTH_DOMAIN: undefined,
      VITE_FIREBASE_PROJECT_ID: 'project-id',
      VITE_FIREBASE_STORAGE_BUCKET: 'bucket',
      VITE_FIREBASE_MESSAGING_SENDER_ID: 'sender',
      VITE_FIREBASE_APP_ID: 'app',
    })

    expect(state.configured).toBe(false)
    expect(state.config).toBeNull()
    expect(state.missing).toEqual([
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
    ])
  })

  it('returns a normalized public Firebase config', () => {
    const state = readFirebaseConfig({
      VITE_FIREBASE_API_KEY: ' api-key ',
      VITE_FIREBASE_AUTH_DOMAIN: 'example.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'project-id',
      VITE_FIREBASE_STORAGE_BUCKET: 'example.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: 'sender',
      VITE_FIREBASE_APP_ID: 'app',
    })

    expect(state.configured).toBe(true)
    expect(state.missing).toEqual([])
    expect(state.config?.apiKey).toBe('api-key')
  })
})
