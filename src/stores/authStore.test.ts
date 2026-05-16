import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/firebase', () => ({ auth: {}, db: {} }))

const { mockOnAuthStateChanged } = vi.hoisted(() => ({
  mockOnAuthStateChanged: vi.fn((_auth: unknown, cb: (u: unknown) => void) => {
    cb(null)
    return () => {}
  }),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: mockOnAuthStateChanged,
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  deleteUser: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(() => ({ id: 'test-doc' })),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => null),
}))

import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, deleteUser } from 'firebase/auth'
import { setDoc } from 'firebase/firestore'
import { useAuthStore } from '../stores/authStore'

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: null, loading: false })
  })

  it('has initial state with null user', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.loading).toBe(false)
  })

  describe('login', () => {
    it('calls signInWithEmailAndPassword and sets user', async () => {
      const mockUser = { uid: 'u1', email: 'test@test.com' }
      vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({ user: mockUser } as never)

      await useAuthStore.getState().login('test@test.com', 'pass')

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@test.com', 'pass')
      expect(useAuthStore.getState().user).toEqual(mockUser)
    })
  })

  describe('register', () => {
    it('calls createUserWithEmailAndPassword and creates Firestore doc', async () => {
      const mockUser = { uid: 'u2', email: 'new@test.com' }
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({ user: mockUser } as never)

      await useAuthStore.getState().register('new@test.com', 'pass123')

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'new@test.com', 'pass123')
      expect(setDoc).toHaveBeenCalledOnce()
      expect(useAuthStore.getState().user).toEqual(mockUser)
    })

    it('rolls back auth user when Firestore doc creation fails', async () => {
      const mockUser = { uid: 'u3', email: 'fail@test.com' }
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({ user: mockUser } as never)
      vi.mocked(setDoc).mockRejectedValueOnce(new Error('Firestore error') as never)

      await expect(useAuthStore.getState().register('fail@test.com', 'pass')).rejects.toThrow('Ошибка создания профиля')

      expect(deleteUser).toHaveBeenCalledWith(mockUser)
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('logout', () => {
    it('calls signOut', async () => {
      useAuthStore.setState({ user: { uid: 'u1' } as never })
      await useAuthStore.getState().logout()
      expect(signOut).toHaveBeenCalledOnce()
    })
  })
})
