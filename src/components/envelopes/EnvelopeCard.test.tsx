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
    expect(screen.getByText('✉️')).toBeInTheDocument()
  })

  it('renders custom icon', () => {
    renderCard({ icon: '🏦' })
    expect(screen.getByText('🏦')).toBeInTheDocument()
  })

  it('shows target amount when target is set', () => {
    renderCard({ target: 100000 })
    expect(screen.getByText(/цель 100 000₽/)).toBeInTheDocument()
  })

  it('does not show target when target is absent', () => {
    renderCard({ target: undefined, isGoal: false })
    expect(screen.queryByText(/цель \d/)).not.toBeInTheDocument()
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
