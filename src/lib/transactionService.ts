import { backend } from './backend'
import type { Transaction, CreateTransactionInput, UpdateTransactionInput } from '../types/transaction'

export async function fetchTransactions(userId: string): Promise<Transaction[]> {
  return backend.transactions.fetch(userId)
}

export async function createTransaction(userId: string, data: CreateTransactionInput): Promise<string> {
  return backend.transactions.create(userId, data)
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  data: UpdateTransactionInput,
): Promise<void> {
  await backend.transactions.update(userId, transactionId, data)
}

export async function deleteTransaction(userId: string, transactionId: string): Promise<void> {
  await backend.transactions.delete(userId, transactionId)
}
