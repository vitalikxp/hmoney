import type { Envelope } from '../../types/envelope'
import { TYPE_LABELS, TYPE_ICONS } from './constants'

interface Props {
  envelope: Envelope
  onEdit: (e: Envelope) => void
  onDelete: (e: Envelope) => void
}

export default function EnvelopeCard({ envelope, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-elevated/50 transition-colors border-b border-hairline last:border-b-0">
      <div className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-sm shrink-0">
        {envelope.icon ?? TYPE_ICONS[envelope.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-ink font-medium truncate">{envelope.name}</span>
          {envelope.isHidden && (
            <span className="text-xs text-muted shrink-0">скрыт</span>
          )}
        </div>
        <div className="text-xs text-muted mt-0.5">
          {TYPE_LABELS[envelope.type]}
          {envelope.target != null && ` · цель ${envelope.target.toLocaleString('ru-RU')}₽`}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-mono font-medium text-ink">
          {envelope.balance.toLocaleString('ru-RU')}₽
        </div>
        {envelope.target != null && envelope.target > 0 && (
          <div className="w-20 h-1.5 bg-elevated rounded-full mt-1 ml-auto overflow-hidden">
            <div
              className="h-full bg-yellow rounded-full transition-all"
              style={{ width: `${Math.min(100, (envelope.balance / envelope.target) * 100)}%` }}
            />
          </div>
        )}
      </div>
      <div className="flex gap-1 shrink-0 ml-2">
        <button
          onClick={() => onEdit(envelope)}
          className="p-1.5 text-muted hover:text-ink hover:bg-elevated rounded transition-colors cursor-pointer"
          title="Редактировать"
        >
          ✎
        </button>
        {!envelope.isBuiltIn && (
          <button
            onClick={() => onDelete(envelope)}
            className="p-1.5 text-muted hover:text-rose hover:bg-elevated rounded transition-colors cursor-pointer"
            title="Удалить"
          >
            🗑
          </button>
        )}
      </div>
    </div>
  )
}
