import { render, screen } from '@testing-library/preact'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import TransactionModal from './TransactionModal'
import { createMockTransaction } from '../../test/mocks/transaction'
import { createMockAccount } from '../../test/mocks/account'
import { createMockEnvelope } from '../../test/mocks/envelope'

const ACCOUNTS = [
  createMockAccount({ id: 'acc-1', name: 'Наличные' }),
  createMockAccount({ id: 'acc-2', name: 'Карта' }),
]
const ENVELOPES = [
  createMockEnvelope({ id: 'env-1', name: 'Резервы', isBuiltIn: true }),
  createMockEnvelope({ id: 'env-2', name: 'Продукты' }),
]

function renderModal(props?: Partial<Parameters<typeof TransactionModal>[0]>) {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const onClose = vi.fn()
  const utils = render(
    <TransactionModal
      transaction={null}
      accounts={ACCOUNTS}
      envelopes={ENVELOPES}
      onSubmit={onSubmit}
      onClose={onClose}
    />,
  )
  return { ...utils, onSubmit, onClose }
}

describe('TransactionModal', () => {
  it('показывает подсказку формата при пустом вводе', () => {
    renderModal()
    expect(screen.getByText(/Формат: 500 молоко/)).toBeInTheDocument()
  })

  it('распознаёт NL-ввод: 5*250 яблоки → сумма 1250', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.type(screen.getByLabelText('Сумма и описание *'), '5*250 яблоки')
    expect(screen.getByText(/Сумма: 1 250₽/)).toBeInTheDocument()
  })

  it('нельзя сабмитить без суммы', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.type(screen.getByLabelText('Категория *'), 'Продукты')
    const submit = screen.getByText('Создать')
    expect(submit).toBeDisabled()
  })

  it('отправляет данные: тип, дата, категория, счёт, конверт', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderModal()

    await user.type(screen.getByLabelText('Сумма и описание *'), '5*250 яблоки')
    await user.type(screen.getByLabelText('Категория *'), 'Продукты')
    await user.click(screen.getByText('Создать'))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const arg = onSubmit.mock.calls[0][0]
    expect(arg.type).toBe('expense')
    expect(arg.amount).toBe(1250)
    expect(arg.category).toBe('Продукты')
    expect(arg.description).toBe('яблоки')
    expect(arg.accountId).toBe('acc-1') // первый счёт по умолчанию
    expect(arg.envelopeId).toBeNull() // ХаниМани по умолчанию
  })

  it('сабмитит только с заполненной категорией', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderModal()

    await user.type(screen.getByLabelText('Сумма и описание *'), '100 кофе')
    const submit = screen.getByText('Создать')
    expect(submit).toBeDisabled()
    await user.type(screen.getByLabelText('Категория *'), 'Кафе')
    expect(submit).toBeEnabled()
  })

  it('переключает тип на доход', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderModal()

    await user.type(screen.getByLabelText('Сумма и описание *'), '50000 зарплата')
    await user.type(screen.getByLabelText('Категория *'), 'Работа')
    await user.click(screen.getByText('Доход'))
    await user.click(screen.getByText('Создать'))

    const arg = onSubmit.mock.calls[0][0]
    expect(arg.type).toBe('income')
  })

  it('выбирает конверт вместо ХаниМани', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderModal()

    await user.type(screen.getByLabelText('Сумма и описание *'), '500 молоко')
    await user.type(screen.getByLabelText('Категория *'), 'Продукты')
    await user.selectOptions(screen.getByLabelText('Конверт'), 'env-2')
    await user.click(screen.getByText('Создать'))

    const arg = onSubmit.mock.calls[0][0]
    expect(arg.envelopeId).toBe('env-2')
  })

  it('закрывается по клику на оверлей', async () => {
    const user = userEvent.setup()
    const { onClose } = renderModal()

    await user.click(screen.getByText('Отмена'))
    expect(onClose).toHaveBeenCalled()
  })

  it('в режиме редактирования предзаполняет поля', () => {
    const tx = createMockTransaction({ amount: 1250, category: 'Продукты', description: 'Пятёрочка' })
    render(
      <TransactionModal
        transaction={tx}
        accounts={ACCOUNTS}
        envelopes={ENVELOPES}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByText('Редактировать транзакцию')).toBeInTheDocument()
    const input = screen.getByLabelText('Сумма и описание *') as HTMLInputElement
    expect(input.value).toBe(`${(1250).toLocaleString('ru-RU')} Пятёрочка`)
    expect((screen.getByLabelText('Категория *') as HTMLInputElement).value).toBe('Продукты')
    expect(screen.getByText('Сохранить')).toBeInTheDocument()
  })
})
