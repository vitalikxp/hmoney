import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import AccountModal from './AccountModal'
import { createMockAccount } from '../../test/mocks/account'

function renderModal(overrides?: Parameters<typeof createMockAccount>[0], onSubmit?: () => Promise<void>) {
  const account = overrides != null ? createMockAccount(overrides) : null
  const onClose = vi.fn()
  const onSubmitFn = onSubmit ?? vi.fn().mockResolvedValue(undefined)
  render(<AccountModal account={account} onSubmit={onSubmitFn} onClose={onClose} />)
  return { account, onClose, onSubmit: onSubmitFn }
}

describe('AccountModal', () => {
  describe('create mode', () => {
    it('renders "Новый счёт" title', () => {
      renderModal()
      expect(screen.getByText('Новый счёт')).toBeInTheDocument()
    })

    it('renders default icon selected', () => {
      renderModal()
      expect(screen.getByText('💳')).toBeInTheDocument()
    })

    it('shows includeInBalance checkbox', () => {
      renderModal()
      expect(screen.getByLabelText('Участвует в общем балансе')).toBeInTheDocument()
    })

    it('hides includeInBalance checkbox in edit mode', () => {
      renderModal({})
      expect(screen.queryByLabelText('Участвует в общем балансе')).not.toBeInTheDocument()
    })

    it('calls onSubmit with form data on submit', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      renderModal(null, onSubmit)

      await user.type(screen.getByPlaceholderText('Наличные, Карта, …'), 'Мой счёт')
      await user.click(screen.getByText('Создать'))

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Мой счёт' }))
    })

    it('позволяет ввести отрицательный баланс', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      renderModal(null, onSubmit)

      await user.type(screen.getByPlaceholderText('Наличные, Карта, …'), 'Долг')
      await user.click(screen.getByLabelText('Баланс *'))
      await user.keyboard('-5000')
      await user.click(screen.getByText('Создать'))

      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ balance: -5000 }))
    })

    it('disables submit when name is empty', () => {
      renderModal()
      expect(screen.getByText('Создать')).toBeDisabled()
    })

    it('calls onClose after successful submit', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      const { onClose } = renderModal(null, onSubmit)

      await user.type(screen.getByPlaceholderText('Наличные, Карта, …'), 'test')
      await user.click(screen.getByText('Создать'))

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('edit mode', () => {
    it('renders "Редактировать счёт" title', () => {
      renderModal({})
      expect(screen.getByText('Редактировать счёт')).toBeInTheDocument()
    })

    it('pre-fills form with account data', () => {
      renderModal({ name: 'Карта', balance: 5000 })
      const input = screen.getByPlaceholderText('Наличные, Карта, …') as HTMLInputElement
      expect(input.value).toBe('Карта')
    })

    it('renders "Сохранить" button text', () => {
      renderModal({})
      expect(screen.getByText('Сохранить')).toBeInTheDocument()
    })
  })

  describe('credit limit', () => {
    it('shows limit field when checkbox is enabled', async () => {
      const user = userEvent.setup()
      renderModal()
      expect(screen.queryByText('Лимит')).not.toBeInTheDocument()

      await user.click(screen.getByLabelText('Кредитный лимит'))
      expect(screen.getByText('Лимит')).toBeInTheDocument()
    })
  })

  describe('icon selection', () => {
    it('allows selecting an icon', async () => {
      const user = userEvent.setup()
      renderModal()
      await user.click(screen.getByText('💰'))
      expect(screen.getByText('💰').closest('button')?.className).toContain('bg-yellow')
    })
  })

  describe('close behavior', () => {
    it('calls onClose when overlay clicked', async () => {
      const user = userEvent.setup()
      const { onClose } = renderModal()
      const overlay = document.querySelector('.fixed.inset-0.z-50 > div:first-child')
      if (overlay) await user.click(overlay)
      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when cancel clicked', async () => {
      const user = userEvent.setup()
      const { onClose } = renderModal()
      await user.click(screen.getByText('Отмена'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})
