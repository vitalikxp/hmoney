import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockLogin, mockUseAuthStore, mockFirebaseError } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockUseAuthStore: vi.fn(),
  mockFirebaseError: class extends Error {
    code = ''
  },
}))

vi.mock('../stores/authStore', () => ({
  useAuthStore: mockUseAuthStore,
}))

vi.mock('firebase/app', () => ({ FirebaseError: mockFirebaseError }))

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
    const fbErr = new mockFirebaseError('wrong')
    fbErr.code = 'auth/invalid-credential'
    mockUseAuthStore.mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin.mockRejectedValue(fbErr),
    })
    renderPage()

    await user.type(screen.getByLabelText('Email'), 'bad@test.com')
    await user.type(screen.getByLabelText('Пароль'), 'wrong')
    await user.click(screen.getByText('Войти'))

    expect(await screen.findByText('Неверный email или пароль')).toBeInTheDocument()
  })
})
