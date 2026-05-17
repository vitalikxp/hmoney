import type { Account } from '../../types/account'
import AccountGroup from './AccountGroup'

interface Props {
  accounts: Account[]
  onEdit: (a: Account) => void
  onDelete: (a: Account) => void
}

export default function AccountList({ accounts, onEdit, onDelete }: Props) {
  if (accounts.length === 0) return null
  return <AccountGroup label="Счета" icon="💳" accounts={accounts} onEdit={onEdit} onDelete={onDelete} />
}
