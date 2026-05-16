import type { Account } from '../../types/account'

interface Props {
  account: Account
  onEdit: (a: Account) => void
  onDelete: (a: Account) => void
}

function availableBalance(account: Account): number | null {
  if (account.creditLimit == null) return null
  return account.creditLimit - Math.abs(account.balance)
}

export default function AccountCard({ account, onEdit, onDelete }: Props) {
  const avail = availableBalance(account)

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-elevated/50 transition-colors border-b border-hairline last:border-b-0">
      <div className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-sm shrink-0">
        {account.icon ?? '💳'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-ink font-medium truncate">{account.name}</span>
          {!account.includeInBalance && (
            <span className="text-xs text-rose shrink-0">исключён</span>
          )}
        </div>
        {avail != null && (
          <div className="text-xs text-muted mt-0.5">
            {avail.toLocaleString('ru-RU')}₽ доступно из {account.creditLimit!.toLocaleString('ru-RU')}₽
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        <div className={`font-mono font-medium ${account.balance < 0 ? 'text-rose' : account.balance > 0 ? 'text-emerald' : 'text-muted'}`}>
          {account.balance.toLocaleString('ru-RU')}₽
        </div>
      </div>
      <div className="flex gap-1 shrink-0 ml-2">
        <button
          onClick={() => onEdit(account)}
          className="p-1.5 text-muted hover:text-ink hover:bg-elevated rounded transition-colors cursor-pointer"
          title="Редактировать"
        >
          ✎
        </button>
        <button
          onClick={() => onDelete(account)}
          className="p-1.5 text-muted hover:text-rose hover:bg-elevated rounded transition-colors cursor-pointer"
          title="Удалить"
        >
          🗑
        </button>
      </div>
    </div>
  )
}
