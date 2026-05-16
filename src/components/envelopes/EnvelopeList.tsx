import type { Envelope } from '../../types/envelope'
import EnvelopeGroup from './EnvelopeGroup'
import { TYPE_ORDER } from './constants'

interface Props {
  envelopes: Envelope[]
  onEdit: (e: Envelope) => void
  onDelete: (e: Envelope) => void
}

export default function EnvelopeList({ envelopes, onEdit, onDelete }: Props) {
  return (
    <div className="space-y-3">
      {TYPE_ORDER.map((t) => {
        const groupEnvs = envelopes.filter((e) => e.type === t)
        if (t === 'spending' || t === 'reserve') {
          return (
            <EnvelopeGroup
              key={t}
              type={t}
              envelopes={groupEnvs}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )
        }
        if (groupEnvs.length > 0) {
          return (
            <EnvelopeGroup
              key={t}
              type={t}
              envelopes={groupEnvs}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )
        }
        return null
      })}
    </div>
  )
}
