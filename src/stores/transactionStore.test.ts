import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockTransactionService, mockAccountStore, mockEnvelopeStore } = vi.hoisted(() => ({
  mockTransactionService: {
    fetchTransactions: vi.fn(),
    createTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
  },
  mockAccountStore: {
    accounts: [],
    updateAccount: vi.fn().mockResolvedValue(undefined),
    getState: vi.fn(),
  },
  mockEnvelopeStore: {
    envelopes: [],
    updateEnvelope: vi.fn().mockResolvedValue(undefined),
    getState: vi.fn(),
  },
}))

vi.mock('../lib/transactionService', () => mockTransactionService)
vi.mock('./authStore', () => ({
  useAuthStore: { getState: () => ({ user: { uid: 'u1', email: 't@t.dev' } }) },
}))
vi.mock('./accountStore', () => ({ useAccountStore: mockAccountStore }))
vi.mock('./envelopeStore', () => ({ useEnvelopeStore: mockEnvelopeStore }))

import { useTransactionStore } from './transactionStore'

function createMockTransaction(overrides?: Record<string, unknown>) {
  return {
    id: 'tx-1',
    type: 'expense',
    date: 100,
    amount: 1000,
    category: 'Продукты',
    accountId: 'acc-1',
    envelopeId: null,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  }
}

describe('transactionStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAccountStore.getState = vi.fn(() => mockAccountStore)
    mockEnvelopeStore.getState = vi.fn(() => mockEnvelopeStore)
    useTransactionStore.setState({ transactions: [], loading: false, error: null })
  })

  describe('fetchTransactions', () => {
    it('загружает транзакции', async () => {
      mockTransactionService.fetchTransactions.mockResolvedValueOnce([createMockTransaction()])
      await useTransactionStore.getState().fetchTransactions()

      expect(mockTransactionService.fetchTransactions).toHaveBeenCalledWith('u1')
      expect(useTransactionStore.getState().transactions).toHaveLength(1)
      expect(useTransactionStore.getState().loading).toBe(false)
    })

    it('устанавливает ошибку при неудаче', async () => {
      mockTransactionService.fetchTransactions.mockRejectedValueOnce(new Error('backend'))
      await useTransactionStore.getState().fetchTransactions()

      expect(useTransactionStore.getState().error).toBe('Ошибка загрузки транзакций')
      expect(useTransactionStore.getState().loading).toBe(false)
    })
  })

  describe('createTransaction', () => {
    it('создаёт транзакцию и применяет дельты балансов', async () => {
      mockAccountStore.accounts = [{ id: 'acc-1', balance: 5000, name: 'Карта' }]
      mockEnvelopeStore.envelopes = [{ id: 'env-1', balance: 2000, name: 'Продукты' }]
      mockTransactionService.createTransaction.mockResolvedValueOnce('tx-1')
      mockTransactionService.fetchTransactions.mockResolvedValueOnce([])

      await useTransactionStore.getState().createTransaction({
        type: 'expense',
        date: 100,
        amount: 1000,
        category: 'Продукты',
        accountId: 'acc-1',
        envelopeId: 'env-1',
      })

      expect(mockAccountStore.updateAccount).toHaveBeenCalledWith('acc-1', { balance: 4000 })
      expect(mockEnvelopeStore.updateEnvelope).toHaveBeenCalledWith('env-1', { balance: 1000 })
    })

    it('доход в ХаниМани меняет только счёт', async () => {
      mockAccountStore.accounts = [{ id: 'acc-1', balance: 5000 }]
      mockTransactionService.createTransaction.mockResolvedValueOnce('tx-1')
      mockTransactionService.fetchTransactions.mockResolvedValueOnce([])

      await useTransactionStore.getState().createTransaction({
        type: 'income',
        date: 100,
        amount: 3000,
        category: 'Зарплата',
        accountId: 'acc-1',
        envelopeId: null,
      })

      expect(mockAccountStore.updateAccount).toHaveBeenCalledWith('acc-1', { balance: 8000 })
      expect(mockEnvelopeStore.updateEnvelope).not.toHaveBeenCalled()
    })

    it('доход в конверт увеличивает и счёт, и конверт', async () => {
      mockAccountStore.accounts = [{ id: 'acc-1', balance: 5000 }]
      mockEnvelopeStore.envelopes = [{ id: 'env-1', balance: 2000 }]
      mockTransactionService.createTransaction.mockResolvedValueOnce('tx-1')
      mockTransactionService.fetchTransactions.mockResolvedValueOnce([])

      await useTransactionStore.getState().createTransaction({
        type: 'income',
        date: 100,
        amount: 1000,
        category: 'Кэшбэк',
        accountId: 'acc-1',
        envelopeId: 'env-1',
      })

      expect(mockAccountStore.updateAccount).toHaveBeenCalledWith('acc-1', { balance: 6000 })
      expect(mockEnvelopeStore.updateEnvelope).toHaveBeenCalledWith('env-1', { balance: 3000 })
    })

    it('устанавливает ошибку при неудаче', async () => {
      mockTransactionService.createTransaction.mockRejectedValueOnce(new Error('backend'))
      await useTransactionStore.getState().createTransaction({
        type: 'expense',
        date: 100,
        amount: 1000,
        category: 'Продукты',
        accountId: 'acc-1',
        envelopeId: null,
      })

      expect(useTransactionStore.getState().error).toBe('Ошибка создания транзакции')
      expect(mockAccountStore.updateAccount).not.toHaveBeenCalled()
    })
  })

  describe('updateTransaction', () => {
    it('откатывает старые дельты и применяет новые', async () => {
      mockAccountStore.accounts = [{ id: 'acc-1', balance: 5000 }, { id: 'acc-2', balance: 1000 }]
      mockTransactionService.updateTransaction.mockResolvedValueOnce(undefined)
      mockTransactionService.fetchTransactions.mockResolvedValueOnce([])
      useTransactionStore.setState({ transactions: [createMockTransaction()] })

      await useTransactionStore.getState().updateTransaction('tx-1', { accountId: 'acc-2' })

      // старый счёт: +1000 (откат расхода), новый счёт: −1000
      expect(mockAccountStore.updateAccount).toHaveBeenCalledWith('acc-1', { balance: 6000 })
      expect(mockAccountStore.updateAccount).toHaveBeenCalledWith('acc-2', { balance: 0 })
    })
  })

  describe('deleteTransaction', () => {
    it('отменяет дельты при удалении', async () => {
      mockAccountStore.accounts = [{ id: 'acc-1', balance: 4000 }]
      mockTransactionService.deleteTransaction.mockResolvedValueOnce(undefined)
      mockTransactionService.fetchTransactions.mockResolvedValueOnce([])
      useTransactionStore.setState({ transactions: [createMockTransaction()] })

      await useTransactionStore.getState().deleteTransaction('tx-1')

      // откат расхода: счёт +1000
      expect(mockAccountStore.updateAccount).toHaveBeenCalledWith('acc-1', { balance: 5000 })
    })
  })
})
