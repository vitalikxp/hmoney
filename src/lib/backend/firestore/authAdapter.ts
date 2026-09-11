import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  deleteUser,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import type { AuthProvider, BackendErrorCode, User } from '../types'
import { BackendError } from '../types'
import { getFirebase } from './firebase'

function toUser(u: FirebaseUser): User {
  return { uid: u.uid, email: u.email ?? '' }
}

function toBackendError(e: unknown): never {
  const code = (e as { code?: string }).code?.replace('auth/', '') as BackendErrorCode | undefined
  const known: BackendErrorCode[] = ['invalid-credential', 'email-already-in-use', 'weak-password', 'invalid-email']
  if (code && known.includes(code)) {
    throw new BackendError(code, code)
  }
  throw new BackendError('unknown', 'unknown error')
}

export const firebaseAuth: AuthProvider = {
  subscribe(onChange) {
    const { auth } = getFirebase()
    onAuthStateChanged(auth, (user) => onChange(user ? toUser(user) : null))
  },

  async login(email, password) {
    const { auth } = getFirebase()
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      return toUser(cred.user)
    } catch (e) {
      toBackendError(e)
    }
  },

  async register(email, password) {
    const { auth } = getFirebase()
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      return toUser(cred.user)
    } catch (e) {
      toBackendError(e)
    }
  },

  async logout() {
    const { auth } = getFirebase()
    await signOut(auth)
  },

  async deleteUser(uid) {
    const { auth } = getFirebase()
    const user = auth.currentUser
    if (user && user.uid === uid) {
      await deleteUser(user)
    }
  },
}

export async function createProfile(userId: string, email: string): Promise<void> {
  const { db } = getFirebase()
  await setDoc(doc(db, 'users', userId), {
    email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}
