import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockAccount } from '../test/mocks/account'

const { mockGetState } = vi.hoisted(() => ({
  mockGetState: vi.fn(() => ({ user: { uid: 'test-uid' } })),
}))

vi.mock('../stores/authStore', () => ({
  useAuthStore: Object.assign(vi.fn(), {
    getState: mockGetState,
    setState: vi.fn(),
  }),
}))

const { mockService } = vi.hoisted(() => ({
  mockService: {
    fetchAccounts: vi.fn(),
    createAccount: vi.fn(),
    updateAccount: vi.fn(),
    deleteAccount: vi.fn(),
  },
}))

vi.mock('../lib/accountService', () => mockService)

import { useAccountStore } from '../stores/accountStore'

describe('accountStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAccountStore.setState({ accounts: [], loading: false, error: null })
  })

  describe('fetchAccounts', () => {
    it('fetches accounts and updates state', async () => {
      const mockAccounts = [createMockAccount({ id: 'a1' }), createMockAccount({ id: 'a2' })]
      mockService.fetchAccounts.mockResolvedValueOnce(mockAccounts)

      await useAccountStore.getState().fetchAccounts()

      expect(mockService.fetchAccounts).toHaveBeenCalledWith('test-uid')
      expect(useAccountStore.getState().accounts).toEqual(mockAccounts)
      expect(useAccountStore.getState().loading).toBe(false)
      expect(useAccountStore.getState().error).toBeNull()
    })

    it('sets loading true during fetch', async () => {
      mockService.fetchAccounts.mockImplementationOnce(() => new Promise(() => {}))
      useAccountStore.getState().fetchAccounts()
      expect(useAccountStore.getState().loading).toBe(true)
    })

    it('sets error on failure', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      mockService.fetchAccounts.mockRejectedValueOnce(new Error('fail'))
      await useAccountStore.getState().fetchAccounts()
      expect(useAccountStore.getState().error).toBe('Ошибка загрузки счетов')
      expect(useAccountStore.getState().loading).toBe(false)
    })

    it('does nothing when no user', async () => {
      mockGetState.mockReturnValueOnce({ user: null })
      await useAccountStore.getState().fetchAccounts()
      expect(mockService.fetchAccounts).not.toHaveBeenCalled()
    })
  })

  describe('createAccount', () => {
    it('calls service and refetches', async () => {
      mockService.createAccount.mockResolvedValueOnce('new-id')
      mockService.fetchAccounts.mockResolvedValueOnce([createMockAccount()])

      await useAccountStore.getState().createAccount({ name: 'New', balance: 0, includeInBalance: true, currency: 'RUB', group: 'default', sortOrder: 0 })

      expect(mockService.createAccount).toHaveBeenCalledWith('test-uid', expect.objectContaining({ name: 'New' }))
      expect(mockService.fetchAccounts).toHaveBeenCalledAfter(mockService.createAccount)
    })

    it('sets error on failure', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      mockService.createAccount.mockRejectedValueOnce(new Error('fail'))
      await useAccountStore.getState().createAccount({ name: 'New', balance: 0, includeInBalance: true, currency: 'RUB', group: 'default', sortOrder: 0 })
      expect(useAccountStore.getState().error).toBe('Ошибка создания счёта')
    })
  })

  describe('updateAccount', () => {
    it('calls service and refetches', async () => {
      mockService.updateAccount.mockResolvedValueOnce(undefined)
      mockService.fetchAccounts.mockResolvedValueOnce([createMockAccount()])

      await useAccountStore.getState().updateAccount('a1', { name: 'Updated' })

      expect(mockService.updateAccount).toHaveBeenCalledWith('test-uid', 'a1', { name: 'Updated' })
      expect(mockService.fetchAccounts).toHaveBeenCalledAfter(mockService.updateAccount)
    })

    it('sets error on failure', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      mockService.updateAccount.mockRejectedValueOnce(new Error('fail'))
      await useAccountStore.getState().updateAccount('a1', { name: 'x' })
      expect(useAccountStore.getState().error).toBe('Ошибка обновления счёта')
    })
  })

  describe('deleteAccount', () => {
    it('calls service and refetches', async () => {
      mockService.deleteAccount.mockResolvedValueOnce(undefined)
      mockService.fetchAccounts.mockResolvedValueOnce([])

      await useAccountStore.getState().deleteAccount('a1')

      expect(mockService.deleteAccount).toHaveBeenCalledWith('test-uid', 'a1')
      expect(mockService.fetchAccounts).toHaveBeenCalledAfter(mockService.deleteAccount)
    })

    it('sets error on failure', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      mockService.deleteAccount.mockRejectedValueOnce(new Error('fail'))
      await useAccountStore.getState().deleteAccount('a1')
      expect(useAccountStore.getState().error).toBe('Ошибка удаления счёта')
    })
  })
})
