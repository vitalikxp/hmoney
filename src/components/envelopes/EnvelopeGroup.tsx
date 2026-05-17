import { useState } from 'react'
import type { Envelope } from '../../types/envelope'
import EnvelopeCard from './EnvelopeCard'

interface Props {
  label: string
  icon: string
  envelopes: Envelope[]
  onEdit: (e: Envelope) => void
  onDelete: (e: Envelope) => void
}

export default function EnvelopeGroup({ label, icon, envelopes, onEdit, onDelete }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  const total = envelopes.reduce((s, e) => s + e.balance, 0)

  return (
    <div className="border border-hairline rounded-lg overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-elevated/50 hover:bg-elevated transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-sm font-semibold text-ink">{label}</span>
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
