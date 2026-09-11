import type { Account } from '../../types/account'

export function createMockAccount(overrides?: Partial<Account>): Account {
  return {
    id: 'test-id',
    name: 'Тестовый счёт',
    balance: 10000,
    icon: '💳',
    includeInBalance: true,
    currency: 'RUB',
    sortOrder: 0,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  }
}
