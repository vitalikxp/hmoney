import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { generateRecurringDates } from './repeatUtils'

const DAY = 24 * 60 * 60 * 1000

// фиксируем «сегодня», чтобы горизонт был детерминированным
const NOW = new Date(2026, 8, 10, 12).getTime()

describe('generateRecurringDates', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('первая дата — дата старта', () => {
    const dates = generateRecurringDates(NOW, { frequency: 'month', interval: 1 })
    expect(dates[0]).toBe(new Date(2026, 8, 10).getTime())
  })

  it('каждый месяц: 13 дат на 12-месячном горизонте', () => {
    const dates = generateRecurringDates(new Date(2026, 8, 10).getTime(), {
      frequency: 'month',
      interval: 1,
    })
    expect(dates).toHaveLength(13)
    expect(dates[1]).toBe(new Date(2026, 9, 10).getTime())
  })

  it('каждую неделю: ~53 даты', () => {
    const dates = generateRecurringDates(new Date(2026, 8, 10).getTime(), {
      frequency: 'week',
      interval: 1,
    })
    expect(dates.length).toBeGreaterThanOrEqual(52)
    expect(dates.length).toBeLessThanOrEqual(54)
  })

  it('каждые 1.5 месяца: чередование 1 и 2 месяца', () => {
    const dates = generateRecurringDates(new Date(2026, 8, 10).getTime(), {
      frequency: 'month',
      interval: 1.5,
    })
    // 10 сентября → 10 окт (+1 мес, через ~15 дней... целая часть 1) → далее сдвиги 1.5 мес ≈ 45 дней
    const gap1 = dates[1] - dates[0]
    const gap2 = dates[2] - dates[1]
    expect(gap1).toBeGreaterThan(30 * DAY)
    expect(gap1).toBeLessThan(50 * DAY)
    expect(gap2).toBeGreaterThan(30 * DAY)
    expect(gap2).toBeLessThan(50 * DAY)
  })

  it('кламп конца месяца: 31 января → 28/29 февраля', () => {
    const dates = generateRecurringDates(new Date(2026, 0, 31).getTime(), {
      frequency: 'month',
      interval: 1,
    })
    const feb = new Date(dates[1])
    expect(feb.getMonth()).toBe(1)
    expect(feb.getDate()).toBeLessThanOrEqual(28)
    // март — снова 31-е
    const mar = new Date(dates[2])
    expect(mar.getMonth()).toBe(2)
    expect(mar.getDate()).toBe(31)
  })

  it('уважает until (Повторять до:)', () => {
    const until = new Date(2026, 10, 30).getTime()
    const dates = generateRecurringDates(new Date(2026, 8, 10).getTime(), {
      frequency: 'month',
      interval: 1,
      until,
    })
    expect(dates).toHaveLength(3) // 10 сен, 10 окт, 10 ноя
    expect(dates.every((d) => d <= until)).toBe(true)
  })

  it('по будням: пропускает выходные', () => {
    const dates = generateRecurringDates(new Date(2026, 8, 10).getTime(), {
      frequency: 'day',
      interval: 1,
      weekendMode: 'workdays',
    })
    const weekend = dates.filter((d) => [0, 6].includes(new Date(d).getDay()))
    expect(weekend).toHaveLength(0)
    expect(dates.length).toBeGreaterThan(250)
  })

  it('по выходным: только суббота и воскресенье', () => {
    const dates = generateRecurringDates(new Date(2026, 8, 10).getTime(), {
      frequency: 'day',
      interval: 1,
      weekendMode: 'weekends',
    })
    expect(dates.every((d) => [0, 6].includes(new Date(d).getDay()))).toBe(true)
  })

  it('каждый год: 2 даты на горизонте', () => {
    const dates = generateRecurringDates(new Date(2026, 8, 10).getTime(), {
      frequency: 'year',
      interval: 1,
    })
    expect(dates).toHaveLength(2)
  })

  it('каждые 2 месяца: 7 дат', () => {
    const dates = generateRecurringDates(new Date(2026, 8, 10).getTime(), {
      frequency: 'month',
      interval: 2,
    })
    expect(dates).toHaveLength(7)
  })
})
