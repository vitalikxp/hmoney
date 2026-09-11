import type { Transaction } from '../../types/transaction'

interface Props {
  transaction: Transaction
  accountNames: Map<string, string>
  envelopeNames: Map<string, string>
  onEdit: (t: Transaction) => void
  onDelete: (t: Transaction) => void
}

export default function TransactionCard({ transaction, accountNames, envelopeNames, onEdit, onDelete }: Props) {
  const isTransfer = transaction.type === 'transfer'
  const isPlan = transaction.mode === 'plan'

  let title = transaction.category
  let icon = transaction.category.trim().charAt(0).toUpperCase() || '•'

  if (isTransfer) {
    icon = '⇄'
    if (transaction.toEnvelopeId) {
      title = `${envelopeNames.get(transaction.envelopeId ?? '') ?? '?'} → ${envelopeNames.get(transaction.toEnvelopeId) ?? '?'}`
    } else {
      title = `${accountNames.get(transaction.accountId) ?? '?'} → ${accountNames.get(transaction.toAccountId ?? '') ?? '?'}`
    }
  }

  const sign = transaction.type === 'expense' ? '−' : '+'
  const colorClass = isTransfer ? 'text-link' : transaction.type === 'expense' ? 'text-rose' : 'text-emerald'

  return (
    <div
      onClick={() => onEdit(transaction)}
      className="flex items-center gap-3 px-4 py-3 hover:bg-elevated/50 transition-colors border-b border-hairline last:border-b-0 cursor-pointer"
    >
      <div className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-sm shrink-0 font-medium">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-ink font-medium truncate">{title}</span>
          {isPlan && <span className="text-xs text-link shrink-0">План</span>}
          {transaction.seriesId && <span className="text-xs text-muted shrink-0">🔁</span>}
        </div>
        {transaction.description && (
          <div className="text-xs text-muted mt-0.5 truncate">{transaction.description}</div>
        )}
      </div>
      <div className="text-right shrink-0">
        <div className={`font-mono font-medium ${colorClass}`}>
          {`${sign} ${transaction.amount.toLocaleString('ru-RU')}₽`}
        </div>
      </div>
      <div className="flex gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onEdit(transaction)}
          className="p-1.5 text-muted hover:text-ink hover:bg-elevated rounded transition-colors cursor-pointer"
          title="Редактировать"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(transaction)}
          className="p-1.5 text-muted hover:text-rose hover:bg-elevated rounded transition-colors cursor-pointer"
          title="Удалить"
        >
          🗑
        </button>
      </div>
    </div>
  )
}
