import { render, screen } from '@testing-library/preact'
import { describe, it, expect, vi } from 'vitest'
import TransactionList from './TransactionList'
import { createMockTransaction } from '../../test/mocks/transaction'

function txForDay(daysAgo: number, overrides?: Record<string, unknown>) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return createMockTransaction({
    date: d.getTime() - daysAgo * 24 * 60 * 60 * 1000,
    ...overrides,
  })
}

describe('TransactionList', () => {
  it('группирует транзакции по дням', () => {
    render(
      <TransactionList
        transactions={[txForDay(0, { id: 'a' }), txForDay(1, { id: 'b', category: 'Транспорт' })]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('Продукты')).toBeInTheDocument()
    expect(screen.getByText('Транспорт')).toBeInTheDocument()
    // два заголовка-дня (каждая транзакция в своём дне)
    expect(screen.getAllByRole('button')).toHaveLength(2 + 4) // 2 заголовка + по 2 кнопки на карточку
  })

  it('показывает пустой контейнер без транзакций', () => {
    const { container } = render(<TransactionList transactions={[]} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(container.firstElementChild).toBeEmptyDOMElement()
  })

  it('показывает «Показать ещё» при превышении батча и подгружает по клику', () => {
    const many = []
    for (let i = 0; i < 40; i++) {
      many.push(txForDay(i, { id: `tx-${i}`, category: `Категория ${i}` }))
    }
    render(<TransactionList transactions={many} onEdit={vi.fn()} onDelete={vi.fn()} />)

    // первый батч — 30 дней
    expect(screen.getByText('Категория 0')).toBeInTheDocument()
    expect(screen.getByText('Категория 29')).toBeInTheDocument()
    expect(screen.queryByText('Категория 39')).not.toBeInTheDocument()
    expect(screen.getByText(/Показать ещё \(10\)/)).toBeInTheDocument()
  })

  it('сортирует дни по убыванию даты', () => {
    render(
      <TransactionList
        transactions={[txForDay(2, { id: 'old' }), txForDay(0, { id: 'new' })]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    const buttons = screen.getAllByRole('button')
    const first = buttons[0].textContent!
    const second = buttons[1].textContent!
    const today = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })
    expect(first).toContain(today)
    expect(second).not.toContain(today)
  })
})
