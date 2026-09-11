import { render, screen } from '@testing-library/preact'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockUpdateTransaction } = vi.hoisted(() => ({
  mockUpdateTransaction: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../stores/transactionStore', () => ({
  useTransactionStore: {
    getState: () => ({ updateTransaction: mockUpdateTransaction }),
  },
}))

import CategoriesModal from './CategoriesModal'
import { createMockTransaction } from '../../test/mocks/transaction'

describe('CategoriesModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('показывает список категорий с количеством', () => {
    render(
      <CategoriesModal
        transactions={[
          createMockTransaction({ category: 'Продукты' }),
          createMockTransaction({ id: 'tx-2', category: 'Продукты' }),
          createMockTransaction({ id: 'tx-3', category: 'Транспорт' }),
        ]}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByText('Продукты')).toBeInTheDocument()
    expect(screen.getByText('Транспорт')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('не показывает категорию у переводов', () => {
    render(
      <CategoriesModal
        transactions={[
          createMockTransaction({ category: 'Продукты' }),
          createMockTransaction({ id: 'tx-2', type: 'transfer', category: 'Перевод' }),
        ]}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByText('Продукты')).toBeInTheDocument()
    expect(screen.queryByText('Перевод')).not.toBeInTheDocument()
  })

  it('переименовывает категорию во всех транзакциях', async () => {
    const user = userEvent.setup()
    mockUpdateTransaction.mockResolvedValue(undefined)
    render(
      <CategoriesModal
        transactions={[
          createMockTransaction({ category: 'Продукты' }),
          createMockTransaction({ id: 'tx-2', category: 'Продукты' }),
          createMockTransaction({ id: 'tx-3', category: 'Транспорт' }),
        ]}
        onClose={vi.fn()}
      />,
    )

    await user.click(screen.getAllByTitle('Переименовать')[0])
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'Супермаркеты')
    await user.click(screen.getByText('Сохранить'))

    // обновлены обе транзакции Продукты, Транспорт не тронут
    expect(mockUpdateTransaction).toHaveBeenCalledWith('tx-test-id', { category: 'Супермаркеты' })
    expect(mockUpdateTransaction).toHaveBeenCalledWith('tx-2', { category: 'Супермаркеты' })
    expect(mockUpdateTransaction).not.toHaveBeenCalledWith('tx-3', expect.anything())
  })

  it('пустое состояние без транзакций', () => {
    render(<CategoriesModal transactions={[]} onClose={vi.fn()} />)

    expect(screen.getByText(/Категорий пока нет/)).toBeInTheDocument()
  })

  it('закрывается по кнопке', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<CategoriesModal transactions={[]} onClose={onClose} />)

    await user.click(screen.getByText('Закрыть'))
    expect(onClose).toHaveBeenCalled()
  })
})
