import { useMemo, useState } from 'preact/hooks'
import type { TargetedEvent } from 'preact'
import type { Transaction } from '../../types/transaction'
import { useTransactionStore } from '../../stores/transactionStore'

interface Props {
  transactions: Transaction[]
  onClose: () => void
}

// Редактор категорий (ХаниМани: категории создаются на ходу, редактор
// позволяет переименовать категорию во всех транзакциях разом)
export default function CategoriesModal({ transactions, onClose }: Props) {
  const [renaming, setRenaming] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [busy, setBusy] = useState(false)

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const t of transactions) {
      if (t.type === 'transfer') continue
      counts.set(t.category, (counts.get(t.category) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [transactions])

  const handleRename = async (e: TargetedEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!renaming || !newName.trim() || newName.trim() === renaming) return
    setBusy(true)
    try {
      const affected = transactions.filter((t) => t.category === renaming && t.type !== 'transfer')
      for (const t of affected) {
        await useTransactionStore.getState().updateTransaction(t.id, { category: newName.trim() })
      }
      setRenaming(null)
      setNewName('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface border border-hairline rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl max-h-[80vh] flex flex-col">
        <h2 className="text-lg font-bold text-ink mb-4">Категории</h2>

        {categories.length === 0 ? (
          <div className="text-muted text-sm py-6 text-center">
            Категорий пока нет — они появятся при создании транзакций
          </div>
        ) : (
          <div className="overflow-y-auto border border-hairline rounded-lg divide-y divide-hairline mb-4">
            {categories.map(([category, count]) => (
              <div key={category} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  {renaming === category ? (
                    <form onSubmit={handleRename} className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={newName}
                        onInput={(e) => setNewName(e.currentTarget.value)}
                        autoFocus
                        className="flex-1 px-2 py-1 bg-elevated border border-hairline rounded-lg text-ink text-sm outline-none focus:border-yellow transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={busy}
                        className="px-3 py-1 text-xs font-medium bg-yellow text-black rounded-lg hover:brightness-110 disabled:opacity-40 transition-all cursor-pointer"
                      >
                        Сохранить
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenaming(null)}
                        className="px-3 py-1.5 text-xs text-muted hover:text-ink cursor-pointer"
                      >
                        Отмена
                      </button>
                    </form>
                  ) : (
                    <span className="text-ink text-sm truncate">{category}</span>
                  )}
                </div>
                {renaming !== category && (
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs text-muted">{count}</span>
                    <button
                      onClick={() => {
                        setRenaming(category)
                        setNewName(category)
                      }}
                      className="p-1 text-muted hover:text-ink hover:bg-elevated rounded transition-colors cursor-pointer"
                      title="Переименовать"
                    >
                      ✎
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted mb-4">
          Переименование затронет все транзакции этой категории
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-muted hover:text-ink border border-hairline rounded-lg hover:bg-elevated transition-colors cursor-pointer"
        >
          Закрыть
        </button>
      </div>
    </div>
  )
}
