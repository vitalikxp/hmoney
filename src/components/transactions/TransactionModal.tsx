import { useState, useEffect } from 'preact/hooks'
import type { TargetedEvent } from 'preact'
import type {
  Transaction,
  TransactionRepeat,
  RepeatFrequency,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../../types/transaction'
import type { Account } from '../../types/account'
import type { Envelope } from '../../types/envelope'
import { parseTransactionInput } from '../../lib/parseTransactionInput'

interface Props {
  transaction: Transaction | null
  accounts: Account[]
  envelopes: Envelope[]
  onSubmit: (
    data: CreateTransactionInput | UpdateTransactionInput,
    scope: 'one' | 'future',
  ) => Promise<void>
  onClose: () => void
}

interface RepeatPreset {
  label: string
  value: string
}

const REPEAT_PRESETS: RepeatPreset[] = [
  { label: 'Каждый день', value: 'day:1' },
  { label: 'Каждые 2 дня', value: 'day:2' },
  { label: 'Каждые 3 дня', value: 'day:3' },
  { label: 'Каждую неделю', value: 'week:1' },
  { label: 'Каждые 2 недели', value: 'week:2' },
  { label: 'Каждый месяц', value: 'month:1' },
  { label: 'Каждые 1.5 месяца', value: 'month:1.5' },
  { label: 'Каждые 2 месяца', value: 'month:2' },
  { label: 'Каждые 3 месяца', value: 'month:3' },
  { label: 'Каждые полгода', value: 'month:6' },
  { label: 'Каждый год', value: 'year:1' },
  { label: 'По будням', value: 'day:1:workdays' },
  { label: 'По выходным', value: 'day:1:weekends' },
]

function presetToRepeat(value: string): TransactionRepeat {
  const [frequency, interval, mode] = value.split(':')
  return {
    frequency: frequency as RepeatFrequency,
    interval: parseFloat(interval),
    weekendMode: (mode as 'workdays' | 'weekends' | undefined) ?? undefined,
  }
}

function repeatToPresetValue(repeat?: TransactionRepeat): string {
  if (!repeat) return 'month:1'
  const mode = repeat.weekendMode ? `:${repeat.weekendMode}` : ''
  return `${repeat.frequency}:${repeat.interval}${mode}`
}

// Локальная дата в формате input[type=date] (toISOString даёт UTC-день,
// который для утренних часов MSK — вчерашний)
function toLocalInputValue(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayInputValue(): string {
  return toLocalInputValue(new Date())
}

function dateToInputValue(ts: number): string {
  return toLocalInputValue(new Date(ts))
}

function toTs(input: string): number {
  return new Date(`${input}T12:00:00`).getTime()
}

export default function TransactionModal({ transaction, accounts, envelopes, onSubmit, onClose }: Props) {
  const isEdit = transaction !== null
  const [type, setType] = useState(transaction?.type ?? 'expense')
  const [mode, setMode] = useState(transaction?.mode ?? 'fact')
  const [inputText, setInputText] = useState('')
  const [date, setDate] = useState(() =>
    transaction ? dateToInputValue(transaction.date) : todayInputValue(),
  )
  const [category, setCategory] = useState(transaction?.category ?? '')
  const [accountId, setAccountId] = useState(transaction?.accountId ?? '')
  const [envelopeId, setEnvelopeId] = useState<string | null>(transaction?.envelopeId ?? null)
  const [toAccountId, setToAccountId] = useState(transaction?.toAccountId ?? '')
  const [toEnvelopeId, setToEnvelopeId] = useState(transaction?.toEnvelopeId ?? '')
  const [transferKind, setTransferKind] = useState<'accounts' | 'envelopes'>(
    transaction?.toEnvelopeId ? 'envelopes' : 'accounts',
  )
  const [repeatEnabled, setRepeatEnabled] = useState(!!transaction?.repeat)
  const [repeatPreset, setRepeatPreset] = useState(() => repeatToPresetValue(transaction?.repeat))
  const [repeatUntil, setRepeatUntil] = useState(() =>
    transaction?.repeat?.until ? dateToInputValue(transaction.repeat.until) : '',
  )
  const [scope, setScope] = useState<'one' | 'future'>('one')
  const [busy, setBusy] = useState(false)

  // Сброс полей только при переходе в режим редактирования; для create-mode
  // достаточно useState-инициализатора (эффект гоняется позже fill в e2e)
  useEffect(() => {
    if (!transaction) return
    setType(transaction.type)
    setMode(transaction?.mode ?? 'fact')
    setInputText(
      transaction
        ? `${transaction.amount.toLocaleString('ru-RU')} ${transaction.description ?? transaction.category}`
        : '',
    )
    setDate(transaction ? dateToInputValue(transaction.date) : todayInputValue())
    setCategory(transaction?.category ?? '')
    setAccountId(transaction?.accountId ?? '')
    setEnvelopeId(transaction?.envelopeId ?? null)
    setToAccountId(transaction?.toAccountId ?? '')
    setToEnvelopeId(transaction?.toEnvelopeId ?? '')
    setTransferKind(transaction?.toEnvelopeId ? 'envelopes' : 'accounts')
    setRepeatEnabled(!!transaction?.repeat)
    setRepeatPreset(repeatToPresetValue(transaction?.repeat))
    setRepeatUntil(
      transaction?.repeat?.until ? dateToInputValue(transaction.repeat.until) : '',
    )
    setScope('one')
  }, [transaction])

  // счёт подставляется, когда список догрузился
  useEffect(() => {
    if (!accountId && accounts.length) setAccountId(accounts[0].id)
  }, [accounts, accountId])

  // NL-парсер: 5*250 яблоки (комментарий) → сумма 1250, описание «яблоки»
  const parsed = parseTransactionInput(inputText)
  const isTransfer = type === 'transfer'
  const seriesEdited = isEdit && !!transaction?.seriesId

  const repeat = repeatEnabled
    ? {
        ...presetToRepeat(repeatPreset),
        until: repeatUntil ? toTs(repeatUntil) : null,
      }
    : undefined

  // Плановая транзакция не создаётся в прошлом: выбранная дата должна быть сегодня или позже
  const isPlanMode = !isTransfer && (repeatEnabled || mode === 'plan')
  const todayLocal = todayInputValue()
  const planDateInvalid =
    isPlanMode && (!!repeatUntil && repeatUntil < todayInputValue() || date < todayInputValue())

  const handleSubmit = async (e: TargetedEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!parsed.amount || !accountId) return
    if (planDateInvalid) return
    if (isTransfer && transferKind === 'accounts' && (!toAccountId || toAccountId === accountId)) return
    if (isTransfer && transferKind === 'envelopes' && (!toEnvelopeId || toEnvelopeId === envelopeId)) return

    setBusy(true)
    try {
      const transferMode = repeatEnabled ? 'plan' : mode
      let payload: CreateTransactionInput

      if (isTransfer && transferKind === 'accounts') {
        payload = {
          type: 'transfer',
          mode: transferMode as 'fact' | 'plan',
          date: toTs(date),
          amount: parsed.amount,
          category: 'Перевод',
          description: parsed.description || undefined,
          accountId,
          envelopeId: null,
          toAccountId: toAccountId,
        }
      } else if (isTransfer) {
        payload = {
          type: 'transfer',
          mode: transferMode as 'fact' | 'plan',
          date: toTs(date),
          amount: parsed.amount,
          category: 'Перенос',
          description: parsed.description || undefined,
          accountId,
          envelopeId,
          toEnvelopeId: toEnvelopeId,
        }
      } else {
        payload = {
          type: type as 'income' | 'expense',
          mode: repeatEnabled ? 'plan' : (mode as 'fact' | 'plan'),
          date: toTs(date),
          amount: parsed.amount,
          category: category.trim(),
          description: parsed.description || undefined,
          accountId,
          envelopeId,
          repeat: repeatEnabled ? repeat : undefined,
        }
      }

      const editScope = seriesEdited ? scope : 'one'
      await onSubmit(payload, editScope)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface border border-hairline rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
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
              {parsed.amount != null ? (
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
                  type === 'expense' ? 'bg-rose text-white font-medium' : 'bg-elevated text-muted hover:text-ink'
                }`}
              >
                Расход
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                  type === 'income' ? 'bg-emerald text-black font-medium' : 'bg-elevated text-muted hover:text-ink'
                }`}
              >
                Доход
              </button>
              <button
                type="button"
                onClick={() => setType('transfer')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                  type === 'transfer' ? 'bg-link text-black font-medium' : 'bg-elevated text-muted hover:text-ink'
                }`}
              >
                Перевод
              </button>
            </div>
          </div>

          {isTransfer && (
            <>
              <div>
                <label className="block text-sm text-muted mb-2">Что переводим</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTransferKind('accounts')}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      transferKind === 'accounts' ? 'bg-link/20 text-link font-medium' : 'bg-elevated text-muted hover:text-ink'
                    }`}
                  >
                    Между счетами
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferKind('envelopes')}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      transferKind === 'envelopes' ? 'bg-link/20 text-link font-medium' : 'bg-elevated text-muted hover:text-ink'
                    }`}
                  >
                    Между конвертами
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="transfer-from" className="block text-sm text-muted mb-1">Откуда *</label>
                {transferKind === 'accounts' ? (
                  <select
                    id="transfer-from"
                    required
                    value={accountId}
                    onInput={(e) => setAccountId(e.currentTarget.value)}
                    className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink outline-none focus:border-yellow transition-colors"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    id="transfer-from"
                    required
                    value={envelopeId ?? ''}
                    onInput={(e) => setEnvelopeId(e.currentTarget.value || null)}
                    className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink outline-none focus:border-yellow transition-colors"
                  >
                    <option value="" disabled>Выберите конверт</option>
                    {envelopes.map((env) => (
                      <option key={env.id} value={env.id}>{env.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label htmlFor="transfer-to" className="block text-sm text-muted mb-1">Куда *</label>
                {transferKind === 'accounts' ? (
                  <select
                    id="transfer-to"
                    required
                    value={toAccountId}
                    onInput={(e) => setToAccountId(e.currentTarget.value)}
                    className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink outline-none focus:border-yellow transition-colors"
                  >
                    <option value="" disabled>Выберите счёт</option>
                    {accounts.filter((a) => a.id !== accountId).map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    id="transfer-to"
                    required
                    value={toEnvelopeId}
                    onInput={(e) => setToEnvelopeId(e.currentTarget.value)}
                    className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink outline-none focus:border-yellow transition-colors"
                  >
                    <option value="" disabled>Выберите конверт</option>
                    {envelopes.filter((env) => env.id !== envelopeId).map((env) => (
                      <option key={env.id} value={env.id}>{env.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </>
          )}

          {!isTransfer && (
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
          )}

          <div>
            <label htmlFor="transaction-date" className="block text-sm text-muted mb-1">Дата *</label>
            <input
              id="transaction-date"
              type="date"
              required
              value={date}
              min={isPlanMode ? todayLocal : undefined}
              onInput={(e) => setDate(e.currentTarget.value)}
              className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink outline-none focus:border-yellow transition-colors"
            />
            {planDateInvalid && (
              <div className="text-xs text-rose mt-1">Плановая транзакция не создаётся в прошлом</div>
            )}
          </div>

          {!isTransfer && (
            <div>
              <label htmlFor="transaction-account" className="block text-sm text-muted mb-1">Счёт *</label>
              <select
                id="transaction-account"
                required
                value={accountId}
                onInput={(e) => setAccountId(e.currentTarget.value)}
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
          )}

          {!isTransfer && (
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
          )}

          {!isTransfer && (
            <div>
              <label className="block text-sm text-muted mb-2">Режим</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('fact')}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                    mode === 'fact' && !repeatEnabled ? 'bg-yellow text-black font-medium' : 'bg-elevated text-muted hover:text-ink'
                  }`}
                >
                  Факт
                </button>
                <button
                  type="button"
                  onClick={() => setMode('plan')}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                    mode === 'plan' && !repeatEnabled ? 'bg-link/20 text-link font-medium' : 'bg-elevated text-muted hover:text-ink'
                  }`}
                >
                  План
                </button>
              </div>
              {repeatEnabled && (
                <div className="text-xs text-muted mt-1">
                  Повторяющаяся транзакция — это серия планов
                </div>
              )}
            </div>
          )}

          {!isTransfer && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="repeat-enabled"
                  checked={repeatEnabled}
                  onInput={(e) => setRepeatEnabled(e.currentTarget.checked)}
                  className="accent-yellow"
                />
                <label htmlFor="repeat-enabled" className="text-sm text-muted">Повторять</label>
              </div>
              {repeatEnabled && (
                <div className="space-y-2">
                  <select
                    id="repeat-preset"
                    value={repeatPreset}
                    onInput={(e) => setRepeatPreset(e.currentTarget.value)}
                    className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink outline-none focus:border-yellow transition-colors"
                  >
                    {REPEAT_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="repeat-until-enabled"
                      checked={!!repeatUntil}
                      onInput={(e) => setRepeatUntil(e.currentTarget.checked ? todayInputValue() : '')}
                      className="accent-yellow"
                    />
                    <label htmlFor="repeat-until-enabled" className="text-sm text-muted">Повторять до:</label>
                    {repeatUntil !== '' && (
                      <input
                        id="repeat-until"
                        type="date"
                        value={repeatUntil}
                        onInput={(e) => setRepeatUntil(e.currentTarget.value)}
                        className="px-2 py-1 bg-elevated border border-hairline rounded-lg text-ink text-xs outline-none focus:border-yellow transition-colors"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {isEdit && transaction?.seriesId && (
            <div>
              <label className="block text-sm text-muted mb-2">Применить к</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setScope('one')}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                    scope === 'one' ? 'bg-yellow text-black font-medium' : 'bg-elevated text-muted hover:text-ink'
                  }`}
                >
                  Только эту
                </button>
                <button
                  type="button"
                  onClick={() => setScope('future')}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                    scope === 'future' ? 'bg-yellow text-black font-medium' : 'bg-elevated text-muted hover:text-ink'
                  }`}
                >
                  Эту и будущие
                </button>
              </div>
              <div className="text-xs text-muted mt-1">Прошлые транзакции будут не тронуты</div>
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
              disabled={busy || !parsed.amount || planDateInvalid || (!isTransfer && !category.trim())}
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
