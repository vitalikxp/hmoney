import { render, screen } from '@testing-library/preact'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import TransactionDayGroup from './TransactionDayGroup'
import { createMockTransaction } from '../../test/mocks/transaction'

// фиксированная дата: 2026-09-10 12:00 UTC
const DAY = new Date(2026, 8, 10, 12).getTime()

describe('TransactionDayGroup', () => {
  it('показывает дату дня и количество транзакций', () => {
    render(
      <TransactionDayGroup
        date={DAY}
        transactions={[createMockTransaction()]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText(/10 сентября/)).toBeInTheDocument()
    expect(screen.getByText('(1)')).toBeInTheDocument()
  })

  it('показывает итоги дня: минус расход, плюс доход', () => {
    render(
      <TransactionDayGroup
        date={DAY}
        transactions={[
          createMockTransaction({ amount: 1000 }),
          createMockTransaction({ type: 'income', amount: 5000, id: 'tx-2', category: 'Зарплата' }),
        ]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('−1 000₽ +5 000₽')).toBeInTheDocument()
  })

  it('сворачивается и разворачивается по клику', async () => {
    const user = userEvent.setup()
    render(
      <TransactionDayGroup
        date={DAY}
        transactions={[createMockTransaction()]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('Продукты')).toBeInTheDocument()
    await user.click(screen.getByText(/10 сентября/))
    expect(screen.queryByText('Продукты')).not.toBeInTheDocument()
    await user.click(screen.getByText(/10 сентября/))
    expect(screen.getByText('Продукты')).toBeInTheDocument()
  })
})
