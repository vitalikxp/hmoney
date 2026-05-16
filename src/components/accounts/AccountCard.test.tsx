import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AccountCard from './AccountCard'
import { createMockAccount } from '../../test/mocks/account'

function renderCard(overrides = {}) {
  const account = createMockAccount(overrides)
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  render(<AccountCard account={account} onEdit={onEdit} onDelete={onDelete} />)
  return { account, onEdit, onDelete }
}

describe('AccountCard', () => {
  it('renders account name and balance', () => {
    renderCard({ name: 'Наличные', balance: 5000 })
    expect(screen.getByText('Наличные')).toBeInTheDocument()
    expect(screen.getByText('5 000₽')).toBeInTheDocument()
  })

  it('renders default icon when no icon set', () => {
    renderCard({ icon: undefined })
    expect(screen.getByText('💳')).toBeInTheDocument()
  })

  it('renders custom icon', () => {
    renderCard({ icon: '🏦' })
    expect(screen.getByText('🏦')).toBeInTheDocument()
  })

  it('shows credit limit info when creditLimit is set', () => {
    renderCard({ creditLimit: 50000, balance: -15000 })
    expect(screen.getByText(/доступно из/)).toBeInTheDocument()
    expect(screen.getByText(/50 000₽/)).toBeInTheDocument()
  })

  it('does not show credit limit when creditLimit is absent', () => {
    renderCard({ creditLimit: undefined })
    expect(screen.queryByText(/доступно из/)).not.toBeInTheDocument()
  })

  it('shows "исключён" badge when includeInBalance is false', () => {
    renderCard({ includeInBalance: false })
    expect(screen.getByText('исключён')).toBeInTheDocument()
  })

  it('does not show badge when includeInBalance is true', () => {
    renderCard({ includeInBalance: true })
    expect(screen.queryByText('исключён')).not.toBeInTheDocument()
  })

  it('colors negative balance red', () => {
    renderCard({ balance: -500 })
    const el = screen.getByText('-500₽')
    expect(el.className).toContain('text-rose')
  })

  it('colors positive balance green', () => {
    renderCard({ balance: 500 })
    const el = screen.getByText('500₽')
    expect(el.className).toContain('text-emerald')
  })

  it('colors zero balance muted', () => {
    renderCard({ balance: 0 })
    const el = screen.getByText('0₽')
    expect(el.className).toContain('text-muted')
  })

  it('calls onEdit when edit button clicked', () => {
    const { account, onEdit } = renderCard()
    const btn = screen.getByTitle('Редактировать')
    btn.click()
    expect(onEdit).toHaveBeenCalledWith(account)
  })

  it('calls onDelete when delete button clicked', () => {
    const { account, onDelete } = renderCard()
    const btn = screen.getByTitle('Удалить')
    btn.click()
    expect(onDelete).toHaveBeenCalledWith(account)
  })
})
