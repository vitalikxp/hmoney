import type { Envelope } from '../../types/envelope'
import EnvelopeGroup from './EnvelopeGroup'
import { TYPE_ORDER } from './constants'

interface Props {
  envelopes: Envelope[]
  onEdit: (e: Envelope) => void
  onDelete: (e: Envelope) => void
}

export default function EnvelopeList({ envelopes, onEdit, onDelete }: Props) {
  if (envelopes.length === 0) return null

  return (
    <div className="space-y-3">
      {TYPE_ORDER.map((t) => (
        <EnvelopeGroup
          key={t}
          type={t}
          envelopes={envelopes.filter((e) => e.type === t)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
