import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import AccountGroup from './AccountGroup'
import { createMockAccount } from '../../test/mocks/account'

function renderGroup(accounts = [createMockAccount()]) {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  render(
    <AccountGroup
      label="Счета"
      icon="💳"
      accounts={accounts}
      onEdit={onEdit}
      onDelete={onDelete}
    />,
  )
  return { accounts, onEdit, onDelete }
}

describe('AccountGroup', () => {
  it('renders label, icon and total', () => {
    renderGroup([createMockAccount({ balance: 10000 })])
    const header = screen.getByRole('button', { name: /Счета/ })
    expect(header).toHaveTextContent('💳')
    expect(header).toHaveTextContent('Счета')
    expect(header).toHaveTextContent('10 000₽')
  })

  it('shows count', () => {
    renderGroup([createMockAccount(), createMockAccount()])
    expect(screen.getByText('(2)')).toBeInTheDocument()
  })

  it('учитывает только счета участвующие в балансе', () => {
    renderGroup([
      createMockAccount({ balance: 1000 }),
      createMockAccount({ balance: 5000, includeInBalance: false, name: 'Тайник' }),
    ])
    const header = screen.getByRole('button', { name: /Счета/ })
    expect(header).toHaveTextContent('1 000₽')
  })

  it('returns null when no accounts', () => {
    const { container } = render(
      <AccountGroup label="Счета" icon="💳" accounts={[]} onEdit={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('toggles collapse on header click', async () => {
    const user = userEvent.setup()
    renderGroup([createMockAccount({ name: 'Видимый' })])

    expect(screen.getByText('Видимый')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Счета/ }))
    expect(screen.queryByText('Видимый')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Счета/ }))
    expect(screen.getByText('Видимый')).toBeInTheDocument()
  })

  it('passes onEdit and onDelete to child cards', () => {
    const { onEdit } = renderGroup()
    screen.getByTitle('Редактировать').click()
    expect(onEdit).toHaveBeenCalledTimes(1)
  })
})
