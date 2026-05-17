import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import EnvelopeList from './EnvelopeList'
import { createMockEnvelope } from '../../test/mocks/envelope'

function renderList(envelopes = [createMockEnvelope({ isBuiltIn: false })], onAdd = vi.fn()) {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  return { onEdit, onDelete, onAdd, ...render(<EnvelopeList envelopes={envelopes} onEdit={onEdit} onDelete={onDelete} onAdd={onAdd} />) }
}

describe('EnvelopeList', () => {
  it('показывает empty state если нет пользовательских конвертов', () => {
    renderList([])
    expect(screen.getByText('У вас пока нет конвертов')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Создать первый конверт' })).toBeInTheDocument()
  })

  it('вызывает onAdd при клике на кнопку в empty state', () => {
    const onAdd = vi.fn()
    renderList([], onAdd)
    screen.getByRole('button', { name: 'Создать первый конверт' }).click()
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('показывает группу Конверты если есть пользовательские конверты', () => {
    renderList([createMockEnvelope({ isBuiltIn: false, name: 'НЗ' })])
    expect(screen.getByRole('button', { name: /Конверты/ })).toBeInTheDocument()
    expect(screen.getByText('НЗ')).toBeInTheDocument()
  })

  it('не показывает встроенные конверты в группе', () => {
    renderList([createMockEnvelope({ isBuiltIn: true, name: 'Резервы' })])
    expect(screen.queryByRole('button', { name: /Конверты/ })).not.toBeInTheDocument()
    expect(screen.getByText('У вас пока нет конвертов')).toBeInTheDocument()
  })

  it('передаёт onEdit и onDelete дочерним карточкам', () => {
    const { onEdit } = renderList([createMockEnvelope({ isBuiltIn: false })])
    screen.getByTitle('Редактировать').click()
    expect(onEdit).toHaveBeenCalledTimes(1)
  })
})
