import type { Envelope } from '../../types/envelope'

export function createMockEnvelope(overrides?: Partial<Envelope>): Envelope {
  return {
    id: 'env-test-id',
    name: 'Тестовый конверт',
    isGoal: false,
    balance: 5000,
    icon: '✉️',
    isBuiltIn: false,
    sortOrder: 0,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  }
}
