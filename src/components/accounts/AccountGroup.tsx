import { useState } from 'react'
import type { Account } from '../../types/account'
import AccountCard from './AccountCard'

interface Props {
  label: string
  accounts: Account[]
  total: number
  onEdit: (a: Account) => void
  onDelete: (a: Account) => void
}

export default function AccountGroup({ label, accounts, total, onEdit, onDelete }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  if (accounts.length === 0) return null

  return (
    <div className="border border-hairline rounded-lg overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-elevated/50 hover:bg-elevated transition-colors cursor-pointer"
      >
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className="text-sm font-mono text-muted">{total.toLocaleString()}₽</span>
      </button>
      {!collapsed && accounts.map((a) => (
        <AccountCard key={a.id} account={a} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
