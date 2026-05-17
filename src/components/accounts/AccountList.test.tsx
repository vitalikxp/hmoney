import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AccountList from './AccountList'
import { createMockAccount } from '../../test/mocks/account'

function renderList(accounts = [createMockAccount()]) {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  return render(<AccountList accounts={accounts} onEdit={onEdit} onDelete={onDelete} />)
}

describe('AccountList', () => {
  it('renders total balance of included accounts', () => {
    renderList([
      createMockAccount({ balance: 1000 }),
      createMockAccount({ balance: 2000, name: 'Другой' }),
    ])
    expect(screen.getByRole('button', { name: /счета/i })).toHaveTextContent('3 000₽')
  })

  it('excludes accounts not in balance from total', () => {
    renderList([
      createMockAccount({ balance: 1000 }),
      createMockAccount({ balance: 5000, includeInBalance: false, name: 'Тайник' }),
    ])
    expect(screen.getByRole('button', { name: /счета/i })).toHaveTextContent('1 000₽')
  })

  it('renders all accounts', () => {
    renderList([
      createMockAccount({ name: 'Счёт 1' }),
      createMockAccount({ name: 'Счёт 2' }),
      createMockAccount({ name: 'Счёт 3' }),
    ])
    expect(screen.getByText('Счёт 1')).toBeInTheDocument()
    expect(screen.getByText('Счёт 2')).toBeInTheDocument()
    expect(screen.getByText('Счёт 3')).toBeInTheDocument()
  })

  it('returns null when no accounts', () => {
    const { container } = renderList([])
    expect(container.firstChild).toBeNull()
  })

  it('passes onEdit and onDelete to child cards', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(<AccountList accounts={[createMockAccount()]} onEdit={onEdit} onDelete={onDelete} />)
    screen.getByTitle('Редактировать').click()
    expect(onEdit).toHaveBeenCalledTimes(1)
  })
})
