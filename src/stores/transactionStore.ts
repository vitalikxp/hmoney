import { create } from 'zustand'
import { useAuthStore } from './authStore'
import { useAccountStore } from './accountStore'
import { useEnvelopeStore } from './envelopeStore'
import * as service from '../lib/transactionService'
import type { Transaction, CreateTransactionInput, UpdateTransactionInput } from '../types/transaction'

interface TransactionState {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  fetchTransactions: () => Promise<void>
  createTransaction: (data: CreateTransactionInput) => Promise<void>
  updateTransaction: (id: string, data: UpdateTransactionInput) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
}

type DeltaSource = Pick<Transaction, 'type' | 'amount' | 'accountId' | 'envelopeId'>

// Дельта балансов: расход −, доход +. Балансы хранятся у счёта и конверта;
// ХаниМани вычисляется из них же, поэтому отдельно не обновляется.
async function applyTransactionDeltas(
  tx: DeltaSource,
  multiplier = 1,
): Promise<void> {
  const sign = tx.type === 'expense' ? -1 : 1
  const delta = multiplier * sign * tx.amount

  const { accounts, updateAccount } = useAccountStore.getState()
  const account = accounts.find((a) => a.id === tx.accountId)
  if (account) {
    await updateAccount(account.id, { balance: account.balance + delta })
  }

  if (tx.envelopeId) {
    const { envelopes, updateEnvelope } = useEnvelopeStore.getState()
    const envelope = envelopes.find((e) => e.id === tx.envelopeId)
    if (envelope) {
      await updateEnvelope(tx.envelopeId, { balance: envelope.balance + delta })
    }
  }
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
      const transactions = await service.fetchTransactions(user.uid)
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
      await service.createTransaction(user.uid, data)
      await applyTransactionDeltas(data)
      await useTransactionStore.getState().fetchTransactions()
    } catch (e) {
      set({ error: 'Ошибка создания транзакции' })
      console.error(e)
    }
  },

  updateTransaction: async (id, data) => {
    const user = useAuthStore.getState().user
    if (!user) return
    set({ error: null })
    try {
      const old = useTransactionStore.getState().transactions.find((t) => t.id === id)
      await service.updateTransaction(user.uid, id, data)
      if (old) {
        await applyTransactionDeltas(old, -1)
        await applyTransactionDeltas({ ...old, ...data })
      }
      await useTransactionStore.getState().fetchTransactions()
    } catch (e) {
      set({ error: 'Ошибка обновления транзакции' })
      console.error(e)
    }
  },

  deleteTransaction: async (id) => {
    const user = useAuthStore.getState().user
    if (!user) return
    set({ error: null })
    try {
      const old = useTransactionStore.getState().transactions.find((t) => t.id === id)
      await service.deleteTransaction(user.uid, id)
      if (old) {
        await applyTransactionDeltas(old, -1)
      }
      await useTransactionStore.getState().fetchTransactions()
    } catch (e) {
      set({ error: 'Ошибка удаления транзакции' })
      console.error(e)
    }
  },
}))
