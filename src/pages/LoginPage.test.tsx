import { render, screen } from '@testing-library/preact'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BackendError } from '../lib/backend'

const { mockLogin, mockUseAuthStore } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockUseAuthStore: vi.fn(),
}))

vi.mock('../stores/authStore', () => ({
  useAuthStore: mockUseAuthStore,
}))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>,
  )
}

import LoginPage from './LoginPage'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state', () => {
    mockUseAuthStore.mockReturnValue({ user: null, loading: true, login: mockLogin })
    renderPage()
    expect(screen.getByText('Загрузка...')).toBeInTheDocument()
  })

  it('redirects when already logged in', () => {
    mockUseAuthStore.mockReturnValue({ user: { uid: 'test' }, loading: false, login: mockLogin })
    renderPage()
    expect(screen.queryByText('Войти')).not.toBeInTheDocument()
  })

  it('renders login form', () => {
    mockUseAuthStore.mockReturnValue({ user: null, loading: false, login: mockLogin })
    renderPage()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument()
    expect(screen.getByText('Войти')).toBeInTheDocument()
  })

  it('calls login on submit', async () => {
    const user = userEvent.setup()
    mockUseAuthStore.mockReturnValue({ user: null, loading: false, login: mockLogin.mockResolvedValue(undefined) })
    renderPage()

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Пароль'), 'password')
    await user.click(screen.getByText('Войти'))

    expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password')
  })

  it('shows error on failed login', async () => {
    const user = userEvent.setup()
    const loginErr = new BackendError('invalid-credential', 'Неверный email или пароль')
    mockUseAuthStore.mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin.mockRejectedValue(loginErr),
    })
    renderPage()

    await user.type(screen.getByLabelText('Email'), 'bad@test.com')
    await user.type(screen.getByLabelText('Пароль'), 'wrong')
    await user.click(screen.getByText('Войти'))

    expect(await screen.findByText('Неверный email или пароль')).toBeInTheDocument()
  })
})
