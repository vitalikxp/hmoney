import type { Account } from '../../types/account'
import AccountGroup from './AccountGroup'
interface Props {
  accounts: Account[]
  onEdit: (a: Account) => void
  onDelete: (a: Account) => void
}

const GROUP_ORDER: Array<Account['group']> = ['favorites', 'investments', 'hidden', 'default']
const GROUP_LABELS: Record<Account['group'], string> = {
  favorites: 'Избранные',
  investments: 'Инвестиции',
  hidden: 'Скрытые',
  default: 'Прочие',
}

function groupTotal(accounts: Account[]): number {
  return accounts.reduce((s, a) => s + (a.includeInBalance ? a.balance : 0), 0)
}

export default function AccountList({ accounts, onEdit, onDelete }: Props) {
  const grouped = GROUP_ORDER.map((g) => ({
    label: GROUP_LABELS[g],
    accounts: accounts.filter((a) => a.group === g),
    total: groupTotal(accounts.filter((a) => a.group === g)),
  }))

  const allIncluded = accounts.filter((a) => a.includeInBalance)
  const total = groupTotal(allIncluded)

  if (accounts.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-muted">Всего</span>
        <span className="text-sm font-mono text-ink">{total.toLocaleString('ru-RU')}₽</span>
      </div>
      {grouped.map((g) => (
        <AccountGroup key={g.label} {...g} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
