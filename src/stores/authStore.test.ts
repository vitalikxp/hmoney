import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockAuth, mockCreateProfile, mockEnsureBuiltInEnvelopes } = vi.hoisted(() => ({
  mockAuth: {
    subscribe: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    deleteUser: vi.fn(),
  },
  mockCreateProfile: vi.fn(),
  mockEnsureBuiltInEnvelopes: vi.fn(),
}))

vi.mock('../lib/backend', () => ({
  backend: {
    auth: mockAuth,
    createProfile: mockCreateProfile,
  },
}))

vi.mock('../lib/envelopeService', () => ({
  ensureBuiltInEnvelopes: mockEnsureBuiltInEnvelopes,
}))

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
    it('calls backend login and sets user', async () => {
      const mockUser = { uid: 'u1', email: 'test@test.com' }
      mockAuth.login.mockResolvedValueOnce(mockUser)

      await useAuthStore.getState().login('test@test.com', 'pass')

      expect(mockAuth.login).toHaveBeenCalledWith('test@test.com', 'pass')
      expect(useAuthStore.getState().user).toEqual(mockUser)
    })
  })

  describe('register', () => {
    it('registers, creates profile and built-in envelopes', async () => {
      const mockUser = { uid: 'u2', email: 'new@test.com' }
      mockAuth.register.mockResolvedValueOnce(mockUser)

      await useAuthStore.getState().register('new@test.com', 'pass123')

      expect(mockAuth.register).toHaveBeenCalledWith('new@test.com', 'pass123')
      expect(mockCreateProfile).toHaveBeenCalledWith('u2', 'new@test.com')
      expect(mockEnsureBuiltInEnvelopes).toHaveBeenCalledWith('u2')
      expect(useAuthStore.getState().user).toEqual(mockUser)
    })

    it('rolls back auth user when profile creation fails', async () => {
      const mockUser = { uid: 'u3', email: 'fail@test.com' }
      mockAuth.register.mockResolvedValueOnce(mockUser)
      mockCreateProfile.mockRejectedValueOnce(new Error('backend error'))

      await expect(useAuthStore.getState().register('fail@test.com', 'pass')).rejects.toThrow('Ошибка создания профиля')

      expect(mockAuth.deleteUser).toHaveBeenCalledWith('u3')
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('logout', () => {
    it('calls backend logout', async () => {
      await useAuthStore.getState().logout()
      expect(mockAuth.logout).toHaveBeenCalledOnce()
    })
  })
})
