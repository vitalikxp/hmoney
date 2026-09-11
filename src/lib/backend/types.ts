import type { Account, CreateAccountInput, UpdateAccountInput } from '../../types/account'
import type { Envelope, CreateEnvelopeInput, UpdateEnvelopeInput } from '../../types/envelope'

export interface User {
  uid: string
  email: string
}

export type BackendErrorCode =
  | 'invalid-credential'
  | 'email-already-in-use'
  | 'weak-password'
  | 'invalid-email'
  | 'unknown'

export class BackendError extends Error {
  constructor(public code: BackendErrorCode, message: string) {
    super(message)
  }
}

export interface Repository<T, CreateIn, UpdateIn> {
  fetch(userId: string): Promise<T[]>
  create(userId: string, data: CreateIn): Promise<string>
  update(userId: string, id: string, data: UpdateIn): Promise<void>
  delete(userId: string, id: string): Promise<void>
}

export type AccountRepository = Repository<Account, CreateAccountInput, UpdateAccountInput>
export type EnvelopeRepository = Repository<Envelope, CreateEnvelopeInput, UpdateEnvelopeInput>

export interface AuthProvider {
  subscribe(onChange: (user: User | null) => void): void
  login(email: string, password: string): Promise<User>
  register(email: string, password: string): Promise<User>
  logout(): Promise<void>
  deleteUser(uid: string): Promise<void>
}

export interface Backend {
  auth: AuthProvider
  accounts: AccountRepository
  envelopes: EnvelopeRepository
  createProfile(userId: string, email: string): Promise<void>
}
