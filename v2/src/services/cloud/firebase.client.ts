import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

import { firebaseConfigState } from '@/services/cloud/firebase.config'

export interface FirebaseServices {
  app: FirebaseApp
  auth: Auth
  firestore: Firestore
}

let services: FirebaseServices | null = null

export function getFirebaseServices(): FirebaseServices | null {
  if (!firebaseConfigState.configured || !firebaseConfigState.config) return null
  if (services) return services

  const app = getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfigState.config)

  services = {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  }

  return services
}
