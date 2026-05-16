import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import AuthGuard from './AuthGuard'

const { mockUseAuthStore } = vi.hoisted(() => ({
  mockUseAuthStore: vi.fn(),
}))

vi.mock('../stores/authStore', () => ({
  useAuthStore: mockUseAuthStore,
}))

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    </MemoryRouter>,
  )
}

describe('AuthGuard', () => {
  it('shows loading state', () => {
    mockUseAuthStore.mockReturnValue({ user: null, loading: true })
    renderGuard()
    expect(screen.getByText('Загрузка...')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    mockUseAuthStore.mockReturnValue({ user: null, loading: false })
    renderGuard()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    mockUseAuthStore.mockReturnValue({ user: { uid: 'test' }, loading: false })
    renderGuard()
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })
})
