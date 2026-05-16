import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import EnvelopeList from './EnvelopeList'
import { createMockEnvelope } from '../../test/mocks/envelope'

function renderList(envelopes = [createMockEnvelope({ type: 'fund', isBuiltIn: false })]) {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  return { onEdit, onDelete, ...render(<EnvelopeList envelopes={envelopes} onEdit={onEdit} onDelete={onDelete} />) }
}

describe('EnvelopeList', () => {
  it('возвращает null если нет пользовательских конвертов', () => {
    const { container } = renderList([])
    expect(container.firstChild).toBeNull()
  })

  it('группирует фонды и цели по типу', () => {
    renderList([
      createMockEnvelope({ type: 'fund', name: 'НЗ' }),
      createMockEnvelope({ type: 'goal', name: 'Машина' }),
    ])
    expect(screen.getByRole('button', { name: /Фонды/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Цели/ })).toBeInTheDocument()
  })

  it('скрывает группу если в ней нет конвертов', () => {
    renderList([createMockEnvelope({ type: 'fund', name: 'НЗ' })])
    expect(screen.queryByRole('button', { name: /Цели/ })).not.toBeInTheDocument()
  })

  it('передаёт onEdit и onDelete дочерним карточкам', () => {
    const { onEdit } = renderList([createMockEnvelope({ type: 'fund', isBuiltIn: false })])
    screen.getByTitle('Редактировать').click()
    expect(onEdit).toHaveBeenCalledTimes(1)
  })
})
