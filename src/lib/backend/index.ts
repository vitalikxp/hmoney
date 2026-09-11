import type { Backend } from './types'
import { accountsRepository, envelopesRepository } from './firestore/dataAdapter'
import { createProfile as createFirestoreProfile, firebaseAuth } from './firestore/authAdapter'
import { localAccounts, localEnvelopes, localAuth, createProfile as createLocalProfile } from './local/adapter'

export { BackendError } from './types'
export type { Backend, User, Repository, AccountRepository, EnvelopeRepository, AuthProvider } from './types'

const DRIVER = import.meta.env.VITE_STORAGE_DRIVER ?? 'firestore'

export function getDriverName(): 'local' | 'firestore' {
  return DRIVER === 'local' ? 'local' : 'firestore'
}

const firestoreBackend: Backend = {
  auth: firebaseAuth,
  accounts: accountsRepository,
  envelopes: envelopesRepository,
  createProfile: createFirestoreProfile,
}

const localBackend: Backend = {
  auth: localAuth,
  accounts: localAccounts,
  envelopes: localEnvelopes,
  createProfile: createLocalProfile,
}

export const backend: Backend = getDriverName() === 'local' ? localBackend : firestoreBackend
