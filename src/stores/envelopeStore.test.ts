import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockEnvelope } from '../test/mocks/envelope'

const { mockGetState } = vi.hoisted(() => ({
  mockGetState: vi.fn(() => ({ user: { uid: 'test-uid' } })),
}))

vi.mock('../stores/authStore', () => ({
  useAuthStore: Object.assign(vi.fn(), {
    getState: mockGetState,
    setState: vi.fn(),
  }),
}))

const { mockService } = vi.hoisted(() => ({
  mockService: {
    fetchEnvelopes: vi.fn(),
    createEnvelope: vi.fn(),
    updateEnvelope: vi.fn(),
    deleteEnvelope: vi.fn(),
    ensureBuiltInEnvelopes: vi.fn(),
  },
}))

vi.mock('../lib/envelopeService', () => mockService)

import { useEnvelopeStore } from '../stores/envelopeStore'

describe('envelopeStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useEnvelopeStore.setState({ envelopes: [], loading: false, error: null })
  })

  describe('fetchEnvelopes', () => {
    it('fetches envelopes and updates state', async () => {
      const mockEnvelopes = [createMockEnvelope({ id: 'e1' }), createMockEnvelope({ id: 'e2' })]
      mockService.fetchEnvelopes.mockResolvedValueOnce(mockEnvelopes)

      await useEnvelopeStore.getState().fetchEnvelopes()

      expect(mockService.fetchEnvelopes).toHaveBeenCalledWith('test-uid')
      expect(useEnvelopeStore.getState().envelopes).toEqual(mockEnvelopes)
      expect(useEnvelopeStore.getState().loading).toBe(false)
      expect(useEnvelopeStore.getState().error).toBeNull()
    })

    it('sets loading true during fetch', async () => {
      mockService.fetchEnvelopes.mockImplementationOnce(() => new Promise(() => {}))
      useEnvelopeStore.getState().fetchEnvelopes()
      expect(useEnvelopeStore.getState().loading).toBe(true)
    })

    it('sets error on failure', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      mockService.fetchEnvelopes.mockRejectedValueOnce(new Error('fail'))
      await useEnvelopeStore.getState().fetchEnvelopes()
      expect(useEnvelopeStore.getState().error).toBe('Ошибка загрузки конвертов')
      expect(useEnvelopeStore.getState().loading).toBe(false)
    })

    it('does nothing when no user', async () => {
      mockGetState.mockReturnValueOnce({ user: null })
      await useEnvelopeStore.getState().fetchEnvelopes()
      expect(mockService.fetchEnvelopes).not.toHaveBeenCalled()
    })

  })

  describe('createEnvelope', () => {
    it('calls service and refetches', async () => {
      mockService.createEnvelope.mockResolvedValueOnce('new-id')
      mockService.fetchEnvelopes.mockResolvedValueOnce([createMockEnvelope()])

      await useEnvelopeStore.getState().createEnvelope({ name: 'New', isGoal: false, balance: 0, sortOrder: 0, isHidden: false })

      expect(mockService.createEnvelope).toHaveBeenCalledWith('test-uid', expect.objectContaining({ name: 'New' }))
      expect(mockService.fetchEnvelopes).toHaveBeenCalledAfter(mockService.createEnvelope)
    })

    it('sets error on failure', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      mockService.createEnvelope.mockRejectedValueOnce(new Error('fail'))
      await useEnvelopeStore.getState().createEnvelope({ name: 'New', isGoal: false, balance: 0, sortOrder: 0, isHidden: false })
      expect(useEnvelopeStore.getState().error).toBe('Ошибка создания конверта')
    })

    it('блокирует создание при достижении лимита 20 пользовательских конвертов', async () => {
      const twentyEnvelopes = Array.from({ length: 20 }, (_, i) =>
        createMockEnvelope({ id: `e${i}`, isGoal: false, isBuiltIn: false }),
      )
      useEnvelopeStore.setState({ envelopes: twentyEnvelopes, loading: false, error: null })

      await useEnvelopeStore.getState().createEnvelope({ name: 'Лишний', isGoal: false, balance: 0, sortOrder: 0, isHidden: false })

      expect(mockService.createEnvelope).not.toHaveBeenCalled()
      expect(useEnvelopeStore.getState().error).toBe('Достигнут лимит конвертов (20). Удалите неиспользуемые.')
    })
  })

  describe('updateEnvelope', () => {
    it('calls service and refetches', async () => {
      mockService.updateEnvelope.mockResolvedValueOnce(undefined)
      mockService.fetchEnvelopes.mockResolvedValueOnce([createMockEnvelope()])

      await useEnvelopeStore.getState().updateEnvelope('e1', { name: 'Updated' })

      expect(mockService.updateEnvelope).toHaveBeenCalledWith('test-uid', 'e1', { name: 'Updated' })
      expect(mockService.fetchEnvelopes).toHaveBeenCalledAfter(mockService.updateEnvelope)
    })

    it('sets error on failure', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      mockService.updateEnvelope.mockRejectedValueOnce(new Error('fail'))
      await useEnvelopeStore.getState().updateEnvelope('e1', { name: 'x' })
      expect(useEnvelopeStore.getState().error).toBe('Ошибка обновления конверта')
    })
  })

  describe('deleteEnvelope', () => {
    it('calls service and refetches', async () => {
      mockService.deleteEnvelope.mockResolvedValueOnce(undefined)
      mockService.fetchEnvelopes.mockResolvedValueOnce([])

      await useEnvelopeStore.getState().deleteEnvelope('e1')

      expect(mockService.deleteEnvelope).toHaveBeenCalledWith('test-uid', 'e1')
      expect(mockService.fetchEnvelopes).toHaveBeenCalledAfter(mockService.deleteEnvelope)
    })

    it('sets error on failure', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      mockService.deleteEnvelope.mockRejectedValueOnce(new Error('fail'))
      await useEnvelopeStore.getState().deleteEnvelope('e1')
      expect(useEnvelopeStore.getState().error).toBe('Ошибка удаления конверта')
    })

    it('does not allow deleting built-in envelope', async () => {
      useEnvelopeStore.setState({
        envelopes: [createMockEnvelope({ id: 'built', isBuiltIn: true })],
        loading: false,
        error: null,
      })
      await useEnvelopeStore.getState().deleteEnvelope('built')
      expect(mockService.deleteEnvelope).not.toHaveBeenCalled()
      expect(useEnvelopeStore.getState().error).toBe('Встроенный конверт нельзя удалить')
    })
  })
})
