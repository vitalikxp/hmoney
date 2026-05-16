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
      createMockAccount({ balance: 1000, group: 'favorites' }),
      createMockAccount({ balance: 2000, group: 'default', name: 'Другой' }),
    ])
    expect(screen.getByText('Всего').parentElement).toHaveTextContent('3 000₽')
  })

  it('excludes accounts not in balance from total', () => {
    renderList([
      createMockAccount({ balance: 1000, group: 'favorites' }),
      createMockAccount({ balance: 5000, includeInBalance: false, group: 'hidden', name: 'Тайник' }),
    ])
    expect(screen.getByText('Всего').parentElement).toHaveTextContent('1 000₽')
  })

  it('groups accounts by group type', () => {
    renderList([
      createMockAccount({ group: 'favorites', name: 'Любимый' }),
      createMockAccount({ group: 'investments', name: 'Инвестиция', icon: '📈' }),
      createMockAccount({ group: 'hidden', name: 'Секрет', icon: '🔒' }),
      createMockAccount({ group: 'default', name: 'Обычный' }),
    ])
    expect(screen.getByText('Избранные')).toBeInTheDocument()
    expect(screen.getByText('Инвестиции')).toBeInTheDocument()
    expect(screen.getByText('Скрытые')).toBeInTheDocument()
    expect(screen.getByText('Прочие')).toBeInTheDocument()
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
