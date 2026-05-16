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
      label="Избранные"
      accounts={accounts}
      total={accounts.reduce((s, a) => s + a.balance, 0)}
      onEdit={onEdit}
      onDelete={onDelete}
    />,
  )
  return { accounts, onEdit, onDelete }
}

describe('AccountGroup', () => {
  it('renders label and total', () => {
    renderGroup()
    expect(screen.getByText('Избранные')).toBeInTheDocument()
    const header = screen.getByRole('button', { name: /Избранные/ })
    expect(header).toHaveTextContent('10 000₽')
  })

  it('renders children accounts', () => {
    renderGroup([createMockAccount({ name: 'Счёт 1' }), createMockAccount({ name: 'Счёт 2' })])
    expect(screen.getByText('Счёт 1')).toBeInTheDocument()
    expect(screen.getByText('Счёт 2')).toBeInTheDocument()
  })

  it('returns null when no accounts', () => {
    const { container } = render(
      <AccountGroup label="Избранные" accounts={[]} total={0} onEdit={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('toggles collapse on header click', async () => {
    const user = userEvent.setup()
    const accounts = [createMockAccount({ name: 'Видимый' })]
    renderGroup(accounts)

    expect(screen.getByText('Видимый')).toBeInTheDocument()

    await user.click(screen.getByText('Избранные'))
    expect(screen.queryByText('Видимый')).not.toBeInTheDocument()

    await user.click(screen.getByText('Избранные'))
    expect(screen.getByText('Видимый')).toBeInTheDocument()
  })
})
