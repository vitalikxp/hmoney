export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  date: number
  amount: number
  category: string
  description?: string
  accountId: string
  envelopeId: string | null
  createdAt: number
  updatedAt: number
}

export type CreateTransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateTransactionInput = Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>
