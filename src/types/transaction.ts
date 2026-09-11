export type TransactionType = 'income' | 'expense' | 'transfer'
export type TransactionMode = 'fact' | 'plan'

export type RepeatFrequency = 'day' | 'week' | 'month' | 'year'

// Повторяющаяся серия: периодичность + опциональный день окончания.
// «По будням/по выходным» — day/1 с флагом weekendMode.
// interval может быть дробным (ХаниМани: «Каждые 1.5 месяца»).
export interface TransactionRepeat {
  frequency: RepeatFrequency
  interval: number
  until?: number | null
  weekendMode?: 'workdays' | 'weekends'
}

export interface Transaction {
  id: string
  type: TransactionType
  mode: TransactionMode
  date: number
  amount: number
  category: string
  description?: string
  accountId: string
  envelopeId: string | null
  // Переводы: между счетами (toAccountId) или между конвертами (toEnvelopeId)
  toAccountId?: string
  toEnvelopeId?: string
  // Повторяющаяся серия: все экземпляры с общим seriesId; план, дельт не даёт
  seriesId?: string
  repeat?: TransactionRepeat
  createdAt: number
  updatedAt: number
}

export type CreateTransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateTransactionInput = Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>
