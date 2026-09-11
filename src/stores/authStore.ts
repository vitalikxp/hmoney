import { create } from 'zustand'
import { backend, type User } from '../lib/backend'
import * as envelopeService from '../lib/envelopeService'

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
    const user = await backend.auth.login(email, password)
    useAuthStore.setState({ user })
  },
  register: async (email, password) => {
    const user = await backend.auth.register(email, password)
    useAuthStore.setState({ user })
    try {
      await backend.createProfile(user.uid, email)
      await envelopeService.ensureBuiltInEnvelopes(user.uid)
    } catch {
      useAuthStore.setState({ user: null })
      try { await backend.auth.deleteUser(user.uid) } catch (e) { console.error('Failed to delete orphaned auth user', e) }
      throw new Error('Ошибка создания профиля')
    }
  },
  logout: async () => {
    await backend.auth.logout()
    useAuthStore.setState({ user: null })
  },
}))

backend.auth.subscribe((user) => {
  useAuthStore.setState({ user, loading: false })
})
