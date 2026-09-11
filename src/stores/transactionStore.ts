import { create } from 'zustand'
import { useAuthStore } from './authStore'
import { useAccountStore } from './accountStore'
import { useEnvelopeStore } from './envelopeStore'
import * as service from '../lib/transactionService'
import { generateRecurringDates, getStartOfDay, SERIES_HORIZON_DAYS } from '../lib/repeatUtils'
import type { Transaction, CreateTransactionInput, UpdateTransactionInput } from '../types/transaction'

export type EditScope = 'one' | 'future'

interface TransactionState {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  fetchTransactions: () => Promise<void>
  createTransaction: (data: CreateTransactionInput) => Promise<void>
  updateTransaction: (id: string, data: UpdateTransactionInput, scope?: EditScope) => Promise<void>
  deleteTransaction: (id: string, scope?: EditScope) => Promise<void>
}

type DeltaSource = Pick<Transaction, 'type' | 'mode' | 'amount' | 'accountId' | 'envelopeId' | 'toAccountId' | 'toEnvelopeId'>

// Дельта балансов только для фактических транзакций (mode='fact'):
// расход — счёт −amount (и конверт −amount), доход — наоборот, перевод —
// списание с source и зачисление на target. План-транзакции балансы не трогают.
async function applyTransactionDeltas(
  tx: DeltaSource,
  multiplier = 1,
): Promise<void> {
  if (tx.mode === 'plan') return

  const { accounts, updateAccount } = useAccountStore.getState()
  const { envelopes, updateEnvelope } = useEnvelopeStore.getState()

  if (tx.type === 'transfer') {
    if (tx.toEnvelopeId) {
      // перевод между конвертами
      const src = envelopes.find((e) => e.id === tx.envelopeId)
      if (src) {
        await updateEnvelope(src.id, { balance: src.balance - multiplier * tx.amount })
      }
      const to = envelopes.find((e) => e.id === tx.toEnvelopeId)
      if (to) {
        await updateEnvelope(to.id, { balance: to.balance + multiplier * tx.amount })
      }
      return
    }
    // перевод между счетами
    const from = accounts.find((a) => a.id === tx.accountId)
    if (from) {
      await updateAccount(from.id, { balance: from.balance - multiplier * tx.amount })
    }
    const to = accounts.find((a) => a.id === tx.toAccountId)
    if (to) {
      await updateAccount(to.id, { balance: to.balance + multiplier * tx.amount })
    }
    return
  }

  const sign = tx.type === 'expense' ? -1 : 1
  const delta = multiplier * sign * tx.amount

  const account = accounts.find((a) => a.id === tx.accountId)
  if (account) {
    await updateAccount(account.id, { balance: account.balance + delta })
  }

  if (tx.envelopeId) {
    const envelope = envelopes.find((e) => e.id === tx.envelopeId)
    if (envelope) {
      await updateEnvelope(tx.envelopeId, { balance: envelope.balance + delta })
    }
  }
}

