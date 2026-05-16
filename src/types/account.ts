import type { Timestamp } from 'firebase/firestore'

export interface Account {
  id: string
  name: string
  balance: number
  creditLimit?: number
  icon?: string
  includeInBalance: boolean
  currency: string
  group: 'favorites' | 'investments' | 'hidden' | 'default'
  sortOrder: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type CreateAccountInput = Omit<Account, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateAccountInput = Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>
