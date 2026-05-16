import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import EnvelopeModal from './EnvelopeModal'
import { createMockEnvelope } from '../../test/mocks/envelope'

function renderModal(overrides?: Parameters<typeof createMockEnvelope>[0], onSubmit?: () => Promise<void>) {
  const envelope = overrides != null ? createMockEnvelope(overrides) : null
  const onClose = vi.fn()
  const onSubmitFn = onSubmit ?? vi.fn().mockResolvedValue(undefined)
  render(<EnvelopeModal envelope={envelope} onSubmit={onSubmitFn} onClose={onClose} />)
  return { envelope, onClose, onSubmit: onSubmitFn }
}

describe('EnvelopeModal', () => {
  describe('create mode', () => {
    it('renders "Новый конверт" title', () => {
      renderModal()
      expect(screen.getByText('Новый конверт')).toBeInTheDocument()
    })

    it('renders default icon selected', () => {
      renderModal()
      expect(screen.getByText('🧃')).toBeInTheDocument()
    })

    it('shows type selector', () => {
      renderModal()
      expect(screen.getByText('Тип')).toBeInTheDocument()
    })

    it('hides target fields for spending type', () => {
      renderModal()
      expect(screen.queryByText('Целевая сумма')).not.toBeInTheDocument()
    })

    it('shows target checkbox for fund type', async () => {
      const user = userEvent.setup()
      renderModal()
      await user.selectOptions(screen.getByRole('combobox'), 'fund')
      expect(screen.getByLabelText('Сумма фонда')).toBeInTheDocument()
    })

    it('shows target checkbox for goal type', async () => {
      const user = userEvent.setup()
      renderModal()
      await user.selectOptions(screen.getByRole('combobox'), 'goal')
      expect(screen.getByLabelText('Целевая сумма *')).toBeInTheDocument()
    })

    it('calls onSubmit with form data on submit', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      renderModal(null, onSubmit)

      await user.type(screen.getByPlaceholderText('Продукты, Ремонт, …'), 'Мой конверт')
      await user.click(screen.getByText('Создать'))

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Мой конверт' }))
    })

    it('disables submit when name is empty', () => {
      renderModal()
      expect(screen.getByText('Создать')).toBeDisabled()
    })

    it('calls onClose after successful submit', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      const { onClose } = renderModal(null, onSubmit)

      await user.type(screen.getByPlaceholderText('Продукты, Ремонт, …'), 'test')
      await user.click(screen.getByText('Создать'))

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('edit mode', () => {
    it('renders "Редактировать конверт" title', () => {
      renderModal({})
      expect(screen.getByText('Редактировать конверт')).toBeInTheDocument()
    })

    it('pre-fills form with envelope data', () => {
      renderModal({ name: 'Еда', balance: 5000 })
      const input = screen.getByPlaceholderText('Продукты, Ремонт, …') as HTMLInputElement
      expect(input.value).toBe('Еда')
    })

    it('renders "Сохранить" button text', () => {
      renderModal({})
      expect(screen.getByText('Сохранить')).toBeInTheDocument()
    })
  })

  describe('target fields', () => {
    it('shows target input when checkbox is enabled for fund', async () => {
      const user = userEvent.setup()
      renderModal()
      await user.selectOptions(screen.getByRole('combobox'), 'fund')
      await user.click(screen.getByLabelText('Сумма фонда'))
      expect(screen.getByText('Сумма')).toBeInTheDocument()
    })

    it('shows target input when checkbox is enabled for goal', async () => {
      const user = userEvent.setup()
      renderModal()
      await user.selectOptions(screen.getByRole('combobox'), 'goal')
      await user.click(screen.getByLabelText('Целевая сумма *'))
      expect(screen.getByText('Цель')).toBeInTheDocument()
    })
  })

  describe('icon selection', () => {
    it('allows selecting an icon', async () => {
      const user = userEvent.setup()
      renderModal()
      await user.click(screen.getByText('🛡️'))
      expect(screen.getByText('🛡️').closest('button')?.className).toContain('bg-yellow')
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
