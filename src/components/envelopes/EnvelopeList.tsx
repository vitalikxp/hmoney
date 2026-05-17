import type { Envelope } from '../../types/envelope'
import EnvelopeGroup from './EnvelopeGroup'

interface Props {
  envelopes: Envelope[]
  onEdit: (e: Envelope) => void
  onDelete: (e: Envelope) => void
  onAdd: () => void
}

export default function EnvelopeList({ envelopes, onEdit, onDelete, onAdd }: Props) {
  const userEnvelopes = envelopes.filter((e) => !e.isBuiltIn)

  if (userEnvelopes.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-hairline rounded-xl">
        <p className="text-muted mb-4">У вас пока нет конвертов</p>
        <button
          onClick={onAdd}
          className="px-4 py-2 text-sm font-medium bg-yellow text-black rounded-lg hover:brightness-110 transition-all cursor-pointer"
        >
          Создать первый конверт
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <EnvelopeGroup label="Конверты" icon="✉️" envelopes={userEnvelopes} onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}
