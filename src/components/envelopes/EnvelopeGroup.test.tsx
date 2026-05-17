import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import EnvelopeGroup from './EnvelopeGroup'
import { createMockEnvelope } from '../../test/mocks/envelope'

function renderGroup(envelopes = [createMockEnvelope({ balance: 5000 })]) {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  render(
    <EnvelopeGroup
      label="Конверты"
      icon="✉️"
      envelopes={envelopes}
      onEdit={onEdit}
      onDelete={onDelete}
    />,
  )
  return { envelopes, onEdit, onDelete }
}

describe('EnvelopeGroup', () => {
  it('renders label and total', () => {
    renderGroup()
    const header = screen.getByRole('button', { name: /Конверты/ })
    expect(header).toHaveTextContent('Конверты')
    expect(header).toHaveTextContent('5 000₽')
  })

  it('renders children envelopes', () => {
    renderGroup([
      createMockEnvelope({ name: 'Конверт 1' }),
      createMockEnvelope({ name: 'Конверт 2' }),
    ])
    expect(screen.getByText('Конверт 1')).toBeInTheDocument()
    expect(screen.getByText('Конверт 2')).toBeInTheDocument()
  })

  it('shows count', () => {
    renderGroup([createMockEnvelope(), createMockEnvelope()])
    expect(screen.getByText('(2)')).toBeInTheDocument()
  })

  it('renders header even when no envelopes', () => {
    const { container } = render(
      <EnvelopeGroup label="Конверты" icon="✉️" envelopes={[]} onEdit={vi.fn()} onDelete={vi.fn()} />,
    )
    const header = container.querySelector('button')
    expect(header).toHaveTextContent('Конверты')
    expect(header).toHaveTextContent('(0)')
    expect(container.querySelector('button[title="Редактировать"]')).toBeNull()
  })

  it('toggles collapse on header click', async () => {
    const user = userEvent.setup()
    const envelopes = [createMockEnvelope({ name: 'Видимый' })]
    renderGroup(envelopes)

    expect(screen.getByText('Видимый')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Конверты/ }))
    expect(screen.queryByText('Видимый')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Конверты/ }))
    expect(screen.getByText('Видимый')).toBeInTheDocument()
  })
})
