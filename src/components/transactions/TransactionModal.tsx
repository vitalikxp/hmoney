import { useState, useEffect } from 'preact/hooks'
import type { TargetedEvent } from 'preact'
import type { Transaction, TransactionType, CreateTransactionInput, UpdateTransactionInput } from '../../types/transaction'
import type { Account } from '../../types/account'
import type { Envelope } from '../../types/envelope'
import { parseTransactionInput } from '../../lib/parseTransactionInput'

interface Props {
  transaction: Transaction | null
  accounts: Account[]
  envelopes: Envelope[]
  onSubmit: (data: CreateTransactionInput | UpdateTransactionInput) => Promise<void>
  onClose: () => void
}

function todayInputValue(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function dateToInputValue(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10)
}

function toTs(input: string): number {
  const d = new Date(`${input}T12:00:00`)
  return d.getTime()
}

export default function TransactionModal({ transaction, accounts, envelopes, onSubmit, onClose }: Props) {
  const isEdit = transaction !== null
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense')
  const [inputText, setInputText] = useState('')
  const [date, setDate] = useState(() =>
    transaction ? dateToInputValue(transaction.date) : todayInputValue(),
  )
  const [category, setCategory] = useState(transaction?.category ?? '')
  const [accountId, setAccountId] = useState(transaction?.accountId ?? accounts[0]?.id ?? '')
  const [envelopeId, setEnvelopeId] = useState<string | null>(transaction?.envelopeId ?? null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setType(transaction?.type ?? 'expense')
    setInputText(
      transaction
        ? `${transaction.amount.toLocaleString('ru-RU')} ${transaction.description ?? transaction.category}`
        : '',
    )
    setDate(transaction ? dateToInputValue(transaction.date) : todayInputValue())
    setCategory(transaction?.category ?? '')
    setAccountId(transaction?.accountId ?? accounts[0]?.id ?? '')
    setEnvelopeId(transaction?.envelopeId ?? null)
  }, [transaction])

  // NL-парсер: 5*250 яблоки (комментарий) → сумма 1250, описание «яблоки»
  const parsed = parseTransactionInput(inputText)

  // Счёт подставляется, когда список догрузился (при открытии он мог быть пуст)
  useEffect(() => {
    if (!accountId && accounts.length) {
      setAccountId(accounts[0].id)
    }
  }, [accounts, accountId])

  const handleSubmit = async (e: TargetedEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!parsed.amount || !category.trim() || !accountId) return
    setBusy(true)
    try {
      const payload: CreateTransactionInput = {
        type,
        date: toTs(date),
        amount: parsed.amount!,
        category: category.trim(),
        description: parsed.description || undefined,
        accountId,
        envelopeId,
      }
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
          {isEdit ? 'Редактировать транзакцию' : 'Новая транзакция'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="transaction-input" className="block text-sm text-muted mb-1">Сумма и описание *</label>
            <input
              id="transaction-input"
              type="text"
              required
              value={inputText}
              onInput={(e) => setInputText(e.currentTarget.value)}
              placeholder="5*250 яблоки (100 в скобках не учтётся)"
              className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink placeholder:text-muted/50 outline-none focus:border-yellow transition-colors font-mono"
            />
            <div className="text-xs mt-1">
              {parsed.amount != null && parsed.description ? (
                <span className="text-emerald">
                  {`Сумма: ${parsed.amount.toLocaleString('ru-RU')}₽${parsed.description ? ` · ${parsed.description}` : ''}`}
                </span>
              ) : (
                <span className="text-muted">
                  Формат: 500 молоко, 5*250 яблоки (комментарий)
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">Тип</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose text-white font-medium'
                    : 'bg-elevated text-muted hover:text-ink'
                }`}
              >
                Расход
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                  type === 'income'
                    ? 'bg-emerald text-black font-medium'
                    : 'bg-elevated text-muted hover:text-ink'
                }`}
              >
                Доход
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="transaction-date" className="block text-sm text-muted mb-1">Дата *</label>
            <input
              id="transaction-date"
              type="date"
              required
              value={date}
              onInput={(e) => setDate(e.currentTarget.value)}
              className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink outline-none focus:border-yellow transition-colors"
            />
          </div>

          <div>
            <label htmlFor="transaction-category" className="block text-sm text-muted mb-1">Категория *</label>
            <input
              id="transaction-category"
              type="text"
              required
              value={category}
              onInput={(e) => setCategory(e.currentTarget.value)}
              placeholder="Продукты, Транспорт, …"
              className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink placeholder:text-muted/50 outline-none focus:border-yellow transition-colors"
            />
          </div>

          <div>
            <label htmlFor="transaction-account" className="block text-sm text-muted mb-1">Счёт *</label>
            <select
              id="transaction-account"
              required
              value={accountId}
              onChange={(e) => setAccountId(e.currentTarget.value)}
              className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink outline-none focus:border-yellow transition-colors"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            {!accounts.length && (
              <div className="text-xs text-rose mt-1">Сначала создайте счёт на странице «Счета»</div>
            )}
          </div>

          <div>
            <label htmlFor="transaction-envelope" className="block text-sm text-muted mb-1">Конверт</label>
            <select
              id="transaction-envelope"
              value={envelopeId ?? ''}
              onInput={(e) => setEnvelopeId(e.currentTarget.value || null)}
              className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink outline-none focus:border-yellow transition-colors"
            >
              <option value="">ХаниМани</option>
              {envelopes.map((env) => (
                <option key={env.id} value={env.id}>{env.name}</option>
              ))}
            </select>
          </div>

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
              disabled={busy || !parsed.amount || !category.trim()}
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
