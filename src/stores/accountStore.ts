import { create } from 'zustand'
import { useAuthStore } from './authStore'
import * as service from '../lib/accountService'
import type { Account, CreateAccountInput, UpdateAccountInput } from '../types/account'

interface AccountState {
  accounts: Account[]
  loading: boolean
  error: string | null
  fetchAccounts: () => Promise<void>
  createAccount: (data: CreateAccountInput) => Promise<void>
  updateAccount: (id: string, data: UpdateAccountInput) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  loading: false,
  error: null,

  fetchAccounts: async () => {
    const user = useAuthStore.getState().user
    if (!user) return
    set({ loading: true, error: null })
    try {
      const accounts = await service.fetchAccounts(user.uid)
      set({ accounts, loading: false })
    } catch (e) {
      set({ loading: false, error: 'Ошибка загрузки счетов' })
      console.error(e)
    }
  },

  createAccount: async (data) => {
    const user = useAuthStore.getState().user
    if (!user) return
    set({ error: null })
    try {
      await service.createAccount(user.uid, data)
      await useAccountStore.getState().fetchAccounts()
    } catch (e) {
      set({ error: 'Ошибка создания счёта' })
      console.error(e)
    }
  },

  updateAccount: async (id, data) => {
    const user = useAuthStore.getState().user
    if (!user) return
    set({ error: null })
    try {
      await service.updateAccount(user.uid, id, data)
      await useAccountStore.getState().fetchAccounts()
    } catch (e) {
      set({ error: 'Ошибка обновления счёта' })
      console.error(e)
    }
  },

  deleteAccount: async (id) => {
    const user = useAuthStore.getState().user
    if (!user) return
    set({ error: null })
    try {
      await service.deleteAccount(user.uid, id)
      await useAccountStore.getState().fetchAccounts()
    } catch (e) {
      set({ error: 'Ошибка удаления счёта' })
      console.error(e)
    }
  },
}))
