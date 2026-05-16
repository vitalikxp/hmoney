import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import EnvelopeList from './EnvelopeList'
import { createMockEnvelope } from '../../test/mocks/envelope'

function renderList(envelopes = [createMockEnvelope()]) {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  return render(<EnvelopeList envelopes={envelopes} onEdit={onEdit} onDelete={onDelete} />)
}

describe('EnvelopeList', () => {
  it('groups envelopes by type', () => {
    renderList([
      createMockEnvelope({ type: 'spending', name: 'Еда' }),
      createMockEnvelope({ type: 'reserve', name: 'Ремонт', icon: '🛡️' }),
      createMockEnvelope({ type: 'fund', name: 'НЗ', icon: '🏦' }),
      createMockEnvelope({ type: 'goal', name: 'Машина', icon: '🎯' }),
    ])
    expect(screen.getByRole('button', { name: /ХаниМани/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Резервы/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Фонды/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Цели/ })).toBeInTheDocument()
  })

  it('returns null when no envelopes', () => {
    const { container } = renderList([])
    expect(container.firstChild).toBeNull()
  })

  it('passes onEdit and onDelete to child cards', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(<EnvelopeList envelopes={[createMockEnvelope()]} onEdit={onEdit} onDelete={onDelete} />)
    screen.getByTitle('Редактировать').click()
    expect(onEdit).toHaveBeenCalledTimes(1)
  })
})
