import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockTransactionService, mockAccountStore, mockEnvelopeStore, mockGenerateRecurringDates } = vi.hoisted(() => ({
  mockGenerateRecurringDates: vi.fn(() => [1700000000000, 1702678400000, 1705097600000]),
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
vi.mock('../lib/repeatUtils', () => ({
  generateRecurringDates: mockGenerateRecurringDates,
  getStartOfDay: vi.fn((ts: number) => ts),
  SERIES_HORIZON_DAYS: 365,
}))
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

    it('scope «future» по серии пересоздаёт серию с новыми значениями', async () => {
      const repeat = { frequency: 'month' as const, interval: 1 }
      const seriesTx = createMockTransaction({
        seriesId: 'series-1',
        repeat,
        mode: 'plan',
        date: 1700000000000,
      })
      const futureTx = createMockTransaction({
        id: 'tx-2',
        seriesId: 'series-1',
        repeat,
        mode: 'plan',
        date: 1702678400000,
      })
      mockTransactionService.fetchTransactions.mockResolvedValueOnce([])
      useTransactionStore.setState({ transactions: [seriesTx, futureTx] })

      await useTransactionStore.getState().updateTransaction('tx-1', { amount: 5000 }, 'future')

      // старый и будущий экземпляры удалены
      expect(mockTransactionService.deleteTransaction).toHaveBeenCalledWith('u1', 'tx-1')
      expect(mockTransactionService.deleteTransaction).toHaveBeenCalledWith('u1', 'tx-2')
      // новая серия: 3 экземпляра с amount 5000, mode plan
      const creates = mockTransactionService.createTransaction.mock.calls
      expect(creates).toHaveLength(3)
      expect(creates[0][1]).toMatchObject({ amount: 5000, mode: 'plan', seriesId: expect.any(String) })
      expect(creates[0][1].repeat).toEqual(repeat)
    })

    it('план-транзакция не даёт дельт при обновлении', async () => {
      mockAccountStore.accounts = [{ id: 'acc-1', balance: 5000 }]
      mockTransactionService.updateTransaction.mockResolvedValueOnce(undefined)
      mockTransactionService.fetchTransactions.mockResolvedValueOnce([])
      useTransactionStore.setState({ transactions: [createMockTransaction({ mode: 'plan' })] })

      await useTransactionStore.getState().updateTransaction('tx-1', { amount: 2000 })

      expect(mockAccountStore.updateAccount).not.toHaveBeenCalled()
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

    it('scope «future» удаляет текущий и будущие экземпляры серии', async () => {
      const repeat = { frequency: 'week' as const, interval: 1 }
      const seriesTx = createMockTransaction({ seriesId: 'series-2', repeat, date: 100 })
      const futureTx = createMockTransaction({ id: 'tx-3', seriesId: 'series-2', repeat, date: 200 })
      const pastTx = createMockTransaction({ id: 'tx-4', seriesId: 'series-2', repeat, date: 50 })
      mockTransactionService.fetchTransactions.mockResolvedValueOnce([])
      useTransactionStore.setState({ transactions: [seriesTx, futureTx, pastTx] })

      await useTransactionStore.getState().deleteTransaction('tx-1', 'future')

      expect(mockTransactionService.deleteTransaction).toHaveBeenCalledWith('u1', 'tx-1')
      expect(mockTransactionService.deleteTransaction).toHaveBeenCalledWith('u1', 'tx-3')
      // прошлый экземпляр серии не трогается
      expect(mockTransactionService.deleteTransaction).not.toHaveBeenCalledWith('u1', 'tx-4')
    })
  })

  describe('переводы (transfer)', () => {
    it('перевод между счетами: списание с source, зачисление на target', async () => {
      mockAccountStore.accounts = [
        { id: 'acc-1', balance: 5000 },
        { id: 'acc-2', balance: 1000 },
      ]
      mockTransactionService.createTransaction.mockResolvedValueOnce('tx-9')
      mockTransactionService.fetchTransactions.mockResolvedValueOnce([])

      await useTransactionStore.getState().createTransaction({
        type: 'transfer',
        mode: 'fact',
        date: 100,
        amount: 2000,
        category: 'Перевод',
        accountId: 'acc-1',
        envelopeId: null,
        toAccountId: 'acc-2',
      })

      expect(mockAccountStore.updateAccount).toHaveBeenCalledWith('acc-1', { balance: 3000 })
      expect(mockAccountStore.updateAccount).toHaveBeenCalledWith('acc-2', { balance: 3000 })
    })

    it('перевод между конвертами не трогает счета', async () => {
      mockEnvelopeStore.envelopes = [
        { id: 'env-1', balance: 5000 },
        { id: 'env-2', balance: 1000 },
      ]
      mockTransactionService.createTransaction.mockResolvedValueOnce('tx-9')
      mockTransactionService.fetchTransactions.mockResolvedValueOnce([])

      await useTransactionStore.getState().createTransaction({
        type: 'transfer',
        mode: 'fact',
        date: 100,
        amount: 1500,
        category: 'Перенос',
        accountId: 'acc-1',
        envelopeId: 'env-1',
        toEnvelopeId: 'env-2',
      })

      expect(mockEnvelopeStore.updateEnvelope).toHaveBeenCalledWith('env-1', { balance: 3500 })
      expect(mockEnvelopeStore.updateEnvelope).toHaveBeenCalledWith('env-2', { balance: 2500 })
      expect(mockAccountStore.updateAccount).not.toHaveBeenCalled()
    })
  })

  describe('повторяющиеся серии', () => {
    it('создаёт материализованную серию план-транзакций без дельт', async () => {
      mockAccountStore.accounts = [{ id: 'acc-1', balance: 5000 }]
      mockTransactionService.fetchTransactions.mockResolvedValueOnce([])

      await useTransactionStore.getState().createTransaction({
        type: 'income',
        date: 1700000000000,
        amount: 100000,
        category: 'Зарплата',
        accountId: 'acc-1',
        envelopeId: null,
        repeat: { frequency: 'month', interval: 1 },
      })

      // 3 экземпляра из мока генератора
      const creates = mockTransactionService.createTransaction.mock.calls
      expect(creates).toHaveLength(3)
      expect(creates[0][1]).toMatchObject({
        mode: 'plan',
        seriesId: expect.any(String),
        repeat: { frequency: 'month', interval: 1 },
      })
      // одинаковый seriesId у всех экземпляров
      const ids = creates.map((c) => c[1].seriesId)
      expect(new Set(ids).size).toBe(1)
      // дельт нет — план
      expect(mockAccountStore.updateAccount).not.toHaveBeenCalled()
    })
  })
})

describe('автопродление бесконечных серий', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAccountStore.getState = vi.fn(() => mockAccountStore)
    mockEnvelopeStore.getState = vi.fn(() => mockEnvelopeStore)
    useTransactionStore.setState({ transactions: [], loading: false, error: null })
  })

  it('fetch дозаматериализует хвост серии без «Повторять до»', async () => {
    const repeat = { frequency: 'month' as const, interval: 1 }
    const last = {
      id: 'tx-last',
      type: 'income',
      mode: 'plan',
      date: 1705097600000,
      amount: 100000,
      category: 'Зарплата',
      accountId: 'acc-1',
      envelopeId: null,
      seriesId: 'series-1',
      repeat,
      createdAt: 0,
      updatedAt: 0,
    }
    mockTransactionService.fetchTransactions
      .mockResolvedValueOnce([last]) // первая загрузка — хвост заканчивается
      .mockResolvedValueOnce([])     // после продления
    // генератор возвращает хвост с датой позже последнего экземпляра
    mockGenerateRecurringDates.mockReturnValue([1705097600000, 1707516800000])

    await useTransactionStore.getState().fetchTransactions()

    const creates = mockTransactionService.createTransaction.mock.calls
    // создан новый экземпляр из хвоста с датой > последней
    expect(creates.length).toBeGreaterThan(0)
    expect(creates[0][1]).toMatchObject({
      mode: 'plan',
      seriesId: 'series-1',
      repeat,
      amount: 100000,
    })
    // повторная загрузка после продления
    expect(mockTransactionService.fetchTransactions).toHaveBeenCalledTimes(2)
  })

  it('серия с «Повторять до» не продлевается', async () => {
    const repeat = { frequency: 'month', interval: 1, until: 1705097600000 }
    const tx = {
      id: 'tx-lim',
      type: 'income',
      mode: 'plan',
      date: 1700000000000,
      amount: 100000,
      category: 'Зарплата',
      accountId: 'acc-1',
      envelopeId: null,
      seriesId: 'series-2',
      repeat,
      createdAt: 0,
      updatedAt: 0,
    }
    mockTransactionService.fetchTransactions.mockResolvedValue([tx])

    await useTransactionStore.getState().fetchTransactions()

    expect(mockTransactionService.createTransaction).not.toHaveBeenCalled()
  })
})
