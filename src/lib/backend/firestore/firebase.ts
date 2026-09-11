import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

let app: FirebaseApp | null = null
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null

export function getFirebase(): { auth: Auth; db: Firestore } {
  if (!app) {
    const firebaseConfig = {
      apiKey: import.meta.env.FIREBASE_API_KEY,
      authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.FIREBASE_APP_ID,
    }

    const missing = Object.entries(firebaseConfig)
      .filter(([, v]) => !v)
      .map(([k]) => k)

    if (missing.length) {
      throw new Error(`Missing Firebase config vars: ${missing.join(', ')}. Check .env file.`)
    }

    app = initializeApp(firebaseConfig)
    authInstance = getAuth(app)
    dbInstance = getFirestore(app)
  }

  return { auth: authInstance!, db: dbInstance! }
}
