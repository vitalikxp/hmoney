import { useState, useEffect } from 'react'
import type { Account, CreateAccountInput, UpdateAccountInput } from '../../types/account'

interface Props {
  account: Account | null
  onSubmit: (data: CreateAccountInput | UpdateAccountInput) => Promise<void>
  onClose: () => void
}

const ICONS = ['💳', '💰', '🏦', '💵', '🏠', '🚗', '🎓', '✈️', '🛒', '🍽️', '🏥', '🛠️', '🎮', '👶', '📱', '🔧', '💎', '🐾']

const GROUPS: Array<{ value: Account['group']; label: string }> = [
  { value: 'favorites', label: 'Избранные' },
  { value: 'investments', label: 'Инвестиции' },
  { value: 'hidden', label: 'Скрытые' },
  { value: 'default', label: 'Прочие' },
]

function toInput(account: Account | null): CreateAccountInput & { id?: string } {
  return account
    ? { ...account, creditLimit: account.creditLimit ?? undefined }
    : {
        name: '',
        balance: 0,
        includeInBalance: true,
        currency: 'RUB',
        group: 'favorites',
        sortOrder: 0,
        icon: ICONS[0],
      }
}

export default function AccountModal({ account, onSubmit, onClose }: Props) {
  const isEdit = account !== null
  const [form, setForm] = useState(() => toInput(account))
  const [creditEnabled, setCreditEnabled] = useState(account?.creditLimit != null && account.creditLimit > 0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setForm(toInput(account))
    setCreditEnabled(account?.creditLimit != null && account.creditLimit > 0)
  }, [account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setBusy(true)
    try {
      const { creditLimit: _cl, ...rest } = form
      const payload = creditEnabled && form.creditLimit
        ? { ...rest, creditLimit: form.creditLimit }
        : rest
      await onSubmit(payload)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface border border-hairline rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-ink mb-4">
          {isEdit ? 'Редактировать счёт' : 'Новый счёт'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Название *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Наличные, Тинькофф, …"
              className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink placeholder:text-muted/50 outline-none focus:border-yellow transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">Иконка</label>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setForm({ ...form, icon: ic })}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-base transition-all cursor-pointer ${
                    form.icon === ic
                      ? 'bg-yellow text-black ring-2 ring-yellow ring-offset-1 ring-offset-surface'
                      : 'bg-elevated text-muted hover:text-ink hover:bg-elevated/80'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Баланс *</label>
            <input
              type="number"
              step="1"
              required
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: parseInt(e.target.value) || 0 })}
              onFocus={(e) => e.target.select()}
              className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink font-mono outline-none focus:border-yellow transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="creditLimit"
              checked={creditEnabled}
              onChange={(e) => setCreditEnabled(e.target.checked)}
              className="accent-yellow"
            />
            <label htmlFor="creditLimit" className="text-sm text-muted">Кредитный лимит</label>
          </div>

          {creditEnabled && (
            <div>
              <label className="block text-sm text-muted mb-1">Лимит</label>
              <input
                type="number"
                step="1"
                value={form.creditLimit ?? ''}
                onChange={(e) => setForm({ ...form, creditLimit: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink font-mono outline-none focus:border-yellow transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-muted mb-1">Группа</label>
            <select
              value={form.group}
              onChange={(e) => setForm({ ...form, group: e.target.value as Account['group'] })}
              className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink outline-none focus:border-yellow transition-colors"
            >
              {GROUPS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          {!isEdit && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeInBalance"
                checked={form.includeInBalance}
                onChange={(e) => setForm({ ...form, includeInBalance: e.target.checked })}
                className="accent-yellow"
              />
              <label htmlFor="includeInBalance" className="text-sm text-muted">Участвует в общем балансе</label>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm text-muted hover:text-ink border border-hairline rounded-lg hover:bg-elevated transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={busy || !form.name.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium bg-yellow text-black rounded-lg hover:brightness-110 disabled:opacity-40 transition-all cursor-pointer"
            >
              {busy ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
