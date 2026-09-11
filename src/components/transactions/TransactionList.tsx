import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { Transaction } from '../../types/transaction'
import type { Account } from '../../types/account'
import type { Envelope } from '../../types/envelope'
import TransactionDayGroup from './TransactionDayGroup'

export type ListRange = 'past' | 'future'

interface Props {
  transactions: Transaction[]
  accounts: Account[]
  envelopes: Envelope[]
  range: ListRange
  onEdit: (t: Transaction) => void
  onDelete: (t: Transaction) => void
}

const BATCH_DAYS = 30

function dayKey(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function todayKey(): number {
  return dayKey(Date.now())
}

export default function TransactionList({ transactions, accounts, envelopes, range, onEdit, onDelete }: Props) {
  const accountNames = useMemo(() => new Map(accounts.map((a) => [a.id, a.name])), [accounts])
  const envelopeNames = useMemo(() => new Map(envelopes.map((e) => [e.id, e.name])), [envelopes])
  const today = todayKey()

  // Фильтр по диапазону; сегодняшний день показывается всегда и выделяется цветом
  const visible = useMemo(() => {
    if (range === 'past') {
      return transactions.filter((t) => dayKey(t.date) <= today)
    }
    // «Будущее» — всё после сегодня; сегодняшний день добавляем сверху всегда
    const future = transactions.filter((t) => dayKey(t.date) > today)
    const todayTxs = transactions.filter((t) => dayKey(t.date) === today)
    return [...todayTxs, ...future]
  }, [transactions, range, today])

  const days = useMemo(() => {
    const buckets = new Map<number, Transaction[]>()
    for (const t of visible) {
      const key = dayKey(t.date)
      const bucket = buckets.get(key)
      if (bucket) bucket.push(t)
      else buckets.set(key, [t])
    }
    return [...buckets.entries()]
      .sort((a, b) => (range === 'future' ? a[0] - b[0] : b[0] - a[0]))
      .map(([date, txs]) => ({ date, transactions: txs.sort((a, b) => b.createdAt - a.createdAt) }))
  }, [visible])

  const [visibleDays, setVisibleDays] = useState(BATCH_DAYS)
  useEffect(() => setVisibleDays(BATCH_DAYS), [range])

  const shown = days.slice(0, visibleDays)
  const hasMore = days.length > visibleDays
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Бесконечная прокрутка: подгружаем следующий батч, когда низ списка в кадре
  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleDays((v) => v + BATCH_DAYS)
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore])

  const futureEmpty = range === 'future' && days.length === 0

  return (
    <div className="space-y-3">
      {futureEmpty && (
        <div className="text-center py-10 text-muted">Будущих транзакций пока нет</div>
      )}
      {shown.map((day) => (
        <TransactionDayGroup
          key={day.date}
          date={day.date}
          transactions={day.transactions}
          accountNames={accountNames}
          envelopeNames={envelopeNames}
          isToday={day.date === today}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      {hasMore && (
        <div ref={sentinelRef} className="text-center py-3 text-sm text-muted">
          Показать ещё ({days.length - visibleDays})
        </div>
      )}
    </div>
  )
}
