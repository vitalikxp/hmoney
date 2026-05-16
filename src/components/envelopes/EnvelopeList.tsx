import type { Envelope } from '../../types/envelope'
import EnvelopeGroup from './EnvelopeGroup'
import { TYPE_ORDER } from './constants'

interface Props {
  envelopes: Envelope[]
  onEdit: (e: Envelope) => void
  onDelete: (e: Envelope) => void
}

export default function EnvelopeList({ envelopes, onEdit, onDelete }: Props) {
  const groups = TYPE_ORDER
    .map((t) => ({ type: t, envs: envelopes.filter((e) => e.type === t) }))
    .filter(({ envs }) => envs.length > 0)

  if (groups.length === 0) return null

  return (
    <div className="space-y-3">
      {groups.map(({ type, envs }) => (
        <EnvelopeGroup key={type} type={type} envelopes={envs} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
