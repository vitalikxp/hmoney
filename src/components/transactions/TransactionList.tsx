import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { Transaction } from '../../types/transaction'
import TransactionDayGroup from './TransactionDayGroup'

interface Props {
  transactions: Transaction[]
  onEdit: (t: Transaction) => void
  onDelete: (t: Transaction) => void
}

const BATCH_DAYS = 30

function dayKey(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export default function TransactionList({ transactions, onEdit, onDelete }: Props) {
  const days = useMemo(() => {
    const buckets = new Map<number, Transaction[]>()
    for (const t of transactions) {
      const key = dayKey(t.date)
      const bucket = buckets.get(key)
      if (bucket) bucket.push(t)
      else buckets.set(key, [t])
    }
    return [...buckets.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([date, txs]) => ({ date, transactions: txs.sort((a, b) => b.createdAt - a.createdAt) }))
  }, [transactions])

  const [visibleDays, setVisibleDays] = useState(BATCH_DAYS)
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

  return (
    <div className="space-y-3">
      {shown.map((day) => (
        <TransactionDayGroup
          key={day.date}
          date={day.date}
          transactions={day.transactions}
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
