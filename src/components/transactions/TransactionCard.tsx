import type { Transaction } from '../../types/transaction'

interface Props {
  transaction: Transaction
  onEdit: (t: Transaction) => void
  onDelete: (t: Transaction) => void
}

export default function TransactionCard({ transaction, onEdit, onDelete }: Props) {
  const sign = transaction.type === 'expense' ? '−' : '+'
  const colorClass = transaction.type === 'expense' ? 'text-rose' : 'text-emerald'
  const initial = transaction.category.trim().charAt(0).toUpperCase() || '•'

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-elevated/50 transition-colors border-b border-hairline last:border-b-0">
      <div className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-sm shrink-0 font-medium">
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-ink font-medium truncate">{transaction.category}</div>
        {transaction.description && (
          <div className="text-xs text-muted mt-0.5 truncate">{transaction.description}</div>
        )}
      </div>
      <div className="text-right shrink-0">
        <div className={`font-mono font-medium ${colorClass}`}>
          {`${sign} ${transaction.amount.toLocaleString('ru-RU')}₽`}
        </div>
      </div>
      <div className="flex gap-1 shrink-0 ml-2">
        <button
          onClick={() => onEdit(transaction)}
          className="p-1.5 text-muted hover:text-ink hover:bg-elevated rounded transition-colors cursor-pointer"
          title="Редактировать"
        >
          ✎
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
