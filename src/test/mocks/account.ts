import type { Account } from '../../types/account'

export function createMockAccount(overrides?: Partial<Account>): Account {
  return {
    id: 'test-id',
    name: 'Тестовый счёт',
    balance: 10000,
    icon: '💳',
    includeInBalance: true,
    currency: 'RUB',
    group: 'default',
    sortOrder: 0,
    createdAt: { seconds: 0, nanoseconds: 0 } as Account['createdAt'],
    updatedAt: { seconds: 0, nanoseconds: 0 } as Account['updatedAt'],
    ...overrides,
  }
}
