import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockEnvelope } from '../test/mocks/envelope'

const { mockLogout, mockFetchEnvelopes, mockCreateEnvelope, mockUpdateEnvelope, mockDeleteEnvelope, mockUseAuthStore, mockUseEnvelopeStore } = vi.hoisted(() => ({
  mockLogout: vi.fn(),
  mockFetchEnvelopes: vi.fn(),
  mockCreateEnvelope: vi.fn(),
  mockUpdateEnvelope: vi.fn(),
  mockDeleteEnvelope: vi.fn(),
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
}))

vi.mock('../stores/authStore', () => ({ useAuthStore: mockUseAuthStore }))
vi.mock('../stores/envelopeStore', () => ({ useEnvelopeStore: mockUseEnvelopeStore }))

vi.mock('../components/envelopes/EnvelopeModal', () => ({
  default: ({ onSubmit, onClose }: { onSubmit: () => void; onClose: () => void }) => (
    <div data-testid="envelope-modal">
      <button onClick={() => onSubmit().then(onClose)} data-testid="modal-submit">
        Submit
      </button>
      <button onClick={onClose} data-testid="modal-close">
        Close
      </button>
    </div>
  ),
}))

import EnvelopesPage from './EnvelopesPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <EnvelopesPage />
    </MemoryRouter>,
  )
}

describe('EnvelopesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches envelopes on mount', () => {
    renderPage()
    expect(mockFetchEnvelopes).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    mockUseEnvelopeStore.mockReturnValueOnce({
      envelopes: [], loading: true, error: null, fetchEnvelopes: mockFetchEnvelopes,
      createEnvelope: mockCreateEnvelope, updateEnvelope: mockUpdateEnvelope, deleteEnvelope: mockDeleteEnvelope,
    })
    renderPage()
    expect(screen.getByText('Загрузка…')).toBeInTheDocument()
  })

  it('shows error message', () => {
    mockUseEnvelopeStore.mockReturnValueOnce({
      envelopes: [], loading: false, error: 'Ошибка', fetchEnvelopes: mockFetchEnvelopes,
      createEnvelope: mockCreateEnvelope, updateEnvelope: mockUpdateEnvelope, deleteEnvelope: mockDeleteEnvelope,
    })
    renderPage()
    expect(screen.getByText('Ошибка')).toBeInTheDocument()
  })

  it('renders envelopes list', () => {
    mockUseEnvelopeStore.mockReturnValueOnce({
      envelopes: [createMockEnvelope({ name: 'Продукты' })],
      loading: false, error: null, fetchEnvelopes: mockFetchEnvelopes,
      createEnvelope: mockCreateEnvelope, updateEnvelope: mockUpdateEnvelope, deleteEnvelope: mockDeleteEnvelope,
    })
    renderPage()
    expect(screen.getByText('Продукты')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ХаниМани/ })).toBeInTheDocument()
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

  it('closes modal on close', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByText('+ Создать'))
    expect(screen.getByTestId('envelope-modal')).toBeInTheDocument()
    await user.click(screen.getByTestId('modal-close'))
    expect(screen.queryByTestId('envelope-modal')).not.toBeInTheDocument()
  })
})
