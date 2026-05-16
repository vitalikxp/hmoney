import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import EnvelopeGroup from './EnvelopeGroup'
import { createMockEnvelope } from '../../test/mocks/envelope'

function renderGroup(envelopes = [createMockEnvelope({ type: 'reserve', balance: 5000 })]) {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  render(
    <EnvelopeGroup
      type="reserve"
      envelopes={envelopes}
      onEdit={onEdit}
      onDelete={onDelete}
    />,
  )
  return { envelopes, onEdit, onDelete }
}

describe('EnvelopeGroup', () => {
  it('renders type label and total', () => {
    renderGroup()
    const header = screen.getByRole('button', { name: /Резервы/ })
    expect(header).toHaveTextContent('Резервы')
    expect(header).toHaveTextContent('5 000₽')
  })

  it('renders children envelopes', () => {
    renderGroup([
      createMockEnvelope({ type: 'reserve', name: 'Конверт 1' }),
      createMockEnvelope({ type: 'reserve', name: 'Конверт 2' }),
    ])
    expect(screen.getByText('Конверт 1')).toBeInTheDocument()
    expect(screen.getByText('Конверт 2')).toBeInTheDocument()
  })

  it('shows count', () => {
    renderGroup([createMockEnvelope({ type: 'reserve' }), createMockEnvelope({ type: 'reserve' })])
    expect(screen.getByText('(2)')).toBeInTheDocument()
  })

  it('renders header even when no envelopes', () => {
    const { container } = render(
      <EnvelopeGroup type="reserve" envelopes={[]} onEdit={vi.fn()} onDelete={vi.fn()} />,
    )
    const header = container.querySelector('button')
    expect(header).toHaveTextContent('Резервы')
    expect(header).toHaveTextContent('(0)')
    expect(container.querySelector('button[title="Редактировать"]')).toBeNull()
  })

  it('toggles collapse on header click', async () => {
    const user = userEvent.setup()
    const envelopes = [createMockEnvelope({ type: 'reserve', name: 'Видимый' })]
    renderGroup(envelopes)

    expect(screen.getByText('Видимый')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Резервы/ }))
    expect(screen.queryByText('Видимый')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Резервы/ }))
    expect(screen.getByText('Видимый')).toBeInTheDocument()
  })
})
