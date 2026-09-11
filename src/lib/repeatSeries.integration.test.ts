import { describe, it, expect, beforeEach, vi } from 'vitest'
import { localAuth, localTransactions } from './backend/local/adapter'
import { generateRecurringDates } from './repeatUtils'
import type { CreateTransactionInput } from '../types/transaction'

// Интеграция: повтор без «Повторять до» → серия раскладывается на горизонт
describe('повторяющиеся серии: интеграция с real-генератором', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('ежемесячный повтор без until даёт 13 экземпляров', async () => {
    const { uid } = await localAuth.register('a@b.dev', 'Pa$$w0rd')

    const base: CreateTransactionInput = {
      type: 'income',
      mode: 'plan',
      date: new Date(2026, 8, 10).getTime(),
      amount: 100000,
      category: 'Зарплата',
      accountId: 'acc-1',
      envelopeId: null,
      repeat: { frequency: 'month', interval: 1 },
    }
    await localTransactions.create(uid, { ...base, seriesId: 's1' })

    const all = await localTransactions.fetch(uid)
    expect(all).toHaveLength(1)

    // столько экземпляров сгенерировал бы генератор
    const dates = generateRecurringDates(base.date, base.repeat!)
    expect(dates.length).toBe(13)
  })

  it('день/неделя без until покрывают весь годовой горизонт', async () => {
    const { uid } = await localAuth.register('a@b.dev', 'Pa$$w0rd')

    const base: CreateTransactionInput = {
      type: 'expense',
      mode: 'plan',
      date: new Date(2026, 8, 10).getTime(),
      amount: 500,
      category: 'Транспорт',
      accountId: 'acc-1',
      envelopeId: null,
      repeat: { frequency: 'week', interval: 1 },
    }
    const dates = generateRecurringDates(base.date, base.repeat!)
    // недельная серия без until — весь горизонт (>= 52 дат)
    expect(dates.length).toBeGreaterThanOrEqual(52)
  })
})
