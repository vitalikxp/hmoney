import { backend } from './backend'
import type { Account, CreateAccountInput, UpdateAccountInput } from '../types/account'

export async function fetchAccounts(userId: string): Promise<Account[]> {
  return backend.accounts.fetch(userId)
}

export async function createAccount(userId: string, data: CreateAccountInput): Promise<string> {
  return backend.accounts.create(userId, data)
}

export async function updateAccount(userId: string, accountId: string, data: UpdateAccountInput): Promise<void> {
  await backend.accounts.update(userId, accountId, data)
}

export async function deleteAccount(userId: string, accountId: string): Promise<void> {
  await backend.accounts.delete(userId, accountId)
}
