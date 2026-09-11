import type { Transaction } from '../../types/transaction'

export function createMockTransaction(overrides?: Partial<Transaction>): Transaction {
  return {
    id: 'tx-test-id',
    type: 'expense',
    date: 0,
    amount: 1000,
    category: 'Продукты',
    description: 'Пятёрочка',
    accountId: 'test-id',
    envelopeId: null,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  }
}
