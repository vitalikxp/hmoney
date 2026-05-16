import type { Timestamp } from 'firebase/firestore'

export type EnvelopeType = 'spending' | 'reserve' | 'fund' | 'goal'

export interface Envelope {
  id: string
  name: string
  type: EnvelopeType
  balance: number
  target?: number
  icon?: string
  sortOrder: number
  isHidden: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type CreateEnvelopeInput = Omit<Envelope, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateEnvelopeInput = Partial<Omit<Envelope, 'id' | 'createdAt' | 'updatedAt'>>
