import { render, screen } from '@testing-library/preact'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockTransactionStore, mockAccountStore, mockEnvelopeStore } = vi.hoisted(() => ({
  mockTransactionStore: vi.fn(),
  mockAccountStore: vi.fn(),
  mockEnvelopeStore: vi.fn(),
}))

vi.mock('../stores/transactionStore', () => ({ useTransactionStore: mockTransactionStore }))
vi.mock('../stores/accountStore', () => ({ useAccountStore: mockAccountStore }))
vi.mock('../stores/envelopeStore', () => ({ useEnvelopeStore: mockEnvelopeStore }))

import TransactionsPage from './TransactionsPage'
import { createMockTransaction } from '../test/mocks/transaction'
import { createMockAccount } from '../test/mocks/account'
import { createMockEnvelope } from '../test/mocks/envelope'

function renderPage() {
  return render(
    <MemoryRouter>
      <TransactionsPage />
    </MemoryRouter>,
  )
}

const ACCOUNTS = [createMockAccount({ id: 'acc-1', name: 'Наличные' })]
const ENVELOPES = [createMockEnvelope({ id: 'env-1', name: 'Резервы', isBuiltIn: true })]
const STORE_ACTIONS = {
  fetchTransactions: vi.fn(),
  createTransaction: vi.fn().mockResolvedValue(undefined),
  updateTransaction: vi.fn().mockResolvedValue(undefined),
  deleteTransaction: vi.fn().mockResolvedValue(undefined),
}

function setupTransactionStore(state: { transactions: unknown[]; loading: boolean; error?: string | null }) {
  mockTransactionStore.mockReturnValue({ ...STORE_ACTIONS, ...state })
}

describe('TransactionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAccountStore.mockReturnValue({
      accounts: ACCOUNTS,
      fetchAccounts: vi.fn(),
    })
    mockEnvelopeStore.mockReturnValue({
      envelopes: ENVELOPES,
      fetchEnvelopes: vi.fn(),
    })
  })

  it('загружает транзакции, счета и конверты при монтировании', () => {
    setupTransactionStore({ transactions: [], loading: false })
    renderPage()
    expect(STORE_ACTIONS.fetchTransactions).toHaveBeenCalled()
  })

  it('показывает состояние загрузки', () => {
    setupTransactionStore({ transactions: [], loading: true })
    renderPage()
    expect(screen.getByText('Загрузка…')).toBeInTheDocument()
  })

  it('показывает empty state без транзакций', () => {
    setupTransactionStore({ transactions: [], loading: false })
    renderPage()
    expect(screen.getByText('Транзакций пока нет')).toBeInTheDocument()
    expect(screen.getByText('Создать первую транзакцию')).toBeInTheDocument()
  })

  it('показывает ошибку', () => {
    setupTransactionStore({ transactions: [], loading: false, error: 'Ошибка создания транзакции' })
    renderPage()
    expect(screen.getByText('Ошибка создания транзакции')).toBeInTheDocument()
  })

  it('открывает модал создания по кнопке', async () => {
    const user = userEvent.setup()
    setupTransactionStore({ transactions: [], loading: false })
    renderPage()

    await user.click(screen.getByText('+ Добавить'))
    expect(screen.getByText('Новая транзакция')).toBeInTheDocument()
  })

  it('отрисовывает список транзакций по дням', () => {
    setupTransactionStore({ transactions: [createMockTransaction()], loading: false })
    renderPage()
    expect(screen.getByText('Продукты')).toBeInTheDocument()
    expect(screen.queryByText('Транзакций пока нет')).not.toBeInTheDocument()
  })

  it('удаляет транзакцию с подтверждением', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    setupTransactionStore({ transactions: [createMockTransaction()], loading: false })
    renderPage()

    await user.click(screen.getByTitle('Удалить'))
    expect(STORE_ACTIONS.deleteTransaction).toHaveBeenCalledWith('tx-test-id')
    vi.restoreAllMocks()
  })

  it('не удаляет без подтверждения', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    setupTransactionStore({ transactions: [createMockTransaction()], loading: false })
    renderPage()

    await user.click(screen.getByTitle('Удалить'))
    expect(STORE_ACTIONS.deleteTransaction).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })
})
