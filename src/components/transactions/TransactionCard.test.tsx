import { render, screen } from '@testing-library/preact'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import TransactionCard from './TransactionCard'
import { createMockTransaction } from '../../test/mocks/transaction'

const NAMES = new Map([
  ['acc-1', 'Карта'],
  ['acc-2', 'Наличные'],
  ['env-1', 'Резервы'],
  ['env-2', 'Отпуск'],
])

function renderCard(tx: Parameters<typeof TransactionCard>[0]['transaction'], handlers = { onEdit: vi.fn(), onDelete: vi.fn() }) {
  return render(
    <TransactionCard
      transaction={tx}
      accountNames={new Map([['acc-1', 'Карта'], ['acc-2', 'Наличные']])}
      envelopeNames={new Map([['env-1', 'Резервы'], ['env-2', 'Отпуск']])}
      onEdit={handlers.onEdit}
      onDelete={handlers.onDelete}
    />,
  )
}

describe('TransactionCard', () => {
  it('показывает категорию и сумму со знаком минус для расхода', () => {
    renderCard(createMockTransaction({ type: 'expense', amount: 1250, category: 'Продукты' }))

    expect(screen.getByText('Продукты')).toBeInTheDocument()
    expect(screen.getByText('− 1 250₽')).toBeInTheDocument()
  })

  it('показывает плюс для дохода', () => {
    renderCard(createMockTransaction({ type: 'income', amount: 50000, category: 'Зарплата' }))

    expect(screen.getByText('+ 50 000₽')).toBeInTheDocument()
  })

  it('показывает описание под категорией', () => {
    renderCard(createMockTransaction({ description: 'Пятёрочка' }))

    expect(screen.getByText('Пятёрочка')).toBeInTheDocument()
  })

  it('бейдж «План» для плановой транзакции', () => {
    renderCard(createMockTransaction({ mode: 'plan' }))

    expect(screen.getByText('План')).toBeInTheDocument()
  })

  it('значок 🔁 для повторяющейся', () => {
    renderCard(createMockTransaction({ seriesId: 'series-1' }))

    expect(screen.getByText('🔁')).toBeInTheDocument()
  })

  it('перевод между счетами: «Карта → Наличные»', () => {
    renderCard(
      createMockTransaction({
        type: 'transfer',
        category: 'Перевод',
        accountId: 'acc-1',
        toAccountId: 'acc-2',
      }),
    )

    expect(screen.getByText('Карта → Наличные')).toBeInTheDocument()
    expect(screen.getByText('⇄')).toBeInTheDocument()
  })

  it('перевод между конвертами: «Резервы → Отпуск»', () => {
    renderCard(
      createMockTransaction({
        type: 'transfer',
        category: 'Перенос',
        accountId: 'acc-1',
        envelopeId: 'env-1',
        toEnvelopeId: 'env-2',
      }),
    )

    expect(screen.getByText('Резервы → Отпуск')).toBeInTheDocument()
  })

  it('вызывает onEdit по кнопке редактирования', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const tx = createMockTransaction()
    renderCard(tx, { onEdit, onDelete: vi.fn() })

    await user.click(screen.getByTitle('Редактировать'))
    expect(onEdit).toHaveBeenCalledWith(tx)
  })

  it('вызывает onDelete по кнопке удаления', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const tx = createMockTransaction()
    renderCard(tx, { onEdit: vi.fn(), onDelete })

    await user.click(screen.getByTitle('Удалить'))
    expect(onDelete).toHaveBeenCalledWith(tx)
  })
})
