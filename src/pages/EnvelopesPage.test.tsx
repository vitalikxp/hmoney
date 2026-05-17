import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockEnvelope } from '../test/mocks/envelope'
import { createMockAccount } from '../test/mocks/account'

const {
  mockLogout, mockFetchEnvelopes, mockCreateEnvelope, mockUpdateEnvelope, mockDeleteEnvelope,
  mockFetchAccounts, mockUseAuthStore, mockUseEnvelopeStore, mockUseAccountStore,
} = vi.hoisted(() => ({
  mockLogout: vi.fn(),
  mockFetchEnvelopes: vi.fn(),
  mockCreateEnvelope: vi.fn(),
  mockUpdateEnvelope: vi.fn(),
  mockDeleteEnvelope: vi.fn(),
  mockFetchAccounts: vi.fn(),
  mockUseAuthStore: vi.fn(() => ({
    user: { email: 'test@test.com' },
    logout: mockLogout,
  })),
  mockUseEnvelopeStore: vi.fn(() => ({
    envelopes: [],
    loading: false,
    error: null,
    fetchEnvelopes: mockFetchEnvelopes,
    createEnvelope: mockCreateEnvelope,
    updateEnvelope: mockUpdateEnvelope,
    deleteEnvelope: mockDeleteEnvelope,
  })),
  mockUseAccountStore: vi.fn(() => ({
    accounts: [createMockAccount({ balance: 100000, includeInBalance: true })],
    fetchAccounts: mockFetchAccounts,
  })),
}))

vi.mock('../stores/authStore', () => ({ useAuthStore: mockUseAuthStore }))
vi.mock('../stores/envelopeStore', () => ({ useEnvelopeStore: mockUseEnvelopeStore }))
vi.mock('../stores/accountStore', () => ({ useAccountStore: mockUseAccountStore }))

vi.mock('../components/envelopes/EnvelopeModal', () => ({
  default: ({ onSubmit, onClose }: { onSubmit: () => void; onClose: () => void }) => (
    <div data-testid="envelope-modal">
      <button onClick={() => onSubmit().then(onClose)} data-testid="modal-submit">Submit</button>
      <button onClick={onClose} data-testid="modal-close">Close</button>
    </div>
  ),
}))

import EnvelopesPage from './EnvelopesPage'

function renderPage() {
  return render(<MemoryRouter><EnvelopesPage /></MemoryRouter>)
}

describe('EnvelopesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAccountStore.mockReturnValue({
      accounts: [createMockAccount({ balance: 100000, includeInBalance: true })],
      fetchAccounts: mockFetchAccounts,
    })
    mockUseEnvelopeStore.mockReturnValue({
      envelopes: [],
      loading: false,
      error: null,
      fetchEnvelopes: mockFetchEnvelopes,
      createEnvelope: mockCreateEnvelope,
      updateEnvelope: mockUpdateEnvelope,
      deleteEnvelope: mockDeleteEnvelope,
    })
  })

  it('загружает конверты и счета при монтировании', () => {
    renderPage()
    expect(mockFetchEnvelopes).toHaveBeenCalledTimes(1)
    expect(mockFetchAccounts).toHaveBeenCalledTimes(1)
  })

  it('показывает состояние загрузки', () => {
    mockUseEnvelopeStore.mockReturnValueOnce({
      envelopes: [], loading: true, error: null, fetchEnvelopes: mockFetchEnvelopes,
      createEnvelope: mockCreateEnvelope, updateEnvelope: mockUpdateEnvelope, deleteEnvelope: mockDeleteEnvelope,
    })
    renderPage()
    expect(screen.getByText('Загрузка…')).toBeInTheDocument()
  })

  it('показывает сообщение об ошибке', () => {
    mockUseEnvelopeStore.mockReturnValueOnce({
      envelopes: [], loading: false, error: 'Ошибка', fetchEnvelopes: mockFetchEnvelopes,
      createEnvelope: mockCreateEnvelope, updateEnvelope: mockUpdateEnvelope, deleteEnvelope: mockDeleteEnvelope,
    })
    renderPage()
    expect(screen.getByText('Ошибка')).toBeInTheDocument()
  })

  it('показывает виджет BudgetSummary с корректными значениями', () => {
    // 100k счёт, 20k резервы (built-in), 30k конверт → ХаниМани = 50k, Всего = 100k
    mockUseEnvelopeStore.mockReturnValueOnce({
      envelopes: [
        createMockEnvelope({ isBuiltIn: true, balance: 20000 }),
        createMockEnvelope({ isBuiltIn: false, balance: 30000 }),
      ],
      loading: false, error: null, fetchEnvelopes: mockFetchEnvelopes,
      createEnvelope: mockCreateEnvelope, updateEnvelope: mockUpdateEnvelope, deleteEnvelope: mockDeleteEnvelope,
    })
    renderPage()
    expect(screen.getByText('ХаниМани')).toBeInTheDocument()
    expect(screen.getByText('Резервы')).toBeInTheDocument()
    expect(screen.getAllByText('Конверты').length).toBeGreaterThan(0)
    expect(screen.getByText('Всего')).toBeInTheDocument()
    expect(screen.getByText('50 000₽')).toBeInTheDocument()  // ХаниМани
    expect(screen.getByText('100 000₽')).toBeInTheDocument() // Всего
  })

  it('показывает email и кнопку выхода', () => {
    renderPage()
    expect(screen.getByText('test@test.com')).toBeInTheDocument()
    expect(screen.getByText('Выйти')).toBeInTheDocument()
  })

  it('вызывает logout при клике на Выйти', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByText('Выйти'))
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('открывает модал при клике + Создать', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByText('+ Создать'))
    expect(screen.getByTestId('envelope-modal')).toBeInTheDocument()
  })

  it('открывает модал из empty state при клике "Создать первый конверт"', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Создать первый конверт' }))
    expect(screen.getByTestId('envelope-modal')).toBeInTheDocument()
  })

  it('создаёт конверт через модал', async () => {
    mockCreateEnvelope.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByText('+ Создать'))
    await user.click(screen.getByTestId('modal-submit'))
    expect(mockCreateEnvelope).toHaveBeenCalled()
  })

  it('закрывает модал по кнопке Close', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByText('+ Создать'))
    expect(screen.getByTestId('envelope-modal')).toBeInTheDocument()
    await user.click(screen.getByTestId('modal-close'))
    expect(screen.queryByTestId('envelope-modal')).not.toBeInTheDocument()
  })
})
