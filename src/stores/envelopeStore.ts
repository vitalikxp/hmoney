import { create } from 'zustand'
import { useAuthStore } from './authStore'
import * as service from '../lib/envelopeService'
import type { Envelope, CreateEnvelopeInput, UpdateEnvelopeInput } from '../types/envelope'

interface EnvelopeState {
  envelopes: Envelope[]
  loading: boolean
  error: string | null
  fetchEnvelopes: () => Promise<void>
  createEnvelope: (data: CreateEnvelopeInput) => Promise<void>
  updateEnvelope: (id: string, data: UpdateEnvelopeInput) => Promise<void>
  deleteEnvelope: (id: string) => Promise<void>
}

export const useEnvelopeStore = create<EnvelopeState>((set) => ({
  envelopes: [],
  loading: false,
  error: null,

  fetchEnvelopes: async () => {
    const user = useAuthStore.getState().user
    if (!user) return
    set({ loading: true, error: null })
    try {
      const envelopes = await service.fetchEnvelopes(user.uid)
      set({ envelopes, loading: false })
    } catch (e) {
      set({ loading: false, error: 'Ошибка загрузки конвертов' })
      console.error(e)
    }
  },

  createEnvelope: async (data) => {
    const user = useAuthStore.getState().user
    if (!user) return
    if (data.type === 'spending') {
      set({ error: 'ХаниМани — вычисляемое значение, конверт не создаётся' })
      return
    }
    if (data.type === 'reserve') {
      set({ error: 'Резервы создаются автоматически' })
      return
    }
    const userCount = useEnvelopeStore.getState().envelopes.filter((e) => !e.isBuiltIn).length
    if (userCount >= 20) {
      set({ error: 'Достигнут лимит конвертов (20). Удалите неиспользуемые.' })
      return
    }
    set({ error: null })
    try {
      await service.createEnvelope(user.uid, data)
      await useEnvelopeStore.getState().fetchEnvelopes()
    } catch (e) {
      set({ error: 'Ошибка создания конверта' })
      console.error(e)
    }
  },

  updateEnvelope: async (id, data) => {
    const user = useAuthStore.getState().user
    if (!user) return
    const envelope = useEnvelopeStore.getState().envelopes.find((e) => e.id === id)
    if (envelope?.isBuiltIn && data.type && data.type !== envelope.type) {
      set({ error: 'Тип встроенного конверта нельзя изменить' })
      return
    }
    set({ error: null })
    try {
      await service.updateEnvelope(user.uid, id, data)
      await useEnvelopeStore.getState().fetchEnvelopes()
    } catch (e) {
      set({ error: 'Ошибка обновления конверта' })
      console.error(e)
    }
  },

  deleteEnvelope: async (id) => {
    const user = useAuthStore.getState().user
    if (!user) return
    const envelope = useEnvelopeStore.getState().envelopes.find((e) => e.id === id)
    if (envelope?.isBuiltIn) {
      set({ error: 'Встроенный конверт нельзя удалить' })
      return
    }
    set({ error: null })
    try {
      await service.deleteEnvelope(user.uid, id)
      await useEnvelopeStore.getState().fetchEnvelopes()
    } catch (e) {
      set({ error: 'Ошибка удаления конверта' })
      console.error(e)
    }
  },
}))
