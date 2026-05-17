import { useState, useEffect } from 'react'
import type { Envelope, CreateEnvelopeInput, UpdateEnvelopeInput } from '../../types/envelope'
import { ICONS, DEFAULT_ICON } from './constants'
import MoneyInput from '../ui/MoneyInput'

interface Props {
  envelope: Envelope | null
  onSubmit: (data: CreateEnvelopeInput | UpdateEnvelopeInput) => Promise<void>
  onClose: () => void
}

function toInput(envelope: Envelope | null): CreateEnvelopeInput {
  if (!envelope) return { name: '', isGoal: false, balance: 0, sortOrder: 0, icon: DEFAULT_ICON }
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = envelope
  return rest
}

export default function EnvelopeModal({ envelope, onSubmit, onClose }: Props) {
  const isEdit = envelope !== null
  const [form, setForm] = useState(() => toInput(envelope))
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setForm(toInput(envelope))
  }, [envelope])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setBusy(true)
    try {
      const { target: _t, ...rest } = form
      const payload = form.isGoal && form.target != null
        ? { ...rest, target: form.target }
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
            <label htmlFor="envelope-balance" className="block text-sm text-muted mb-1">Баланс *</label>
            <MoneyInput
              id="envelope-balance"
              value={form.balance}
              onValueChange={(v) => setForm({ ...form, balance: v.floatValue ?? 0 })}
              allowNegative
              required
              onFocus={(e) => e.target.select()}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isGoal"
              checked={form.isGoal}
              onChange={(e) => setForm({ ...form, isGoal: e.target.checked, target: e.target.checked ? form.target : undefined })}
              className="accent-yellow"
            />
            <label htmlFor="isGoal" className="text-sm text-muted">Это цель</label>
          </div>

          {form.isGoal && (
            <div>
              <label htmlFor="target" className="block text-sm text-muted mb-1">Целевая сумма *</label>
              <MoneyInput
                id="target"
                value={form.target ?? ''}
                onValueChange={(v) => setForm({ ...form, target: v.floatValue ?? 0 })}
                required
              />
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
