import { useState } from 'react'
import type { Envelope, EnvelopeType } from '../../types/envelope'
import EnvelopeCard from './EnvelopeCard'
import { TYPE_LABELS, TYPE_ICONS } from './constants'

interface Props {
  type: EnvelopeType
  envelopes: Envelope[]
  onEdit: (e: Envelope) => void
  onDelete: (e: Envelope) => void
}

export default function EnvelopeGroup({ type, envelopes, onEdit, onDelete }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  if (envelopes.length === 0) return null

  const total = envelopes.reduce((s, e) => s + e.balance, 0)

  return (
    <div className="border border-hairline rounded-lg overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-elevated/50 hover:bg-elevated transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="text-sm">{TYPE_ICONS[type]}</span>
          <span className="text-sm font-semibold text-ink">{TYPE_LABELS[type]}</span>
          <span className="text-xs text-muted">({envelopes.length})</span>
        </span>
        <span className="text-sm font-mono text-muted">{total.toLocaleString('ru-RU')}₽</span>
      </button>
      {!collapsed && envelopes.map((e) => (
        <EnvelopeCard key={e.id} envelope={e} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