function newSeriesId(): string {
  return `series-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Повторение → материализованная серия план-транзакций (не влияют на балансы)
async function createSeries(
  userId: string,
  base: CreateTransactionInput,
  repeat: NonNullable<CreateTransactionInput['repeat']>,
): Promise<void> {
  const seriesId = newSeriesId()
  const dates = generateRecurringDates(base.date, repeat)
  for (const date of dates) {
    await service.createTransaction(userId, { ...base, mode: 'plan', date, seriesId, repeat })
  }
}

const DAY_MS = 24 * 60 * 60 * 1000

// Бесконечные серии (без «Повторять до») продлеваются автоматически:
// если последний экземпляр ближе горизонта — досоздаём хвост от него.
// Значения берутся из последнего экземпляра (он отражает правки «эту и будущие»).
async function extendInfiniteSeries(
  userId: string,
  transactions: Transaction[],
): Promise<boolean> {
  const horizonEnd = getStartOfDay(Date.now()) + SERIES_HORIZON_DAYS * DAY_MS
  const seriesIds = new Set(
    transactions.filter((t) => t.seriesId && t.repeat && t.repeat.until == null).map((t) => t.seriesId!),
  )

  let created = false
  for (const seriesId of seriesIds) {
    const members = transactions
      .filter((t) => t.seriesId === seriesId)
      .sort((a, b) => a.date - b.date)
    const last = members[members.length - 1]
    const repeat = last?.repeat
    if (!last || !repeat) continue

    if (last.date >= horizonEnd) continue
    const tail = generateRecurringDates(last.date, repeat).filter((d) => d > last.date)
    for (const date of tail) {
      await service.createTransaction(userId, {
        ...last,
        mode: 'plan',
        date,
        seriesId,
        repeat,
      })
      created = true
    }
  }
  return created
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  loading: false,
  error: null,

  fetchTransactions: async () => {
    const user = useAuthStore.getState().user
    if (!user) return
    set({ loading: true, error: null })
    try {
      let transactions = await service.fetchTransactions(user.uid)

      // бесконечные серии (без «Повторять до») продлеваются до горизонта
      if (await extendInfiniteSeries(user.uid, transactions)) {
        transactions = await service.fetchTransactions(user.uid)
      }

      set({ transactions, loading: false })
    } catch (e) {
      set({ loading: false, error: 'Ошибка загрузки транзакций' })
      console.error(e)
    }
  },

  createTransaction: async (data) => {
    const user = useAuthStore.getState().user
    if (!user) return
    set({ error: null })
    try {
      if (data.repeat) {
        await createSeries(user.uid, data, data.repeat)
      } else {
        const mode = data.mode ?? 'fact'
        await service.createTransaction(user.uid, { ...data, mode })
        await applyTransactionDeltas({ ...data, mode })
      }
      await useTransactionStore.getState().fetchTransactions()
    } catch (e) {
      set({ error: 'Ошибка создания транзакции' })
      console.error(e)
    }
  },

  updateTransaction: async (id, data, scope = 'one') => {
    const user = useAuthStore.getState().user
    if (!user) return
    set({ error: null })
    try {
      const old = useTransactionStore.getState().transactions.find((t) => t.id === id)
      if (!old) return

      if (scope === 'future' && old.seriesId) {
        // удаляем этот и все будущие экземпляры серии, создаём новую серию от этой даты
        const future = useTransactionStore
          .getState()
          .transactions.filter((t) => t.seriesId === old.seriesId && t.date >= old.date)
        for (const t of future) {
          await service.deleteTransaction(user.uid, t.id)
        }
        const repeat = data.repeat ?? old.repeat
        const base: CreateTransactionInput = {
          type: data.type ?? old.type,
          mode: 'plan',
          date: data.date ?? old.date,
          amount: data.amount ?? old.amount,
          category: data.category ?? old.category,
          description: data.description ?? old.description,
          accountId: data.accountId ?? old.accountId,
          envelopeId: data.envelopeId !== undefined ? data.envelopeId : old.envelopeId,
          toAccountId: data.toAccountId ?? old.toAccountId,
          toEnvelopeId: data.toEnvelopeId ?? old.toEnvelopeId,
          repeat,
        }
        if (repeat) {
          await createSeries(user.uid, base, repeat)
        } else {
          await service.createTransaction(user.uid, base)
        }
      } else {
        await service.updateTransaction(user.uid, id, data)
        await applyTransactionDeltas(old, -1)
        const merged = { ...old, ...data, mode: data.mode ?? old.mode }
        await applyTransactionDeltas(merged)
      }
      await useTransactionStore.getState().fetchTransactions()
    } catch (e) {
      set({ error: 'Ошибка обновления транзакции' })
      console.error(e)
    }
  },

  deleteTransaction: async (id, scope = 'one') => {
    const user = useAuthStore.getState().user
    if (!user) return
    set({ error: null })
    try {
      const old = useTransactionStore.getState().transactions.find((t) => t.id === id)
      if (!old) return

      if (scope === 'future' && old.seriesId) {
        const future = useTransactionStore
          .getState()
          .transactions.filter((t) => t.seriesId === old.seriesId && t.date >= old.date)
        for (const t of future) {
          await service.deleteTransaction(user.uid, t.id)
        }
      } else {
        await service.deleteTransaction(user.uid, id)
      }
      await applyTransactionDeltas(old, -1)
      await useTransactionStore.getState().fetchTransactions()
    } catch (e) {
      set({ error: 'Ошибка удаления транзакции' })
      console.error(e)
    }
  },
}))
