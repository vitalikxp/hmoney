import { render, screen } from '@testing-library/preact'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import TransactionCard from './TransactionCard'
import { createMockTransaction } from '../../test/mocks/transaction'

describe('TransactionCard', () => {
  it('показывает категорию, сумму со знаком минус для расхода', () => {
    render(
      <TransactionCard
        transaction={createMockTransaction({ type: 'expense', amount: 1250, category: 'Продукты' })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('Продукты')).toBeInTheDocument()
    expect(screen.getByText('− 1 250₽')).toBeInTheDocument()
  })

  it('показывает плюс для дохода', () => {
    render(
      <TransactionCard
        transaction={createMockTransaction({ type: 'income', amount: 50000, category: 'Зарплата' })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('+ 50 000₽')).toBeInTheDocument()
  })

  it('показывает описание под категорией', () => {
    render(
      <TransactionCard
        transaction={createMockTransaction({ description: 'Пятёрочка' })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('Пятёрочка')).toBeInTheDocument()
  })

  it('показывает первую букву категории в кружке', () => {
    render(
      <TransactionCard
        transaction={createMockTransaction({ category: 'Транспорт' })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('Т')).toBeInTheDocument()
  })

  it('вызывает onEdit по кнопке редактирования', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const tx = createMockTransaction()
    render(<TransactionCard transaction={tx} onEdit={onEdit} onDelete={vi.fn()} />)

    await user.click(screen.getByTitle('Редактировать'))
    expect(onEdit).toHaveBeenCalledWith(tx)
  })

  it('вызывает onDelete по кнопке удаления', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const tx = createMockTransaction()
    render(<TransactionCard transaction={tx} onEdit={vi.fn()} onDelete={onDelete} />)

    await user.click(screen.getByTitle('Удалить'))
    expect(onDelete).toHaveBeenCalledWith(tx)
  })
})
