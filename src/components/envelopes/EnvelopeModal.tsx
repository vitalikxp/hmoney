import { useState, useEffect } from 'react'
import type { Envelope, EnvelopeType, CreateEnvelopeInput, UpdateEnvelopeInput } from '../../types/envelope'

interface Props {
  envelope: Envelope | null
  onSubmit: (data: CreateEnvelopeInput | UpdateEnvelopeInput) => Promise<void>
  onClose: () => void
}

const ICONS = ['🧃', '🛡️', '🏦', '🎯', '💰', '🏠', '🚗', '🎓', '✈️', '🛒', '🍽️', '🏥', '🎮', '👶', '📱', '💎', '🐾', '🌴']

const TYPES: Array<{ value: EnvelopeType; label: string }> = [
  { value: 'spending', label: 'ХаниМани' },
  { value: 'reserve', label: 'Резервы' },
  { value: 'fund', label: 'Фонды' },
  { value: 'goal', label: 'Цели' },
]

function toInput(envelope: Envelope | null): CreateEnvelopeInput & { id?: string } {
  return envelope
    ? { ...envelope }
    : {
        name: '',
        type: 'spending',
        balance: 0,
        sortOrder: 0,
        isHidden: false,
        icon: ICONS[0],
      }
}

export default function EnvelopeModal({ envelope, onSubmit, onClose }: Props) {
  const isEdit = envelope !== null
  const [form, setForm] = useState(() => toInput(envelope))
  const [targetEnabled, setTargetEnabled] = useState(envelope?.target != null && envelope.target > 0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setForm(toInput(envelope))
    setTargetEnabled(envelope?.target != null && envelope.target > 0)
  }, [envelope])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setBusy(true)
    try {
      const { target: _t, ...rest } = form
      const showTarget = form.type === 'fund' || form.type === 'goal'
      const payload = showTarget && targetEnabled && form.target
        ? { ...rest, target: form.target }
        : rest
      await onSubmit(payload)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  const showTarget = form.type === 'fund' || form.type === 'goal'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface border border-hairline rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-ink mb-4">
          {isEdit ? 'Редактировать конверт' : 'Новый конверт'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Название *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Продукты, Ремонт, …"
              className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink placeholder:text-muted/50 outline-none focus:border-yellow transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Тип</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as EnvelopeType })}
              className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink outline-none focus:border-yellow transition-colors"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
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

          {showTarget && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="targetEnabled"
                  checked={targetEnabled}
                  onChange={(e) => setTargetEnabled(e.target.checked)}
                  className="accent-yellow"
                />
                <label htmlFor="targetEnabled" className="text-sm text-muted">
                  {form.type === 'goal' ? 'Целевая сумма *' : 'Сумма фонда'}
                </label>
              </div>

              {targetEnabled && (
                <div>
                  <label className="block text-sm text-muted mb-1">
                    {form.type === 'goal' ? 'Цель' : 'Сумма'}
                  </label>
                  <input
                    type="number"
                    step="1"
                    required={form.type === 'goal'}
                    value={form.target ?? ''}
                    onChange={(e) => setForm({ ...form, target: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-ink font-mono outline-none focus:border-yellow transition-colors"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isHidden"
              checked={form.isHidden}
              onChange={(e) => setForm({ ...form, isHidden: e.target.checked })}
              className="accent-yellow"
            />
            <label htmlFor="isHidden" className="text-sm text-muted">Скрытый конверт</label>
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
