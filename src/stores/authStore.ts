import { create } from 'zustand'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  deleteUser,
  type User,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  loading: true,
  login: async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    useAuthStore.setState({ user: cred.user })
  },
  register: async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    useAuthStore.setState({ user: cred.user })
    try {
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch {
      useAuthStore.setState({ user: null })
      try { await deleteUser(cred.user) } catch (e) { console.error('Failed to delete orphaned auth user', e) }
      throw new Error('Ошибка создания профиля')
    }
  },
  logout: async () => {
    await signOut(auth)
  },
}))

onAuthStateChanged(auth, (user) => {
  useAuthStore.setState({ user, loading: false })
})
