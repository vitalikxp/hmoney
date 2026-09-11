import type { Account, CreateAccountInput, UpdateAccountInput } from '../../../types/account'
import type { Envelope, CreateEnvelopeInput, UpdateEnvelopeInput } from '../../../types/envelope'
import type { AccountRepository, AuthProvider, EnvelopeRepository } from '../types'
import { BackendError } from '../types'

// DEV-адаптер: данные в localStorage, пароль хранится в открытом виде.
// Это не security — только удобство локальной разработки без Firebase.

const USERS_KEY = 'hmoney:users'
const SESSION_KEY = 'hmoney:session'

interface LocalUser {
  uid: string
  email: string
  password: string
}

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (raw === null) return fallback
  return JSON.parse(raw) as T
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function readUsers(): LocalUser[] {
  return readJson<LocalUser[]>(USERS_KEY, [])
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function userKey(uid: string, collection: 'accounts' | 'envelopes'): string {
  return `hmoney:data:${uid}:${collection}`
}

export const localAccounts: AccountRepository = {
  async fetch(userId) {
    const accounts = readJson<Account[]>(userKey(userId, 'accounts'), [])
    return accounts.sort((a, b) => a.createdAt - b.createdAt)
  },

  async create(userId, data: CreateAccountInput) {
    const now = Date.now()
    const account: Account = {
      ...data,
      id: newId('acc'),
      createdAt: now,
      updatedAt: now,
    }
    const accounts = readJson<Account[]>(userKey(userId, 'accounts'), [])
    accounts.push(account)
    writeJson(userKey(userId, 'accounts'), accounts)
    return account.id
  },

  async update(userId, accountId, data: UpdateAccountInput) {
    const accounts = readJson<Account[]>(userKey(userId, 'accounts'), [])
    const next = accounts.map((a) => (a.id === accountId ? { ...a, ...data, updatedAt: Date.now() } : a))
    writeJson(userKey(userId, 'accounts'), next)
  },

  async delete(userId, accountId) {
    const accounts = readJson<Account[]>(userKey(userId, 'accounts'), [])
    writeJson(userKey(userId, 'accounts'), accounts.filter((a) => a.id !== accountId))
  },
}

export const localEnvelopes: EnvelopeRepository = {
  async fetch(userId) {
    const envelopes = readJson<Envelope[]>(userKey(userId, 'envelopes'), [])
    return envelopes.sort((a, b) => a.createdAt - b.createdAt)
  },

  async create(userId, data: CreateEnvelopeInput) {
    const now = Date.now()
    const envelope: Envelope = {
      ...data,
      id: newId('env'),
      createdAt: now,
      updatedAt: now,
    }
    const envelopes = readJson<Envelope[]>(userKey(userId, 'envelopes'), [])
    envelopes.push(envelope)
    writeJson(userKey(userId, 'envelopes'), envelopes)
    return envelope.id
  },

  async update(userId, envelopeId, data: UpdateEnvelopeInput) {
    const envelopes = readJson<Envelope[]>(userKey(userId, 'envelopes'), [])
    const next = envelopes.map((e) => (e.id === envelopeId ? { ...e, ...data, updatedAt: Date.now() } : e))
    writeJson(userKey(userId, 'envelopes'), next)
  },

  async delete(userId, envelopeId) {
    const envelopes = readJson<Envelope[]>(userKey(userId, 'envelopes'), [])
    writeJson(userKey(userId, 'envelopes'), envelopes.filter((e) => e.id !== envelopeId))
  },
}

export const localAuth: AuthProvider = {
  subscribe(onChange) {
    const uid = localStorage.getItem(SESSION_KEY)
    if (uid) {
      const user = readUsers().find((u) => u.uid === uid)
      if (user) {
        onChange({ uid: user.uid, email: user.email })
        return
      }
    }
    onChange(null)
  },

  async login(email, password) {
    const user = readUsers().find((u) => u.email === email)
    if (!user || user.password !== password) {
      throw new BackendError('invalid-credential', 'Неверный email или пароль')
    }
    localStorage.setItem(SESSION_KEY, user.uid)
    return { uid: user.uid, email: user.email }
  },

  async register(email, password) {
    const users = readUsers()
    if (users.some((u) => u.email === email)) {
      throw new BackendError('email-already-in-use', 'Этот email уже зарегистрирован')
    }
    const user: LocalUser = { uid: newId('uid'), email, password }
    users.push(user)
    writeJson(USERS_KEY, users)
    localStorage.setItem(SESSION_KEY, user.uid)
    return { uid: user.uid, email: user.email }
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY)
  },

  async deleteUser(uid) {
    writeJson(USERS_KEY, readUsers().filter((u) => u.uid !== uid))
    localStorage.removeItem(userKey(uid, 'accounts'))
    localStorage.removeItem(userKey(uid, 'envelopes'))
    localStorage.removeItem(SESSION_KEY)
  },
}

export async function createProfile(): Promise<void> {
  // В local-адаптере профиль уже записан в hmoney:users при register()
}
