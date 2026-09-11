import { useState } from 'preact/hooks'
import type { Transaction } from '../../types/transaction'
import TransactionCard from './TransactionCard'

interface Props {
  date: number
  transactions: Transaction[]
  onEdit: (t: Transaction) => void
  onDelete: (t: Transaction) => void
}

function startOfToday(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export default function TransactionDayGroup({ date, transactions, onEdit, onDelete }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)

  const dayLabel = new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  })

  return (
    <div className="border border-hairline rounded-lg overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-elevated/50 hover:bg-elevated transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="text-sm">{date >= startOfToday() ? '☀️' : '📅'}</span>
          <span className="text-sm font-semibold text-ink">{dayLabel}</span>
          <span className="text-xs text-muted">({transactions.length})</span>
        </span>
        <span className="text-sm font-mono text-muted">
          {[
            expense > 0 ? `−${expense.toLocaleString('ru-RU')}₽` : '',
            income > 0 ? `+${income.toLocaleString('ru-RU')}₽` : '',
          ].filter(Boolean).join(' ')}
        </span>
      </button>
      {!collapsed && transactions.map((t) => (
        <TransactionCard key={t.id} transaction={t} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
