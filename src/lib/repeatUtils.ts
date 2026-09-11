import type { TransactionRepeat } from '../types/transaction'

// Горизонт материализации серий — 12 месяцев вперёд (как прогноз ХаниМани)
export const SERIES_HORIZON_DAYS = 365

function startOfDay(ts: number): Date {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getStartOfDay(ts: number): number {
  return startOfDay(ts).getTime()
}

function addDays(ts: number, days: number): number {
  const d = new Date(ts)
  d.setDate(d.getDate() + days)
  return d.getTime()
}

// Календарное добавление месяцев с клампом на конец месяца (31.01 → 28.02)
function addMonths(ts: number, months: number): number {
  const d = startOfDay(ts)
  const day = d.getDate()
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(day, lastDay))
  return target.getTime()
}

// Дробные месяцы (ХаниМани: «Каждые 1.5 месяца»): целые календарно, дробь ≈ 30 днями
function addMonthsFractional(ts: number, months: number): number {
  const whole = Math.trunc(months)
  const frac = months - whole
  const base = addMonths(ts, whole)
  if (frac <= 0) return base
  return base + Math.round(frac * 30) * 24 * 60 * 60 * 1000
}

function isWeekend(ts: number): boolean {
  const day = new Date(ts).getDay()
  return day === 0 || day === 6
}

function nextDate(ts: number, repeat: TransactionRepeat): number {
  const { frequency, interval } = repeat
  switch (frequency) {
    case 'day':
      return addDays(ts, interval)
    case 'week':
      return addDays(ts, interval * 7)
    case 'month':
      return addMonthsFractional(ts, interval)
    case 'year': {
      const d = startOfDay(ts)
      d.setFullYear(d.getFullYear() + interval)
      return d.getTime()
    }
  }
}

function satisfiesWeekendMode(ts: number, repeat: TransactionRepeat): boolean {
  if (!repeat.weekendMode) return true
  const weekend = isWeekend(ts)
  return repeat.weekendMode === 'workdays' ? !weekend : weekend
}

// Разворачивает серию повторений в конкретные даты.
// Месяцы/годы считаются от базовой даты (день серии сохраняется: 31.01 → 28.02 → 31.03),
// дни/недели — от предыдущего экземпляра. Ограничение: until ИЛИ горизонт 12 месяцев.
export function generateRecurringDates(
  startTs: number,
  repeat: TransactionRepeat,
  maxCount = 365,
): number[] {
  const horizon = startOfDay(Date.now()).getTime() + SERIES_HORIZON_DAYS * 24 * 60 * 60 * 1000
  const limit = Math.min(repeat.until ?? Infinity, horizon)

  let current = startOfDay(startTs).getTime()

  // если старт не удовлетворяет режиму будней/выходных — сдвигаем к ближайшему подходящему дню
  if (!satisfiesWeekendMode(current, repeat)) {
    while (!satisfiesWeekendMode(current, repeat) && current < limit) {
      current = addDays(current, 1)
    }
  }
  if (current > limit) return []

  const dates: number[] = [current]
  let guard = 0
  let occurrence = 0

  while (guard++ < maxCount) {
    occurrence++
    if (repeat.frequency === 'month') {
      current = addMonthsFractional(startOfDay(startTs).getTime(), occurrence * repeat.interval)
    } else if (repeat.frequency === 'year') {
      const d = startOfDay(startTs)
      d.setFullYear(d.getFullYear() + occurrence * repeat.interval)
      current = d.getTime()
    } else {
      current = nextDate(current, repeat)
    }

    if (current > limit) break
    if (!satisfiesWeekendMode(current, repeat)) continue
    dates.push(current)
  }

  return dates
}
