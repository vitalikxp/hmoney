import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import EnvelopeCard from './EnvelopeCard'
import { createMockEnvelope } from '../../test/mocks/envelope'

function renderCard(overrides = {}) {
  const envelope = createMockEnvelope(overrides)
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  render(<EnvelopeCard envelope={envelope} onEdit={onEdit} onDelete={onDelete} />)
  return { envelope, onEdit, onDelete }
}

describe('EnvelopeCard', () => {
  it('renders envelope name and balance', () => {
    renderCard({ name: 'Продукты', balance: 5000 })
    expect(screen.getByText('Продукты')).toBeInTheDocument()
    expect(screen.getByText('5 000₽')).toBeInTheDocument()
  })

  it('renders default icon when no icon set', () => {
    renderCard({ icon: undefined })
    expect(screen.getByText('🧃')).toBeInTheDocument()
  })

  it('renders custom icon', () => {
    renderCard({ icon: '🏦' })
    expect(screen.getByText('🏦')).toBeInTheDocument()
  })

  it('shows type label', () => {
    renderCard({ type: 'reserve' })
    expect(screen.getByText('Резервы')).toBeInTheDocument()
  })

  it('shows target for fund type', () => {
    renderCard({ type: 'fund', target: 100000 })
    expect(screen.getByText(/цель 100 000₽/)).toBeInTheDocument()
  })

  it('shows target for goal type', () => {
    renderCard({ type: 'goal', target: 500000 })
    expect(screen.getByText(/цель 500 000₽/)).toBeInTheDocument()
  })

  it('does not show target for spending type', () => {
    renderCard({ type: 'spending' })
    expect(screen.queryByText(/цель/)).not.toBeInTheDocument()
  })

  it('shows "скрыт" badge when isHidden is true', () => {
    renderCard({ isHidden: true })
    expect(screen.getByText('скрыт')).toBeInTheDocument()
  })

  it('does not show badge when isHidden is false', () => {
    renderCard({ isHidden: false })
    expect(screen.queryByText('скрыт')).not.toBeInTheDocument()
  })

  it('shows progress bar when target is set', () => {
    renderCard({ target: 10000, balance: 5000 })
    const progress = document.querySelector('.bg-yellow.rounded-full')
    expect(progress).toBeInTheDocument()
  })

  it('does not show progress bar when target is absent', () => {
    renderCard({ target: undefined })
    const progress = document.querySelector('.bg-yellow.rounded-full')
    expect(progress).not.toBeInTheDocument()
  })

  it('calls onEdit when edit button clicked', () => {
    const { envelope, onEdit } = renderCard()
    const btn = screen.getByTitle('Редактировать')
    btn.click()
    expect(onEdit).toHaveBeenCalledWith(envelope)
  })

  it('calls onDelete when delete button clicked', () => {
    const { envelope, onDelete } = renderCard()
    const btn = screen.getByTitle('Удалить')
    btn.click()
    expect(onDelete).toHaveBeenCalledWith(envelope)
  })
})
