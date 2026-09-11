export interface Account {
  id: string
  name: string
  balance: number
  creditLimit?: number
  icon?: string
  includeInBalance: boolean
  currency: string
  sortOrder: number
  createdAt: number
  updatedAt: number
}

export type CreateAccountInput = Omit<Account, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateAccountInput = Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>
