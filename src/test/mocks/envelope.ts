import type { Envelope } from '../../types/envelope'

export function createMockEnvelope(overrides?: Partial<Envelope>): Envelope {
  return {
    id: 'env-test-id',
    name: 'Тестовый конверт',
    type: 'spending',
    balance: 5000,
    icon: '🧃',
    sortOrder: 0,
    isHidden: false,
    createdAt: { seconds: 0, nanoseconds: 0 } as Envelope['createdAt'],
    updatedAt: { seconds: 0, nanoseconds: 0 } as Envelope['updatedAt'],
    ...overrides,
  }
}
