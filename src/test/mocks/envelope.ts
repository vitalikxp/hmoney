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
    createdAt: { seconds: 0, nanoseconds: 0 } as Envelope['createdAt'],
    updatedAt: { seconds: 0, nanoseconds: 0 } as Envelope['updatedAt'],
    ...overrides,
  }
}
