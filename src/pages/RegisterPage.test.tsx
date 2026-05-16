import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockRegister, mockUseAuthStore, mockFirebaseError } = vi.hoisted(() => ({
  mockRegister: vi.fn(),
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
    <MemoryRouter initialEntries={['/register']}>
      <RegisterPage />
    </MemoryRouter>,
  )
}

import RegisterPage from './RegisterPage'

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state', () => {
    mockUseAuthStore.mockReturnValue({ user: null, loading: true, register: mockRegister })
    renderPage()
    expect(screen.getByText('Загрузка...')).toBeInTheDocument()
  })

  it('redirects when already logged in', () => {
    mockUseAuthStore.mockReturnValue({ user: { uid: 'test' }, loading: false, register: mockRegister })
    renderPage()
    expect(screen.queryByText('Создать аккаунт')).not.toBeInTheDocument()
  })

  it('renders registration form', () => {
    mockUseAuthStore.mockReturnValue({ user: null, loading: false, register: mockRegister })
    renderPage()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument()
    expect(screen.getByLabelText('Подтверждение пароля')).toBeInTheDocument()
    expect(screen.getByText('Создать аккаунт')).toBeInTheDocument()
  })

  it('calls register on submit', async () => {
    const user = userEvent.setup()
    mockUseAuthStore.mockReturnValue({ user: null, loading: false, register: mockRegister.mockResolvedValue(undefined) })
    renderPage()

    await user.type(screen.getByLabelText('Email'), 'new@test.com')
    await user.type(screen.getByLabelText('Пароль'), 'password123')
    await user.type(screen.getByLabelText('Подтверждение пароля'), 'password123')
    await user.click(screen.getByText('Создать аккаунт'))

    expect(mockRegister).toHaveBeenCalledWith('new@test.com', 'password123')
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    mockUseAuthStore.mockReturnValue({ user: null, loading: false, register: mockRegister })
    renderPage()

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Пароль'), 'pass1')
    await user.type(screen.getByLabelText('Подтверждение пароля'), 'pass2')
    await user.click(screen.getByText('Создать аккаунт'))

    expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument()
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('shows error when password is too short', async () => {
    const user = userEvent.setup()
    mockUseAuthStore.mockReturnValue({ user: null, loading: false, register: mockRegister })
    renderPage()

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Пароль'), '12345')
    await user.type(screen.getByLabelText('Подтверждение пароля'), '12345')
    await user.click(screen.getByText('Создать аккаунт'))

    expect(screen.getByText('Пароль должен быть не менее 6 символов')).toBeInTheDocument()
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('shows error on duplicate email', async () => {
    const user = userEvent.setup()
    const fbErr = new mockFirebaseError('exists')
    fbErr.code = 'auth/email-already-in-use'
    mockUseAuthStore.mockReturnValue({
      user: null,
      loading: false,
      register: mockRegister.mockRejectedValue(fbErr),
    })
    renderPage()

    await user.type(screen.getByLabelText('Email'), 'exists@test.com')
    await user.type(screen.getByLabelText('Пароль'), 'password123')
    await user.type(screen.getByLabelText('Подтверждение пароля'), 'password123')
    await user.click(screen.getByText('Создать аккаунт'))

    expect(await screen.findByText('Этот email уже зарегистрирован')).toBeInTheDocument()
  })
})
