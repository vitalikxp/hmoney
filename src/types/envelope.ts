import type { Timestamp } from 'firebase/firestore'

export interface Envelope {
  id: string
  name: string
  balance: number
  isGoal: boolean
  target?: number
  icon?: string
  isBuiltIn?: boolean
  sortOrder: number
  isHidden: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type CreateEnvelopeInput = Omit<Envelope, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateEnvelopeInput = Partial<Omit<Envelope, 'id' | 'createdAt' | 'updatedAt'>>
