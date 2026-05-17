import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockAccount } from '../test/mocks/account'

const { mockLogout, mockFetchAccounts, mockCreateAccount, mockUpdateAccount, mockDeleteAccount, mockUseAuthStore, mockUseAccountStore } = vi.hoisted(() => ({
  mockLogout: vi.fn(),
  mockFetchAccounts: vi.fn(),
  mockCreateAccount: vi.fn(),
  mockUpdateAccount: vi.fn(),
  mockDeleteAccount: vi.fn(),
  mockUseAuthStore: vi.fn(() => ({
    user: { email: 'test@test.com' },
    logout: mockLogout,
  })),
  mockUseAccountStore: vi.fn(() => ({
    accounts: [],
    loading: false,
    error: null,
    fetchAccounts: mockFetchAccounts,
    createAccount: mockCreateAccount,
    updateAccount: mockUpdateAccount,
    deleteAccount: mockDeleteAccount,
  })),
}))

vi.mock('../stores/authStore', () => ({ useAuthStore: mockUseAuthStore }))
vi.mock('../stores/accountStore', () => ({ useAccountStore: mockUseAccountStore }))

vi.mock('../components/accounts/AccountModal', () => ({
  default: ({ onSubmit, onClose }: { onSubmit: () => void; onClose: () => void }) => (
    <div data-testid="account-modal">
      <button onClick={() => onSubmit().then(onClose)} data-testid="modal-submit">
        Submit
      </button>
      <button onClick={onClose} data-testid="modal-close">
        Close
      </button>
    </div>
  ),
}))

import AccountsPage from './AccountsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <AccountsPage />
    </MemoryRouter>,
  )
}

describe('AccountsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches accounts on mount', () => {
    renderPage()
    expect(mockFetchAccounts).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    mockUseAccountStore.mockReturnValueOnce({
      accounts: [], loading: true, error: null, fetchAccounts: mockFetchAccounts,
      createAccount: mockCreateAccount, updateAccount: mockUpdateAccount, deleteAccount: mockDeleteAccount,
    })
    renderPage()
    expect(screen.getByText('Загрузка…')).toBeInTheDocument()
  })

  it('shows empty state', () => {
    renderPage()
    expect(screen.getByText('У вас пока нет счетов')).toBeInTheDocument()
  })

  it('shows error message', () => {
    mockUseAccountStore.mockReturnValueOnce({
      accounts: [], loading: false, error: 'Ошибка', fetchAccounts: mockFetchAccounts,
      createAccount: mockCreateAccount, updateAccount: mockUpdateAccount, deleteAccount: mockDeleteAccount,
    })
    renderPage()
    expect(screen.getByText('Ошибка')).toBeInTheDocument()
  })

  it('renders accounts list', () => {
    mockUseAccountStore.mockReturnValueOnce({
      accounts: [createMockAccount({ name: 'Наличные' })],
      loading: false, error: null, fetchAccounts: mockFetchAccounts,
      createAccount: mockCreateAccount, updateAccount: mockUpdateAccount, deleteAccount: mockDeleteAccount,
    })
    renderPage()
    expect(screen.getByText('Наличные')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /счета/i })).toBeInTheDocument()
  })

  it('shows user email and logout button', () => {
    renderPage()
    expect(screen.getByText('test@test.com')).toBeInTheDocument()
    expect(screen.getByText('Выйти')).toBeInTheDocument()
  })

  it('calls logout on logout click', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByText('Выйти'))
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('opens modal on create button click', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByText('+ Создать'))
    expect(screen.getByTestId('account-modal')).toBeInTheDocument()
  })

  it('opens modal on "Создать первый счёт" click in empty state', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByText('Создать первый счёт'))
    expect(screen.getByTestId('account-modal')).toBeInTheDocument()
  })

  it('creates account via modal submit', async () => {
    mockCreateAccount.mockResolvedValue(undefined)
    mockUseAccountStore.mockReturnValueOnce({
      accounts: [], loading: false, error: null, fetchAccounts: mockFetchAccounts,
      createAccount: mockCreateAccount, updateAccount: mockUpdateAccount, deleteAccount: mockDeleteAccount,
    })
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByText('Создать первый счёт'))
    await user.click(screen.getByTestId('modal-submit'))
    expect(mockCreateAccount).toHaveBeenCalled()
  })

  it('closes modal on close', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByText('+ Создать'))
    expect(screen.getByTestId('account-modal')).toBeInTheDocument()
    await user.click(screen.getByTestId('modal-close'))
    expect(screen.queryByTestId('account-modal')).not.toBeInTheDocument()
  })
})
